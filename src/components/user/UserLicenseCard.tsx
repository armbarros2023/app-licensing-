import {
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  Download,
  Printer,
  ExternalLink,
  Files,
} from 'lucide-react';
import { License, Company, RenewalURL } from '../../types';
import api from '../../utils/api';

interface UserLicenseCardProps {
  license: License;
  companies: Company[];
  renewalURLs: RenewalURL[];
}

export function UserLicenseCard({ license, companies, renewalURLs }: UserLicenseCardProps) {
  const company = companies.find(c => c.id === license.companyId);
  const renewalUrl = renewalURLs.find(u => u.licenseType === license.type);

  const statusConfig = {
    valid: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      icon: CheckCircle,
      label: 'Válida',
    },
    expiring: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-800 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: Clock,
      label: 'A Vencer',
    },
    expired: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      icon: AlertCircle,
      label: 'Vencida',
    },
  };

  const config = statusConfig[license.status];
  const StatusIcon = config.icon;

  const getDaysUntilExpiry = () => {
    const expiry = new Date(license.expiryDate);
    const today = new Date();
    const days = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysUntilExpiry = getDaysUntilExpiry();
  const filesCount = license.files?.length || 0;

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      const response = await api.get(`/licenses/${license.id}/files/${fileId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Erro ao fazer download do arquivo.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate progress bar percentage (for expiring/valid licenses)
  const getProgressPercentage = () => {
    const issue = new Date(license.issueDate).getTime();
    const expiry = new Date(license.expiryDate).getTime();
    const today = new Date().getTime();
    const total = expiry - issue;
    const elapsed = today - issue;
    const remaining = Math.max(0, Math.min(100, 100 - (elapsed / total) * 100));
    return remaining;
  };

  const progressPercentage = getProgressPercentage();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border-2 ${config.border} p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`px-3 py-1 ${config.bg} ${config.text} rounded-full flex items-center gap-2 text-sm font-medium`}>
          <StatusIcon className="w-4 h-4" />
          {config.label}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Imprimir"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <p className="font-semibold text-gray-900 dark:text-white">
              {company?.name || 'Empresa não encontrada'}
            </p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
            CNPJ: {company?.cnpj}
          </p>
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <p className="font-semibold text-gray-900 dark:text-white">{license.type}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400 mb-1">Emissão</p>
            <div className="flex items-center gap-1 text-gray-900 dark:text-white">
              <Calendar className="w-4 h-4" />
              <span>{new Date(license.issueDate).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 mb-1">Vencimento</p>
            <div className="flex items-center gap-1 text-gray-900 dark:text-white">
              <Calendar className="w-4 h-4" />
              <span>{new Date(license.expiryDate).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* Progress bar for time remaining */}
        {daysUntilExpiry >= 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500 dark:text-gray-400">Tempo restante</span>
              <span className={config.text}>{daysUntilExpiry} dias</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${license.status === 'valid' ? 'bg-green-500' :
                  license.status === 'expiring' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {daysUntilExpiry >= 0 && daysUntilExpiry <= 30 && (
          <div className={`mt-3 p-2 ${config.bg} rounded-lg`}>
            <p className={`text-xs ${config.text} font-medium text-center`}>
              {daysUntilExpiry === 0
                ? 'Vence hoje!'
                : `Vence em ${daysUntilExpiry} dia${daysUntilExpiry !== 1 ? 's' : ''}`}
            </p>
          </div>
        )}

        {daysUntilExpiry < 0 && (
          <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <p className="text-xs text-red-800 dark:text-red-400 font-medium text-center">
              Vencida há {Math.abs(daysUntilExpiry)} dia{Math.abs(daysUntilExpiry) !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Files section - download only, no delete for users */}
        {filesCount > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1.5 mb-2">
              <Files className="w-4 h-4 text-indigo-500" />
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Arquivos ({filesCount})
              </p>
            </div>
            <div className="space-y-1.5">
              {license.files!.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-1.5 bg-gray-50 dark:bg-gray-700/50 rounded group">
                  <span className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[70%]">
                    {file.fileName}
                  </span>
                  <button
                    onClick={() => handleDownloadFile(file.id, file.fileName)}
                    className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {renewalUrl && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <a
              href={renewalUrl.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Portal de Renovação
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
