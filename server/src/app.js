import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import apiRouter from './routes/api.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { noSqlSanitizer } from './middlewares/sanitizer.js';
import openApiSpec from './config/swagger.js';

const app = express();

// ─── 1. Security & Compression ─────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'ws:', 'wss:', 'http://localhost:5000', 'http://localhost:5173'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(compression());

// ─── 2. CORS ───────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);

// ─── 3. Body, Cookie & Input Sanitizer ──────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(noSqlSanitizer);

// ─── 4. Logging ────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// ─── 5. API Documentation & Versioned Routes ───────────────────────────────────
app.get('/api/v1/docs', (req, res) => res.json(openApiSpec));
app.use('/api/v1', apiRouter);

// ─── 6. 404 Handler ────────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ─── 7. Global Error Handler (must be last) ────────────────────────────────────
app.use(errorHandler);

export default app;
