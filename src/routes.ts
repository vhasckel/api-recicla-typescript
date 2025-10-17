import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { logger } from './infra/logger';
import { materialRouter } from './modules/material';
import { pointRouter } from './modules/point';
import { userRouter } from './modules/user/routes';
import { settings } from './settings';
import { validate } from './shared';


const routes = Router();

routes.get(
  '/',
  validate(z.object({}), 'query'),
  (_req: Request, res: Response, next: NextFunction) => {
    logger.info(
      { name: settings.server.name, version: '1.0.0' },
      'API is running'
    );
    next();

    res.json({
      name: settings.server.name,
      version: '1.0.0',
    });
  }
);

routes.use('/users', userRouter);
routes.use('/materials', materialRouter);
routes.use('/points', pointRouter);

export default routes;
