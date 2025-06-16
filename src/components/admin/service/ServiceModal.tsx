import React from 'react'
import { FaTimes } from 'react-icons/fa'

interface Service {
  id: string;
  service_name: string;
  service_type: string;
  test_category: string;
  description: string;
  price: number;
  duration_days: number;
  collection_methods: string[];
  requires_legal_documents: boolean;
  is_active: boolean;
  created_at: string;
}

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Omit<Service, 'id' | 'created_at'>) => void;
  service?: Service;
}

export default function ServiceModal({ isOpen, onClose, onSave, service }: ServiceModalProps) {
  const defaultForm: Omit<Service, 'id' | 'created_at'> = {
    service_name: service?.service_name || '',
    service_type: service?.service_type || '',
    test_category: service?.test_category || '',
    description: service?.description || '',
    price: service?.price || 0,
    duration_days: service?.duration_days || 0,
    collection_methods: service?.collection_methods || [],
    requires_legal_documents: service?.requires_legal_documents || false,
    is_active: service?.is_active ?? true,
  };

  const [formData, setFormData] = React.useState<Omit<Service, 'id' | 'created_at'>>(defaultForm);

  React.useEffect(() => {
    if (service) {
      setFormData({
        service_name: service.service_name,
        service_type: service.service_type,
        test_category: service.test_category,
        description: service.description,
        price: service.price,
        duration_days: service.duration_days,
        collection_methods: service.collection_methods,
        requires_legal_documents: service.requires_legal_documents,
        is_active: service.is_active,
      });
    } else {
      setFormData(defaultForm);
    }
  }, [service]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {service ? 'Edit Service' : 'Add New Service'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên dịch vụ</label>
            <input
              type="text"
              required
              value={formData.service_name}
              onChange={e => setFormData({ ...formData, service_name: e.target.value })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại dịch vụ</label>
            <input
              type="text"
              required
              value={formData.service_type}
              onChange={e => setFormData({ ...formData, service_type: e.target.value })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm xét nghiệm</label>
            <input
              type="text"
              required
              value={formData.test_category}
              onChange={e => setFormData({ ...formData, test_category: e.target.value })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              required
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian (ngày)</label>
            <input
              type="number"
              required
              min="1"
              step="1"
              value={formData.duration_days}
              onChange={e => setFormData({ ...formData, duration_days: parseInt(e.target.value, 10) })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức lấy mẫu</label>
            <select
              multiple
              value={formData.collection_methods}
              onChange={e => setFormData({ ...formData, collection_methods: Array.from(e.target.selectedOptions, opt => opt.value) })}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="In-Clinic">In-Clinic</option>
              <option value="Home Kit">Home Kit</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.requires_legal_documents}
              onChange={e => setFormData({ ...formData, requires_legal_documents: e.target.checked })}
              id="requires_legal_documents"
            />
            <label htmlFor="requires_legal_documents" className="text-sm font-medium text-gray-700">Yêu cầu giấy tờ pháp lý</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
              id="is_active"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Đang hoạt động</label>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              {service ? 'Lưu thay đổi' : 'Thêm dịch vụ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
