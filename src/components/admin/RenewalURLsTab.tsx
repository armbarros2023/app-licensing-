import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Link, Loader2 } from 'lucide-react';
import { RenewalURL, LicenseType } from '../../types';
import { RenewalURLModal } from './RenewalURLModal';
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

export function RenewalURLsTab() {
  const [urls, setUrls] = useState<RenewalURL[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUrl, setEditingUrl] = useState<RenewalURL | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadURLs();
  }, []);

  const loadURLs = async () => {
    try {
      setLoading(true);
      const response = await api.get<RenewalURL[]>('/renewal-urls');
      setUrls(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to load URLs:', err);
      setError('Erro ao carregar URLs.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveURL = async (urlData: Omit<RenewalURL, 'id'>) => {
    try {
      if (editingUrl) {
        const response = await api.put<RenewalURL>(`/renewal-urls/${editingUrl.id}`, urlData);
        setUrls(urls.map(u =>
          u.id === editingUrl.id ? response.data : u
        ));
      } else {
        const response = await api.post<RenewalURL>('/renewal-urls', urlData);
        setUrls([...urls, response.data]);
      }
      setIsModalOpen(false);
      setEditingUrl(null);
    } catch (err) {
      console.error('Failed to save URL:', err);
      alert('Erro ao salvar URL. Tente novamente.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta URL?')) {
      try {
        await api.delete(`/renewal-urls/${id}`);
        setUrls(urls.filter(u => u.id !== id));
      } catch (err) {
        console.error('Failed to delete URL:', err);
        alert('Erro ao excluir URL. Tente novamente.');
      }
    }
  };

  const handleEdit = (url: RenewalURL) => {
    setEditingUrl(url);
    setIsModalOpen(true);
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">URLs de Renovação</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Links para portais de renovação de licenças</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
        >
          <Plus className="w-5 h-5" />
          Nova URL
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

      {/* URLs grouped by type */}
      {Object.keys(groupedURLs).length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Link className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma URL cadastrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Adicione links para os portais de renovação de licenças
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 gradient-bg text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
          >
            <Plus className="w-5 h-5" />
            Adicionar Primeira URL
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedURLs).map(([type, typeUrls]) => (
            <div key={type} className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Link className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {type}
              </h3>
              <div className="space-y-3">
                {typeUrls.map(url => (
                  <div key={url.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 group">
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
                    <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(url)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(url.id)}
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
        <RenewalURLModal
          url={editingUrl}
          onSave={handleSaveURL}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
