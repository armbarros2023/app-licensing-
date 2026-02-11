import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { CompaniesTab } from './admin/CompaniesTab';
import { LicensesTab } from './admin/LicensesTab';
import { DocumentsTab } from './admin/DocumentsTab';
import { RenewalURLsTab } from './admin/RenewalURLsTab';
import { initializeLocalStorage } from '../utils/mockData';
import {
  Shield,
  Building2,
  FileText,
  Upload,
  Link,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const tabs = [
  { id: 'companies', label: 'Empresas', icon: Building2 },
  { id: 'licenses', label: 'Licenças', icon: FileText },
  { id: 'documents', label: 'Documentos', icon: Upload },
  { id: 'urls', label: 'URLs de Renovação', icon: Link },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('companies');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ProtectedRoute handles role check and auth redirection
  // initializeLocalStorage is no longer needed as we use API

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon || Building2;

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
                  Painel Administrativo
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Gestão de Licenças
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
              <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-white font-semibold text-sm shadow-md">
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

      {/* Tab Navigation */}
      <nav className="sticky top-16 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${isActive
                    ? 'gradient-bg text-white shadow-md shadow-indigo-500/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 no-print">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Shield className="w-4 h-4" />
          <span>Admin</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 dark:text-white font-medium flex items-center gap-1.5">
            <ActiveIcon className="w-4 h-4" />
            {tabs.find(t => t.id === activeTab)?.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 animate-fade-in">
        <div key={activeTab} className="animate-slide-up">
          {activeTab === 'companies' && <CompaniesTab />}
          {activeTab === 'licenses' && <LicensesTab />}
          {activeTab === 'documents' && <DocumentsTab />}
          {activeTab === 'urls' && <RenewalURLsTab />}
        </div>
      </main>
    </div>
  );
}