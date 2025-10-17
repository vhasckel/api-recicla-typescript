import z from 'zod';

export const materialModel = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().max(500).optional(),
  active: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Material = z.infer<typeof materialModel>;

export const createMaterialSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().max(500).optional(),
  active: z.boolean().default(true),
});

export type CreateMaterial = z.infer<typeof createMaterialSchema>;

export const updateMaterialSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().max(500).optional(),
  active: z.boolean().optional(),
});

export type UpdateMaterial = z.infer<typeof updateMaterialSchema>;

export const listMaterialsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(100),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().optional(),
  active: z.coerce.boolean().optional(),
});

export type ListMaterialsQuery = z.infer<typeof listMaterialsQuerySchema>;

export const materialIdParamSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export type MaterialIdParam = z.infer<typeof materialIdParamSchema>;

export const pointInMaterialModel = z.object({
  id: z.string().uuid(),
  name: z.string(),
  address: z.string(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  active: z.boolean(),
});

export type PointInMaterial = z.infer<typeof pointInMaterialModel>;

export const materialWithPointsModel = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  active: z.boolean(),
  points: z.array(pointInMaterialModel),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type MaterialWithPoints = z.infer<typeof materialWithPointsModel>;
