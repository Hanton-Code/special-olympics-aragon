import { prisma } from '../libs/prisma';

async function participantDocsAreValid(participantType: 'Voluntario'|'Tutorizado', participantId: string) {
  // Regla base: debe existir al menos 1 documento validado no caducado
  const personaId = participantId; // en este MVP usamos personaId
  const now = new Date();
  const count = await prisma.documento.count({ where: { personaId, status: 'validated', OR: [ { expiresAt: null }, { expiresAt: { gt: now } } ] } });
  return count > 0;
}

export async function inscribir(eventoId: string, participantType: 'Voluntario'|'Tutorizado', participantId: string) {
  const evento = await prisma.evento.findUnique({ where: { id: eventoId }, include: { inscripciones: true, waitlist: true } });
  if (!evento) throw Object.assign(new Error('Evento not found'), { status: 404 });

  const okDocs = await participantDocsAreValid(participantType, participantId);
  if (!okDocs) throw Object.assign(new Error('Participant documentation not valid'), { status: 409 });

  const confirmedCount = evento.inscripciones.filter(i => i.status === 'confirmed').length;
  if (confirmedCount < evento.capacity) {
    return prisma.inscripcion.create({ data: { eventoId, participantType, participantId, status: 'confirmed' } });
  } else {
    const position = (evento.waitlist.map(w => w.position).sort((a,b)=>b-a)[0] ?? 0) + 1;
    await prisma.waitlist.create({ data: { eventoId, participantType, participantId, position } });
    return { status: 'waitlist', position } as any;
  }
}

export async function cancelarInscripcion(id: string) {
  const ins = await prisma.inscripcion.update({ where: { id }, data: { status: 'cancelled' } });
  await promoverWaitlist(ins.eventoId);
  return ins;
}

export async function promoverWaitlist(eventoId: string) {
  const evento = await prisma.evento.findUnique({ where: { id: eventoId }, include: { inscripciones: true, waitlist: { orderBy: { position: 'asc' } } } });
  if (!evento) return;
  const confirmedCount = evento.inscripciones.filter(i => i.status === 'confirmed').length;
  const available = Math.max(0, evento.capacity - confirmedCount);
  const toPromote = evento.waitlist.slice(0, available);
  for (const w of toPromote) {
    await prisma.inscripcion.create({ data: { eventoId, participantType: w.participantType, participantId: w.participantId, status: 'confirmed' } });
    await prisma.waitlist.delete({ where: { id: w.id } });
  }
}