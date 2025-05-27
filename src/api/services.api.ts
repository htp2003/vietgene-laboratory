// Mock data
const mockServices: Service[] = [
  {
    id: '1',
    name: 'Paternity DNA Test',
    description: 'Determine biological relationship between alleged father and child',
    price: 299.99,
    category: 'Relationship Testing',
    status: 'active'
  },
  {
    id: '2',
    name: 'Ancestry DNA Test',
    description: 'Discover your ethnic origins and find relatives',
    price: 199.99,
    category: 'Ancestry Testing',
    status: 'active'
  }
]

// Types
export interface Service {
  id: string
  name: string
  description: string
  price: number
  category: string
  status: 'active' | 'inactive'
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