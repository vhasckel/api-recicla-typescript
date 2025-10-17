import { BadRequestError, NotFoundError } from '../../shared/exceptions';
import { IMaterialRepository } from '../material/repository';

import { CreatePoint, ListPointsQuery, Point, UpdatePoint } from './models';
import { IPointRepository } from './repository';

export interface IPointService {
  findAll(query: ListPointsQuery): Promise<{ data: Point[]; total: number }>;
  findById(id: string): Promise<Point | null>;
  findByMaterialId(materialId: string): Promise<Point[]>;
  create(data: CreatePoint): Promise<Point>;
  update(id: string, data: UpdatePoint): Promise<Point | null>;
  delete(id: string): Promise<boolean>;
}

const MAX_LIMIT = 100;

export const makePointService = (
  repository: IPointRepository,
  materialRepository: IMaterialRepository
): IPointService => {
  const validateMaterials = async (materialIds: string[]): Promise<void> => {
    for (const materialId of materialIds) {
      const exists = await materialRepository.findById(materialId);
      if (!exists) {
        throw new BadRequestError(`Material with id ${materialId} not found`);
      }
    }
  };

  const ensurePointExists = async (id: string): Promise<void> => {
    const point = await repository.findById(id);
    if (!point) {
      throw new NotFoundError('Point not found');
    }
  };

  return {
    findAll: async (query: ListPointsQuery) => {
      if (query.limit > MAX_LIMIT) {
        throw new BadRequestError(`Limit cannot exceed ${MAX_LIMIT}`);
      }
      return repository.findAll(query);
    },

    findById: (id: string) => repository.findById(id),

    findByMaterialId: (materialId: string) =>
      repository.findByMaterialId(materialId),

    create: async (data: CreatePoint) => {
      await validateMaterials(data.materialIds);
      return repository.create(data);
    },

    update: async (id: string, data: UpdatePoint) => {
      await ensurePointExists(id);
      if (data.materialIds?.length) {
        await validateMaterials(data.materialIds);
      }
      return repository.update(id, data);
    },

    delete: async (id: string) => {
      await ensurePointExists(id);
      return repository.delete(id);
    },
  };
};
