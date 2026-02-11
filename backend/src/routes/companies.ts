import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const prisma = new PrismaClient();
const router = Router();

// All routes require auth
router.use(authMiddleware);

// GET /api/companies
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const companies = await prisma.company.findMany({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { licenses: true } } },
        });
        res.json(companies);
    } catch (error) {
        console.error('Get companies error:', error);
        res.status(500).json({ error: 'Erro ao buscar empresas' });
    }
});

// POST /api/companies (admin only)
router.post('/', adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { cnpj, name } = req.body;

        if (!cnpj || !name) {
            res.status(400).json({ error: 'CNPJ e nome são obrigatórios' });
            return;
        }

        const existing = await prisma.company.findUnique({ where: { cnpj } });
        if (existing) {
            res.status(400).json({ error: 'CNPJ já cadastrado' });
            return;
        }

        const company = await prisma.company.create({ data: { cnpj, name } });
        res.status(201).json(company);
    } catch (error) {
        console.error('Create company error:', error);
        res.status(500).json({ error: 'Erro ao criar empresa' });
    }
});

// PUT /api/companies/:id (admin only)
router.put('/:id', adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { cnpj, name } = req.body;

        const company = await prisma.company.update({
            where: { id },
            data: { cnpj, name },
        });
        res.json(company);
    } catch (error) {
        console.error('Update company error:', error);
        res.status(500).json({ error: 'Erro ao atualizar empresa' });
    }
});

// DELETE /api/companies/:id (admin only)
router.delete('/:id', adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        await prisma.company.delete({ where: { id } });
        res.json({ message: 'Empresa excluída com sucesso' });
    } catch (error) {
        console.error('Delete company error:', error);
        res.status(500).json({ error: 'Erro ao excluir empresa' });
    }
});

export { router as companiesRouter };
