import { prisma } from '@libs/prisma';

export async function createMaterial(data: any) {
  return prisma.material.create({ data });
}

export async function movimientoInventario(data: any) {
  const material = await prisma.material.findUnique({ where: { id: data.materialId } });
  if (!material) throw Object.assign(new Error('Material not found'), { status: 404 });
  let reserved = material.reservedStock;
  let total = material.totalStock;
  if (data.kind === 'in') total += data.quantity;
  if (data.kind === 'out') total = Math.max(0, total - data.quantity);
  if (data.kind === 'adjust') total = Math.max(0, data.quantity);
  if (data.kind === 'missing') total = Math.max(0, total - data.quantity);
  await prisma.$transaction([
    prisma.material.update({ where: { id: material.id }, data: { totalStock: total, reservedStock: reserved } }),
    prisma.movimientoInventario.create({ data })
  ]);
}

export async function reservarMaterial(eventoId: string, materialId: string, quantity: number) {
  const m = await prisma.material.findUnique({ where: { id: materialId } });
  if (!m) throw Object.assign(new Error('Material not found'), { status: 404 });
  const available = m.totalStock - m.reservedStock;
  if (quantity > available) throw Object.assign(new Error('Insufficient stock'), { status: 409 });
  await prisma.$transaction([
    prisma.reservaMaterial.create({ data: { eventoId, materialId, quantity } }),
    prisma.material.update({ where: { id: materialId }, data: { reservedStock: m.reservedStock + quantity } })
  ]);
}


//TODO: Corregir alertas (error de sintaxis Prisma)
/*export async function alertasInventario() {
  return prisma.material.findMany({ where: { AND: [ { alertThreshold: { gt: 0 } }, { OR: [ { totalStock: { lt: { field: 'alertThreshold' } } } ] } ] } });
}*/