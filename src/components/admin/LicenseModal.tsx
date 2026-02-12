import { useState, useEffect } from 'react';
import { X, Upload, FileText, Trash2 } from 'lucide-react';
import { License, Company, LicenseType } from '../../types';
import api from '../../utils/api';

interface LicenseModalProps {
  license: License | null;
  companies: Company[];
  onSave: (license: Omit<License, 'id' | 'status'>) => void;
  onClose: () => void;
  onRefresh?: () => void;
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

export function LicenseModal({ license, companies, onSave, onClose, onRefresh }: LicenseModalProps) {
  const [companyId, setCompanyId] = useState('');
  const [type, setType] = useState<LicenseType>('Polícia Federal');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [fileName, setFileName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const existingFilesCount = license?.files?.length || 0;
  const maxNewFiles = 5 - existingFilesCount;

  useEffect(() => {
    if (license) {
      setCompanyId(license.companyId);
      setType(license.type);
      setIssueDate(license.issueDate.split('T')[0]);
      setExpiryDate(license.expiryDate.split('T')[0]);
      setFileName(license.fileName || '');
    } else if (companies.length > 0) {
      setCompanyId(companies[0].id);
    }
  }, [license, companies]);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > maxNewFiles) {
      setUploadError(`Máximo de ${maxNewFiles} arquivo(s) permitido(s). Já existem ${existingFilesCount} arquivo(s).`);
      return;
    }
    setSelectedFiles(files);
    setUploadError('');
    if (files.length > 0) {
      setFileName(files[0].name);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingFile = async (fileId: string) => {
    if (!license || !confirm('Tem certeza que deseja excluir este arquivo?')) return;
    try {
      await api.delete(`/licenses/${license.id}/files/${fileId}`);
      onRefresh?.();
    } catch (err) {
      console.error('Failed to delete file:', err);
      alert('Erro ao excluir arquivo.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Save license data
    onSave({
      companyId,
      type,
      issueDate,
      expiryDate,
      fileName: fileName || undefined,
      fileUrl: fileName ? `mock://licenses/${fileName}` : undefined,
    });
  };

  const handleUploadFiles = async () => {
    if (!license || selectedFiles.length === 0) return;

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      await api.post(`/licenses/${license.id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSelectedFiles([]);
      onRefresh?.();
    } catch (err: any) {
      console.error('Upload error:', err);
      const msg = err.response?.data?.error || 'Erro ao fazer upload.';
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {license ? 'Editar Licença' : 'Nova Licença'}
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
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Empresa *
            </label>
            <select
              id="company"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name} - {company.cnpj}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Licença *
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as LicenseType)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              {licenseTypes.map(licenseType => (
                <option key={licenseType} value={licenseType}>
                  {licenseType}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data de Emissão *
              </label>
              <input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data de Vencimento *
              </label>
              <input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          {/* Existing Files (edit mode only) */}
          {license && license.files && license.files.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Arquivos Existentes ({license.files.length}/5)
              </label>
              <div className="space-y-2">
                {license.files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{file.fileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingFile(file.id)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                      title="Excluir arquivo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload new files */}
          <div>
            <label htmlFor="files" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {license ? `Adicionar Arquivos (máx: ${maxNewFiles})` : 'Arquivos da Licença (máx: 5)'}
            </label>
            <div className="relative">
              <input
                id="files"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                multiple
                onChange={handleFilesChange}
                className="hidden"
              />
              <label
                htmlFor="files"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
              >
                <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} arquivo(s) selecionado(s)`
                    : 'Clique para selecionar arquivos'}
                </span>
              </label>
            </div>

            {/* Selected files list */}
            {selectedFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm text-blue-700 dark:text-blue-300 truncate">{file.name}</span>
                      <span className="text-xs text-blue-500 dark:text-blue-400 flex-shrink-0">
                        ({(file.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploadError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{uploadError}</p>
            )}
          </div>

          {/* Upload button (only in edit mode) */}
          {license && selectedFiles.length > 0 && (
            <button
              type="button"
              onClick={handleUploadFiles}
              disabled={uploading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Enviando...' : `Enviar ${selectedFiles.length} arquivo(s)`}
            </button>
          )}

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
              {license ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
