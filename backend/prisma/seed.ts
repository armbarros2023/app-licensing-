import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@licencas.com' },
        update: {},
        create: {
            email: 'admin@licencas.com',
            password: adminPassword,
            name: 'Administrador',
            role: 'admin',
        },
    });

    const user = await prisma.user.upsert({
        where: { email: 'usuario@licencas.com' },
        update: {},
        create: {
            email: 'usuario@licencas.com',
            password: userPassword,
            name: 'Usuário Comum',
            role: 'user',
        },
    });

    console.log('✅ Users created:', admin.email, user.email);

    // Create companies
    // const companies = await Promise.all([
    //     prisma.company.upsert({
    //         where: { cnpj: '12.345.678/0001-90' },
    //         update: {},
    //         create: { cnpj: '12.345.678/0001-90', name: 'Indústria XYZ Ltda' },
    //     }),
    //     prisma.company.upsert({
    //         where: { cnpj: '98.765.432/0001-10' },
    //         update: {},
    //         create: { cnpj: '98.765.432/0001-10', name: 'Comércio ABC S.A.' },
    //     }),
    //     prisma.company.upsert({
    //         where: { cnpj: '45.678.901/0001-23' },
    //         update: {},
    //         create: { cnpj: '45.678.901/0001-23', name: 'Serviços Delta ME' },
    //     }),
    // ]);
    // console.log('✅ Companies created:', companies.length);

    console.log('ℹ️ Skipped creation of dummy data (Companies, Licenses, Documents, URLs) for clean start.');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
