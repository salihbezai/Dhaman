import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { 
  getDriverOrders, 
  updateOrderStatus, 
  markArrival 
} from '../controllers/driverController';

const router = Router();

// Get only orders assigned to the logged-in driver
router.get('/orders', protect, getDriverOrders);

// Update status (Delivered, Returned, etc.)
router.patch('/orders/:id/status', protect, updateOrderStatus);

// Mark as arrived (Arrival Alert)
router.patch('/orders/:id/arrive', protect, markArrival);

export default router;