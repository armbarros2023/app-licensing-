import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { getLicenseStatus } from '../utils/licenseStatus';

const prisma = new PrismaClient();
const router = Router();

// Multer config for license file uploads
const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', '..', 'uploads', 'licenses'),
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

router.use(authMiddleware);

// GET /api/licenses
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { companyId, status, type } = req.query;

        const where: any = {};
        if (companyId && companyId !== 'all') where.companyId = companyId;
        if (type && type !== 'all') where.type = type;

        const licenses = await prisma.license.findMany({
            where,
            include: { company: true },
            orderBy: { expiryDate: 'asc' },
        });

        const licensesWithStatus = licenses.map((l) => ({
            ...l,
            status: getLicenseStatus(l.expiryDate),
        }));

        // Filter by computed status if requested
        const filtered = status && status !== 'all'
            ? licensesWithStatus.filter((l) => l.status === status)
            : licensesWithStatus;

        res.json(filtered);
    } catch (error) {
        console.error('Get licenses error:', error);
        res.status(500).json({ error: 'Erro ao buscar licenças' });
    }
});

// GET /api/licenses/stats
router.get('/stats', async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const licenses = await prisma.license.findMany();

        const stats = licenses.reduce(
            (acc, l) => {
                const s = getLicenseStatus(l.expiryDate);
                acc.total++;
                acc[s]++;
                return acc;
            },
            { total: 0, valid: 0, expiring: 0, expired: 0 }
        );

        res.json(stats);
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

// POST /api/licenses (admin only)
router.post('/', adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { companyId, type, issueDate, expiryDate, fileName } = req.body;

        if (!companyId || !type || !issueDate || !expiryDate) {
            res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
            return;
        }

        const license = await prisma.license.create({
            data: {
                companyId,
                type,
                issueDate: new Date(issueDate),
                expiryDate: new Date(expiryDate),
                fileName,
            },
            include: { company: true },
        });

        res.status(201).json({
            ...license,
            status: getLicenseStatus(license.expiryDate),
        });
    } catch (error) {
        console.error('Create license error:', error);
        res.status(500).json({ error: 'Erro ao criar licença' });
    }
});

// PUT /api/licenses/:id (admin only)
router.put('/:id', adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { companyId, type, issueDate, expiryDate, fileName } = req.body;

        const license = await prisma.license.update({
            where: { id },
            data: {
                companyId,
                type,
                issueDate: issueDate ? new Date(issueDate) : undefined,
                expiryDate: expiryDate ? new Date(expiryDate) : undefined,
                fileName,
            },
            include: { company: true },
        });

        res.json({
            ...license,
            status: getLicenseStatus(license.expiryDate),
        });
    } catch (error) {
        console.error('Update license error:', error);
        res.status(500).json({ error: 'Erro ao atualizar licença' });
    }
});

// DELETE /api/licenses/:id (admin only)
router.delete('/:id', adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        await prisma.license.delete({ where: { id } });
        res.json({ message: 'Licença excluída com sucesso' });
    } catch (error) {
        console.error('Delete license error:', error);
        res.status(500).json({ error: 'Erro ao excluir licença' });
    }
});

// POST /api/licenses/:id/upload (admin only)
router.post('/:id/upload', adminMiddleware, upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        if (!req.file) {
            res.status(400).json({ error: 'Nenhum arquivo enviado' });
            return;
        }

        const license = await prisma.license.update({
            where: { id },
            data: {
                fileName: req.file.originalname,
                fileUrl: `/uploads/licenses/${req.file.filename}`,
            },
        });

        res.json(license);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Erro ao fazer upload' });
    }
});

export { router as licensesRouter };
