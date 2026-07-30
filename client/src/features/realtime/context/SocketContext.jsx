import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../../context/AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, membership } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]); // List of users typing
  const socketRef = useRef(null);

  const workspaceId =
    membership?.workspaceId ||
    user?.currentWorkspaceId ||
    localStorage.getItem('nexora_workspace_id') ||
    null;

  useEffect(() => {
    const token = localStorage.getItem('nexora_jwt_token');
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const baseUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1')
      .replace('/api/v1', '');

    const cleanToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

    // Initialize socket connection
    const newSocket = io(baseUrl, {
      auth: { token: cleanToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect_error', (err) => {
      console.warn('⚡ Socket connection paused:', err?.message || err);
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected:', newSocket.id);
      setIsConnected(true);

      // Join workspace presence room
      if (workspaceId) {
        newSocket.emit('workspace:join', {
          workspaceId,
          userDetails: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
          },
        });
      }
    });

    newSocket.on('presence:update', ({ onlineUsers: list }) => {
      setOnlineUsers(list || []);
    });

    newSocket.on('typing:update', ({ user: typingUser, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          if (prev.some((u) => u.id === typingUser.id)) return prev;
          return [...prev, typingUser];
        } else {
          return prev.filter((u) => u.id !== typingUser.id);
        }
      });
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    });

    return () => {
      if (workspaceId) {
        newSocket.emit('workspace:leave', { workspaceId });
      }
      newSocket.disconnect();
    };
  }, [user, workspaceId]);

  // Join Project Board Room
  const joinProjectRoom = (projectId) => {
    if (socketRef.current && projectId) {
      socketRef.current.emit('board:join', { projectId });
    }
  };

  // Leave Project Board Room
  const leaveProjectRoom = (projectId) => {
    if (socketRef.current && projectId) {
      socketRef.current.emit('board:leave', { projectId });
    }
  };

  // Emit typing start
  const startTyping = (room) => {
    if (socketRef.current && room && user) {
      socketRef.current.emit('typing:start', {
        room,
        user: { id: user._id, name: user.name },
      });
    }
  };

  // Emit typing stop
  const stopTyping = (room) => {
    if (socketRef.current && room && user) {
      socketRef.current.emit('typing:stop', {
        room,
        user: { id: user._id, name: user.name },
      });
    }
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    typingUsers,
    joinProjectRoom,
    leaveProjectRoom,
    startTyping,
    stopTyping,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
