// Mock data
export const mockServices: Service[] = [
  {
    id: '1',
    service_name: 'Paternity DNA Test',
    service_type: 'Civil',
    test_category: 'Relationship',
    description: 'Determine biological relationship between alleged father and child',
    price: 299.99,
    duration_days: 7,
    collection_methods: ['In-Clinic', 'Home Kit'],
    requires_legal_documents: true,
    is_active: true,
    created_at: '2025-06-01T10:00:00+07:00'
  },
  {
    id: '2',
    service_name: 'Ancestry DNA Test',
    service_type: 'Administrative',
    test_category: 'Ancestry',
    description: 'Discover your ethnic origins and find relatives',
    price: 199.99,
    duration_days: 10,
    collection_methods: ['Home Kit'],
    requires_legal_documents: false,
    is_active: true,
    created_at: '2025-06-01T10:00:00+07:00'
  }
];

// Types
export interface Service {
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

// Mock API service
export const servicesApi = {
  // Get all services
  getAll: async (): Promise<Service[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return [...mockServices]
  },

  // Create new service
  create: async (data: Omit<Service, 'id'>): Promise<Service> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newService = {
      ...data,
      id: Math.random().toString(36).substr(2, 9)
    }
    mockServices.push(newService)
    return newService
  },

  // Update service
  update: async (id: string, data: Partial<Service>): Promise<Service> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const index = mockServices.findIndex(s => s.id === id)
    if (index === -1) throw new Error('Service not found')
    
    const updatedService = {
      ...mockServices[index],
      ...data
    }
    mockServices[index] = updatedService
    return updatedService
  },

  // Delete service
  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const index = mockServices.findIndex(s => s.id === id)
    if (index === -1) throw new Error('Service not found')
    mockServices.splice(index, 1)
  }
}