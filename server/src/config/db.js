import mongoose from 'mongoose';

/**
 * Robust production-ready MongoDB connection utility.
 * Features retry logic, event listeners, and graceful shutdown handles.
 */
let isGracefulShutdown = false;

export const connectDB = async () => {
  const dbUri = process.env.MONGODB_URI;

  if (!dbUri) {
    console.error('CRITICAL: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  const options = {
    autoIndex: true, // Build indexes; consider disabling in production for massive datasets
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  };

  // Configure mongoose connection event listeners
  mongoose.connection.on('connecting', () => {
    console.info('MongoDB: Connecting to persistent store...');
  });

  mongoose.connection.on('connected', () => {
    console.info(`MongoDB: Successfully connected to host: ${mongoose.connection.host}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB: Connection error occurred: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    if (!isGracefulShutdown) {
      console.warn('MongoDB: Connection disconnected! Attempting reconnection...');
    }
  });

  mongoose.connection.on('reconnected', () => {
    console.info('MongoDB: Connection re-established successfully.');
  });

  // Connection retry logic using exponential backoff
  const maxRetries = 5;
  let retryCount = 0;

  const connectWithRetry = async () => {
    try {
      await mongoose.connect(dbUri, options);
    } catch (err) {
      retryCount += 1;
      console.error(
        `MongoDB: Initial connection failed (Attempt ${retryCount}/${maxRetries}): ${err.message}`,
      );

      if (retryCount >= maxRetries) {
        console.error('MongoDB: Max retries exceeded. Terminating backend boot.');
        process.exit(1);
      }

      const backoffDelay = Math.pow(2, retryCount) * 1000;
      console.info(`MongoDB: Retrying connection in ${backoffDelay / 1000}s...`);
      /* global setTimeout */
      setTimeout(connectWithRetry, backoffDelay);
    }
  };

  await connectWithRetry();

  // Setup process termination hooks for graceful shutdown
  const shutdown = async (signal) => {
    if (isGracefulShutdown) {
      return;
    }
    isGracefulShutdown = true;
    console.warn(`\nMongoDB: Received ${signal}. Shutting down connection gracefully...`);

    try {
      await mongoose.connection.close();
      console.warn('MongoDB: Connection closed successfully.');
      process.exit(0);
    } catch (err) {
      console.error(`MongoDB: Error closing connection: ${err.message}`);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};
