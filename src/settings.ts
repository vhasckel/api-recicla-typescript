import { env } from './config/env';

export const settings = {
  server: {
    port: env.HTTP_PORT,
    name: env.APP_NAME,
    env: env.NODE_ENV,
  },
  logging: {
    level: env.LOGGING_LEVEL,
  },
  cors: {
    origin:
      env.CORS_ORIGIN === '*'
        ? undefined
        : env.CORS_ORIGIN.split(',').map((s) => s.trim()),
  },
  openapi: {
    enabled: true,
    spec: {
      path: '/spec',
      title: 'API Recicla',
      description:
        'API para gerenciamento de materiais recicláveis e pontos de coleta',
      version: '1.0.0',
    },
  },
};
