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
    const companies = await Promise.all([
        prisma.company.upsert({
            where: { cnpj: '12.345.678/0001-90' },
            update: {},
            create: { cnpj: '12.345.678/0001-90', name: 'Indústria XYZ Ltda' },
        }),
        prisma.company.upsert({
            where: { cnpj: '98.765.432/0001-10' },
            update: {},
            create: { cnpj: '98.765.432/0001-10', name: 'Comércio ABC S.A.' },
        }),
        prisma.company.upsert({
            where: { cnpj: '45.678.901/0001-23' },
            update: {},
            create: { cnpj: '45.678.901/0001-23', name: 'Serviços Delta ME' },
        }),
    ]);

    console.log('✅ Companies created:', companies.length);

    // Create licenses
    const existingLicenses = await prisma.license.count();
    if (existingLicenses === 0) {
        await prisma.license.createMany({
            data: [
                {
                    companyId: companies[0].id,
                    type: 'Polícia Federal',
                    issueDate: new Date('2025-06-10'),
                    expiryDate: new Date('2027-06-10'),
                    fileName: 'licenca_pf_xyz.pdf',
                },
                {
                    companyId: companies[0].id,
                    type: 'IBAMA',
                    issueDate: new Date('2025-01-15'),
                    expiryDate: new Date('2027-01-15'),
                    fileName: 'licenca_ibama_xyz.pdf',
                },
                {
                    companyId: companies[0].id,
                    type: 'CETESB',
                    issueDate: new Date('2025-09-01'),
                    expiryDate: new Date('2027-09-01'),
                    fileName: 'licenca_cetesb_xyz.pdf',
                },
                {
                    companyId: companies[1].id,
                    type: 'Vigilância Sanitária',
                    issueDate: new Date('2025-08-01'),
                    expiryDate: new Date('2026-02-28'),
                    fileName: 'licenca_visa_abc.pdf',
                },
                {
                    companyId: companies[1].id,
                    type: 'Municipal',
                    issueDate: new Date('2025-03-15'),
                    expiryDate: new Date('2026-03-15'),
                    fileName: 'licenca_municipal_abc.pdf',
                },
                {
                    companyId: companies[2].id,
                    type: 'Polícia Civil',
                    issueDate: new Date('2024-05-10'),
                    expiryDate: new Date('2025-11-10'),
                    fileName: 'licenca_pc_delta.pdf',
                },
                {
                    companyId: companies[2].id,
                    type: 'Exército',
                    issueDate: new Date('2025-10-01'),
                    expiryDate: new Date('2027-10-01'),
                    fileName: 'licenca_exercito_delta.pdf',
                },
            ],
        });
        console.log('✅ Licenses created: 7');
    }

    // Create renewal documents
    const existingDocs = await prisma.renewalDocument.count();
    if (existingDocs === 0) {
        await prisma.renewalDocument.createMany({
            data: [
                { licenseType: 'Polícia Federal', documentName: 'Formulário de Requisição', fileName: 'form_requisicao_pf.pdf' },
                { licenseType: 'Polícia Federal', documentName: 'Certificado de Registro', fileName: 'cert_registro_pf.pdf' },
                { licenseType: 'IBAMA', documentName: 'Relatório Ambiental', fileName: 'relatorio_ambiental.pdf' },
                { licenseType: 'CETESB', documentName: 'Plano de Gerenciamento de Resíduos', fileName: 'pgr_cetesb.pdf' },
            ],
        });
        console.log('✅ Renewal documents created: 4');
    }

    // Create renewal URLs
    const existingURLs = await prisma.renewalURL.count();
    if (existingURLs === 0) {
        await prisma.renewalURL.createMany({
            data: [
                { licenseType: 'Polícia Federal', url: 'https://www.gov.br/pf/pt-br', description: 'Portal da Polícia Federal - Seção de Licenças' },
                { licenseType: 'IBAMA', url: 'https://www.gov.br/ibama/pt-br', description: 'Sistema de Licenciamento Ambiental - IBAMA' },
                { licenseType: 'CETESB', url: 'https://cetesb.sp.gov.br/', description: 'CETESB - Licenciamento e Autorizações' },
                { licenseType: 'Vigilância Sanitária', url: 'https://www.gov.br/anvisa/pt-br', description: 'ANVISA - Licenças Sanitárias' },
            ],
        });
        console.log('✅ Renewal URLs created: 4');
    }

    console.log('🎉 Seed completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
