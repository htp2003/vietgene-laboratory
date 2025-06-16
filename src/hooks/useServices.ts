import { useState, useCallback, useEffect } from 'react'
import { Service, servicesApi } from '../api/services.api'

export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Fetch all services
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true)
      const data = await servicesApi.getAll()
      setServices(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load services on mount
  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  // Create new service
  const createService = useCallback(async (data: Omit<Service, 'id'>) => {
    try {
      setLoading(true)
      const newService = await servicesApi.create(data)
      setServices(prev => [...prev, newService])
      return newService
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update service
  const updateService = useCallback(async (id: string, data: Partial<Service>) => {
    try {
      setLoading(true)
      const updated = await servicesApi.update(id, data)
      setServices(prev => prev.map(s => s.id === id ? updated : s))
      return updated
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete service
  const deleteService = useCallback(async (id: string) => {
    try {
      setLoading(true)
      await servicesApi.delete(id)
      setServices(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Search services
  const searchServices = useCallback((searchTerm: string) => {
    const lower = searchTerm.toLowerCase();
    return services.filter(service =>
      (service.service_name && service.service_name.toLowerCase().includes(lower)) ||
      (service.service_type && service.service_type.toLowerCase().includes(lower)) ||
      (service.test_category && service.test_category.toLowerCase().includes(lower)) ||
      (service.description && service.description.toLowerCase().includes(lower))
    );
  }, [services])

  return {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
    searchServices
  }
}
