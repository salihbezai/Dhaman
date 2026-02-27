import { Router } from 'express';
import { protect, adminOnly } from '../middlewares/authMiddleware';
import { 
  getTeam, 
  createUser, 
//   updateUser, 
  deleteUser, 
  getAllOrders,
  createProduct, 
} from '../controllers/supervisorController';

const router = Router();



router.get('/team',protect, adminOnly, getTeam);
router.post('/users',protect, adminOnly, createUser);
// router.put('/users/:id', updateUser);
router.delete('/users/:id',protect, adminOnly, deleteUser);
router.get('/orders', protect, adminOnly,getAllOrders);


// product
router.post('/products',createProduct);

export default router;