import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { getLicenseStatus } from '../utils/licenseStatus';

const prisma = new PrismaClient();
const router = Router();

// Multer config for license file uploads
const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'licenses');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB per file

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
            include: { company: true, files: true },
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
        const { companyId, type, subType, issueDate, expiryDate, fileName } = req.body;

        if (!companyId || !type || !issueDate || !expiryDate) {
            res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
            return;
        }

        const license = await prisma.license.create({
            data: {
                companyId,
                type,
                subType,
                issueDate: new Date(issueDate),
                expiryDate: new Date(expiryDate),
                fileName,
            },
            include: { company: true, files: true },
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
        const { companyId, type, subType, issueDate, expiryDate, fileName } = req.body;

        const license = await prisma.license.update({
            where: { id },
            data: {
                companyId,
                type,
                subType,
                issueDate: issueDate ? new Date(issueDate) : undefined,
                expiryDate: expiryDate ? new Date(expiryDate) : undefined,
                fileName,
            },
            include: { company: true, files: true },
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

        // Delete associated files from disk
        const files = await prisma.licenseFile.findMany({ where: { licenseId: id } });
        for (const file of files) {
            const filePath = path.join(uploadsDir, path.basename(file.fileUrl));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await prisma.license.delete({ where: { id } });
        res.json({ message: 'Licença excluída com sucesso' });
    } catch (error) {
        console.error('Delete license error:', error);
        res.status(500).json({ error: 'Erro ao excluir licença' });
    }
});

// POST /api/licenses/:id/upload (admin only) - Upload files
router.post('/:id/upload', adminMiddleware, upload.array('files', 20), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            res.status(400).json({ error: 'Nenhum arquivo enviado' });
            return;
        }

        // Check current file count for this license
        const existingCount = await prisma.licenseFile.count({ where: { licenseId: id } });

        if (existingCount + files.length > 20) {
            // Remove uploaded files from disk since we're rejecting
            for (const file of files) {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }
            res.status(400).json({
                error: `Limite de 20 arquivos por licença. Atualmente: ${existingCount}. Tentando adicionar: ${files.length}.`
            });
            return;
        }

        // Create LicenseFile records
        const createdFiles = await Promise.all(
            files.map((file) =>
                prisma.licenseFile.create({
                    data: {
                        licenseId: id,
                        fileName: file.originalname,
                        fileUrl: `/uploads/licenses/${file.filename}`,
                    },
                })
            )
        );

        // Also update the legacy fileName on the license (use first file)
        if (createdFiles.length > 0) {
            await prisma.license.update({
                where: { id },
                data: {
                    fileName: createdFiles[0].fileName,
                    fileUrl: createdFiles[0].fileUrl,
                },
            });
        }

        res.json(createdFiles);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Erro ao fazer upload' });
    }
});

// DELETE /api/licenses/:licenseId/files/:fileId (admin only) - Delete a single file
router.delete('/:licenseId/files/:fileId', adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const fileId = req.params.fileId as string;

        const file = await prisma.licenseFile.findUnique({ where: { id: fileId } });

        if (!file) {
            res.status(404).json({ error: 'Arquivo não encontrado' });
            return;
        }

        // Delete file from disk
        const filePath = path.join(uploadsDir, path.basename(file.fileUrl));
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await prisma.licenseFile.delete({ where: { id: fileId as string } });

        res.json({ message: 'Arquivo excluído com sucesso' });
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({ error: 'Erro ao excluir arquivo' });
    }
});

// GET /api/licenses/:id/files/:fileId/download - Download a file (any authenticated user)
router.get('/:id/files/:fileId/download', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const fileId = req.params.fileId as string;

        const file = await prisma.licenseFile.findUnique({ where: { id: fileId } });

        if (!file) {
            res.status(404).json({ error: 'Arquivo não encontrado' });
            return;
        }

        const filePath = path.join(uploadsDir, path.basename(file.fileUrl));

        if (!fs.existsSync(filePath)) {
            res.status(404).json({ error: 'Arquivo não encontrado no servidor' });
            return;
        }

        res.download(filePath, file.fileName);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Erro ao fazer download' });
    }
});

export { router as licensesRouter };
