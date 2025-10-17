import { NextFunction, Request, Response } from 'express';

import { logger } from '../../infra/logger';
import { ApiResponse } from '../../shared';

import {
  CreateMaterial,
  ListMaterialsQuery,
  MaterialIdParam,
  UpdateMaterial,
} from './models';
import { IMaterialService } from './services';

export interface IMaterialController {
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

  findByIdWithPoints(
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

export const makeMaterialController = (
  service: IMaterialService
): IMaterialController => ({
  findAll: async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    const { limit, offset } = req.query as unknown as ListMaterialsQuery;
    try {
      const materials = await service.findAll(limit, offset);

      logger.info(
        { limit, offset, count: materials.length },
        'materials retrieved successfully'
      );

      res.status(200).json({
        success: true,
        data: materials,
        meta: {
          limit,
          offset,
          count: materials.length,
        },
      });
    } catch (err) {
      logger.error(
        {
          error: err instanceof Error ? err.message : String(err),
          limit,
          offset,
        },
        'error finding all materials'
      );
      next(err);
    }
  },

  findById: async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    const { id } = req.params as MaterialIdParam;
    try {
      const material = await service.findById(id);

      logger.info(
        { materialId: id, materialName: material?.name },
        'material retrieved successfully'
      );

      res.status(200).json({
        success: true,
        data: material,
      });
    } catch (err) {
      logger.error(
        {
          error: err instanceof Error ? err.message : String(err),
          materialId: id,
        },
        'error finding material by id'
      );
      next(err);
    }
  },

  findByIdWithPoints: async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    const { id } = req.params as MaterialIdParam;
    try {
      const material = await service.findByIdWithPoints(id);

      logger.info(
        { materialId: material?.id, materialName: material?.name },
        'material retrieved successfully with points'
      );

      res.status(200).json({
        success: true,
        data: material,
      });
    } catch (err) {
      logger.error(
        {
          error: err instanceof Error ? err.message : String(err),
          materialId: id,
        },
        'error finding material by id with points'
      );
      next(err);
    }
  },

  create: async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    const materialData = req.body as CreateMaterial;
    try {
      const material = await service.create(materialData);

      logger.info(
        { materialId: material.id, materialName: material.name },
        'material created successfully'
      );

      res.status(201).json({
        success: true,
        data: material,
        message: 'Material created successfully',
      });
    } catch (err) {
      logger.error(
        {
          error: err instanceof Error ? err.message : String(err),
          materialName: req.body?.name,
        },
        'error creating material'
      );
      next(err);
    }
  },
  update: async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    const { id } = req.params as MaterialIdParam;
    try {
      const materialData = req.body as UpdateMaterial;
      const material = await service.update(id, materialData);

      logger.info(
        { materialId: id, materialName: material?.name },
        'material updated successfully'
      );

      res.status(200).json({
        success: true,
        data: material,
        message: 'Material updated successfully',
      });
    } catch (err) {
      logger.error(
        {
          error: err instanceof Error ? err.message : String(err),
          materialId: id,
          materialName: req.body?.name,
        },
        'error updating material'
      );
      next(err);
    }
  },

  delete: async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    const { id } = req.params as MaterialIdParam;
    try {
      await service.delete(id);

      logger.info({ materialId: id }, 'material deleted successfully');

      res.status(204).send();
    } catch (err) {
      logger.error(
        {
          error: err instanceof Error ? err.message : String(err),
          materialId: id,
        },
        'error deleting material'
      );
      next(err);
    }
  },
});
