import { z } from 'zod';

export const idParam = z.object({id:z.cuid()});
export const paginationQuery =z.object({
    page: z.coerce.number().int().positive().optional(),
    size: z.coerce.number().int().positive().max(100).optional()
})