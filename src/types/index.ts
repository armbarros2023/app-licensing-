export interface Company {
  id: string;
  cnpj: string;
  name: string;
  createdAt: string;
}

export interface LicenseFile {
  id: string;
  licenseId: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
}

export interface License {
  id: string;
  companyId: string;
  type: LicenseType;
  issueDate: string;
  expiryDate: string;
  fileUrl?: string;
  fileName?: string;
  files?: LicenseFile[];
  status: 'valid' | 'expiring' | 'expired';
}

export type LicenseType =
  | 'Polícia Civil'
  | 'Polícia Federal'
  | 'IBAMA'
  | 'CETESB'
  | 'Vigilância Sanitária'
  | 'Exército'
  | 'Municipal';

export interface RenewalDocument {
  id: string;
  licenseType: LicenseType;
  documentName: string;
  fileUrl?: string;
  fileName?: string;
  uploadedAt: string;
}

export interface RenewalURL {
  id: string;
  licenseType: LicenseType;
  url: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}
