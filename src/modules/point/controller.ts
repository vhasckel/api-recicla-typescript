import { NextFunction, Request, Response } from 'express';

import { logger } from '../../infra/logger';
import { ApiResponse } from '../../shared';

import {
  CreatePoint,
  ListPointsQuery,
  PointIdParam,
  UpdatePoint,
} from './models';
import { IPointService } from './services';

export interface IPointController {
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

  findByMaterialId(
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

export const makePointController = (
  service: IPointService
): IPointController => ({
  findAll: async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    try {
      const query = req.query as unknown as ListPointsQuery;
      const points = await service.findAll(query);

      logger.info(
        { queryParams: query, count: points.total },
        'points retrieved successfully'
      );

      res.status(200).json({
        success: true,
        data: points,
        meta: {
          limit: query.limit,
          offset: query.offset,
          count: points.total,
          total: points.total,
        },
      });
    } catch (error) {
      logger.error({ error }, 'error finding all points');
      next(error);
    }
  },

  findById: async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    const { id } = req.params as PointIdParam;
    try {
      const point = await service.findById(id);

      logger.info(
        { pointId: id, pointName: point?.name },
        'point retrieved successfully'
      );

      res.status(200).json({
        success: true,
        data: point,
      });
    } catch (err) {
      logger.error(
        {
          error: err instanceof Error ? err.message : String(err),
          pointId: id,
        },
        'error finding point by id'
      );
      next(err);
    }
  },

  findByMaterialId: async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    const { id } = req.params as PointIdParam;
    try {
      const points = await service.findByMaterialId(id);

      logger.info(
        { materialId: id, pointsCount: points.length },
        'points retrieved successfully'
      );

      res.status(200).json({
        success: true,
        data: points,
      });
    } catch (err) {
      logger.error(
        {
          error: err instanceof Error ? err.message : String(err),
          materialId: id,
        },
        'error finding points by material id'
      );
      next(err);
    }
  },

  create: async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    const pointData = req.body as CreatePoint;
    try {
      const point = await service.create(pointData);

      logger.info(
        { pointId: point.id, pointName: point.name },
        'point created successfully'
      );

      res.status(201).json({
        success: true,
        data: point,
        message: 'Point created successfully',
      });
    } catch (err) {
      logger.error(
        {
          error: err instanceof Error ? err.message : String(err),
          pointName: req.body?.name,
        },
        'error creating point'
      );
      next(err);
    }
  },

  update: async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    const { id } = req.params as PointIdParam;
    try {
      const pointData = req.body as UpdatePoint;
      const point = await service.update(id, pointData);

      logger.info(
        { pointId: id, pointName: point?.name },
        'point updated successfully'
      );

      res.status(200).json({
        success: true,
        data: point,
        message: 'Point updated successfully',
      });
    } catch (err) {
      logger.error(
        {
          error: err instanceof Error ? err.message : String(err),
          pointId: id,
          pointName: req.body?.name,
        },
        'error updating point'
      );
      next(err);
    }
  },

  delete: async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    const { id } = req.params as PointIdParam;
    try {
      await service.delete(id);

      logger.info({ pointId: id }, 'point deleted successfully');

      res.status(204).send();
    } catch (err) {
      logger.error(
        {
          error: err instanceof Error ? err.message : String(err),
          pointId: id,
        },
        'error deleting point'
      );
      next(err);
    }
  },
});
