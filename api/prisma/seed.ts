import { PrismaClient } from '@prisma/client';
import { hashPassword }from '@utils/passwords'

const prisma = new PrismaClient();
async function main() {
    const roles = ['Administrador, Trabajador, Tutor, Voluntario'];
    for (const name of roles){
        await prisma.role.upsert({where:{name}, update:{}, create:{name}});
    }
    //TODO: take email and password from environment config ? 
    const email = 'admin@soa.local';
    const admin = await prisma.user.upsert({where: {email}, update:{}, create:{ email, password: await hashPassword('ChangeMe123!')}});

    const adminRole = await prisma.role.findUnique({where: {name: 'Administrador'}});
    if(adminRole){
        await prisma.userRole.upsert({where:{userId_roleId: {userId:admin.id, roleId:adminRole.id}}, update:{}, create:{userId:admin.id, roleId: adminRole.id}});
    }
}

main().finally(()=>prisma.$disconnect());