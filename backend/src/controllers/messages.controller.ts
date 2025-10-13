import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.userId, receiverId: userId },
          { senderId: userId, receiverId: req.userId },
        ],
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
      orderBy: {
        sentAt: 'asc',
      },
    });

    res.json({ messages });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { receiverId, content, rideId, rideRequestId } = req.body;

    if (!receiverId || !content) {
      res.status(400).json({ error: 'Receiver and content are required' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        senderId: req.userId!,
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

    // Note: Real-time delivery handled by Socket.io in socket.service.ts

    res.status(201).json({ message: 'Message sent successfully', data: message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    // Only receiver can mark as read
    if (message.receiverId !== req.userId) {
      res.status(403).json({ error: 'You can only mark your own messages as read' });
      return;
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: {
        readAt: new Date(),
      },
    });

    res.json({ message: 'Message marked as read', data: updatedMessage });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get all users that the current user has exchanged messages with
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.userId },
          { receiverId: req.userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            rating: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            rating: true,
          },
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
    });

    // Extract unique conversations
    const conversationsMap = new Map();
    
    messages.forEach(msg => {
      const otherUserId = msg.senderId === req.userId ? msg.receiverId : msg.senderId;
      
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          user: msg.senderId === req.userId ? msg.receiver : msg.sender,
          lastMessage: msg,
          unreadCount: 0,
        });
      }
      
      // Count unread messages
      if (msg.receiverId === req.userId && !msg.readAt) {
        conversationsMap.get(otherUserId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
};

