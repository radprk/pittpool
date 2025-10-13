import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createRide,
  getAllRides,
  getMyRides,
  getRideById,
  updateRide,
  deleteRide,
  getRideMatches,
} from '../controllers/rides.controller';

const router = Router();

router.post('/', authenticateToken, createRide);
router.get('/', authenticateToken, getAllRides);
router.get('/my-rides', authenticateToken, getMyRides);
router.get('/:id', authenticateToken, getRideById);
router.put('/:id', authenticateToken, updateRide);
router.delete('/:id', authenticateToken, deleteRide);
router.get('/:id/matches', authenticateToken, getRideMatches);

export default router;

