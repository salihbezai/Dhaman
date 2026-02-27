import { Router } from 'express';
import { protect, confirmerOnly } from '../middlewares/authMiddleware';
import { 
  getConfirmerOrders, 
  createOrder, 
  handleNoAnswer, 
  confirmOrder, 
} from '../controllers/confirmerController';

const router = Router();


router.get('/orders',protect, confirmerOnly,getConfirmerOrders);
router.post('/orders',protect, confirmerOnly,createOrder);
router.patch('/orders/:id/no-answer',protect, confirmerOnly,handleNoAnswer);
router.patch('/orders/:id/confirm', protect, confirmerOnly, confirmOrder);


export default router;