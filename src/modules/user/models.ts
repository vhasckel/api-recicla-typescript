import z from 'zod';

export const userModel = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string(),
  role: z.enum(['user', 'admin']),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type User = z.infer<typeof userModel>;

export const createUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  role: z.enum(['user', 'admin']).default('user'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .optional(),
  role: z.enum(['user', 'admin']).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const listUsersQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(100),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().optional(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const userIdParamSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;
