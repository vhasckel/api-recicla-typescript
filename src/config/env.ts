import 'dotenv/config';
import z from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().optional(),
  HTTP_PORT: z.preprocess(
    (v) => v ?? process.env.PORT,
    z.coerce.number().default(3333)
  ),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  CORS_ORIGIN: z.string().default('*'),
  APP_NAME: z.string().default('Recicla'),
  DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().default('recicla'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('123456'),
  DB_POOL_MIN: z.coerce.number().default(2),
  DB_POOL_MAX: z.coerce.number().default(10),
  LOGGING_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export const env = envSchema.parse(process.env);
