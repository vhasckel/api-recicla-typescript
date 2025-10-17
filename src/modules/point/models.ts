import z from 'zod';

export const materialInPointModel = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  active: z.boolean(),
});

export const pointModel = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  address: z.string().min(2),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  active: z.boolean(),
  materials: z.array(materialInPointModel),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Point = z.infer<typeof pointModel>;

export const createPointSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(2),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  active: z.boolean().default(true),
  materialIds: z
    .array(z.string().uuid())
    .min(1, 'Pelo menos um material é obrigatório'),
});

export type CreatePoint = z.infer<typeof createPointSchema>;

export const updatePointSchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().min(2).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  active: z.boolean().optional(),
  materialIds: z.array(z.string().uuid()).min(1).optional(),
});

export type UpdatePoint = z.infer<typeof updatePointSchema>;

export const listPointsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(100),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().optional(),
  active: z.coerce.boolean().optional(),
  materialIds: z.array(z.string().uuid()).optional(),
});

export type ListPointsQuery = z.infer<typeof listPointsQuerySchema>;

export const pointIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type PointIdParam = z.infer<typeof pointIdParamSchema>;
