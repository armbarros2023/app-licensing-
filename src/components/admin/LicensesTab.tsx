import { useState, useEffect } from 'react';
import { Plus, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { License, Company } from '../../types';
import { LicenseModal } from './LicenseModal';
import { LicenseCard } from './LicenseCard';
import { getLicenseStatus } from '../../utils/mockData';

export function LicensesTab() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedLicenses = localStorage.getItem('licenses');
    const storedCompanies = localStorage.getItem('companies');

    if (storedLicenses) {
      const parsedLicenses = JSON.parse(storedLicenses);
      // Update status based on expiry date
      const updatedLicenses = parsedLicenses.map((license: License) => ({
        ...license,
        status: getLicenseStatus(license.expiryDate)
      }));
      setLicenses(updatedLicenses);
      localStorage.setItem('licenses', JSON.stringify(updatedLicenses));
    }

    if (storedCompanies) {
      setCompanies(JSON.parse(storedCompanies));
    }
  };

  const handleSaveLicense = (license: Omit<License, 'id' | 'status'>) => {
    const stored = localStorage.getItem('licenses');
    const currentLicenses: License[] = stored ? JSON.parse(stored) : [];
    const status = getLicenseStatus(license.expiryDate);

    if (editingLicense) {
      const updated = currentLicenses.map(l =>
        l.id === editingLicense.id ? { ...license, id: editingLicense.id, status } : l
      );
      localStorage.setItem('licenses', JSON.stringify(updated));
      setLicenses(updated);
    } else {
      const newLicense: License = {
        ...license,
        id: Date.now().toString(),
        status
      };
      const updated = [...currentLicenses, newLicense];
      localStorage.setItem('licenses', JSON.stringify(updated));
      setLicenses(updated);
    }

    setIsModalOpen(false);
    setEditingLicense(null);
  };

  const handleEdit = (license: License) => {
    setEditingLicense(license);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta licença?')) {
      const stored = localStorage.getItem('licenses');
      const currentLicenses: License[] = stored ? JSON.parse(stored) : [];
      const updated = currentLicenses.filter(l => l.id !== id);
      localStorage.setItem('licenses', JSON.stringify(updated));
      setLicenses(updated);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLicense(null);
  };

  const filteredLicenses = licenses.filter(license => {
    if (selectedCompany !== 'all' && license.companyId !== selectedCompany) return false;
    if (selectedStatus !== 'all' && license.status !== selectedStatus) return false;
    return true;
  });

  const stats = {
    total: licenses.length,
    valid: licenses.filter(l => l.status === 'valid').length,
    expiring: licenses.filter(l => l.status === 'expiring').length,
    expired: licenses.filter(l => l.status === 'expired').length,
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Licenças</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gerencie todas as licenças das empresas</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Licença
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 stagger-children">
        <div className="stat-card-total rounded-xl border p-4 card-premium">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
            <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="stat-card-valid rounded-xl border p-4 card-premium">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Válidas</p>
            <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-700 dark:text-green-400">{stats.valid}</p>
        </div>
        <div className="stat-card-expiring rounded-xl border p-4 card-premium">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">A Vencer</p>
            <Clock className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{stats.expiring}</p>
        </div>
        <div className="stat-card-expired rounded-xl border p-4 card-premium">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vencidas</p>
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
          </div>
          <p className="text-3xl font-bold text-red-700 dark:text-red-400">{stats.expired}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar por Empresa
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            >
              <option value="all">Todas as empresas</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar por Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            >
              <option value="all">Todos os status</option>
              <option value="valid">Válidas</option>
              <option value="expiring">A Vencer (30 dias)</option>
              <option value="expired">Vencidas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Licenses Grid */}
      {filteredLicenses.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma licença encontrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {licenses.length === 0
              ? 'Comece adicionando uma nova licença ao sistema'
              : 'Nenhuma licença corresponde aos filtros selecionados'}
          </p>
          {licenses.length === 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 gradient-bg text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-indigo-500/25"
            >
              <Plus className="w-5 h-5" />
              Adicionar Primeira Licença
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filteredLicenses.map((license) => (
            <LicenseCard
              key={license.id}
              license={license}
              companies={companies}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <LicenseModal
          license={editingLicense}
          companies={companies}
          onSave={handleSaveLicense}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}