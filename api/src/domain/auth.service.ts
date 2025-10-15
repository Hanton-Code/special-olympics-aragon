import { prisma } from '@libs/prisma';
import { hashPassword, verifyPassword } from '@utils/passwords';
import { signJwt } from '@utils/jwt';

export async function register(email: string, password: string, role: string) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw Object.assign(new Error('Email already registered'), { status: 400 });
  const pw = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, password: pw } });
  const roleRecord = await prisma.role.upsert({
    where: { name: role },
    update: {},
    create: { name: role }
  });
  await prisma.userRole.create({ data: { userId: user.id, roleId: roleRecord.id } });
  return { id: user.id, email: user.email, roles: [role] };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: { include: { role: true } } }
  });
  if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  const ok = await verifyPassword(password, user.password);
  if (!ok) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  const roles = user.roles.map(r => r.role.name);
  const token = signJwt({ id: user.id, roles });
  return { token, user: { id: user.id, email: user.email, roles } };
}