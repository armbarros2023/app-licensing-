import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { RenewalURL, LicenseType } from '../../types';

interface RenewalURLModalProps {
  url: RenewalURL | null;
  onSave: (url: Omit<RenewalURL, 'id'>) => void;
  onClose: () => void;
}

const licenseTypes: LicenseType[] = [
  'Polícia Civil',
  'Polícia Federal',
  'IBAMA',
  'CETESB',
  'Vigilância Sanitária',
  'Exército',
  'Municipal'
];

export function RenewalURLModal({ url, onSave, onClose }: RenewalURLModalProps) {
  const [licenseType, setLicenseType] = useState<LicenseType>('Polícia Federal');
  const [urlValue, setUrlValue] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (url) {
      setLicenseType(url.licenseType);
      setUrlValue(url.url);
      setDescription(url.description);
    }
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      licenseType,
      url: urlValue,
      description
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {url ? 'Editar URL' : 'Nova URL'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="licenseType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Licença *
            </label>
            <select
              id="licenseType"
              value={licenseType}
              onChange={(e) => setLicenseType(e.target.value as LicenseType)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              {licenseTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição *
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Ex: Portal da Polícia Federal - Seção de Licenças"
              required
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL *
            </label>
            <input
              id="url"
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="https://exemplo.gov.br"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {url ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
