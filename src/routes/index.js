import { Router } from 'express';
import authRoutes from './auth.routes.js';
import driverRoutes from './driver.routes.js';
import rideRoutes from './ride.routes.js';
import earningsRoutes from './earnings.routes.js';
import settingsRoutes from './settings.routes.js';
import customerAuthRoutes from './customerAuth.routes.js';
import customerProfileRoutes from './customerProfile.routes.js';
import customerRideRoutes from './customerRide.routes.js';
import placesRoutes from './places.routes.js';
import walletRoutes from './wallet.routes.js';
import adminRoutes from './admin.routes.js';
const router = Router();

// Driver
router.use('/auth', authRoutes);
router.use('/driver', driverRoutes);
router.use('/driver/ride', rideRoutes);
router.use('/driver/earnings', earningsRoutes);
router.use('/driver/settings', settingsRoutes);

// Customer
router.use('/customer/auth', customerAuthRoutes);
router.use('/customer', customerProfileRoutes);
router.use('/customer/rides', customerRideRoutes);
router.use('/customer/places', placesRoutes);
router.use('/customer/wallet', walletRoutes);
router.use('/admin', adminRoutes);
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'RideGo API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;