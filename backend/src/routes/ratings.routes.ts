import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { createRating, getUserRatings } from '../controllers/ratings.controller';

const router = Router();

router.post('/', authenticateToken, createRating);
router.get('/user/:userId', authenticateToken, getUserRatings);

export default router;

