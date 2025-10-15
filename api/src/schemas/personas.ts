import { z } from 'zod';

export const personaCreateSchema = z.object({
  type: z.enum(['Tutor', 'Voluntario', 'Tutorizado']),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  nif: z.string().optional(),
  birthDate: z.coerce.date().optional(),
  email: z.email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  specialNeeds: z.any().optional(),
  legalResponsibleId: z.string().optional()
});