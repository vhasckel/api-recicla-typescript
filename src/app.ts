import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { z } from 'zod';

import { db } from './infra/database';
import { logger } from './infra/logger';
import { errorHandler } from './middlewares/error';
import { notFound } from './middlewares/notFound';
import routes from './routes';
import { settings } from './settings';
import { validate } from './shared';
import { openapi } from './shared';

export const app = express();

app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
  })
);
app.use(settings.cors.origin ? cors({ origin: settings.cors.origin }) : cors());
app.options(
  /.*/,
  settings.cors.origin ? cors({ origin: settings.cors.origin }) : cors()
);

app.use(express.json());

if (settings.server.env === 'development') {
  app.use(morgan('dev'));
}

openapi(app);

app.get('/health', validate(z.object({}), 'query'), async (_req, res) => {
  const dbHealthy = await db.healthCheck();
  logger.info(
    {
      name: settings.server.name,
      database: dbHealthy ? 'connected' : 'disconnected',
    },
    'health check'
  );
  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? 'ok' : 'degraded',
    name: settings.server.name,
    database: dbHealthy ? 'connected' : 'disconnected',
  });
});

app.use(routes);

app.use(notFound);
app.use(errorHandler);
