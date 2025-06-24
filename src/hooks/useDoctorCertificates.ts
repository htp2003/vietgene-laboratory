import { useState, useEffect, useCallback } from 'react';
import doctorCertificateService, { DoctorCertificate, CertificateRequest } from '../services/doctorCertificateService';

export interface CertificateStats {
  total: number;
  active: number;
  expired: number;
  expiringSoon: number; 
}
export const useDoctorCertificate = (doctorId: string) => {
  const [certificates, setCertificates] = useState<DoctorCertificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch certificates for a specific doctor
  const fetchCertificates = useCallback(async () => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await doctorCertificateService.getCertificatesByDoctorId(doctorId);
      
      if (response.success && response.data) {
        setCertificates(response.data);
      } else {
        setError(new Error(response.message));
      }
    } catch (err: any) {
      setError(new Error('Có lỗi xảy ra khi tải danh sách chứng chỉ'));
      console.error('Fetch certificates error:', err);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  // Create new certificate
  const createCertificate = useCallback(async (certificateData: CertificateRequest) => {
    try {
      setError(null);
      
      const response = await doctorCertificateService.createCertificate(certificateData);
      
      if (response.success && response.data) {
        setCertificates(prev => [response.data!, ...prev]);
        return { success: true, message: response.message };
      } else {
        setError(new Error(response.message));
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi tạo chứng chỉ';
      setError(new Error(errorMessage));
      console.error('Create certificate error:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Update certificate
  const updateCertificate = useCallback(async (certificateId: string, certificateData: Partial<CertificateRequest>) => {
    try {
      setError(null);
      
      const response = await doctorCertificateService.updateCertificate(certificateId, certificateData);
      
      if (response.success && response.data) {
        setCertificates(prev => 
          prev.map(cert => 
            cert.id === certificateId ? response.data! : cert
          )
        );
        return { success: true, message: response.message };
      } else {
        setError(new Error(response.message));
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi cập nhật chứng chỉ';
      setError(new Error(errorMessage));
      console.error('Update certificate error:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Delete certificate
  const deleteCertificate = useCallback(async (certificateId: string) => {
    try {
      setError(null);
      
      const response = await doctorCertificateService.deleteCertificate(certificateId);
      
      if (response.success) {
        setCertificates(prev => prev.filter(cert => cert.id !== certificateId));
        return { success: true, message: response.message };
      } else {
        setError(new Error(response.message));
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi xóa chứng chỉ';
      setError(new Error(errorMessage));
      console.error('Delete certificate error:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Toggle certificate status (removed since API doesn't support this)
  // Can be added back if API supports this feature
  const toggleCertificateStatus = useCallback(async (certificateId: string) => {
    try {
      setError(null);
      
      // Get current certificate
      const currentCert = certificates.find(cert => cert.id === certificateId);
      if (!currentCert) {
        return { success: false, message: "Không tìm thấy chứng chỉ" };
      }
      
      // Update with opposite status
      const response = await updateCertificate(certificateId, {
        isActive: !currentCert.isActive
      });
      
      return response;
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi thay đổi trạng thái chứng chỉ';
      setError(new Error(errorMessage));
      console.error('Toggle certificate status error:', err);
      return { success: false, message: errorMessage };
    }
  }, [certificates, updateCertificate]);

  // Check if certificate is expired
  const isCertificateExpired = useCallback((expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  }, []);

  // Check if certificate is expiring soon (within 30 days)
  const isCertificateExpiringSoon = useCallback((expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }, []);

  // Get certificate statistics
  const getCertificateStats = useCallback((): CertificateStats => {
    const stats = {
      total: certificates.length,
      active: certificates.filter(cert => cert.isActive && !isCertificateExpired(cert.expiryDate)).length,
      expired: certificates.filter(cert => isCertificateExpired(cert.expiryDate)).length,
      expiringSoon: certificates.filter(cert => 
        cert.isActive && isCertificateExpiringSoon(cert.expiryDate)
      ).length,
    };
    
    return stats;
  }, [certificates, isCertificateExpired, isCertificateExpiringSoon]);

  // Search certificates
  const searchCertificates = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) {
      return certificates;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return certificates.filter(cert => 
      (cert.certificateName || '').toLowerCase().includes(lowerSearchTerm) ||
      (cert.issuedBy || '').toLowerCase().includes(lowerSearchTerm)
    );
  }, [certificates]);

  // Filter certificates by status
  const filterCertificatesByStatus = useCallback((status: 'active' | 'expired' | 'expiring' | 'all') => {
    switch (status) {
      case 'active':
        return certificates.filter(cert => cert.isActive && !isCertificateExpired(cert.expiryDate));
      case 'expired':
        return certificates.filter(cert => isCertificateExpired(cert.expiryDate));
      case 'expiring':
        return certificates.filter(cert => cert.isActive && isCertificateExpiringSoon(cert.expiryDate));
      case 'all':
      default:
        return certificates;
    }
  }, [certificates, isCertificateExpired, isCertificateExpiringSoon]);

  // Get filtered certificates with search and status
  const getFilteredCertificates = useCallback((searchTerm: string, statusFilter: 'active' | 'expired' | 'expiring' | 'all') => {
    let filtered = filterCertificatesByStatus(statusFilter);
    
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(cert => 
        (cert.certificateName || '').toLowerCase().includes(lowerSearchTerm) ||
        (cert.issuedBy || '').toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    return filtered;
  }, [filterCertificatesByStatus]);

  // Load certificates on component mount or when doctorId changes
  useEffect(() => {
    if (doctorId) {
      fetchCertificates();
    }
  }, [fetchCertificates, doctorId]);

  return {
    // State
    certificates,
    loading,
    error,
    
    // Actions
    createCertificate,
    updateCertificate,
    deleteCertificate,
    toggleCertificateStatus,
    refetch: fetchCertificates,
    
    // Utilities
    isCertificateExpired,
    isCertificateExpiringSoon,
    
    // Filtering & Search
    searchCertificates,
    filterCertificatesByStatus,
    getFilteredCertificates,
    
    // Statistics
    getCertificateStats,
  };
};

export default useDoctorCertificate;