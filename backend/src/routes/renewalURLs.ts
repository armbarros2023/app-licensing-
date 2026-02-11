import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const prisma = new PrismaClient();
const router = Router();

router.use(authMiddleware);

// GET /api/renewal-urls
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const urls = await prisma.renewalURL.findMany({
            orderBy: { licenseType: 'asc' },
        });
        res.json(urls);
    } catch (error) {
        console.error('Get URLs error:', error);
        res.status(500).json({ error: 'Erro ao buscar URLs' });
    }
});

// POST /api/renewal-urls (admin only)
router.post('/', adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { licenseType, url, description } = req.body;

        if (!licenseType || !url || !description) {
            res.status(400).json({ error: 'Todos os campos são obrigatórios' });
            return;
        }

        const renewalUrl = await prisma.renewalURL.create({
            data: { licenseType, url, description },
        });

        res.status(201).json(renewalUrl);
    } catch (error) {
        console.error('Create URL error:', error);
        res.status(500).json({ error: 'Erro ao criar URL' });
    }
});

// PUT /api/renewal-urls/:id (admin only)
router.put('/:id', adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { licenseType, url, description } = req.body;

        const renewalUrl = await prisma.renewalURL.update({
            where: { id },
            data: { licenseType, url, description },
        });

        res.json(renewalUrl);
    } catch (error) {
        console.error('Update URL error:', error);
        res.status(500).json({ error: 'Erro ao atualizar URL' });
    }
});

// DELETE /api/renewal-urls/:id (admin only)
router.delete('/:id', adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        await prisma.renewalURL.delete({ where: { id } });
        res.json({ message: 'URL excluída com sucesso' });
    } catch (error) {
        console.error('Delete URL error:', error);
        res.status(500).json({ error: 'Erro ao excluir URL' });
    }
});

export { router as renewalURLsRouter };
