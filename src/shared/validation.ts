import { NextFunction, Response, Request } from 'express';
import { ZodTypeAny } from 'zod';

export type FieldError = { field: string; message: string };
export interface ValidationError {
  success: false;
  errors: Array<FieldError>;
}
export type ValidateSource = 'body' | 'query' | 'params';

type Schemas = Partial<Record<ValidateSource, ZodTypeAny>>;

export const validate = (
  schemaOrSchemas: ZodTypeAny | Schemas,
  singleSource: ValidateSource = 'body'
) => {
  const schemas: Schemas =
    typeof schemaOrSchemas === 'object' &&
    'parseAsync' in (schemaOrSchemas as any)
      ? { [singleSource]: schemaOrSchemas as ZodTypeAny }
      : (schemaOrSchemas as Schemas);

  return async (
    req: Request,
    res: Response<ValidationError>,
    next: NextFunction
  ): Promise<void> => {
    const errors: FieldError[] = [];

    for (const [src, sch] of Object.entries(schemas) as Array<
      [ValidateSource, ZodTypeAny]
    >) {
      const result = await sch.safeParseAsync(req[src]);
      if (result.success) {
        if (src === 'query' || src === 'params') {
          Object.defineProperty(req, src, {
            value: result.data,
            writable: true,
            configurable: true,
            enumerable: true,
          });
        } else {
          (req as any)[src] = result.data;
        }
      } else {
        errors.push(
          ...result.error.issues.map((i) => ({
            field: i.path.join('.') || src,
            message: i.message,
          }))
        );
      }
    }

    if (errors.length) {
      res.status(400).json({ success: false, errors });
      return;
    }
    next();
  };
};
