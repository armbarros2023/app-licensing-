import {
  Edit2,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  Download,
  Files,
} from "lucide-react";
import { License, Company } from "../../types";
import api from "../../utils/api";

interface LicenseCardProps {
  license: License;
  companies: Company[];
  onEdit: (license: License) => void;
  onDelete: (id: string) => void;
  onRefresh?: () => void;
}

export function LicenseCard({
  license,
  companies,
  onEdit,
  onDelete,
  onRefresh,
}: LicenseCardProps) {
  const company = companies.find(
    (c) => c.id === license.companyId,
  );

  const statusConfig = {
    valid: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
      icon: CheckCircle,
      label: "Válida",
    },
    expiring: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-200",
      icon: Clock,
      label: "A Vencer",
    },
    expired: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
      icon: AlertCircle,
      label: "Vencida",
    },
  };

  const config = statusConfig[license.status];
  const StatusIcon = config.icon;

  const getDaysUntilExpiry = () => {
    const expiry = new Date(license.expiryDate);
    const today = new Date();
    const days = Math.floor(
      (expiry.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24),
    );
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

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;
    try {
      await api.delete(`/licenses/${license.id}/files/${fileId}`);
      onRefresh?.();
    } catch (err) {
      console.error('Delete file error:', err);
      alert('Erro ao excluir arquivo.');
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border-2 ${config.border} dark:border-opacity-50 p-6 hover:shadow-md transition-shadow`}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={`px-3 py-1 ${config.bg} dark:opacity-90 ${config.text} rounded-full flex items-center gap-2 text-sm font-medium`}
        >
          <StatusIcon className="w-4 h-4" />
          {config.label}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(license)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(license.id)}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Empresa
          </p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {company?.name || "Empresa não encontrada"}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {company?.cnpj}
          </p>
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <p className="font-semibold text-gray-900 dark:text-white">
              {license.type}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400 mb-1">
              Emissão
            </p>
            <div className="flex items-center gap-1 text-gray-900 dark:text-white">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(license.issueDate).toLocaleDateString(
                  "pt-BR",
                )}
              </span>
            </div>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 mb-1">
              Vencimento
            </p>
            <div className="flex items-center gap-1 text-gray-900 dark:text-white">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(
                  license.expiryDate,
                ).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>
        </div>

        {daysUntilExpiry >= 0 && daysUntilExpiry <= 30 && (
          <div
            className={`mt-3 p-2 ${config.bg} dark:opacity-90 rounded-lg`}
          >
            <p
              className={`text-xs ${config.text} font-medium text-center`}
            >
              {daysUntilExpiry === 0
                ? "Vence hoje!"
                : `Vence em ${daysUntilExpiry} dia${daysUntilExpiry !== 1 ? "s" : ""}`}
            </p>
          </div>
        )}

        {daysUntilExpiry < 0 && (
          <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <p className="text-xs text-red-800 dark:text-red-400 font-medium text-center">
              Vencida há {Math.abs(daysUntilExpiry)} dia
              {Math.abs(daysUntilExpiry) !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* Files section */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Files className="w-4 h-4 text-indigo-500" />
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Arquivos ({filesCount}/5)
              </p>
            </div>
          </div>
          {filesCount > 0 ? (
            <div className="space-y-1.5">
              {license.files!.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-1.5 bg-gray-50 dark:bg-gray-700/50 rounded group">
                  <span className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[60%]">
                    {file.fileName}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDownloadFile(file.id, file.fileName)}
                      className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">
              Nenhum arquivo anexado
            </p>
          )}
        </div>
      </div>
    </div>
  );
}