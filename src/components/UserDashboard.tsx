import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { UserLicenseCard } from './user/UserLicenseCard';
import { initializeLocalStorage, getLicenseStatus } from '../utils/mockData';
import {
  Shield,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Building2,
  Filter,
  Printer,
  LogOut,
} from 'lucide-react';
import { License, Company, RenewalURL } from '../types';

export function UserDashboard() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [renewalURLs, setRenewalURLs] = useState<RenewalURL[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'user') {
      navigate('/');
      return;
    }
    initializeLocalStorage();
    loadData();
  }, [user, navigate]);

  const loadData = () => {
    const storedLicenses = localStorage.getItem('licenses');
    const storedCompanies = localStorage.getItem('companies');
    const storedURLs = localStorage.getItem('renewalURLs');

    if (storedLicenses) {
      const parsedLicenses = JSON.parse(storedLicenses).map((l: License) => ({
        ...l,
        status: getLicenseStatus(l.expiryDate),
      }));
      setLicenses(parsedLicenses);
    }
    if (storedCompanies) setCompanies(JSON.parse(storedCompanies));
    if (storedURLs) setRenewalURLs(JSON.parse(storedURLs));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePrint = () => {
    window.print();
  };

  if (!user) return null;

  const stats = {
    total: licenses.length,
    valid: licenses.filter(l => l.status === 'valid').length,
    expiring: licenses.filter(l => l.status === 'expiring').length,
    expired: licenses.filter(l => l.status === 'expired').length,
  };

  const filteredLicenses = licenses.filter(l => {
    const company = companies.find(c => c.id === l.companyId);
    const matchesSearch =
      searchTerm === '' ||
      company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company?.cnpj.includes(searchTerm) ||
      l.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = filterCompany === 'all' || l.companyId === filterCompany;
    const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
    return matchesSearch && matchesCompany && matchesStatus;
  });

  return (
    <div className="min-h-screen gradient-bg-light">
      {/* Premium Header */}
      <header className="sticky top-0 z-30 glass border-b border-gray-200/50 dark:border-gray-700/50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  Portal do Usuário
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Consulta de Licenças
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Imprimir</span>
              </button>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {user.name.charAt(0)}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
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

        {/* Alerts */}
        {stats.expired > 0 && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 animate-slide-up">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 dark:text-red-300">
                Atenção: {stats.expired} licença{stats.expired !== 1 ? 's' : ''} vencida{stats.expired !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">
                Providencie a renovação imediatamente para evitar problemas legais.
              </p>
            </div>
          </div>
        )}

        {stats.expiring > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-start gap-3 animate-slide-up">
            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800 dark:text-yellow-300">
                {stats.expiring} licença{stats.expiring !== 1 ? 's' : ''} vencendo em até 30 dias
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-0.5">
                Inicie o processo de renovação o quanto antes.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="glass rounded-xl p-4 mb-6 no-print">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Search className="w-4 h-4" />
                Buscar
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                placeholder="Nome, CNPJ ou tipo de licença..."
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Building2 className="w-4 h-4" />
                Empresa
              </label>
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all"
              >
                <option value="all">Todas</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Filter className="w-4 h-4" />
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all"
              >
                <option value="all">Todos</option>
                <option value="valid">Válidas</option>
                <option value="expiring">A Vencer</option>
                <option value="expired">Vencidas</option>
              </select>
            </div>
          </div>
        </div>

        {/* License Cards */}
        {filteredLicenses.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center animate-fade-in">
            <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhuma licença encontrada
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Ajuste os filtros para ver mais resultados
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {filteredLicenses.map((license) => (
              <UserLicenseCard
                key={license.id}
                license={license}
                companies={companies}
                renewalURLs={renewalURLs}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}