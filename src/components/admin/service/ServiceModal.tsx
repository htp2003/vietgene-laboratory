import React, { useState, useEffect } from 'react';
import { FaTimes, FaFlask } from 'react-icons/fa';
import { Service } from '../../../services/serviceService';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Partial<Service>) => void;
  service?: Service;
  submitting?: boolean;
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  service,
  submitting = false
}) => {
  const [form, setForm] = useState<Partial<Service>>({
    service_name: '',
    service_type: '',
    test_category: '',
    description: '',
    price: 0,
    duration_days: 7,
    collection_methods: 'facility_collect',
    requires_legal_documents: false,
  });

  useEffect(() => {
    if (service) {
      setForm({
        service_name: service.service_name || '',
        service_type: service.service_type || '',
        test_category: service.test_category || '',
        description: service.description || '',
        price: service.price || 0,
        duration_days: service.duration_days || 7,
        collection_methods: service.collection_methods || 'facility_collect',
        requires_legal_documents: service.requires_legal_documents || false,
      });
    } else {
      setForm({
        service_name: '',
        service_type: '',
        test_category: '',
        description: '',
        price: 0,
        duration_days: 7,
        collection_methods: 'facility_collect',
        requires_legal_documents: false,
      });
    }
  }, [service, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'price' || name === 'duration_days') {
      setForm(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.service_name?.trim()) {
      alert('Vui lòng nhập tên dịch vụ');
      return;
    }
    if (!form.service_type?.trim()) {
      alert('Vui lòng nhập loại dịch vụ');
      return;
    }
    if (!form.test_category?.trim()) {
      alert('Vui lòng nhập danh mục');
      return;
    }
    if (!form.description?.trim()) {
      alert('Vui lòng nhập mô tả');
      return;
    }
    if (!form.price || form.price <= 0) {
      alert('Vui lòng nhập giá hợp lệ');
      return;
    }
    if (!form.duration_days || form.duration_days <= 0) {
      alert('Vui lòng nhập thời gian xử lý hợp lệ');
      return;
    }

    onSave(form);
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isFormValid = () => {
    return form.service_name?.trim() &&
           form.service_type?.trim() &&
           form.test_category?.trim() &&
           form.description?.trim() &&
           form.price && form.price > 0 &&
           form.duration_days && form.duration_days > 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaFlask className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {service ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {service ? 'Cập nhật thông tin dịch vụ' : 'Tạo dịch vụ xét nghiệm mới'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên dịch vụ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="service_name"
                value={form.service_name || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Nhập tên dịch vụ"
                required
                disabled={submitting}
                autoFocus
              />
            </div>

            {/* Service Type and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại dịch vụ <span className="text-red-500">*</span>
                </label>
                <select
                  name="service_type"
                  value={form.service_type || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                  disabled={submitting}
                >
                  <option value="">Chọn loại dịch vụ</option>
                  <option value="civil">Dân sự</option>
                  <option value="administrative">Pháp lý</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  name="test_category"
                  value={form.test_category || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                  disabled={submitting}
                >
                  <option value="">Chọn danh mục</option>
                  <option value="Cơ bản">Cơ bản</option>
                  <option value="Cha con">Cha con</option>
                  <option value="Mẹ con">Mẹ con</option>
                  <option value="Anh chị em">Anh chị em</option>
                  <option value="Huyết thống">Huyết thống</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={form.description || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Nhập mô tả chi tiết về dịch vụ"
                required
                disabled={submitting}
              />
            </div>

            {/* Price and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá dịch vụ (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price || ''}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="0"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian xử lý (ngày) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="duration_days"
                  value={form.duration_days || ''}
                  onChange={handleChange}
                  min="1"
                  max="30"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="7"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Collection Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phương thức lấy mẫu
              </label>
              <select
                name="collection_methods"
                value={form.collection_methods || 'facility_collect'}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={submitting}
              >
                <option value="">Chọn phương thức lấy mẫu</option>
                <option value="facility_collect">Lấy mẫu tại cơ sở y tế</option>
                <option value="self_collect">Tự lấy mẫu tại nhà</option>
              </select>
            </div>

            {/* Legal Documents Required */}
            <div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="requires_legal_documents"
                  checked={form.requires_legal_documents || false}
                  onChange={handleChange}
                  id="requires_legal_documents"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={submitting}
                />
                <label htmlFor="requires_legal_documents" className="text-sm font-medium text-gray-700">
                  Yêu cầu giấy tờ pháp lý
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-7">
                Dịch vụ này có yêu cầu khách hàng cung cấp giấy tờ pháp lý không?
              </p>
            </div>

            {/* Information Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-blue-100 rounded">
                  <FaFlask className="text-blue-600" size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    Lưu ý quan trọng
                  </h4>
                  <p className="text-sm text-blue-700">
                    Vui lòng đảm bảo thông tin chính xác. Giá và thời gian xử lý sẽ được hiển thị 
                    cho khách hàng trên website.
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
            onClick={handleSubmit}
            disabled={submitting || !isFormValid()}
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
                {service ? (
                  <>
                    <FaFlask size={16} />
                    Cập nhật
                  </>
                ) : (
                  <>
                    <FaFlask size={16} />
                    Thêm dịch vụ
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

export default ServiceModal;