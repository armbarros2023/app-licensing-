import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building2, Loader2 } from 'lucide-react';
import { Company } from '../../types';
import { CompanyModal } from './CompanyModal';
import api from '../../utils/api';

export function CompaniesTab() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await api.get<Company[]>('/companies');
      setCompanies(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to load companies:', err);
      setError('Erro ao carregar empresas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async (companyData: Omit<Company, 'id' | 'createdAt'>) => {
    try {
      if (editingCompany) {
        const response = await api.put<Company>(`/companies/${editingCompany.id}`, companyData);
        setCompanies(companies.map(c =>
          c.id === editingCompany.id ? response.data : c
        ));
      } else {
        const response = await api.post<Company>('/companies', companyData);
        setCompanies([response.data, ...companies]);
      }
      setIsModalOpen(false);
      setEditingCompany(null);
    } catch (err) {
      console.error('Failed to save company:', err);
      alert('Erro ao salvar empresa. Verifique os dados e tente novamente.');
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta empresa? Todas as licenças associadas também serão excluídas.')) {
      try {
        await api.delete(`/companies/${id}`);
        setCompanies(companies.filter(c => c.id !== id));
      } catch (err) {
        console.error('Failed to delete company:', err);
        alert('Erro ao excluir empresa. Tente novamente.');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
  };

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Empresas Cadastradas</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gerencie as empresas e suas informações</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
        >
          <Plus className="w-5 h-5" />
          Nova Empresa
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {companies.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma empresa cadastrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Comece adicionando uma nova empresa ao sistema
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 gradient-bg text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
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
              className="glass rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleEdit(company)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">{company.name}</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 flex justify-between">
                  <span className="font-medium">CNPJ:</span>
                  <span className="font-mono">{company.cnpj}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex justify-between">
                  <span className="font-medium">Cadastro:</span>
                  <span>{new Date(company.createdAt).toLocaleDateString('pt-BR')}</span>
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