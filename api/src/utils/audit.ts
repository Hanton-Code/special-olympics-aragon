import { prisma } from '@libs/prisma';

export async function audit(entity: string, entityId: string, action: string, userId?: string, detail?: any) {
  await prisma.audit.create({ data: { entity, entityId, action, userId, detail } });
}