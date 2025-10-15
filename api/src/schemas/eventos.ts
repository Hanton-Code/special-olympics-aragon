import { z } from 'zod';

export const temporadaCreateSchema = z.object({
  name: z.string(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  active: z.boolean().optional()
});

export const eventoCreateSchema = z.object({
  title: z.string(),
  type: z.string(),
  capacity: z.coerce.number().int().positive(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  location: z.string(),
  temporadaId: z.cuid()
});