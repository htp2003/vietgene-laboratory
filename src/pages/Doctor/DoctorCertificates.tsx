import React, { useState } from 'react';
import { 
  FaUserMd, 
  FaCertificate, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes, 
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaBuilding,
  FaIdCard
} from 'react-icons/fa';
import useDoctorCertificate from '../../hooks/useDoctorCertificates';

interface DoctorCertificatesProps {
  doctorId: string;
}

export default function DoctorCertificates({ doctorId }: DoctorCertificatesProps) {
  const {
    certificates,
    loading,
    error,
    createCertificate,
    updateCertificate,
    deleteCertificate,
    getCertificateStats,
    getCertificateStatus,
    getFilteredCertificates,
    getDaysUntilExpiry,
    refetch
  } = useDoctorCertificate(doctorId);


  const [modalOpen, setModalOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    certificateName: '',
    licenseNumber: '',
    issuedBy: '',
    issueDate: '',
    expiryDate: '',
    doctorId: doctorId,
  });

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'expired' | 'expiring'>('all');

  // Get statistics
  const stats = getCertificateStats();
  const filteredCertificates = getFilteredCertificates(searchTerm, statusFilter);

  // Open modal for create/edit
  const handleOpenModal = (certificate: any = null) => {
    if (certificate) {
      setForm({
        certificateName: certificate.certificateName,
        licenseNumber: certificate.licenseNumber,
        issuedBy: certificate.issuedBy,
        issueDate: certificate.issueDate,
        expiryDate: certificate.expiryDate,
        doctorId: doctorId,
      });
      setEditingCertificate(certificate);
    } else {
      setForm({
        certificateName: '',
        licenseNumber: '',
        issuedBy: '',
        issueDate: '',
        expiryDate: '',
        doctorId: doctorId,
      });
      setEditingCertificate(null);
    }
    setModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCertificate(null);
    setForm({
      certificateName: '',
      licenseNumber: '',
      issuedBy: '',
      issueDate: '',
      expiryDate: '',
      doctorId: doctorId,
    });
  };

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Validate form
  const validateForm = () => {
    if (!form.certificateName.trim()) {
      alert('Tên chứng chỉ không được để trống');
      return false;
    }
    if (!form.licenseNumber.trim()) {
      alert('Số giấy phép không được để trống');
      return false;
    }
    if (!form.issuedBy.trim()) {
      alert('Nơi cấp không được để trống');
      return false;
    }
    if (!form.issueDate) {
      alert('Ngày cấp không được để trống');
      return false;
    }
    if (!form.expiryDate) {
      alert('Ngày hết hạn không được để trống');
      return false;
    }

    // Validate dates
    const issueDate = new Date(form.issueDate);
    const expiryDate = new Date(form.expiryDate);
    
    if (expiryDate <= issueDate) {
      alert('Ngày hết hạn phải sau ngày cấp');
      return false;
    }

    return true;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      let response;
      
      if (editingCertificate) {
        response = await updateCertificate(editingCertificate.id, form);
      } else {
        response = await createCertificate(form);
      }

      if (response.success) {
        alert(response.message);
        handleCloseModal();
      } else {
        alert(`Lỗi: ${response.message}`);
      }
    } catch (err: any) {
      console.error('Error submitting certificate:', err);
      alert('Có lỗi xảy ra khi lưu chứng chỉ');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete certificate
  const handleDelete = async (certificate: any) => {
    if (window.confirm(`Bạn có chắc muốn xóa chứng chỉ "${certificate.certificateName}"?`)) {
      try {
        const response = await deleteCertificate(certificate.id);
        if (response.success) {
          alert(response.message);
        } else {
          alert(`Lỗi: ${response.message}`);
        }
      } catch (err: any) {
        console.error('Error deleting certificate:', err);
        alert('Có lỗi xảy ra khi xóa chứng chỉ');
      }
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaCertificate className="text-blue-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Chứng Chỉ Bác Sĩ
                </h1>
                <p className="text-gray-600 mt-1">
                  Quản lý chứng chỉ và giấy phép hành nghề
                </p>
              </div>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <FaPlus size={16} />
              Thêm chứng chỉ
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Tổng số</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                </div>
                <FaCertificate className="text-blue-400" size={24} />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Còn hiệu lực</p>
                  <p className="text-2xl font-bold text-green-800">{stats.valid}</p>
                </div>
                <FaCheckCircle className="text-green-400" size={24} />
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Sắp hết hạn</p>
                  <p className="text-2xl font-bold text-yellow-800">{stats.expiringSoon}</p>
                </div>
                <FaExclamationTriangle className="text-yellow-400" size={24} />
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Đã hết hạn</p>
                  <p className="text-2xl font-bold text-red-800">{stats.expired}</p>
                </div>
                <FaExclamationTriangle className="text-red-400" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Tìm kiếm chứng chỉ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" size={16} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="valid">Còn hiệu lực</option>
                <option value="expiring">Sắp hết hạn</option>
                <option value="expired">Đã hết hạn</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FaSpinner className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Đang tải danh sách chứng chỉ...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FaExclamationTriangle className="text-red-500 mx-auto mb-4" size={48} />
          <p className="text-red-600 mb-4">{error.message}</p>
          <button 
            onClick={refetch}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Certificates List */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Danh sách chứng chỉ ({filteredCertificates.length})
            </h2>
          </div>

          {filteredCertificates.length === 0 ? (
            <div className="p-12 text-center">
              <FaCertificate className="text-gray-300 mx-auto mb-4" size={48} />
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Không tìm thấy chứng chỉ nào'
                  : 'Chưa có chứng chỉ nào'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button
                  onClick={() => handleOpenModal()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Thêm chứng chỉ đầu tiên
                </button>
              )}
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCertificates.map(certificate => {
                  const status = getCertificateStatus(certificate);
                  const daysUntilExpiry = getDaysUntilExpiry(certificate.expiryDate);
                  
                  return (
                    <div key={certificate.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${status.bgColor}`}>
                            <FaCertificate className={status.color} size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-lg">
                              {certificate.certificateName}
                            </h3>
                            <p className={`text-sm ${status.color} font-medium`}>
                              {status.text}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenModal(certificate)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                            title="Chỉnh sửa"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(certificate)}
                            className="text-red-600 hover:text-red-800 transition-colors p-1"
                            title="Xóa"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <FaIdCard className="text-gray-400" size={14} />
                          <span className="text-sm text-gray-600">
                            Số GP: {certificate.licenseNumber}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <FaBuilding className="text-gray-400" size={14} />
                          <span className="text-sm text-gray-600">
                            Nơi cấp: {certificate.issuedBy}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" size={14} />
                          <span className="text-sm text-gray-600">
                            Ngày cấp: {formatDate(certificate.issueDate)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" size={14} />
                          <span className="text-sm text-gray-600">
                            Hết hạn: {formatDate(certificate.expiryDate)}
                          </span>
                        </div>

                        {daysUntilExpiry > 0 && daysUntilExpiry <= 30 && (
                          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                            Còn {daysUntilExpiry} ngày hết hạn
                          </div>
                        )}
                        
                        {daysUntilExpiry < 0 && (
                          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                            Đã hết hạn {Math.abs(daysUntilExpiry)} ngày
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaCertificate className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingCertificate ? 'Chỉnh sửa chứng chỉ' : 'Thêm chứng chỉ mới'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Thông tin chứng chỉ hành nghề
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={submitting}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên chứng chỉ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="certificateName"
                    value={form.certificateName}
                    onChange={handleFormChange}
                    placeholder="Ví dụ: Bằng Bác sĩ Y khoa"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số giấy phép <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={form.licenseNumber}
                    onChange={handleFormChange}
                    placeholder="Ví dụ: GP-2024-001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nơi cấp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="issuedBy"
                    value={form.issuedBy}
                    onChange={handleFormChange}
                    placeholder="Ví dụ: Bộ Y tế"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày cấp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="issueDate"
                      value={form.issueDate}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày hết hạn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={form.expiryDate}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={submitting}
                      min={form.issueDate}
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={submitting}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" size={16} />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <FaSave size={16} />
                    {editingCertificate ? 'Cập nhật' : 'Thêm chứng chỉ'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}