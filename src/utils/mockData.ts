import { Company, License, RenewalDocument, RenewalURL } from '../types';

export const mockCompanies: Company[] = [
  {
    id: '1',
    cnpj: '12.345.678/0001-90',
    name: 'Indústria XYZ Ltda',
    createdAt: '2025-01-15'
  },
  {
    id: '2',
    cnpj: '98.765.432/0001-10',
    name: 'Comércio ABC S.A.',
    createdAt: '2025-02-20'
  },
  {
    id: '3',
    cnpj: '45.678.901/0001-23',
    name: 'Serviços Delta ME',
    createdAt: '2025-03-10'
  }
];

export const mockLicenses: License[] = [
  {
    id: '1',
    companyId: '1',
    type: 'Polícia Federal',
    issueDate: '2025-06-10',
    expiryDate: '2027-06-10',
    fileName: 'licenca_pf_xyz.pdf',
    status: 'valid'
  },
  {
    id: '2',
    companyId: '1',
    type: 'IBAMA',
    issueDate: '2025-01-15',
    expiryDate: '2027-01-15',
    fileName: 'licenca_ibama_xyz.pdf',
    status: 'valid'
  },
  {
    id: '3',
    companyId: '1',
    type: 'CETESB',
    issueDate: '2025-09-01',
    expiryDate: '2027-09-01',
    fileName: 'licenca_cetesb_xyz.pdf',
    status: 'valid'
  },
  {
    id: '4',
    companyId: '2',
    type: 'Vigilância Sanitária',
    issueDate: '2025-08-01',
    expiryDate: '2026-02-28',
    fileName: 'licenca_visa_abc.pdf',
    status: 'expiring'
  },
  {
    id: '5',
    companyId: '2',
    type: 'Municipal',
    issueDate: '2025-03-15',
    expiryDate: '2026-03-15',
    fileName: 'licenca_municipal_abc.pdf',
    status: 'expiring'
  },
  {
    id: '6',
    companyId: '3',
    type: 'Polícia Civil',
    issueDate: '2024-05-10',
    expiryDate: '2025-11-10',
    fileName: 'licenca_pc_delta.pdf',
    status: 'expired'
  },
  {
    id: '7',
    companyId: '3',
    type: 'Exército',
    issueDate: '2025-10-01',
    expiryDate: '2027-10-01',
    fileName: 'licenca_exercito_delta.pdf',
    status: 'valid'
  }
];

export const mockRenewalDocuments: RenewalDocument[] = [
  {
    id: '1',
    licenseType: 'Polícia Federal',
    documentName: 'Formulário de Requisição',
    fileName: 'form_requisicao_pf.pdf',
    uploadedAt: '2025-06-05'
  },
  {
    id: '2',
    licenseType: 'Polícia Federal',
    documentName: 'Certificado de Registro',
    fileName: 'cert_registro_pf.pdf',
    uploadedAt: '2025-06-05'
  },
  {
    id: '3',
    licenseType: 'IBAMA',
    documentName: 'Relatório Ambiental',
    fileName: 'relatorio_ambiental.pdf',
    uploadedAt: '2025-07-10'
  },
  {
    id: '4',
    licenseType: 'CETESB',
    documentName: 'Plano de Gerenciamento de Resíduos',
    fileName: 'pgr_cetesb.pdf',
    uploadedAt: '2025-08-15'
  }
];

export const mockRenewalURLs: RenewalURL[] = [
  {
    id: '1',
    licenseType: 'Polícia Federal',
    url: 'https://www.gov.br/pf/pt-br',
    description: 'Portal da Polícia Federal - Seção de Licenças'
  },
  {
    id: '2',
    licenseType: 'IBAMA',
    url: 'https://www.gov.br/ibama/pt-br',
    description: 'Sistema de Licenciamento Ambiental - IBAMA'
  },
  {
    id: '3',
    licenseType: 'CETESB',
    url: 'https://cetesb.sp.gov.br/',
    description: 'CETESB - Licenciamento e Autorizações'
  },
  {
    id: '4',
    licenseType: 'Vigilância Sanitária',
    url: 'https://www.gov.br/anvisa/pt-br',
    description: 'ANVISA - Licenças Sanitárias'
  }
];

export function getLicenseStatus(expiryDate: string): 'valid' | 'expiring' | 'expired' {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring';
  return 'valid';
}

export function initializeLocalStorage() {
  if (!localStorage.getItem('companies')) {
    localStorage.setItem('companies', JSON.stringify(mockCompanies));
  }
  if (!localStorage.getItem('licenses')) {
    localStorage.setItem('licenses', JSON.stringify(mockLicenses));
  }
  if (!localStorage.getItem('renewalDocuments')) {
    localStorage.setItem('renewalDocuments', JSON.stringify(mockRenewalDocuments));
  }
  if (!localStorage.getItem('renewalURLs')) {
    localStorage.setItem('renewalURLs', JSON.stringify(mockRenewalURLs));
  }
}
