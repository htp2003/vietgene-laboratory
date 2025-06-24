import { useState, useEffect, useCallback } from 'react';
import { ServiceService, ApiService, mapApiServiceToFrontend, Service } from '../services/serviceService';

export interface ServiceStats {
  total: number;
  active: number;
  inactive: number;
  byCategory: { [key: string]: number };
  byType: { [key: string]: number };
}

// Service request interface for create/update - matching new API body
export interface ServiceRequest {
  userId: string;
  serviceId: string;
  service_name: string;
  service_description: string;
  service_category: string;
  service_type: string;
  imageUrl: string;
  test_price: number;
  duration_days: number;
  collection_method: number;
  required_legal_document: boolean;
  is_active: boolean;
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all services
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiServices = await ServiceService.getAllServices();
      console.log('📋 Raw API services:', apiServices);
      
      // Map API services to frontend format
      const mappedServices = apiServices.map(mapApiServiceToFrontend);
      console.log('📋 Mapped services:', mappedServices);
      
      setServices(mappedServices);
    } catch (err: any) {
      console.error('❌ Error fetching services:', err);
      setError(new Error('Có lỗi xảy ra khi tải danh sách dịch vụ'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper function to convert frontend Service to API ServiceRequest format
  const convertToApiFormat = (service: Partial<Service>, userId: string = 'user123'): ServiceRequest => {
    return {
      userId: userId,
      serviceId: service.id || '',
      service_name: service.service_name || '',
      service_description: service.description || '',
      service_category: service.test_category || '',
      service_type: service.service_type || '',
      imageUrl: service.icon || '',
      test_price: service.price || 0,
      duration_days: service.duration_days || 7,
      collection_method: service.collection_methods?.includes('self_collect') ? 1 : 0,
      required_legal_document: service.requires_legal_documents || false,
      is_active: true // Default to active
    };
  };

  // Create new service
  const createService = useCallback(async (serviceData: Partial<Service>) => {
    try {
      setError(null);
      
      // Convert to API format
      const apiData = convertToApiFormat(serviceData);
      console.log('📤 Creating service with data:', apiData);
      
      const result = await ServiceService.createService(apiData);
      
      // Convert result back to frontend format and add to list
      const newService = mapApiServiceToFrontend(result);
      setServices(prev => [newService, ...prev]);
      
      return { success: true, message: 'Tạo dịch vụ thành công' };
    } catch (err: any) {
      console.error('❌ Error creating service:', err);
      setError(new Error('Có lỗi xảy ra khi tạo dịch vụ'));
      return { success: false, message: 'Có lỗi xảy ra khi tạo dịch vụ' };
    }
  }, []);

  // Update service
  const updateService = useCallback(async (serviceId: string, serviceData: Partial<Service>) => {
    try {
      setError(null);
      
      // Convert to API format
      const apiData = convertToApiFormat({ ...serviceData, id: serviceId });
      console.log('📤 Updating service with data:', apiData);
      
      const result = await ServiceService.updateService(serviceId, apiData);
      
      // Convert result back to frontend format and update in list
      const updatedService = mapApiServiceToFrontend(result);
      setServices(prev => 
        prev.map(service => 
          service.id === serviceId ? updatedService : service
        )
      );
      
      return { success: true, message: 'Cập nhật dịch vụ thành công' };
    } catch (err: any) {
      console.error('❌ Error updating service:', err);
      setError(new Error('Có lỗi xảy ra khi cập nhật dịch vụ'));
      return { success: false, message: 'Có lỗi xảy ra khi cập nhật dịch vụ' };
    }
  }, []);

  // Delete service
  const deleteService = useCallback(async (serviceId: string) => {
    try {
      setError(null);
      
      await ServiceService.deleteService(serviceId);
      
      // Remove from list
      setServices(prev => prev.filter(service => service.id !== serviceId));
      
      return { success: true, message: 'Xóa dịch vụ thành công' };
    } catch (err: any) {
      console.error('❌ Error deleting service:', err);
      setError(new Error('Có lỗi xảy ra khi xóa dịch vụ'));
      return { success: false, message: 'Có lỗi xảy ra khi xóa dịch vụ' };
    }
  }, []);

  // Get service by ID
  const getServiceById = useCallback(async (serviceId: string) => {
    try {
      setError(null);
      
      const apiService = await ServiceService.getServiceById(serviceId);
      const service = mapApiServiceToFrontend(apiService);
      
      return { success: true, data: service, message: 'Lấy thông tin dịch vụ thành công' };
    } catch (err: any) {
      console.error('❌ Error getting service by ID:', err);
      setError(new Error('Có lỗi xảy ra khi tải thông tin dịch vụ'));
      return { success: false, message: 'Có lỗi xảy ra khi tải thông tin dịch vụ' };
    }
  }, []);

  // Search services
  const searchServices = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) {
      return services;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return services.filter(service => 
      service.service_name.toLowerCase().includes(lowerSearchTerm) ||
      service.description.toLowerCase().includes(lowerSearchTerm) ||
      service.test_category.toLowerCase().includes(lowerSearchTerm) ||
      service.service_type.toLowerCase().includes(lowerSearchTerm)
    );
  }, [services]);

  // Filter services by category
  const filterServicesByCategory = useCallback((category: string) => {
    if (!category || category === 'all') {
      return services;
    }
    
    return services.filter(service => service.test_category === category);
  }, [services]);

  // Filter services by type
  const filterServicesByType = useCallback((type: string) => {
    if (!type || type === 'all') {
      return services;
    }
    
    return services.filter(service => service.service_type === type);
  }, [services]);

  // Filter services by active status
  const filterServicesByStatus = useCallback((isActive: boolean) => {
    // Since we don't have is_active in the Service interface, we'll assume all are active
    // You might want to add this field to the Service interface if needed
    return services;
  }, [services]);

  // Get service statistics
  const getServiceStats = useCallback((): ServiceStats => {
    const byCategory: { [key: string]: number } = {};
    const byType: { [key: string]: number } = {};
    
    services.forEach(service => {
      // Count by category
      byCategory[service.test_category] = (byCategory[service.test_category] || 0) + 1;
      
      // Count by type
      byType[service.service_type] = (byType[service.service_type] || 0) + 1;
    });
    
    return {
      total: services.length,
      active: services.length, // Assuming all are active since we don't have status field
      inactive: 0,
      byCategory,
      byType
    };
  }, [services]);

  // Get unique categories
  const getCategories = useCallback(() => {
    const categories = new Set(services.map(service => service.test_category));
    return Array.from(categories);
  }, [services]);

  // Get unique types
  const getTypes = useCallback(() => {
    const types = new Set(services.map(service => service.service_type));
    return Array.from(types);
  }, [services]);

  // Load services on component mount
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    // State
    services,
    loading,
    error,
    
    // Actions
    createService,
    updateService,
    deleteService,
    getServiceById,
    refetch: fetchServices,
    
    // Filtering & Search
    searchServices,
    filterServicesByCategory,
    filterServicesByType,
    filterServicesByStatus,
    
    // Utilities
    getServiceStats,
    getCategories,
    getTypes,
  };
};

export default useServices;