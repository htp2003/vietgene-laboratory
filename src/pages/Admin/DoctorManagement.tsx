import React, { useState } from 'react'
import { useDoctor } from '../../hooks/useDoctor'
import { Doctor } from '../../api/doctors.api'
import { FaPlus } from 'react-icons/fa'
import DoctorSearchBar from '../../components/admin/doctor/DoctorSearchBar'
import DoctorList from '../../components/admin/doctor/DoctorList'
import DoctorModal from '../../components/admin/doctor/DoctorModal'
import DoctorTimeSlotManagement from '../../components/admin/doctor/DoctorTimeSlotManagement'
import DoctorCertificateManagement from '../../components/admin/doctor/DoctorCertificateManagement'

export default function DoctorManagement() {
    const {loading, error, doctor, createDoctor, updateDoctor, deleteDoctor, searchDoctors} = useDoctor()

    const [searchTerm, setSearchTerm] = useState('')
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | undefined>(undefined)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const filteredDoctors = searchDoctors(searchTerm)

    // Khi chọn bác sĩ ở DoctorList, sẽ setSelectedDoctor và truyền xuống DoctorTimeSlotManagement

    const handleAddDoctor = () => {
        setSelectedDoctor(undefined)
        setIsModalOpen(true)
    }

    const handleEditDoctor = (doctor: Doctor) => {
        setSelectedDoctor(doctor)
        setIsModalOpen(true)
    }

    const handleDeleteDoctor = async (doctorId: number) => {
        if (window.confirm('Are you sure you want to delete this doctor?')) {
            try {
                await deleteDoctor(doctorId)
            } catch (err) {
                alert('Failed to delete doctor')
            }
        }
    }
  
    const handleSaveDoctor = async (doctorData: Omit<Doctor, "id" | "created_at"> & { user_id: string }) => {
        try {
            if (selectedDoctor) {
                await updateDoctor(selectedDoctor.id, doctorData)
            } else {
                await createDoctor(doctorData)
            }
            setIsModalOpen(false)
            setSelectedDoctor(undefined)
        } catch (err) {
            alert('Failed to save doctor')
        }
    }
  
    return (
    <div className='space-y-6'>
        {/* Header */}
        <div className='flex justify-between items-center'>
            <h1 className='text-2xl font-bold text-gray-800'>Doctor Management</h1>
            <button
                onClick={handleAddDoctor}
                className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2'
            >
                <FaPlus />
                Add Doctor
            </button>
        </div>

        {/* Search Bar */}
        <DoctorSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
        />

        {/* Loading and Error States */}
        {loading && <div className="text-center py-4">Loading...</div>}
        {error && <div className="text-center py-4 text-red-600">{error.message}</div>}

        {/* Doctor List */}
        {!loading && !error && (
            <DoctorList
                doctors={filteredDoctors}
                onEdit={handleEditDoctor}
                onDelete={handleDeleteDoctor}
                onSelect={setSelectedDoctor}
                selectedDoctor={selectedDoctor}
            />
        )}

        {/* Modal */}
        <DoctorModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveDoctor}
            doctor={selectedDoctor}
        />

        {/* Quản lý khung giờ và chứng chỉ bác sĩ */}
        {selectedDoctor && (
          <>
            <DoctorTimeSlotManagement 
              doctorId={selectedDoctor.id} 
              doctorInfo={{
                full_name: selectedDoctor.fullName ?? "",
                phone: selectedDoctor.phone ?? "",
                email: selectedDoctor.email ?? "",
                is_active: selectedDoctor.is_active,
                licensce_number: selectedDoctor.licensce_number
              }}
            />
            <div className="mt-6">
              <DoctorCertificateManagement doctorId={selectedDoctor.id} />
            </div>
          </>
        )}
    </div>
  )
}

