import { prisma } from '@libs/prisma';
import { audit } from '@utils/audit';

export async function listPersonas(filter: any, page: number, size: number) {
  const where: any = { deletedAt: null };
  if (filter.role === 'voluntario') where.type = 'Voluntario';
  if (filter.role === 'tutor') where.type = 'Tutor';
  if (filter.search) {
    where.OR = [
      { firstName: { contains: filter.search, mode: 'insensitive' } },
      { lastName: { contains: filter.search, mode: 'insensitive' } },
      { email: { contains: filter.search, mode: 'insensitive' } }
    ];
  }
  const [items, total] = await Promise.all([
    prisma.persona.findMany({ where, skip: (page-1)*size, take: size }),
    prisma.persona.count({ where })
  ]);
  return { items, total, page, size };
}

export async function createPersona(data: any, userId?: string) {
  const persona = await prisma.persona.create({ data: {
    type: data.type,
    firstName: data.firstName,
    lastName: data.lastName,
    nif: data.nif,
    birthDate: data.birthDate,
    email: data.email,
    phone: data.phone,
    address: data.address,
    voluntario: data.type === 'Voluntario' ? { create: {} } : undefined,
    tutor: data.type === 'Tutor' ? { create: {} } : undefined,
    tutorizado: data.type === 'Tutorizado' ? { create: { specialNeeds: data.specialNeeds, legalResponsibleId: data.legalResponsibleId ?? null } } : undefined
  }});
  await audit('Persona', persona.id, 'create', userId, { type: persona.type });
  return persona;
}

export async function softDeletePersona(id: string, userId?: string) {
  const p = await prisma.persona.update({ where: { id }, data: { deletedAt: new Date() } });
  await audit('Persona', id, 'soft-delete', userId);
  return p;
}