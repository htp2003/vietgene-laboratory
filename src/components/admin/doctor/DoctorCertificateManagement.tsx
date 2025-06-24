import React, { useState } from 'react';
import { FaPlus, FaCertificate, FaEdit, FaTrash, FaCalendarAlt, FaBuilding, FaExclamationTriangle, FaCheckCircle, FaIdCard, FaTimes } from 'react-icons/fa';
import useDoctorCertificate from '../../../hooks/useDoctorCertificates';
import { EnhancedDoctor } from '../../../hooks/useDoctor';
import { CertificateRequest } from '../../../services/doctorCertificateService';

interface DoctorCertificateManagementProps {
  doctor: EnhancedDoctor;
}

const DoctorCertificateManagement: React.FC<DoctorCertificateManagementProps> = ({ doctor }) => {
  const {
    certificates,
    loading,
    error,
    createCertificate,
    updateCertificate,
    deleteCertificate,
    getCertificateStats,
    getCertificateStatus,
    getDaysUntilExpiry,
    getFilteredCertificates,
  } = useDoctorCertificate(doctor.doctorId);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState<CertificateRequest>({
    certificateName: '',
    licenseNumber: '',
    issuedBy: '',
    issueDate: '',
    expiryDate: '',
    doctorId: doctor.doctorId,
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'valid' | 'expired' | 'expiring' | 'all'>('all');

  // Open modal for create/edit
  const handleOpenModal = (certificate: any = null) => {
    if (certificate) {
      setForm({
        certificateName: certificate.certificateName || '',
        licenseNumber: certificate.licenseNumber || '',
        issuedBy: certificate.issuedBy || '',
        issueDate: certificate.issueDate ? certificate.issueDate.split('T')[0] : '',
        expiryDate: certificate.expiryDate ? certificate.expiryDate.split('T')[0] : '',
        doctorId: doctor.doctorId,
      });
      setEditingCertificate(certificate);
    } else {
      setForm({
        certificateName: '',
        licenseNumber: '',
        issuedBy: '',
        issueDate: '',
        expiryDate: '',
        doctorId: doctor.doctorId,
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
      doctorId: doctor.doctorId,
    });
  };

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.certificateName.trim()) {
      alert('Vui lòng nhập tên chứng chỉ');
      return;
    }

    if (!form.licenseNumber.trim()) {
      alert('Vui lòng nhập số giấy phép');
      return;
    }

    if (!form.issuedBy.trim()) {
      alert('Vui lòng nhập nơi cấp');
      return;
    }

    if (!form.issueDate) {
      alert('Vui lòng chọn ngày cấp');
      return;
    }

    if (!form.expiryDate) {
      alert('Vui lòng chọn ngày hết hạn');
      return;
    }

    // Validate dates
    const issueDate = new Date(form.issueDate);
    const expiryDate = new Date(form.expiryDate);
    
    if (expiryDate <= issueDate) {
      alert('Ngày hết hạn phải sau ngày cấp');
      return;
    }

    setSubmitting(true);

    try {
      let response;
      
      // Convert dates to ISO format for API
      const formData = {
        ...form,
        issueDate: new Date(form.issueDate).toISOString(),
        expiryDate: new Date(form.expiryDate).toISOString(),
      };
      
      if (editingCertificate) {
        response = await updateCertificate(editingCertificate.id, formData);
      } else {
        response = await createCertificate(formData);
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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  const getStatusIcon = (certificate: any) => {
    const status = getCertificateStatus(certificate);
    switch (status.status) {
      case 'expired':
        return <FaExclamationTriangle className="text-red-500" size={16} />;
      case 'expiring':
        return <FaExclamationTriangle className="text-yellow-500" size={16} />;
      case 'valid':
        return <FaCheckCircle className="text-green-500" size={16} />;
      default:
        return <FaCheckCircle className="text-gray-500" size={16} />;
    }
  };

  // Filter certificates by search term and status
  const filteredCertificates = getFilteredCertificates(searchTerm, statusFilter);
  const stats = getCertificateStats();

  // Form validation
  const isFormValid = () => {
    return form.certificateName.trim() &&
           form.licenseNumber.trim() &&
           form.issuedBy.trim() &&
           form.issueDate &&
           form.expiryDate &&
           new Date(form.expiryDate) > new Date(form.issueDate);
  };

  return (
    <div className="bg-white rounded-lg shadow mt-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaCertificate className="text-blue-600" />
              Chứng chỉ hành nghề
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Quản lý chứng chỉ của bác sĩ {doctor.doctorName}
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaPlus size={14} />
            Thêm chứng chỉ
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Tổng số</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
            <div className="text-sm text-gray-600">Còn hiệu lực</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</div>
            <div className="text-sm text-gray-600">Sắp hết hạn</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            <div className="text-sm text-gray-600">Đã hết hạn</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm chứng chỉ, số giấy phép, nơi cấp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="valid">Còn hiệu lực</option>
              <option value="expiring">Sắp hết hạn</option>
              <option value="expired">Đã hết hạn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="px-6 py-8 text-center">
          <div className="inline-flex items-center gap-2 text-blue-600">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            Đang tải...
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="px-6 py-8 text-center">
          <div className="text-red-600">{error.message}</div>
        </div>
      )}

      {/* Certificates List */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chứng chỉ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số giấy phép
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nơi cấp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày cấp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày hết hạn
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' ? 'Không tìm thấy chứng chỉ phù hợp' : 'Chưa có chứng chỉ nào'}
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((certificate) => {
                  const status = getCertificateStatus(certificate);
                  const daysUntilExpiry = getDaysUntilExpiry(certificate.expiryDate);
                  
                  return (
                    <tr key={certificate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FaCertificate className="text-blue-500" size={16} />
                          <div>
                            <div className="font-medium text-gray-900">
                              {certificate.certificateName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaIdCard className="text-gray-400" size={14} />
                          <span className="text-gray-900 font-mono text-sm">{certificate.licenseNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaBuilding className="text-gray-400" size={14} />
                          <span className="text-gray-900">{certificate.issuedBy}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {formatDate(certificate.issueDate)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" size={14} />
                          <span className="text-gray-900">{formatDate(certificate.expiryDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(certificate)}
                            <span className={`text-sm font-medium ${status.color}`}>
                              {status.text}
                            </span>
                          </div>
                          {status.status === 'expiring' && (
                            <span className="text-xs text-gray-500">
                              ({daysUntilExpiry} ngày)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal(certificate)}
                            className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                            title="Chỉnh sửa"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(certificate)}
                            className="text-red-600 hover:text-red-900 transition-colors p-1"
                            title="Xóa"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaCertificate className="text-green-600" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingCertificate ? 'Chỉnh sửa chứng chỉ' : 'Thêm chứng chỉ mới'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingCertificate ? 'Cập nhật thông tin chứng chỉ' : 'Tạo chứng chỉ mới cho bác sĩ'}
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
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Certificate Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FaCertificate size={14} />
                      Tên chứng chỉ <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    name="certificateName"
                    value={form.certificateName}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Nhập tên chứng chỉ"
                    required
                    disabled={submitting}
                    autoFocus
                  />
                </div>

                {/* License Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FaIdCard size={14} />
                      Số giấy phép <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={form.licenseNumber}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors font-mono"
                    placeholder="Nhập số giấy phép"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Issued By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FaBuilding size={14} />
                      Nơi cấp <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    name="issuedBy"
                    value={form.issuedBy}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Nhập tên cơ quan cấp chứng chỉ"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Date Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt size={14} />
                        Ngày cấp <span className="text-red-500">*</span>
                      </div>
                    </label>
                    <input
                      type="date"
                      name="issueDate"
                      value={form.issueDate}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt size={14} />
                        Ngày hết hạn <span className="text-red-500">*</span>
                      </div>
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={form.expiryDate}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      required
                      disabled={submitting}
                      min={form.issueDate}
                    />
                  </div>
                </div>

                {/* Date validation message */}
                {form.issueDate && form.expiryDate && new Date(form.expiryDate) <= new Date(form.issueDate) && (
                  <div className="text-red-500 text-sm">
                    Ngày hết hạn phải sau ngày cấp
                  </div>
                )}

                {/* Information Note */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-green-100 rounded">
                      <FaCertificate className="text-green-600" size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-green-900 mb-1">
                        Lưu ý quan trọng
                      </h4>
                      <p className="text-sm text-green-700">
                        Hệ thống sẽ tự động thông báo khi chứng chỉ sắp hết hạn (30 ngày trước). 
                        Vui lòng đảm bảo thông tin chính xác và cập nhật kịp thời.
                      </p>
                    </div>
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
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting || !isFormValid()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors font-medium flex items-center gap-2 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    {editingCertificate ? (
                      <>
                        <FaCertificate size={16} />
                        Cập nhật
                      </>
                    ) : (
                      <>
                        <FaCertificate size={16} />
                        Thêm chứng chỉ
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorCertificateManagement;