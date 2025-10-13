import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createPaymentIntent,
  confirmPayment,
  refundPayment,
  getPaymentStatus,
} from '../controllers/payments.controller';

const router = Router();

router.post('/create-intent', authenticateToken, createPaymentIntent);
router.post('/confirm', authenticateToken, confirmPayment);
router.post('/refund', authenticateToken, refundPayment);
router.get('/status/:bookingId', authenticateToken, getPaymentStatus);

export default router;

