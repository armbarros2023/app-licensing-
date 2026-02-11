import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { RenewalDocument, LicenseType } from '../../types';

interface DocumentModalProps {
  onSave: (document: Omit<RenewalDocument, 'id' | 'uploadedAt'>) => void;
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

export function DocumentModal({ onSave, onClose }: DocumentModalProps) {
  const [licenseType, setLicenseType] = useState<LicenseType>('Polícia Federal');
  const [documentName, setDocumentName] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      licenseType,
      documentName,
      fileName: fileName || undefined,
      fileUrl: fileName ? `mock://documents/${fileName}` : undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Novo Documento</h2>
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
            <label htmlFor="documentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome do Documento *
            </label>
            <input
              id="documentName"
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Ex: Formulário de Requisição"
              required
            />
          </div>

          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Arquivo (PDF) *
            </label>
            <div className="relative">
              <input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                required
              />
              <label
                htmlFor="file"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
              >
                <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {fileName || 'Clique para fazer upload'}
                </span>
              </label>
            </div>
            {fileName && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Arquivo selecionado: <span className="font-medium">{fileName}</span>
              </p>
            )}
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
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
