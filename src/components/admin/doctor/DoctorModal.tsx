import React from 'react';
import { FaTimes, FaUserMd, FaStethoscope, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { DoctorRequest } from '../../../services/doctorService';

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: DoctorRequest;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  editing: boolean;
  submitting?: boolean;
}

const DoctorModal: React.FC<DoctorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  onFormChange,
  editing,
  submitting = false
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaUserMd className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {editing ? 'Chỉnh sửa bác sĩ' : 'Thêm bác sĩ mới'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {editing ? 'Cập nhật thông tin bác sĩ' : 'Tạo hồ sơ bác sĩ mới'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Doctor Code */}
            <div>
              <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaStethoscope size={14} />
                Mã bác sĩ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="doctorCode"
                value={form.doctorCode}
                onChange={onFormChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Nhập mã bác sĩ (VD: BS001, DOC123)"
                required
                disabled={submitting}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Mã bác sĩ duy nhất để xác định trong hệ thống
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái hoạt động
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isActive"
                    value="true"
                    checked={form.isActive === true}
                    onChange={onFormChange}
                    disabled={submitting}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="flex items-center gap-2 text-sm">
                    <FaToggleOn className="text-green-500" size={16} />
                    Đang hoạt động
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isActive"
                    value="false"
                    checked={form.isActive === false}
                    onChange={onFormChange}
                    disabled={submitting}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="flex items-center gap-2 text-sm">
                    <FaToggleOff className="text-gray-400" size={16} />
                    Ngưng hoạt động
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Chọn trạng thái hoạt động của bác sĩ trong hệ thống
              </p>
            </div>

            {/* Information Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-blue-100 rounded">
                  <FaUserMd className="text-blue-600" size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    Thông tin bổ sung
                  </h4>
                  <p className="text-sm text-blue-700">
                    Sau khi tạo hồ sơ bác sĩ, bạn có thể cập nhật thêm thông tin chi tiết như 
                    chuyên khoa, kinh nghiệm, và lịch làm việc trong phần quản lý bác sĩ.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleFormSubmit}
            disabled={submitting || !form.doctorCode.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium flex items-center gap-2 disabled:cursor-not-allowed"
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
                {editing ? (
                  <>
                    <FaUserMd size={16} />
                    Cập nhật
                  </>
                ) : (
                  <>
                    <FaUserMd size={16} />
                    Thêm bác sĩ
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorModal;