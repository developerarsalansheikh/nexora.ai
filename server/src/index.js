import 'dotenv/config';
import http from 'http';

import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';
import { validateEnv } from './config/env.validator.js';

// Resolve configuration profiles
validateEnv();

const PORT = process.env.PORT || 5000;

/**
 * Main application bootstrapping sequence.
 */
const bootstrap = async () => {
  // Connect to persistent store
  await connectDB();

  // Create HTTP core server wrapper
  const server = http.createServer(app);

  // Bind and run websocket listener
  initSocket(server);

  // Bind server listener
  server.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(` Nexora Core Service is booted successfully. `);
    console.log(` Port:    ${PORT}`);
    console.log(` Env:     ${process.env.NODE_ENV || 'production'}`);
    console.log(` URL:     http://localhost:${PORT}/api/v1/health`);
    console.log(`===================================================`);
  });

  // Track unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down gracefully...');
    console.error(err.name, err.message, err.stack);
    server.close(() => {
      process.exit(1);
    });
  });

  // Track uncaught synchronous exceptions
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down immediately...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
  });
};

bootstrap();
