export function getLicenseStatus(expiryDate: Date): 'valid' | 'expiring' | 'expired' {
    const today = new Date();
    const diffMs = expiryDate.getTime() - today.getTime();
    const daysUntilExpiry = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring';
    return 'valid';
}
