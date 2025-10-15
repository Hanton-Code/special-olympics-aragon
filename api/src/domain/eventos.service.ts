import { prisma } from '../libs/prisma';

export async function createTemporada(data: any) {
  if (data.active) {
    await prisma.temporada.updateMany({ data: { active: false } });
  }
  return prisma.temporada.create({ data });
}

export async function listEventos(query: any) {
  const where: any = { deletedAt: null };
  if (query.temporadaId) where.temporadaId = query.temporadaId;
  if (query.estado) where.status = query.estado;
  if (query.tipo) where.type = query.tipo;
  return prisma.evento.findMany({ where, orderBy: { startAt: 'desc' } });
}

export async function createEvento(data: any) {
  return prisma.evento.create({ data });
}

export async function updateEvento(id: string, data: any) {
  return prisma.evento.update({ where: { id }, data });
}

export async function softDeleteEvento(id: string) {
  return prisma.evento.update({ where: { id }, data: { deletedAt: new Date() } });
}