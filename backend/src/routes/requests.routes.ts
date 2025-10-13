import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createRequest,
  getMyRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  getRequestMatches,
} from '../controllers/requests.controller';

const router = Router();

router.post('/', authenticateToken, createRequest);
router.get('/my-requests', authenticateToken, getMyRequests);
router.get('/:id', authenticateToken, getRequestById);
router.put('/:id', authenticateToken, updateRequest);
router.delete('/:id', authenticateToken, deleteRequest);
router.get('/:id/matches', authenticateToken, getRequestMatches);

export default router;

