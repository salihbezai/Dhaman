import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { 
  getDriverOrders, 
  updateOrderStatus, 
  markArrival, 
  acceptOrderByDriver
} from '../controllers/driverController';

const router = Router();

// Get only orders assigned to the logged-in driver
router.get('/orders', protect, getDriverOrders);

// Update status (Delivered, Returned, etc.)
router.put('/orders/:id/status', protect, updateOrderStatus);

// Mark as arrived (Arrival Alert)
router.put('/orders/:id/arrive', protect, markArrival);

// Mark order accepted and assign it to the driver
router.put('/orders/:id/accept', protect, acceptOrderByDriver);

export default router;