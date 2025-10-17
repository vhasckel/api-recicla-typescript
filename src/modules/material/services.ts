import { BadRequestError, NotFoundError } from '../../shared';

import {
  CreateMaterial,
  Material,
  MaterialWithPoints,
  UpdateMaterial,
} from './models';
import { IMaterialRepository } from './repository';

const MAX_LIMIT = 100;

export interface IMaterialService {
  findAll(limit: number, offset?: number): Promise<Material[]>;
  findById(id: string): Promise<Material | null>;
  findBySlug(slug: string): Promise<Material | null>;
  findByIdWithPoints(id: string): Promise<MaterialWithPoints | null>;
  create(data: CreateMaterial): Promise<Material>;
  update(id: string, data: UpdateMaterial): Promise<Material | null>;
  delete(id: string): Promise<boolean>;
}

export const makeMaterialService = (
  repository: IMaterialRepository
): IMaterialService => ({
  findAll: async (limit: number, offset: number = 0) => {
    if (limit > MAX_LIMIT) {
      throw new BadRequestError(`Limit cannot exceed ${MAX_LIMIT}`);
    }

    return repository.findAll(limit, offset);
  },

  findById: async (id: string) => {
    return repository.findById(id);
  },

  findBySlug: async (slug: string) => {
    return repository.findBySlug(slug);
  },

  findByIdWithPoints: async (id: string) => {
    return repository.findByIdWithPoints(id);
  },

  create: async (data: CreateMaterial) => {
    const existingMaterial = await repository.findBySlug(data.slug ?? '');

    if (existingMaterial) {
      throw new BadRequestError('Material with this slug already exists');
    }

    return repository.create(data);
  },

  update: async (id: string, data: UpdateMaterial) => {
    const existingMaterial = await repository.findById(id);
    if (!existingMaterial) {
      throw new NotFoundError('Material not found');
    }

    if (data.slug && data.slug !== existingMaterial.slug) {
      const slugInUse = await repository.findBySlug(data.slug);

      if (slugInUse) {
        throw new BadRequestError('Slug already in use');
      }
    }

    const updatedMaterial = await repository.update(id, data);

    if (!updatedMaterial) {
      throw new BadRequestError('Failed to update material');
    }

    return updatedMaterial;
  },

  delete: async (id: string) => {
    const existingMaterial = await repository.findById(id);

    if (!existingMaterial) {
      throw new NotFoundError('Material not found');
    }

    return repository.delete(id);
  },
});
