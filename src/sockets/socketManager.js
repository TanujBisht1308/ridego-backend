// Central Socket.IO manager. Authenticates every connection via the same
// JWT access tokens already used for REST, then places each socket into
// rooms so events only reach the right driver/customer.

import { Server } from 'socket.io';
import { verifyAccessToken } from '../config/jwt.js';
import { findById as findDriverById } from '../repositories/driver.repository.js';
import { findById as findCustomerById } from '../repositories/customer.repository.js';
import { pool } from '../config/db.js';
import { sendPushNotification } from '../utils/pushNotification.js';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: '*' },
  });

  io.use(async (socket, next) => {
    try {
      const { token, role } = socket.handshake.auth || {};
      if (!token || !role) return next(new Error('Missing auth token or role'));

      const decoded = verifyAccessToken(token);
      if (decoded.type !== 'access' || decoded.role !== role) {
        return next(new Error('Invalid token for this role'));
      }

      if (role === 'driver') {
        const driver = await findDriverById(decoded.id);
        if (!driver) return next(new Error('Driver not found'));
        socket.data.driverId = driver.id;
        socket.data.vehicleType = driver.vehicle_type;
      } else if (role === 'customer') {
        const customer = await findCustomerById(decoded.id);
        if (!customer) return next(new Error('Customer not found'));
        socket.data.customerId = customer.id;
      } else {
        return next(new Error('Invalid role'));
      }

      socket.data.role = role;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    if (socket.data.role === 'driver') {
      socket.join(`driver:${socket.data.driverId}`);
      if (socket.data.vehicleType) {
        socket.join(`vehicleType:${socket.data.vehicleType}`);
      }
      console.log(`Driver connected: ${socket.data.driverId}`);
    } else {
      socket.join(`customer:${socket.data.customerId}`);
      console.log(`Customer connected: ${socket.data.customerId}`);
    }

    socket.on('driver:location', ({ latitude, longitude, rideId }) => {
      if (socket.data.role !== 'driver') return;
      if (rideId) {
        io.to(`ride:${rideId}`).emit('driver:location', { latitude, longitude });
      }
    });

    socket.on('ride:watch', ({ rideId }) => {
      if (socket.data.role !== 'customer') return;
      socket.join(`ride:${rideId}`);
    });

    socket.on('ride:unwatch', ({ rideId }) => {
      socket.leave(`ride:${rideId}`);
    });

    socket.on('ride:join', ({ rideId }) => {
      socket.join(`ride:${rideId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Disconnected: ${socket.data.role} ${socket.data.driverId || socket.data.customerId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized — call initSocket first');
  return io;
};

// ---- Helpers to fetch tokens for push (kept local to avoid circular imports) ----

const getDriverFcmTokensForVehicleType = async (vehicleType) => {
  const result = await pool.query(
    `SELECT id, fcm_token, notification_channel_id FROM drivers
     WHERE vehicle_type = $1 AND is_online = true AND fcm_token IS NOT NULL`,
    [vehicleType]
  );
  return result.rows;
};

const getCustomerFcmToken = async (customerId) => {
  const result = await pool.query('SELECT fcm_token FROM customers WHERE id = $1', [customerId]);
  return result.rows[0]?.fcm_token || null;
};

const getDriverFcmToken = async (driverId) => {
  const result = await pool.query('SELECT fcm_token FROM drivers WHERE id = $1', [driverId]);
  return result.rows[0]?.fcm_token || null;
};

// ---- Emit helpers used by services elsewhere in the app ----
// Each now fires the socket event (for apps that are open/backgrounded)
// AND a push notification (for apps that are fully closed). Push failures
// are swallowed — sockets remain the primary channel, push is a backup.

// New ride request → push to every online driver of the matching vehicle type.
export const notifyNewRideToDrivers = async (vehicleType, ride) => {
  getIO().to(`vehicleType:${vehicleType}`).emit('ride:incoming', ride);

  const drivers = await getDriverFcmTokensForVehicleType(vehicleType);
  const title = 'New Ride Request';
  const body = `${ride.pickupLocation.address} → ${ride.dropLocation.address}`;

  await Promise.all(
    drivers.map(async (d) => {
      await sendPushNotification(d.fcm_token, {
        title,
        body,
        data: { type: 'ride_request', rideId: ride.rideId },
        channelId: d.notification_channel_id || 'ridego_rides',
      });
      await pool.query(
        'INSERT INTO driver_notifications (driver_id, title, body, type) VALUES ($1, $2, $3, $4)',
        [d.id, title, body, 'ride_request']
      );
    })
  );
};

// Ride accepted/arrived/started/completed/cancelled → push to that customer.
export const notifyCustomerRideUpdate = async (customerId, ride) => {
  getIO().to(`customer:${customerId}`).emit('ride:update', ride);

  const statusMessages = {
    accepted: 'Your driver is on the way!',
    driverArrived: 'Your driver has arrived',
    inProgress: 'Your ride has started',
    completed: 'You have arrived at your destination',
    cancelled: 'Your ride was cancelled',
  };
  const body = statusMessages[ride.status] || 'Your ride status has updated';

  const token = await getCustomerFcmToken(customerId);
  await sendPushNotification(token, {
    title: 'RideGo',
    body,
    data: { type: 'ride_update', rideId: ride.rideId, status: ride.status },
  });
};

// Tell a specific driver a ride they saw got taken by someone else.
export const notifyRideTaken = (vehicleType, rideId) => {
  getIO().to(`vehicleType:${vehicleType}`).emit('ride:taken', { rideId });
};

// New — driver-specific push (used when driver's own ride status changes,
// e.g. if you later add driver-side notifications beyond in-app sockets).
export const notifyDriverPush = async (driverId, { title, body, data }) => {
  const token = await getDriverFcmToken(driverId);
  await sendPushNotification(token, { title, body, data });
};