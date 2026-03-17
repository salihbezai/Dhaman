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
  handleRemoveOrder,
  getProducts, 
} from '../controllers/confirmerController';

const router = Router();


router.get('/orders',protect, confirmerOnly,getConfirmerOrders);

router.post('/orders',protect, confirmerOnly,createOrder);

router.put('/orders/:id',updateOrder);
router.put('/orders/:id/no-answer',protect, confirmerOnly,handleNoAnswer);
router.put('/orders/:id/confirm', protect, confirmerOnly, confirmOrder);
router.put('/orders/:id/cancel', protect, confirmerOnly, handleCancelOrder);
router.put('/orders/:id/postpone', protect, confirmerOnly, handlePostponeOrder);

// delete order
router.delete('/orders/:id',protect, confirmerOnly, handleRemoveOrder);

// get the products
router.get('/products',protect, confirmerOnly, getProducts);



export default router;