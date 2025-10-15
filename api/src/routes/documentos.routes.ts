import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { env } from '../config/env';
import { auth } from '../middlewares/auth';
import { registerUpload, updateDocumento, validarDocumento } from '../domain/documentos.service';
import { documentoUpdateSchema, validarDocSchema } from '../schemas/documentos';
import { ensureUploadDir } from '../libs/storage';

ensureUploadDir();
const upload = multer({
  storage: multer.diskStorage({
    destination: env.uploadDir,
    filename: (_req, file, cb) => {
      const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`;
      cb(null, name);
    }
  }),
  limits: { fileSize: env.maxPdfMB * 1024 * 1024 }
});

export const documentosRouter = Router();

//TODO: Wrong endpoint definition. CANNOT BE A VERB
documentosRouter.post('/upload', auth(), upload.single('file'), async (req, res, next) => {
    try {
        const { personaId } = req.body as any;
        const doc = await registerUpload(personaId, req.file!, req.user?.id);
        res.status(201).json(doc);
    } catch (e) { next(e); }
});

documentosRouter.patch('/:id', auth(), async (req, res, next) => {
    try {
        const data = documentoUpdateSchema.parse(req.body);
        const doc = await updateDocumento(String(req.params.id), data);
        res.json(doc);
    } catch (e) { next(e); }
});

//TODO: Wrong endpoint definition. CANNOT BE A VERB
documentosRouter.post('/:id/validar', auth(), async (req, res, next) => {
  try {
    const { status, note } = validarDocSchema.parse(req.body);
    const doc = await validarDocumento(String(req.params.id), status, note, req.user?.id);
    res.json(doc);
  } catch (e) { next(e); }
});