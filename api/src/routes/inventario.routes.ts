import { Router } from 'express';
import { auth } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';
import { materialCreateSchema, movimientoCreateSchema } from '../schemas/inventario';
import { createMaterial, movimientoInventario, reservarMaterial } from '../domain/inventario.service';
import { prisma } from '../libs/prisma';

export const inventarioRouter = Router();

inventarioRouter.get('/materiales', auth(), async (_req, res, next) => {
  try { res.json(await prisma.material.findMany()); } catch (e) { next(e); }
});

inventarioRouter.post('/materiales', auth(), requireRole('Administrador','Trabajador'), async (req, res, next) => {
  try { res.status(201).json(await createMaterial(materialCreateSchema.parse(req.body))); } catch (e) { next(e); }
});

inventarioRouter.post('/materiales/:id/movimientos', auth(), requireRole('Administrador','Trabajador'), async (req, res, next) => {
  try { res.json(await movimientoInventario({ ...movimientoCreateSchema.parse({ ...req.body, materialId: String(req.params.id) }) })); } catch (e) { next(e); }
});

inventarioRouter.post('/eventos/:id/materiales', auth(), requireRole('Administrador','Trabajador'), async (req, res, next) => {
  try {
    const { materialId, quantity } = req.body as any;
    await reservarMaterial(String(req.params.id), materialId, Number(quantity));
    res.status(201).json({ ok: true });
  } catch (e) { next(e); }
});