import { z } from 'zod';

export const materialCreateSchema = z.object({
  sku: z.string(),
  name: z.string(),
  description: z.string().optional(),
  totalStock: z.coerce.number().int().nonnegative(),
  alertThreshold: z.coerce.number().int().nonnegative().optional()
});

export const movimientoCreateSchema = z.object({
  materialId: z.cuid(),
  kind: z.enum(['in','out','adjust','missing']),
  quantity: z.coerce.number().int().positive(),
  reason: z.string().optional(),
  reference: z.string().optional()
});