import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const prisma = new PrismaClient();
const router = Router();

// Multer config for document uploads
const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', '..', 'uploads', 'documents'),
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.use(authMiddleware);

// GET /api/renewal-documents
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { licenseType } = req.query;

        const where: any = {};
        if (licenseType && licenseType !== 'all') where.licenseType = licenseType;

        const documents = await prisma.renewalDocument.findMany({
            where,
            orderBy: { uploadedAt: 'desc' },
        });

        res.json(documents);
    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({ error: 'Erro ao buscar documentos' });
    }
});

// POST /api/renewal-documents (admin only, with file upload)
router.post('/', adminMiddleware, upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { licenseType, documentName } = req.body;

        if (!licenseType || !documentName) {
            res.status(400).json({ error: 'Tipo de licença e nome do documento são obrigatórios' });
            return;
        }

        const document = await prisma.renewalDocument.create({
            data: {
                licenseType,
                documentName,
                fileName: req.file?.originalname,
                fileUrl: req.file ? `/uploads/documents/${req.file.filename}` : undefined,
            },
        });

        res.status(201).json(document);
    } catch (error) {
        console.error('Create document error:', error);
        res.status(500).json({ error: 'Erro ao criar documento' });
    }
});

// DELETE /api/renewal-documents/:id (admin only)
router.delete('/:id', adminMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        await prisma.renewalDocument.delete({ where: { id } });
        res.json({ message: 'Documento excluído com sucesso' });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({ error: 'Erro ao excluir documento' });
    }
});

export { router as renewalDocumentsRouter };
