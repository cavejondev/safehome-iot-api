/**
 * Configura a instancia principal do Express com middlewares globais.
 */
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler } from './middlewares/error-handler';
import { apiRouter } from './routes';

export const app = express();

app.use(
  pinoHttp({
    logger
  })
);
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',')
  })
);
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120
  })
);
app.use(express.json({ limit: '1mb' }));

app.use('/api/v1', apiRouter);
app.use(errorHandler);
