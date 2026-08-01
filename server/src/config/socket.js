import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let ioInstance = null;

// Map workspaceId -> Map<userId, { socketId, user } >
const onlineWorkspaceUsers = new Map();

/**
 * Helper to get list of online users in a workspace.
 */
const getOnlineUsersForWorkspace = (workspaceId) => {
  const usersMap = onlineWorkspaceUsers.get(workspaceId);
  if (!usersMap) return [];
  return Array.from(usersMap.values()).map((item) => item.user);
};

/**
 * Initializes socket.io instance with HTTP server configurations.
 * Sets up authorization middleware and standard connection listeners.
 *
 * @param {object} server - Node HTTP server instance
 */
export const initSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        callback(null, true);
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // Socket authentication middleware via JWT
  ioInstance.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

    if (!token) {
      next(new Error('Authentication error: Token missing.'));
      return;
    }

    try {
      const parsedToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      const decoded = jwt.verify(parsedToken, process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_32_chars_long');
      socket.user = decoded; // Bind decoded identity to socket
      next();
    } catch {
      next(new Error('Authentication error: Invalid or expired token.'));
    }
  });

  // Client connection orchestration
  ioInstance.on('connection', (socket) => {
    const userId = socket.user?.id || socket.user?._id;
    let currentWorkspaceId = null;
    let currentProjectId = null;

    console.log(`Socket Connected: User ${userId} with Socket ID: ${socket.id}`);

    // Join Workspace Room & Presence Tracking
    socket.on('workspace:join', ({ workspaceId, userDetails }) => {
      if (!workspaceId) return;
      currentWorkspaceId = workspaceId;
      socket.join(`workspace:${workspaceId}`);

      if (!onlineWorkspaceUsers.has(workspaceId)) {
        onlineWorkspaceUsers.set(workspaceId, new Map());
      }
      const usersMap = onlineWorkspaceUsers.get(workspaceId);
      const userObj = userDetails || { id: userId, name: socket.user?.name || 'User', email: socket.user?.email };
      usersMap.set(userId, { socketId: socket.id, user: userObj });

      // Broadcast updated online presence to workspace members
      const onlineList = getOnlineUsersForWorkspace(workspaceId);
      ioInstance.to(`workspace:${workspaceId}`).emit('presence:update', { onlineUsers: onlineList });
    });

    // Leave Workspace Room
    socket.on('workspace:leave', ({ workspaceId }) => {
      if (!workspaceId) return;
      socket.leave(`workspace:${workspaceId}`);
      if (onlineWorkspaceUsers.has(workspaceId)) {
        const usersMap = onlineWorkspaceUsers.get(workspaceId);
        usersMap.delete(userId);
        const onlineList = getOnlineUsersForWorkspace(workspaceId);
        ioInstance.to(`workspace:${workspaceId}`).emit('presence:update', { onlineUsers: onlineList });
      }
    });

    // Join Project Board Room
    socket.on('board:join', ({ projectId }) => {
      if (projectId) {
        currentProjectId = projectId;
        socket.join(`project:${projectId}`);
        console.log(`Socket ${socket.id} joined room: project:${projectId}`);
      }
    });

    // Leave Project Board Room
    socket.on('board:leave', ({ projectId }) => {
      if (projectId) {
        socket.leave(`project:${projectId}`);
        console.log(`Socket ${socket.id} left room: project:${projectId}`);
      }
    });

    // Handle collaborative board modifications (task moves, updates)
    socket.on('board:change', ({ projectId, payload }) => {
      socket.to(`project:${projectId}`).emit('board:update', payload);
    });

    // Typing Indicators
    socket.on('typing:start', ({ room, user }) => {
      socket.to(room).emit('typing:update', { user, isTyping: true });
    });

    socket.on('typing:stop', ({ room, user }) => {
      socket.to(room).emit('typing:update', { user, isTyping: false });
    });

    // Live Comments
    socket.on('comment:new', ({ room, comment }) => {
      socket.to(room).emit('comment:added', comment);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Socket Disconnected: Client ID ${socket.id}`);
      if (currentWorkspaceId && onlineWorkspaceUsers.has(currentWorkspaceId)) {
        const usersMap = onlineWorkspaceUsers.get(currentWorkspaceId);
        usersMap.delete(userId);
        const onlineList = getOnlineUsersForWorkspace(currentWorkspaceId);
        ioInstance.to(`workspace:${currentWorkspaceId}`).emit('presence:update', { onlineUsers: onlineList });
      }
    });
  });

  return ioInstance;
};

/**
 * Retrieves the initialized socket.io instance globally.
 */
export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized. Call initSocket first.');
  }
  return ioInstance;
};
