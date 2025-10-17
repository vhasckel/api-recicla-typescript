import { NextFunction, Request, Response } from 'express';
import pino from 'pino';

import { settings } from '../settings';
import { ApiResponse } from '../shared';

export const logger = pino({
  level: settings.logging.level,
  base: { app: settings.server.name, env: settings.server.env },
  ...(settings.server.env === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  }),
});

export const logServerInfo = () => {
  logger.info(`${settings.server.name} - ${settings.server.env}`);
  logger.info(
    `server is running on port ${settings.server.port}: http://localhost:${settings.server.port}`
  );
};

const logRequest = (req: Request) => {
  const { method, url, body, params, query } = req;
  logger.debug({ method, url, body, params, query }, 'request');
};

const logResponse = (body: unknown) => {
  if (!body) return;
  let parsedBody = body;
  if (typeof body === 'string') {
    try {
      parsedBody = JSON.parse(body);
    } catch {
      parsedBody = body;
    }
  }
  logger.debug({ body: parsedBody }, 'response');
};

export const logHttpDebug = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (settings.logging.level !== 'debug') {
    next();
    return;
  }

  logRequest(req);

  const originalSend = res.send;
  let responseLogged = false;

  res.send = function (body: ApiResponse<unknown>) {
    if (!responseLogged) {
      responseLogged = true;
      logResponse(body);
    }
    return originalSend.call(this, body);
  };

  next();
};
