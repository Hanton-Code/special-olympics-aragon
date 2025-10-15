import { Router } from 'express';
import { auth } from '../middlewares/auth';
import { inscribir, cancelarInscripcion, promoverWaitlist } from '../domain/inscripciones.service';
import { prisma } from '../libs/prisma';

export const inscripcionesRouter = Router();

inscripcionesRouter.post('/eventos/:id/inscripciones', auth(), async (req, res, next) => {
  try {
    const eventoId = String(req.params.id);
    const { participantType, participantId } = req.body as any;
    const result = await inscribir(eventoId, participantType, participantId);
    res.status(201).json(result);
  } catch (e) { next(e); }
});

inscripcionesRouter.get('/eventos/:id/inscripciones', auth(), async (req, res, next) => {
  try { res.json(await prisma.inscripcion.findMany({ where: { eventoId: String(req.params.id) } })); } catch (e) { next(e); }
});

inscripcionesRouter.get('/eventos/:id/waitlist', auth(), async (req, res, next) => {
  try { res.json(await prisma.waitlist.findMany({ where: { eventoId: String(req.params.id) }, orderBy: { position: 'asc' } })); } catch (e) { next(e); }
});
//TODO: Endpoint mal definido: Promote no es válido (es un verbo, no un recurso)
inscripcionesRouter.post('/eventos/:id/waitlist/promote', auth(), async (req, res, next) => {
  try { await promoverWaitlist(String(req.params.id)); res.json({ ok: true }); } catch (e) { next(e); }
});

inscripcionesRouter.patch('/inscripciones/:id', auth(), async (req, res, next) => {
  try { res.json(await cancelarInscripcion(String(req.params.id))); } catch (e) { next(e); }
});