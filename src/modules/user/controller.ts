import { NextFunction, Request, Response } from 'express';

import { logger } from '../../infra/logger';
import { ApiResponse } from '../../shared';

import {
  CreateUserInput,
  UpdateUserInput,
  ListUsersQuery,
  UserIdParam,
} from './models';
import { IUserService } from './services';

export interface IUserController {
  findAll(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void>;

  findById(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void>;

  create(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void>;

  update(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void>;

  delete(
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void>;
}

export const makeUserController = (service: IUserService): IUserController => ({
  findAll: async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    const { limit, offset } = req.query as unknown as ListUsersQuery;
    try {
      const users = await service.findAll(limit, offset);

      logger.info(
        { count: users.length, limit, offset },
        'users retrieved successfully'
      );

      res.status(200).json({
        success: true,
        data: users,
        meta: {
          limit,
          offset,
          count: users.length,
        },
      });
    } catch (error) {
      logger.error({ error, limit, offset }, 'error finding all users');
      next(error);
    }
  },

  findById: async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    const { id } = req.params as UserIdParam;
    try {
      const user = await service.findById(id);

      logger.info(
        { userId: id, email: user?.email },
        'user retrieved successfully'
      );

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      logger.error(
        { error: err instanceof Error ? err.message : String(err), userId: id },
        'error finding user by id'
      );
      next(err);
    }
  },

  create: async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    try {
      const userData = req.body as CreateUserInput;
      const user = await service.create(userData);

      logger.info(
        { userId: user.id, email: user.email },
        'user created successfully'
      );

      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully',
      });
    } catch (err) {
      logger.error(
        {
          error: err instanceof Error ? err.message : String(err),
          email: req.body?.email,
        },
        'error creating user'
      );
      next(err);
    }
  },

  update: async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    const { id } = req.params as UserIdParam;
    try {
      const userData = req.body as UpdateUserInput;
      const user = await service.update(id, userData);

      logger.info(
        { userId: id, email: user?.email },
        'user updated successfully'
      );

      res.status(200).json({
        success: true,
        data: user,
        message: 'User updated successfully',
      });
    } catch (error) {
      logger.error({ error, userId: id }, 'error updating user');
      next(error);
    }
  },

  delete: async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    const { id } = req.params as UserIdParam;
    try {
      await service.delete(id);

      logger.info({ userId: id }, 'user deleted successfully');

      res.status(204).send();
    } catch (error) {
      logger.error({ error, userId: id }, 'error deleting user');
      next(error);
    }
  },
});
