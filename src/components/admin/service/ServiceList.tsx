import React from 'react';
import { FaEdit, FaTrash, FaFlask, FaClock, FaMoneyBillWave } from 'react-icons/fa';
import { Service, formatPrice } from '../../../services/serviceService';

interface ServiceListProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
}

const ServiceList: React.FC<ServiceListProps> = ({ services, onEdit, onDelete }) => {
  const getCollectionMethodText = (methods: string) => {
    if (!methods) return 'Tự lấy mẫu';
    
    if (methods.includes('self_collect') && methods.includes('facility_collect')) {
      return 'Cả hai';
    } else if (methods.includes('self_collect')) {
      return 'Tự lấy mẫu';
    } else {
      return 'Lấy mẫu tại cơ sở';
    }
  };

  const getServiceTypeDisplayText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'civil': 'Dân sự',
      'administrative': 'Pháp lý',
      'legal': 'Pháp lý',
      'Dân sự': 'Dân sự',
      'Pháp lý': 'Pháp lý',
    };
    
    return typeMap[type] || type;
};

const getCategoryDisplayText = (category: string) => {
  const categoryMap: { [key: string]: string } = {
    'Cơ bản': 'Cơ bản',
    'Cha con': 'Cha con',
    'Mẹ con': 'Mẹ con',
    'Anh chị em': 'Anh chị em',
    'Huyết thống': 'Huyết thống',
    'Dân sự': 'Dân sự',
    'Pháp lý': 'Pháp lý',
  };
  
  return categoryMap[category] || category;
};

  const getCategoryBadge = (category: string) => {
    const badges: { [key: string]: string } = {
      'Cơ bản': 'bg-blue-100 text-blue-800',
      'Cha con': 'bg-green-100 text-green-800',
      'Mẹ con': 'bg-pink-100 text-pink-800',
      'Anh chị em': 'bg-purple-100 text-purple-800',
      'Huyết thống': 'bg-yellow-100 text-yellow-800',
    };
    
    return badges[category] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type: string) => {
    const badges: { [key: string]: string } = {
      'Dân sự': 'bg-red-100 text-red-800',
      'Pháp lý': 'bg-orange-100 text-orange-800',
    };
    
    return badges[type] || 'bg-gray-100 text-gray-800';
  };

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <FaFlask className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-700 mb-2">Không có dịch vụ nào</h3>
        <p className="text-gray-500">Danh sách dịch vụ trống hoặc không có dịch vụ phù hợp với bộ lọc.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dịch vụ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Loại & Danh mục
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Giá & Thời gian
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phương thức lấy mẫu
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Giấy tờ pháp lý
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {services.map((service) => (
            <tr key={service.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FaFlask className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {service.service_name}
                    </div>
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {service.description}
                    </div>
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(service.service_type)}`}>
                    {getServiceTypeDisplayText(service.service_type)}
                  </span>
                  <br />
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadge(service.test_category)}`}>
                  {getCategoryDisplayText(service.test_category)}
                  </span>
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-900">
                    <FaMoneyBillWave className="h-4 w-4 text-green-500 mr-1" />
                    <span className="font-semibold text-green-600">
                      {formatPrice(service.price)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaClock className="h-4 w-4 text-blue-500 mr-1" />
                    <span>{service.duration_days} ngày</span>
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {getCollectionMethodText(service.collection_methods)}
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  service.requires_legal_documents 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {service.requires_legal_documents ? 'Yêu cầu' : 'Không yêu cầu'}
                </span>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={() => onEdit(service)}
                    className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-full hover:bg-blue-50"
                    title="Chỉnh sửa dịch vụ"
                  >
                    <FaEdit size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(service.id)}
                    className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-full hover:bg-red-50"
                    title="Xóa dịch vụ"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Mobile View */}
      <div className="lg:hidden">
        <div className="grid gap-4 p-4">
          {services.map((service) => (
            <div key={service.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{service.service_name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => onEdit(service)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                  >
                    <FaEdit size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(service.id)}
                    className="text-red-600 hover:text-red-900 p-1"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Loại:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(service.service_type)}`}>
                    {service.service_type}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Danh mục:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadge(service.test_category)}`}>
                    {service.test_category}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Giá:</span>
                  <span className="font-semibold text-green-600">
                    {formatPrice(service.price)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Thời gian:</span>
                  <span className="text-sm text-gray-900">{service.duration_days} ngày</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Lấy mẫu:</span>
                  <span className="text-sm text-gray-900">
                    {getCollectionMethodText(service.collection_methods)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Giấy tờ:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    service.requires_legal_documents 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {service.requires_legal_documents ? 'Yêu cầu' : 'Không yêu cầu'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceList;