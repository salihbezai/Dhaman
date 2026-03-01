import { Router } from 'express';
import { protect, confirmerOnly } from '../middlewares/authMiddleware';
import { 
  getConfirmerOrders, 
  createOrder, 
  handleNoAnswer, 
  confirmOrder,
  handleCancelOrder,
  handlePostponeOrder,
  updateOrder, 
} from '../controllers/confirmerController';

const router = Router();


router.get('/orders',protect, confirmerOnly,getConfirmerOrders);
router.post('/orders',createOrder);
router.put('/orders/:id',updateOrder);
router.put('/orders/:id/no-answer',protect, confirmerOnly,handleNoAnswer);
router.put('/orders/:id/confirm', protect, confirmerOnly, confirmOrder);
router.put('/orders/:id/cancel', protect, confirmerOnly, handleCancelOrder);
router.put('/orders/:id/postpone', protect, confirmerOnly, handlePostponeOrder);



export default router;