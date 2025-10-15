import { Router } from 'express';
import { authRouter } from './auth.routes';
import { personasRouter } from './personas.routes';
import { documentosRouter } from './documentos.routes';
import { eventosRouter } from './eventos.routes';
import { inscripcionesRouter } from './inscripciones.routes';
import { inventarioRouter } from './inventario.routes';

export const api = Router();

api.get('/health', (_req, res) => res.json({ status: 'ok' }));

api.use('/auth', authRouter);
api.use('/personas', personasRouter);
api.use('/documentos', documentosRouter);
api.use('/eventos', eventosRouter);
api.use('/', inscripcionesRouter); // define rutas /eventos/:id/inscripciones y waitlist
api.use('/', inventarioRouter); // rutas de inventario