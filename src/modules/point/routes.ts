import { Router } from 'express';

import { db } from '../../infra/database';
import { validate } from '../../shared/validation';
import { makeMaterialRepository } from '../material';

import { makePointController } from './controller';
import {
  listPointsQuerySchema,
  pointIdParamSchema,
  createPointSchema,
  updatePointSchema,
} from './models';
import { makePointRepository } from './repository';
import { makePointService } from './services';


const pointRouter = Router();

const pointRepo = makePointRepository(db);
const materialRepo = makeMaterialRepository(db);
const pointService = makePointService(pointRepo, materialRepo);
const pointController = makePointController(pointService);

pointRouter.get(
  '/',
  validate(listPointsQuerySchema, 'query'),
  pointController.findAll
);

pointRouter.get(
  '/:id',
  validate(pointIdParamSchema, 'params'),
  pointController.findById
);

pointRouter.get(
  '/material/:id',
  validate(pointIdParamSchema, 'params'),
  pointController.findByMaterialId
);

pointRouter.post(
  '/',
  validate(createPointSchema, 'body'),
  pointController.create
);

pointRouter.put(
  '/:id',
  validate(pointIdParamSchema, 'params'),
  validate(updatePointSchema, 'body'),
  pointController.update
);

pointRouter.delete(
  '/:id',
  validate(pointIdParamSchema, 'params'),
  pointController.delete
);

export { pointRouter };
