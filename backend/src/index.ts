import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';
import rideRoutes from './routes/rides.routes';
import requestRoutes from './routes/requests.routes';
import bookingRoutes from './routes/bookings.routes';
import messageRoutes from './routes/messages.routes';
import paymentRoutes from './routes/payments.routes';
import ratingRoutes from './routes/ratings.routes';
import { initializeSocketService } from './services/socket.service';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'https://pittpool.vercel.app',
      'https://*.vercel.app'
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://pittpool.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ratings', ratingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

// Initialize Socket.io
initializeSocketService(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚗 PittPool server running on port ${PORT}`);
});

export { io };