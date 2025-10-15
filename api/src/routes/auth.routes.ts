import { Router } from 'express';
import { login, register } from '@domain/auth.service';
import { loginSchema, registerSchema } from '@schemas/auth';

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, password, role } = registerSchema.parse(req.body);
    const user = await register(email, password, role);
    res.status(201).json(user);
  } catch (e) { next(e); }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await login(email, password);
    res.json(result);
  } catch (e) { next(e); }
});

authRouter.get('/me', (req, res) => {
  res.json({ user: req.user ?? null });
});