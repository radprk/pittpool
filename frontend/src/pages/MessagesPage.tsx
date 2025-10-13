import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { messagesAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import type { Message, Conversation } from '../types';

const MessagesPage = () => {
  const { user } = useAuth();
  const { sendMessage, onNewMessage, onMessageSent, connected } = useSocket();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get conversations list
  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await messagesAPI.getConversations();
      return response.data.conversations as Conversation[];
    },
  });

  // Get chat history when user is selected
  const { data: chatHistory } = useQuery({
    queryKey: ['chatHistory', selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return [];
      const response = await messagesAPI.getChatHistory(selectedUserId);
      return response.data.messages as Message[];
    },
    enabled: !!selectedUserId,
  });

  // Update messages when chat history changes
  useEffect(() => {
    if (chatHistory) {
      setMessages(chatHistory);
    }
  }, [chatHistory]);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      if (message.senderId === selectedUserId || message.receiverId === selectedUserId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleMessageSent = (message: Message) => {
      // Message already added optimistically, but update with server data
      setMessages((prev) => {
        const filtered = prev.filter(m => m.id !== 'temp');
        return [...filtered, message];
      });
    };

    onNewMessage(handleNewMessage);
    onMessageSent(handleMessageSent);
  }, [selectedUserId, onNewMessage, onMessageSent]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUserId) return;

    // Add message optimistically
    const tempMessage: Message = {
      id: 'temp',
      senderId: user!.id,
      sender: user!,
      receiverId: selectedUserId,
      receiver: {} as any,
      content: messageInput,
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    // Send via socket
    sendMessage(selectedUserId, messageInput);
    setMessageInput('');
  };

  const selectedConversation = conversations?.find(
    (c) => c.user.id === selectedUserId
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-full sm:w-1/3 border-r overflow-y-auto">
            {conversations && conversations.length > 0 ? (
              <div>
                {conversations.map((conversation) => (
                  <button
                    key={conversation.user.id}
                    onClick={() => setSelectedUserId(conversation.user.id!)}
                    className={`w-full p-4 border-b hover:bg-gray-50 text-left transition ${
                      selectedUserId === conversation.user.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{conversation.user.name}</p>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conversation.lastMessage.sentAt).toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-600">
                No conversations yet
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedUserId ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedConversation?.user.name}</h3>
                      <p className="text-sm text-gray-600">
                        ⭐ {selectedConversation?.user.rating?.toFixed(1)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-xs text-gray-600">
                        {connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => {
                    const isMe = message.senderId === user?.id;
                    return (
                      <div
                        key={message.id || index}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${
                            isMe
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${isMe ? 'text-primary-100' : 'text-gray-600'}`}>
                            {new Date(message.sentAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 input-field"
                    />
                    <button
                      type="submit"
                      disabled={!connected || !messageInput.trim()}
                      className="btn-primary px-6"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-600">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;

