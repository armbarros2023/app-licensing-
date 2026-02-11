import express from 'express';
import cors from 'cors';
import path from 'path';
import { authRouter } from './routes/auth';
import { companiesRouter } from './routes/companies';
import { licensesRouter } from './routes/licenses';
import { renewalDocumentsRouter } from './routes/renewalDocuments';
import { renewalURLsRouter } from './routes/renewalURLs';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/licenses', licensesRouter);
app.use('/api/renewal-documents', renewalDocumentsRouter);
app.use('/api/renewal-urls', renewalURLsRouter);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
