import React, { useState } from 'react';
import { FaPlus, FaChartBar, FaList, FaThLarge } from 'react-icons/fa';
import { useServices } from '../../hooks/useServices';
import ServiceModal from '../../components/admin/service/ServiceModal';
import ServiceList from '../../components/admin/service/ServiceList';
import ServiceSearchBar from '../../components/admin/service/ServiceSearchBar';
import { Service } from '../../services/serviceService';

export default function ServicesManagement() {
  const {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
    searchServices,
    getServiceStats,
    getCategories,
    getTypes,
  } = useServices();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Get filtered services
  const getFilteredServices = () => {
    let filtered = searchServices(searchTerm);
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(service => service.test_category === categoryFilter);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(service => service.service_type === typeFilter);
    }
    
    return filtered;
  };

  const filteredServices = getFilteredServices();
  const stats = getServiceStats();
  const categories = getCategories();
  const types = getTypes();

  const handleAddService = () => {
    setEditingService(undefined);
    setIsModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa dịch vụ này?')) {
      try {
        const result = await deleteService(serviceId);
        if (result.success) {
          alert(result.message);
        } else {
          alert(result.message);
        }
      } catch (err) {
        alert('Có lỗi xảy ra khi xóa dịch vụ');
      }
    }
  };

  const handleSaveService = async (serviceData: Partial<Service>) => {
    setSubmitting(true);
    
    try {
      let result;
      
      if (editingService) {
        result = await updateService(editingService.id, serviceData);
      } else {
        result = await createService({
          ...serviceData,
          id: Date.now().toString(), // Temporary ID, will be replaced by API
        });
      }
      
      if (result.success) {
        alert(result.message);
        setIsModalOpen(false);
        setEditingService(undefined);
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi lưu dịch vụ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Dịch vụ</h1>
          <p className="text-gray-600 mt-1">Quản lý các dịch vụ xét nghiệm DNA</p>
        </div>
        <button
          onClick={handleAddService}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus />
          Thêm Dịch vụ
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaChartBar size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng số dịch vụ</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaList size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Danh mục</p>
              <p className="text-2xl font-semibold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FaThLarge size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Loại dịch vụ</p>
              <p className="text-2xl font-semibold text-gray-900">{types.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FaChartBar size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <ServiceSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div className="lg:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="lg:w-48">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả loại</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
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
            <p className="text-gray-600">Đang tải danh sách dịch vụ...</p>
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

      {/* Service List */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Danh sách dịch vụ ({filteredServices.length})
            </h2>
          </div>
          
          <ServiceList
            services={filteredServices}
            onEdit={handleEditService}
            onDelete={handleDeleteService}
          />
          
          {/* Empty State */}
          {filteredServices.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FaChartBar size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Không có dịch vụ phù hợp' 
                  : 'Chưa có dịch vụ nào'
                }
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all'
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                  : 'Thêm dịch vụ đầu tiên để bắt đầu quản lý.'
                }
              </p>
              {!searchTerm && categoryFilter === 'all' && typeFilter === 'all' && (
                <button
                  onClick={handleAddService}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Thêm dịch vụ đầu tiên
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => {
          if (!submitting) {
            setIsModalOpen(false);
            setEditingService(undefined);
          }
        }}
        onSave={handleSaveService}
        service={editingService}
        submitting={submitting}
      />
    </div>
  );
}