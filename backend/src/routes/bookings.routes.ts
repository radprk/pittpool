import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  confirmBooking,
  completeBooking,
  cancelBooking,
} from '../controllers/bookings.controller';

const router = Router();

router.post('/', authenticateToken, createBooking);
router.get('/my-bookings', authenticateToken, getMyBookings);
router.get('/:id', authenticateToken, getBookingById);
router.put('/:id/confirm', authenticateToken, confirmBooking);
router.put('/:id/complete', authenticateToken, completeBooking);
router.put('/:id/cancel', authenticateToken, cancelBooking);

export default router;

