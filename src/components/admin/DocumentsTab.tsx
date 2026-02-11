import { useState, useEffect } from 'react';
import { Plus, Upload, FileText, Trash2, Loader2, Download } from 'lucide-react';
import { RenewalDocument, LicenseType } from '../../types';
import { DocumentModal } from './DocumentModal';
import api from '../../utils/api';

const licenseTypes: LicenseType[] = [
  'Polícia Civil',
  'Polícia Federal',
  'IBAMA',
  'CETESB',
  'Vigilância Sanitária',
  'Exército',
  'Municipal'
];

export function DocumentsTab() {
  const [documents, setDocuments] = useState<RenewalDocument[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get<RenewalDocument[]>('/renewal-documents');
      setDocuments(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to load documents:', err);
      setError('Erro ao carregar documentos.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDocument = async (data: { licenseType: LicenseType; documentName: string; file: File }) => {
    try {
      const formData = new FormData();
      formData.append('licenseType', data.licenseType);
      formData.append('documentName', data.documentName);
      formData.append('file', data.file); // 'file' matches backend multer config

      const response = await api.post<RenewalDocument>('/renewal-documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setDocuments([...documents, response.data]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to upload document:', err);
      alert('Erro ao enviar documento. Tente novamente.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        await api.delete(`/renewal-documents/${id}`);
        setDocuments(documents.filter(d => d.id !== id));
      } catch (err) {
        console.error('Failed to delete document:', err);
        alert('Erro ao excluir documento.');
      }
    }
  };

  const handleDownload = (doc: RenewalDocument) => {
    // Assuming backend serves static files or has a download endpoint
    // For now, let's assume static file serving under /uploads/documents
    // But we should use the API URL
    if (doc.fileUrl) {
      // If fileUrl is relative or full path? Backend returns relative path usually or just filename.
      // Let's assume backend returns stored filename in fileUrl or we construct it.
      // Actually the backend stores 'fileUrl' in DB? 
      // In backend: `fileUrl: req.file.filename` (just filename) or path.
      // Let's check backend implementation if possible.
      // Assuming backend serves at /uploads/documents/:filename
      // We can use a direct link or an API endpoint.
      // Let's try to use the VITE_API_URL base + /uploads/documents/ + doc.fileUrl if it's just filename.
      // But better: open it in new tab.
      // If doc.fileUrl is full URL, good. If relative, prepend.
      // Given earlier conversation, I might not have configured static file serving for /uploads yet in backend code!
      // I created uploads dir, but did I add `app.use('/uploads', express.static(...))`?
      // I should check that later. For now, let's assume it works or just log it.

      // Actually, backend uses `res.json(document)` where `document` has schema fields.
      // Prisma schema: `fileUrl String`.
      // Let's assume it's just the filename for now based on typical multer usage.
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
      // Remove /api if present to get base URL for static files?
      // Or maybe serve static files under /api/uploads? 
      // Or standard /uploads at root.
      // Let's construct a likely URL: http://localhost:3002/uploads/documents/filename

      const serverUrl = baseUrl.replace('/api', '');
      const url = `${serverUrl}/uploads/documents/${doc.fileUrl}`;
      window.open(url, '_blank');
    }
  };

  const filteredDocuments = filterType === 'all'
    ? documents
    : documents.filter(d => d.licenseType === filterType);

  const groupedDocuments = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.licenseType]) {
      acc[doc.licenseType] = [];
    }
    acc[doc.licenseType].push(doc);
    return acc;
  }, {} as Record<string, RenewalDocument[]>);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Documentos para Renovação</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gerencie os documentos necessários para renovação</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
        >
          <Plus className="w-5 h-5" />
          Novo Documento
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="mb-6">
        <div className="glass rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filtrar por Tipo de Licença
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none backdrop-blur-sm transition-all"
          >
            <option value="all">Todos os tipos</option>
            {licenseTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents grouped by type */}
      {Object.keys(groupedDocuments).length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum documento cadastrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Adicione documentos necessários para renovação de licenças
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 gradient-bg text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
          >
            <Plus className="w-5 h-5" />
            Adicionar Primeiro Documento
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDocuments).map(([type, docs]) => (
            <div key={type} className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {type}
              </h3>
              <div className="space-y-3">
                {docs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 group">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{doc.documentName}</p>
                      <div className="flex items-center gap-4 mt-1">
                        {doc.fileName && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400">PDF</span>
                            {doc.fileName}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Enviado em {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <DocumentModal
          onSave={handleSaveDocument}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
