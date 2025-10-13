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

// CORS configuration function that checks origins properly
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'https://pittpool.vercel.app',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    // Check if origin is in allowed list OR ends with .vercel.app
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

const io = new Server(server, {
  cors: {
    origin: function (origin: string | undefined, callback: Function) {
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://pittpool.vercel.app',
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors(corsOptions));
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