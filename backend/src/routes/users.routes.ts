import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getMe, updateMe, getUserById, uploadDocument } from '../controllers/users.controller';

const router = Router();

router.get('/me', authenticateToken, getMe);
router.put('/me', authenticateToken, updateMe);
router.get('/:id', authenticateToken, getUserById);
router.post('/upload-document', authenticateToken, uploadDocument);

export default router;

