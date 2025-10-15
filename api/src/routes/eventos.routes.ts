import { Router } from 'express';
import { auth } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';
import { temporadaCreateSchema, eventoCreateSchema } from '../schemas/eventos';
import { createTemporada, createEvento, listEventos, softDeleteEvento, updateEvento } from '../domain/eventos.service';
import { prisma } from 'src/libs/prisma';

export const eventosRouter = Router();

// Temporadas
eventosRouter.get('/temporadas', auth(), async (_req, res, next) => {
  try {
    res.json(await prisma.temporada.findMany({ orderBy: { startAt: 'desc' } }));
  } catch (e) { next(e); }
});

eventosRouter.post('/temporadas', auth(), requireRole('Administrador','Trabajador'), async (req, res, next) => {
  try {
    const data = temporadaCreateSchema.parse(req.body);
    res.status(201).json(await createTemporada(data));
  } catch (e) { next(e); }
});

// Eventos
eventosRouter.get('/', auth(false), async (req, res, next) => {
  try { res.json(await listEventos(req.query)); } catch (e) { next(e); }
});

eventosRouter.post('/', auth(), requireRole('Administrador','Trabajador'), async (req, res, next) => {
  try { res.status(201).json(await createEvento(eventoCreateSchema.parse(req.body))); } catch (e) { next(e); }
});

eventosRouter.patch('/:id', auth(), requireRole('Administrador','Trabajador'), async (req, res, next) => {
  try { res.json(await updateEvento(String(req.params.id), req.body)); } catch (e) { next(e); }
});

eventosRouter.delete('/:id', auth(), requireRole('Administrador','Trabajador'), async (req, res, next) => {
  try { res.json(await softDeleteEvento(String(req.params.id))); } catch (e) { next(e); }
});