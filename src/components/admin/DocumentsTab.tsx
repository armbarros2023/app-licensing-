import { useState, useEffect } from 'react';
import { Plus, Upload, FileText, Trash2 } from 'lucide-react';
import { RenewalDocument, LicenseType } from '../../types';
import { DocumentModal } from './DocumentModal';

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

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    const stored = localStorage.getItem('renewalDocuments');
    if (stored) {
      setDocuments(JSON.parse(stored));
    }
  };

  const handleSaveDocument = (document: Omit<RenewalDocument, 'id' | 'uploadedAt'>) => {
    const stored = localStorage.getItem('renewalDocuments');
    const currentDocs: RenewalDocument[] = stored ? JSON.parse(stored) : [];

    const newDoc: RenewalDocument = {
      ...document,
      id: Date.now().toString(),
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    const updated = [...currentDocs, newDoc];
    localStorage.setItem('renewalDocuments', JSON.stringify(updated));
    setDocuments(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      const stored = localStorage.getItem('renewalDocuments');
      const currentDocs: RenewalDocument[] = stored ? JSON.parse(stored) : [];
      const updated = currentDocs.filter(d => d.id !== id);
      localStorage.setItem('renewalDocuments', JSON.stringify(updated));
      setDocuments(updated);
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Documentos para Renovação</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gerencie os documentos necessários para renovação</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Documento
        </button>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filtrar por Tipo de Licença
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum documento cadastrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Adicione documentos necessários para renovação de licenças
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Adicionar Primeiro Documento
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDocuments).map(([type, docs]) => (
            <div key={type} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {type}
              </h3>
              <div className="space-y-3">
                {docs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{doc.documentName}</p>
                      <div className="flex items-center gap-4 mt-1">
                        {doc.fileName && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            📎 {doc.fileName}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Enviado em {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
