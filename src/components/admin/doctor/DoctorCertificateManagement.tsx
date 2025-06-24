import React, { useState } from 'react';
import { FaPlus, FaCertificate, FaEdit, FaTrash, FaCalendarAlt, FaBuilding, FaToggleOn, FaToggleOff, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
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
    toggleCertificateStatus,
    getCertificateStats,
    isCertificateExpired,
    isCertificateExpiringSoon,
  } = useDoctorCertificate(doctor.doctorId);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState<CertificateRequest>({
    doctorId: doctor.doctorId,
    certificateName: '',
    issueDate: '',
    expiryDate: '',
    issuedBy: '',
    isActive: true,
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Open modal for create/edit
  const handleOpenModal = (certificate: any = null) => {
    if (certificate) {
      setForm({
        doctorId: doctor.doctorId,
        certificateName: certificate.certificateName || '',
        issueDate: certificate.issueDate || '',
        expiryDate: certificate.expiryDate || '',
        issuedBy: certificate.issuedBy || '',
        isActive: certificate.isActive ?? true,
      });
      setEditingCertificate(certificate);
    } else {
      setForm({
        doctorId: doctor.doctorId,
        certificateName: '',
        issueDate: '',
        expiryDate: '',
        issuedBy: '',
        isActive: true,
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
      doctorId: doctor.doctorId,
      certificateName: '',
      issueDate: '',
      expiryDate: '',
      issuedBy: '',
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

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.certificateName.trim() || !form.issueDate || !form.expiryDate || !form.issuedBy.trim()) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

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

  // Toggle certificate status
  const handleToggleStatus = async (certificate: any) => {
    try {
      const response = await toggleCertificateStatus(certificate.id);
      
      if (response.success) {
        alert(response.message);
      } else {
        alert(`Lỗi: ${response.message}`);
      }
    } catch (err: any) {
      console.error('Error toggling certificate status:', err);
      alert('Có lỗi xảy ra khi thay đổi trạng thái chứng chỉ');
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
    if (isCertificateExpired(certificate.expiryDate)) {
      return <FaExclamationTriangle className="text-red-500" size={16} />;
    } else if (isCertificateExpiringSoon(certificate.expiryDate)) {
      return <FaExclamationTriangle className="text-yellow-500" size={16} />;
    } else {
      return <FaCheckCircle className="text-green-500" size={16} />;
    }
  };

  const getStatusText = (certificate: any) => {
    if (isCertificateExpired(certificate.expiryDate)) {
      return 'Đã hết hạn';
    } else if (isCertificateExpiringSoon(certificate.expiryDate)) {
      return 'Sắp hết hạn';
    } else {
      return 'Còn hiệu lực';
    }
  };

  // Filter certificates by search term
  const filteredCertificates = certificates.filter(cert =>
    cert.certificateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.issuedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = getCertificateStats();

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
              Quản lý chứng chỉ của bác sĩ {doctor.fullName}
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
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
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

      {/* Search */}
      <div className="px-6 py-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Tìm kiếm chứng chỉ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'Không tìm thấy chứng chỉ phù hợp' : 'Chưa có chứng chỉ nào'}
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((certificate) => (
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
                      <div className="flex items-center justify-center gap-2">
                        {getStatusIcon(certificate)}
                        <span className="text-sm">{getStatusText(certificate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(certificate)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title={certificate.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        >
                          {certificate.isActive ? (
                            <FaToggleOn className="text-green-500" size={18} />
                          ) : (
                            <FaToggleOff className="text-gray-400" size={18} />
                          )}
                        </button>
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
                ))
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
              <h3 className="text-xl font-semibold text-gray-900">
                {editingCertificate ? 'Chỉnh sửa chứng chỉ' : 'Thêm chứng chỉ mới'}
              </h3>
              <button
                onClick={handleCloseModal}
                disabled={submitting}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên chứng chỉ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="certificateName"
                      value={form.certificateName}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nơi cấp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="issuedBy"
                      value={form.issuedBy}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày cấp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="issueDate"
                      value={form.issueDate}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày hết hạn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={form.expiryDate}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isActive"
                        value="true"
                        checked={form.isActive === true}
                        onChange={handleFormChange}
                        disabled={submitting}
                      />
                      <span className="ml-2">Hoạt động</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isActive"
                        value="false"
                        checked={form.isActive === false}
                        onChange={handleFormChange}
                        disabled={submitting}
                      />
                      <span className="ml-2">Không hoạt động</span>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={submitting}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {submitting ? 'Đang lưu...' : (editingCertificate ? 'Cập nhật' : 'Thêm mới')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorCertificateManagement;