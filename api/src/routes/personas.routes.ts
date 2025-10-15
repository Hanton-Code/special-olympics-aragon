import { Router } from 'express';
import { auth } from '@middlewares/auth';
import { requireRole } from '@middlewares/rbac';
import { toPagination } from '@utils/pagination';
import { personaCreateSchema } from '@schemas/personas';
import { createPersona, listPersonas, softDeletePersona } from '@domain/personas.service';

export const personasRouter = Router();

personasRouter.get('/', auth(), async (req, res, next) => {
  try {
    const { page, size } = toPagination(req.query);
    const data = await listPersonas(req.query, page, size);
    res.json(data);
  } catch (e) { next(e); }
});

personasRouter.post('/', auth(), requireRole('Administrador','Trabajador'), async (req, res, next) => {
  try {
    const data = personaCreateSchema.parse(req.body);
    const persona = await createPersona(data, req.user?.id);
    res.status(201).json(persona);
  } catch (e) { next(e); }
});

personasRouter.delete('/:id', auth(), requireRole('Administrador','Trabajador'), async (req, res, next) => {
  try {
    const persona = await softDeletePersona(String(req.params.id), req.user?.id);
    res.json(persona);
  } catch (e) { next(e); }
});