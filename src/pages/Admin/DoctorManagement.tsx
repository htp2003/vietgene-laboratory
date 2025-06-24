import React, { useState } from 'react';
import { FaPlus, FaUserMd, FaUserCheck, FaUserTimes, FaCalendarPlus } from 'react-icons/fa';
import { useDoctor, EnhancedDoctor } from '../../hooks/useDoctor';
import { DoctorRequest } from '../../services/doctorService';
import DoctorList from '../../components/admin/doctor/DoctorList';
import DoctorModal from '../../components/admin/doctor/DoctorModal';
import DoctorSearchBar from '../../components/admin/doctor/DoctorSearchBar';
import DoctorCertificateManagement from '../../components/admin/doctor/DoctorCertificateManagement';

export default function DoctorManagement() {
  // Use the doctor hook
  const {
    doctors,
    loading,
    error,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    toggleDoctorStatus,
    getFilteredDoctors,
    getDoctorStats,
  } = useDoctor();

  // Local state for UI
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<EnhancedDoctor | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<EnhancedDoctor | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState<DoctorRequest>({
    doctorCode: '',
    isActive: true,
  });

  // Filter state
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Open modal for create/edit
  const handleOpenModal = (doctor: EnhancedDoctor | null = null) => {
    if (doctor) {
      setForm({
        doctorCode: doctor.doctorCode || '',
        isActive: doctor.isActive ?? true,
      });
      setEditingDoctor(doctor);
    } else {
      setForm({
        doctorCode: '',
        isActive: true,
      });
      setEditingDoctor(null);
    }
    setModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingDoctor(null);
    setForm({
      doctorCode: '',
      isActive: true,
    });
  };

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'isActive') {
      setForm(prev => ({ ...prev, isActive: value === 'true' }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Submit form (create/update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.doctorCode.trim()) {
      alert('Vui lòng nhập mã bác sĩ');
      return;
    }

    setSubmitting(true);

    try {
      let response;
      
      if (editingDoctor) {
        // Update existing doctor
        response = await updateDoctor(editingDoctor.doctorId, form);
      } else {
        // Create new doctor
        response = await createDoctor(form);
      }

      if (response.success) {
        alert(response.message);
        handleCloseModal();
      } else {
        alert(`Lỗi: ${response.message}`);
      }
    } catch (err: any) {
      console.error('Error submitting doctor:', err);
      alert('Có lỗi xảy ra khi lưu thông tin bác sĩ');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete doctor
  const handleDelete = async (doctor: EnhancedDoctor) => {
    if (window.confirm(`Bạn có chắc muốn xóa bác sĩ ${doctor.fullName || doctor.doctorCode}?`)) {
      try {
        const response = await deleteDoctor(doctor.doctorId);
        
        if (response.success) {
          alert(response.message);
        } else {
          alert(`Lỗi: ${response.message}`);
        }
      } catch (err: any) {
        console.error('Error deleting doctor:', err);
        alert('Có lỗi xảy ra khi xóa bác sĩ');
      }
    }
  };

  // Toggle doctor status
  const handleToggleStatus = async (doctor: EnhancedDoctor) => {
    try {
      const response = await toggleDoctorStatus(doctor.doctorId);
      
      if (response.success) {
        alert(response.message);
      } else {
        alert(`Lỗi: ${response.message}`);
      }
    } catch (err: any) {
      console.error('Error toggling doctor status:', err);
      alert('Có lỗi xảy ra khi thay đổi trạng thái bác sĩ');
    }
  };

  // Select doctor for certificate/timeslot management
  const handleSelectDoctor = (doctor: EnhancedDoctor) => {
    setSelectedDoctor(doctor);
  };
  // Get filtered doctors and statistics
  const filteredDoctors = getFilteredDoctors(searchTerm, statusFilter);
  const stats = getDoctorStats();

  return (
    <div className="space-y-6 p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Bác sĩ</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin và lịch làm việc của các bác sĩ</p>
        </div>
        <button
          onClick={() => handleOpenModal(null)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus />
          Thêm Bác sĩ
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaUserMd size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng số</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaUserCheck size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <FaUserTimes size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ngưng hoạt động</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inactive}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FaCalendarPlus size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Mới tháng này</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.newThisMonth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <DoctorSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div className="lg:w-48">
            <select
              value={statusFilter === undefined ? '' : statusFilter.toString()}
              onChange={(e) => {
                const value = e.target.value;
                setStatusFilter(value === '' ? undefined : value === 'true');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Ngưng hoạt động</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <p className="text-gray-600">Đang tải danh sách bác sĩ...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-center items-center h-48">
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow text-center max-w-md">
              <h3 className="font-semibold text-lg mb-2">Có lỗi xảy ra</h3>
              <p className="mb-4">{error.message}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doctor List */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Danh sách bác sĩ ({filteredDoctors.length})
            </h2>
          </div>
          
          <DoctorList
            doctors={filteredDoctors}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onSelect={handleSelectDoctor}
            selectedDoctor={selectedDoctor}
          />
          
          {/* Empty State */}
          {filteredDoctors.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FaUserMd size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {statusFilter !== undefined || searchTerm ? 'Không có bác sĩ phù hợp' : 'Chưa có bác sĩ nào'}
              </h3>
              <p className="text-gray-500 mb-4">
                {statusFilter !== undefined || searchTerm 
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.' 
                  : 'Thêm bác sĩ đầu tiên để bắt đầu quản lý.'
                }
              </p>
              {!statusFilter && !searchTerm && (
                <button
                  onClick={() => handleOpenModal(null)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Thêm bác sĩ đầu tiên
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Certificate Management - Show when a doctor is selected */}
      {selectedDoctor && (
        <DoctorCertificateManagement doctor={selectedDoctor} />
      )}

      {/* Doctor Modal */}
      <DoctorModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        form={form}
        onFormChange={handleFormChange}
        editing={!!editingDoctor}
        submitting={submitting}
      />
    </div>
  );
}