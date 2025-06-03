import React, { useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import ServiceModal from '../../components/admin/ServiceModal'
import ServiceList from '../../components/admin/ServiceList'
import ServiceSearchBar from '../../components/admin/ServiceSearchBar'
import { useServices } from '../../hooks/useServices'
import { Service } from '../../api/services.api'


export default function ServicesManagement() {
  const {
    loading,
    error,
    createService,
    updateService,
    deleteService,
    searchServices
  } = useServices()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedService, setSelectedService] = useState<Service | undefined>(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredServices = searchServices(searchTerm)

  const handleAddService = () => {
    setSelectedService(undefined)
    setIsModalOpen(true)
  }

  const handleEditService = (service: Service) => {
    setSelectedService(service)
    setIsModalOpen(true)
  }

  const handleDeleteService = async (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteService(serviceId)
      } catch (err) {
        alert('Failed to delete service')
      }
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-gray-800'>Services Management</h1>
        <button
          onClick={handleAddService}
          className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2'
        >
          <FaPlus />
          Add Service
        </button>
      </div>

      {/* Search Bar */}
      <ServiceSearchBar
        value={searchTerm}
        onChange={setSearchTerm}
      />

      {/* Loading and Error States */}
      {loading && <div className="text-center py-4">Loading...</div>}
      {error && <div className="text-center py-4 text-red-600">{error.message}</div>}

      {/* Services Table */}
      {!loading && !error && (
        <ServiceList
          services={filteredServices}
          onEdit={handleEditService}
          onDelete={handleDeleteService}
        />
      )}

      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (serviceData) => {
          try {
            if (selectedService) {
              await updateService(selectedService.id, serviceData)
            } else {
              await createService(serviceData)
            }
            setIsModalOpen(false)
            setSelectedService(undefined)
          } catch (err) {
            alert('Failed to save service')
          }
        }}
        service={selectedService}
      />
    </div>
  )
}
