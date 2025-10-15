import { z } from 'zod';

export const documentoUpdateSchema = z.object({
  type: z.string().optional(),
  expiresAt: z.coerce.date().optional(),
});

export const validarDocSchema = z.object({
  status: z.enum(['validated', 'expired']),
  note: z.string().optional()
});