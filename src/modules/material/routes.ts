import { Router } from 'express';

import { db } from '../../infra/database';
import { validate } from '../../shared';

import { makeMaterialController } from './controller';
import {
  createMaterialSchema,
  listMaterialsQuerySchema,
  materialIdParamSchema,
  updateMaterialSchema,
} from './models';
import { makeMaterialRepository } from './repository';
import { makeMaterialService } from './services';

const materialRouter = Router();

const materialRepo = makeMaterialRepository(db);
const materialService = makeMaterialService(materialRepo);
const materialController = makeMaterialController(materialService);

materialRouter.get(
  '/',
  validate(listMaterialsQuerySchema, 'query'),
  materialController.findAll
);

materialRouter.get(
  '/:id',
  validate(materialIdParamSchema, 'params'),
  materialController.findById
);

materialRouter.get(
  '/:id/points',
  validate(materialIdParamSchema, 'params'),
  materialController.findByIdWithPoints
);

materialRouter.post(
  '/',
  validate(createMaterialSchema, 'body'),
  materialController.create
);

materialRouter.put(
  '/:id',
  validate(materialIdParamSchema, 'params'),
  validate(updateMaterialSchema, 'body'),
  materialController.update
);

materialRouter.delete(
  '/:id',
  validate(materialIdParamSchema, 'params'),
  materialController.delete
);

export { materialRouter };
