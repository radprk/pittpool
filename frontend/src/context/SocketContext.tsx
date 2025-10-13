import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import type { Message } from '../types';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  sendMessage: (receiverId: string, content: string, rideId?: string, rideRequestId?: string) => void;
  onNewMessage: (callback: (message: Message) => void) => void;
  onMessageSent: (callback: (message: Message) => void) => void;
  startTyping: (receiverId: string) => void;
  stopTyping: (receiverId: string) => void;
  onUserTyping: (callback: (data: { userId: string; isTyping: boolean }) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const BASE_URL = API_URL.replace('/api', '');

    const newSocket = io(BASE_URL, {
      auth: {
        token,
      },
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const sendMessage = (
    receiverId: string,
    content: string,
    rideId?: string,
    rideRequestId?: string
  ) => {
    if (socket && connected) {
      socket.emit('send-message', {
        receiverId,
        content,
        rideId,
        rideRequestId,
      });
    }
  };

  const onNewMessage = (callback: (message: Message) => void) => {
    if (socket) {
      socket.on('new-message', callback);
    }
  };

  const onMessageSent = (callback: (message: Message) => void) => {
    if (socket) {
      socket.on('message-sent', callback);
    }
  };

  const startTyping = (receiverId: string) => {
    if (socket && connected) {
      socket.emit('typing', { receiverId });
    }
  };

  const stopTyping = (receiverId: string) => {
    if (socket && connected) {
      socket.emit('stop-typing', { receiverId });
    }
  };

  const onUserTyping = (callback: (data: { userId: string; isTyping: boolean }) => void) => {
    if (socket) {
      socket.on('user-typing', callback);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        sendMessage,
        onNewMessage,
        onMessageSent,
        startTyping,
        stopTyping,
        onUserTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

