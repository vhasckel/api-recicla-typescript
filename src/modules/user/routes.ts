import { Router } from 'express';

import { db } from '../../infra/database';
import { validate } from '../../shared/validation';

import { makeUserController } from './controller';
import {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
  userIdParamSchema,
} from './models';
import { makeUserRepository } from './repository';
import { makeUserService } from './services';


const userRouter = Router();

const userRepo = makeUserRepository(db);
const userService = makeUserService(userRepo);
const userController = makeUserController(userService);

userRouter.get(
  '/',
  validate(listUsersQuerySchema, 'query'),
  userController.findAll
);

userRouter.get(
  '/:id',
  validate(userIdParamSchema, 'params'),
  userController.findById
);

userRouter.post('/', validate(createUserSchema, 'body'), userController.create);

userRouter.put(
  '/:id',
  validate(userIdParamSchema, 'params'),
  validate(updateUserSchema, 'body'),
  userController.update
);

userRouter.delete(
  '/:id',
  validate(userIdParamSchema, 'params'),
  userController.delete
);

export { userRouter };
