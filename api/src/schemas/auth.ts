import { z } from 'zod';
export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(['Administrador', 'Trabajador', 'Tutor', 'Voluntario'])
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8)
});