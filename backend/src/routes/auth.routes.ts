import { Router } from 'express';
import { register, login, verifyEmail, verifyPhone } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/verify-phone', verifyPhone);

export default router;

