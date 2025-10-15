import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { logger } from './config/logger';
import { api } from './routes';
import { errorHandler } from './middlewares/error-handler';
import { auth } from './middlewares/auth';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(express.json());
  app.use(cors({ origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (env.allowOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  }}));

  // Rellenar req.user si hay token (no obligatorio)
  app.use(auth(false));

  app.use('/api/v1', api);

  app.use(errorHandler);
  return app;
}