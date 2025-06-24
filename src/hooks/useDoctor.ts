import { useState, useEffect, useCallback } from 'react';
import doctorService, { Doctor, DoctorRequest } from '../services/doctorService';

// Enhanced Doctor interface for frontend with additional fields
export interface EnhancedDoctor extends Doctor {
  specialization?: string;
  experience?: number;
  avatar?: string;
}

export interface DoctorStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
}

export const useDoctor = () => {
  const [doctors, setDoctors] = useState<EnhancedDoctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Helper function to enhance doctor data with additional mock fields for better UI
  const enhanceDoctor = (doctor: Doctor): EnhancedDoctor => {
    return {
      ...doctor,
      specialization: ['Tim mạch', 'Thần kinh', 'Nhi khoa', 'Chỉnh hình', 'Da liễu'][Math.floor(Math.random() * 5)],
      experience: Math.floor(Math.random() * 20) + 1,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.doctorName)}&background=random&color=fff`
    };
  };

  // Fetch all doctors
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await doctorService.getAllDoctors();
      
      if (response.success && response.data) {
        // Enhance doctors with additional mock data
        const enhancedDoctors = response.data.map(enhanceDoctor);
        setDoctors(enhancedDoctors);
      } else {
        setError(new Error(response.message));
      }
    } catch (err: any) {
      setError(new Error('Có lỗi xảy ra khi tải danh sách bác sĩ'));
      console.error('Fetch doctors error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new doctor
  const createDoctor = useCallback(async (doctorData: DoctorRequest) => {
    try {
      setError(null);
      
      const response = await doctorService.createDoctor(doctorData);
      
      if (response.success && response.data) {
        // Enhance and add new doctor to the beginning of the list
        const enhancedDoctor = enhanceDoctor(response.data);
        setDoctors(prev => [enhancedDoctor, ...prev]);
        return { success: true, message: response.message };
      } else {
        setError(new Error(response.message));
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi tạo bác sĩ';
      setError(new Error(errorMessage));
      console.error('Create doctor error:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Update doctor
  const updateDoctor = useCallback(async (doctorId: string, doctorData: DoctorRequest) => {
    try {
      setError(null);
      
      console.log('🔄 Frontend Update Doctor Request:', {
        doctorId,
        doctorData
      });
      
      const response = await doctorService.updateDoctor(doctorId, doctorData);
      
      if (response.success && response.data) {
        // Update the doctor in the list while preserving enhanced fields
        setDoctors(prev => 
          prev.map(doctor => 
            doctor.doctorId === doctorId 
              ? { 
                  ...doctor, // Keep enhanced fields
                  ...response.data!, // Update with API response
                }
              : doctor
          )
        );
        
        console.log('✅ Doctor updated successfully in state');
        return { success: true, message: response.message };
      } else {
        console.error('❌ Update failed:', response.message);
        setError(new Error(response.message));
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi cập nhật bác sĩ';
      console.error('💥 Update doctor error in hook:', err);
      setError(new Error(errorMessage));
      return { success: false, message: errorMessage };
    }
  }, []);

  // Delete doctor
  const deleteDoctor = useCallback(async (doctorId: string) => {
    try {
      setError(null);
      
      const response = await doctorService.deleteDoctor(doctorId);
      
      if (response.success) {
        // Remove the doctor from the list
        setDoctors(prev => prev.filter(doctor => doctor.doctorId !== doctorId));
        return { success: true, message: response.message };
      } else {
        setError(new Error(response.message));
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi xóa bác sĩ';
      setError(new Error(errorMessage));
      console.error('Delete doctor error:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Get doctor by ID
  const getDoctorById = useCallback(async (doctorId: string) => {
    try {
      setError(null);
      
      const response = await doctorService.getDoctorById(doctorId);
      
      if (response.success && response.data) {
        const enhancedDoctor = enhanceDoctor(response.data);
        return { success: true, data: enhancedDoctor, message: response.message };
      } else {
        setError(new Error(response.message));
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi tải thông tin bác sĩ';
      setError(new Error(errorMessage));
      console.error('Get doctor by ID error:', err);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Toggle doctor active status
  const toggleDoctorStatus = useCallback(async (doctorId: string) => {
    try {
      setError(null);
      
      const doctor = doctors.find(d => d.doctorId === doctorId);
      if (!doctor) {
        return { success: false, message: "Không tìm thấy bác sĩ" };
      }
      
      const response = await updateDoctor(doctorId, {
        doctorCode: doctor.doctorCode,
        doctorName: doctor.doctorName,
        doctorEmail: doctor.doctorEmail,
        doctorPhone: doctor.doctorPhone,
        isActive: !doctor.isActive
      });
      
      return response;
    } catch (err: any) {
      const errorMessage = 'Có lỗi xảy ra khi thay đổi trạng thái bác sĩ';
      setError(new Error(errorMessage));
      console.error('Toggle doctor status error:', err);
      return { success: false, message: errorMessage };
    }
  }, [doctors, updateDoctor]);

  // Get combined search and filter results
  const getFilteredDoctors = useCallback((searchTerm: string, statusFilter?: boolean) => {
    let filtered = doctors;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(doctor => {
        // Safe string handling to avoid null errors
        const code = (doctor.doctorCode || '').toLowerCase();
        const name = (doctor.doctorName || '').toLowerCase();
        const email = (doctor.doctorEmail || '').toLowerCase();
        const phone = (doctor.doctorPhone || '').toLowerCase();
        const specialization = (doctor.specialization || '').toLowerCase();
        
        return code.includes(lowerSearchTerm) ||
               name.includes(lowerSearchTerm) ||
               email.includes(lowerSearchTerm) ||
               phone.includes(lowerSearchTerm) ||
               specialization.includes(lowerSearchTerm);
      });
    }
    
    // Apply status filter
    if (statusFilter !== undefined) {
      filtered = filtered.filter(doctor => doctor.isActive === statusFilter);
    }
    
    return filtered;
  }, [doctors]);

  // Get doctor statistics
  const getDoctorStats = useCallback((): DoctorStats => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const stats = {
      total: doctors.length,
      active: doctors.filter(doctor => doctor.isActive).length,
      inactive: doctors.filter(doctor => !doctor.isActive).length,
      newThisMonth: doctors.filter(doctor => 
        new Date(doctor.createdAt) >= firstDayOfMonth
      ).length,
    };
    
    return stats;
  }, [doctors]);

  // Get recent doctors
  const getRecentDoctors = useCallback((limit: number = 5) => {
    return doctors
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }, [doctors]);

  // Get doctors by specialization
  const getDoctorsBySpecialization = useCallback((specialization: string) => {
    return doctors.filter(doctor => doctor.specialization === specialization);
  }, [doctors]);

  // Load doctors on component mount
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return {
    // State
    doctors,
    loading,
    error,
    
    // Actions
    createDoctor,
    updateDoctor,
    deleteDoctor,
    getDoctorById,
    toggleDoctorStatus,
    refetch: fetchDoctors,
    
    // Filtering & Search
    getFilteredDoctors,
    
    // Statistics & Analytics
    getDoctorStats,
    getRecentDoctors,
    getDoctorsBySpecialization,
  };
};

export default useDoctor;