import fs from 'node:fs';
import { prisma } from '@libs/prisma';
import { computeSha256 } from '@libs/storage';
import { audit } from '@utils/audit';

export async function registerUpload(personaId: string, file: Express.Multer.File, userId?: string) {
  if (!file) throw Object.assign(new Error('File required'), { status: 400 });
  if (file.mimetype !== 'application/pdf') throw Object.assign(new Error('Only PDF allowed'), { status: 400 });
  const hash = computeSha256(file.path);
  const doc = await prisma.documento.create({ data: {
    personaId,
    type: 'generic',
    fileName: file.filename,
    hash,
    mime: file.mimetype,
    size: file.size,
    status: 'pending'
  }});
  await audit('Documento', doc.id, 'upload', userId, { size: file.size });
  return doc;
}

export async function updateDocumento(id: string, data: any) {
  return prisma.documento.update({ where: { id }, data });
}

export async function validarDocumento(id: string, status: 'validated'|'expired', note?: string, userId?: string) {
  const doc = await prisma.documento.update({ where: { id }, data: { status, note, validatedBy: userId ?? null, validatedAt: new Date() } });
  await audit('Documento', id, 'validate', userId, { status });
  return doc;
}