import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import prisma from '../config/database';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const initializeSocketService = (io: Server): void => {
  // Authentication middleware for Socket.io
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const payload = verifyToken(token);
      socket.userId = payload.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room for receiving messages
    if (socket.userId) {
      socket.join(socket.userId);
    }

    // Handle sending messages
    socket.on('send-message', async (data) => {
      try {
        const { receiverId, content, rideId, rideRequestId } = data;

        // Save message to database
        const message = await prisma.message.create({
          data: {
            senderId: socket.userId!,
            receiverId,
            content,
            rideId: rideId || null,
            rideRequestId: rideRequestId || null,
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                profilePhoto: true,
              },
            },
            receiver: {
              select: {
                id: true,
                name: true,
                profilePhoto: true,
              },
            },
          },
        });

        // Emit to sender (confirmation)
        socket.emit('message-sent', message);

        // Emit to receiver
        io.to(receiverId).emit('new-message', message);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('message-error', { error: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { receiverId } = data;
      io.to(receiverId).emit('user-typing', {
        userId: socket.userId,
        isTyping: true,
      });
    });

    socket.on('stop-typing', (data) => {
      const { receiverId } = data;
      io.to(receiverId).emit('user-typing', {
        userId: socket.userId,
        isTyping: false,
      });
    });

    // Handle marking messages as read
    socket.on('mark-read', async (data) => {
      try {
        const { messageId } = data;

        await prisma.message.update({
          where: { id: messageId },
          data: { readAt: new Date() },
        });

        // Notify sender that message was read
        const message = await prisma.message.findUnique({
          where: { id: messageId },
        });

        if (message) {
          io.to(message.senderId).emit('message-read', {
            messageId,
            readAt: new Date(),
          });
        }
      } catch (error) {
        console.error('Mark as read error:', error);
      }
    });

    // Handle booking notifications
    socket.on('booking-created', (data) => {
      const { driverId, booking } = data;
      io.to(driverId).emit('new-booking', booking);
    });

    socket.on('booking-confirmed', (data) => {
      const { riderId, booking } = data;
      io.to(riderId).emit('booking-confirmed', booking);
    });

    socket.on('booking-cancelled', (data) => {
      const { userId, booking } = data;
      io.to(userId).emit('booking-cancelled', booking);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  console.log('✅ Socket.io service initialized');
};

