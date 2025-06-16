import { useEffect, useState } from 'react';
import { doctorCertificatesApi, DoctorCertificate } from '../api/doctorCertificates.api';

export function useDoctorCertificates(doctorId?: string) {
  const [certificates, setCertificates] = useState<DoctorCertificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = doctorId !== undefined
        ? await doctorCertificatesApi.getByDoctor(typeof doctorId === 'string' ? parseInt(doctorId, 10) : doctorId)
        : await doctorCertificatesApi.getAll();
      setCertificates(data);
    } catch (e: any) {
      setError(e.message || 'Lỗi khi tải chứng chỉ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCertificates(); }, [doctorId]);

  const addCertificate = async (cert: Omit<DoctorCertificate, 'id' | 'created_at'>) => {
    setLoading(true);
    try {
      const newCert = await doctorCertificatesApi.add(cert);
      setCertificates(prev => [...prev, newCert]);
    } catch (e: any) {
      setError(e.message || 'Lỗi khi thêm chứng chỉ');
    } finally {
      setLoading(false);
    }
  };

  const updateCertificate = async (cert: DoctorCertificate) => {
    setLoading(true);
    try {
      const updated = await doctorCertificatesApi.update(cert);
      if (updated) {
        setCertificates(prev => prev.map(c => c.id === cert.id ? updated : c));
      }
    } catch (e: any) {
      setError(e.message || 'Lỗi khi cập nhật chứng chỉ');
    } finally {
      setLoading(false);
    }
  };

  const deleteCertificate = async (id: string | number) => {
    setLoading(true);
    try {
      const numId = typeof id === 'string' ? parseInt(id, 10) : id;
      await doctorCertificatesApi.delete(numId);
      setCertificates(prev => prev.filter(c => c.id !== numId));
    } catch (e: any) {
      setError(e.message || 'Lỗi khi xóa chứng chỉ');
    } finally {
      setLoading(false);
    }
  };

  return { certificates, loading, error, fetchCertificates, addCertificate, updateCertificate, deleteCertificate };
}
