// Central Socket.IO manager. Authenticates every connection via the same
// JWT access tokens already used for REST, then places each socket into
// rooms so events only reach the right driver/customer.

import { Server } from 'socket.io';
import { verifyAccessToken } from '../config/jwt.js';
import { findById as findDriverById } from '../repositories/driver.repository.js';
import { findById as findCustomerById } from '../repositories/customer.repository.js';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: '*' },
  });

  // Auth handshake — client passes { token, role } in `auth` on connect.
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

    // Driver streams their GPS position while online. rideId lets us also
    // relay it into a ride-specific room the customer is watching.
    socket.on('driver:location', ({ latitude, longitude, rideId }) => {
      if (socket.data.role !== 'driver') return;
      if (rideId) {
        io.to(`ride:${rideId}`).emit('driver:location', { latitude, longitude });
      }
    });

    // Customer opens live tracking for a specific ride — joins that ride's room.
    socket.on('ride:watch', ({ rideId }) => {
      if (socket.data.role !== 'customer') return;
      socket.join(`ride:${rideId}`);
    });

    socket.on('ride:unwatch', ({ rideId }) => {
      socket.leave(`ride:${rideId}`);
    });

    // Driver joins a ride's room too, once assigned, so their own location
    // events (above) actually have somewhere to broadcast into.
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

// ---- Emit helpers used by services elsewhere in the app ----

// New ride request → push to every online driver of the matching vehicle type.
export const notifyNewRideToDrivers = (vehicleType, ride) => {
  getIO().to(`vehicleType:${vehicleType}`).emit('ride:incoming', ride);
};

// Ride accepted/arrived/started/completed/cancelled → push to that customer.
export const notifyCustomerRideUpdate = (customerId, ride) => {
  getIO().to(`customer:${customerId}`).emit('ride:update', ride);
};

// Tell a specific driver a ride they saw got taken by someone else (so
// their incoming-ride card disappears instantly instead of waiting on poll).
export const notifyRideTaken = (vehicleType, rideId) => {
  getIO().to(`vehicleType:${vehicleType}`).emit('ride:taken', { rideId });
};