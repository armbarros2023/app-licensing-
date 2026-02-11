import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';
import { Company } from '../../types';
import { CompanyModal } from './CompanyModal';
import { initializeLocalStorage } from '../../utils/mockData';

export function CompaniesTab() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  useEffect(() => {
    initializeLocalStorage();
    loadCompanies();
  }, []);

  const loadCompanies = () => {
    const stored = localStorage.getItem('companies');
    if (stored) {
      setCompanies(JSON.parse(stored));
    }
  };

  const handleSaveCompany = (company: Omit<Company, 'id' | 'createdAt'>) => {
    const stored = localStorage.getItem('companies');
    const currentCompanies: Company[] = stored ? JSON.parse(stored) : [];

    if (editingCompany) {
      const updated = currentCompanies.map(c =>
        c.id === editingCompany.id ? { ...editingCompany, ...company } : c
      );
      localStorage.setItem('companies', JSON.stringify(updated));
      setCompanies(updated);
    } else {
      const newCompany: Company = {
        ...company,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0]
      };
      const updated = [...currentCompanies, newCompany];
      localStorage.setItem('companies', JSON.stringify(updated));
      setCompanies(updated);
    }

    setIsModalOpen(false);
    setEditingCompany(null);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta empresa? Todas as licenças associadas também serão excluídas.')) {
      const stored = localStorage.getItem('companies');
      const currentCompanies: Company[] = stored ? JSON.parse(stored) : [];
      const updated = currentCompanies.filter(c => c.id !== id);
      localStorage.setItem('companies', JSON.stringify(updated));
      setCompanies(updated);

      // Remove associated licenses
      const licensesStored = localStorage.getItem('licenses');
      if (licensesStored) {
        const licenses = JSON.parse(licensesStored);
        const updatedLicenses = licenses.filter((l: any) => l.companyId !== id);
        localStorage.setItem('licenses', JSON.stringify(updatedLicenses));
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Empresas Cadastradas</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gerencie as empresas e suas informações</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Empresa
        </button>
      </div>

      {companies.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma empresa cadastrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Comece adicionando uma nova empresa ao sistema
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Adicionar Primeira Empresa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(company)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{company.name}</h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">CNPJ:</span> {company.cnpj}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Cadastro:</span>{' '}
                  {new Date(company.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CompanyModal
          company={editingCompany}
          onSave={handleSaveCompany}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}