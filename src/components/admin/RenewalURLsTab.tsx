import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Link } from 'lucide-react';
import { RenewalURL, LicenseType } from '../../types';
import { RenewalURLModal } from './RenewalURLModal';

const licenseTypes: LicenseType[] = [
  'Polícia Civil',
  'Polícia Federal',
  'IBAMA',
  'CETESB',
  'Vigilância Sanitária',
  'Exército',
  'Municipal'
];

export function RenewalURLsTab() {
  const [urls, setUrls] = useState<RenewalURL[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUrl, setEditingUrl] = useState<RenewalURL | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadURLs();
  }, []);

  const loadURLs = () => {
    const stored = localStorage.getItem('renewalURLs');
    if (stored) {
      setUrls(JSON.parse(stored));
    }
  };

  const handleSaveURL = (url: Omit<RenewalURL, 'id'>) => {
    const stored = localStorage.getItem('renewalURLs');
    const currentURLs: RenewalURL[] = stored ? JSON.parse(stored) : [];

    if (editingUrl) {
      const updated = currentURLs.map(u =>
        u.id === editingUrl.id ? { ...editingUrl, ...url } : u
      );
      localStorage.setItem('renewalURLs', JSON.stringify(updated));
      setUrls(updated);
    } else {
      const newURL: RenewalURL = {
        ...url,
        id: Date.now().toString()
      };
      const updated = [...currentURLs, newURL];
      localStorage.setItem('renewalURLs', JSON.stringify(updated));
      setUrls(updated);
    }

    setIsModalOpen(false);
    setEditingUrl(null);
  };

  const handleEdit = (url: RenewalURL) => {
    setEditingUrl(url);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta URL?')) {
      const stored = localStorage.getItem('renewalURLs');
      const currentURLs: RenewalURL[] = stored ? JSON.parse(stored) : [];
      const updated = currentURLs.filter(u => u.id !== id);
      localStorage.setItem('renewalURLs', JSON.stringify(updated));
      setUrls(updated);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUrl(null);
  };

  const filteredURLs = filterType === 'all'
    ? urls
    : urls.filter(u => u.licenseType === filterType);

  const groupedURLs = filteredURLs.reduce((acc, url) => {
    if (!acc[url.licenseType]) {
      acc[url.licenseType] = [];
    }
    acc[url.licenseType].push(url);
    return acc;
  }, {} as Record<string, RenewalURL[]>);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">URLs de Renovação</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Links para portais de renovação de licenças</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova URL
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

      {/* URLs grouped by type */}
      {Object.keys(groupedURLs).length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Link className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma URL cadastrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Adicione links para os portais de renovação de licenças
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Adicionar Primeira URL
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedURLs).map(([type, typeUrls]) => (
            <div key={type} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Link className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {type}
              </h3>
              <div className="space-y-3">
                {typeUrls.map(url => (
                  <div key={url.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white">{url.description}</p>
                      <a
                        href={url.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {url.url}
                      </a>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(url)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(url.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
        <RenewalURLModal
          url={editingUrl}
          onSave={handleSaveURL}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
