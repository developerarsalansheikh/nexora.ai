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
        connectSrc: ["'self'", 'ws:', 'wss:', 'http:', 'https:'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(compression());

// Helper function to resolve allowed origins
const isOriginAllowed = (origin) => {
  if (!origin) return true;
  const envOrigins = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const allowed = envOrigins.split(',').map((o) => o.trim()).filter(Boolean);

  if (allowed.includes('*')) return true;
  if (allowed.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;
  return true; // Allow cross-origin requests for web client integration
};

// ─── 2. CORS ───────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
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

// ─── Root & API Probes ─────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Nexora Core API Server is live',
    version: '1.0.0',
    docs: '/api/v1/docs',
    health: '/api/v1/health',
    timestamp: new Date().toISOString(),
  });
});

// ─── 5. API Documentation & Versioned Routes ───────────────────────────────────
app.get('/api/v1/docs', (req, res) => res.json(openApiSpec));
app.use('/api/v1', apiRouter);

// ─── 6. 404 Handler ────────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ─── 7. Global Error Handler (must be last) ────────────────────────────────────
app.use(errorHandler);

export default app;
