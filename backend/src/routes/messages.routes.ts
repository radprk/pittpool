import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getChatHistory,
  sendMessage,
  markAsRead,
  getConversations,
} from '../controllers/messages.controller';

const router = Router();

router.get('/conversations', authenticateToken, getConversations);
router.get('/:userId', authenticateToken, getChatHistory);
router.post('/', authenticateToken, sendMessage);
router.put('/:id/read', authenticateToken, markAsRead);

export default router;

