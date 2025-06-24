// import React, { useState } from 'react'
// import { DoctorService, Doctor } from '../../services/doctorService'
// import { FaPlus } from 'react-icons/fa'
// import DoctorSearchBar from '../../components/admin/doctor/DoctorSearchBar'
// import DoctorList from '../../components/admin/doctor/DoctorList'
// import DoctorModal from '../../components/admin/doctor/DoctorModal'
// import DoctorTimeSlotManagement from '../../components/admin/doctor/DoctorTimeSlotManagement'
// import DoctorCertificateManagement from '../../components/admin/doctor/DoctorCertificateManagement'

// export default function DoctorManagement() {
//     const [doctors, setDoctors] = useState<Doctor[]>([]);
//     const [loading, setLoading] = useState<boolean>(false);
//     const [error, setError] = useState<Error | null>(null);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [selectedDoctor, setSelectedDoctor] = useState<Doctor | undefined>(undefined);
//     const [isModalOpen, setIsModalOpen] = useState(false);

//     // Fetch doctors on mount
//     React.useEffect(() => {
//         const fetchDoctors = async () => {
//             setLoading(true);
//             setError(null);
//             try {
//                 const data = await DoctorService.getAllDoctors();
//                 setDoctors(data);
//             } catch (err: any) {
//                 setError(err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchDoctors();
//     }, []);

//     // Tìm kiếm doctor theo doctorCode (hoặc custom theo UI)
//     const filteredDoctors = doctors.filter(d => d.doctorCode.toLowerCase().includes(searchTerm.toLowerCase()));

//     // Khi chọn bác sĩ ở DoctorList, sẽ setSelectedDoctor và truyền xuống DoctorTimeSlotManagement

//     const handleAddDoctor = () => {
//         setSelectedDoctor(undefined)
//         setIsModalOpen(true)
//     }

//     const handleEditDoctor = (doctor: Doctor) => {
//         setSelectedDoctor(doctor)
//         setIsModalOpen(true)
//     }

//     const handleDeleteDoctor = async (doctorId: string) => {
//         if (window.confirm('Are you sure you want to delete this doctor?')) {
//             try {
//                 await DoctorService.deleteDoctor(doctorId);
//                 setDoctors(prev => prev.filter(d => d.doctorId !== doctorId));
//             } catch (err) {
//                 alert('Failed to delete doctor');
//             }
//         }
//     }
  
//     const handleSaveDoctor = async (doctorData: Partial<Doctor>) => {
//         try {
//             if (selectedDoctor && selectedDoctor.doctorId) {
//                 const updated = await DoctorService.updateDoctor(selectedDoctor.doctorId, doctorData);
//                 setDoctors(prev => prev.map(d => d.doctorId === updated.doctorId ? updated : d));
//             } else {
//                 const created = await DoctorService.createDoctor(doctorData);
//                 setDoctors(prev => [...prev, created]);
//             }
//             setIsModalOpen(false);
//             setSelectedDoctor(undefined);
//         } catch (err) {
//             alert('Failed to save doctor');
//         }
//     }
  
//     return (
//     <div className='space-y-6'>
//         {/* Header */}
//         <div className='flex justify-between items-center'>
//             <h1 className='text-2xl font-bold text-gray-800'>Doctor Management</h1>
//             <button
//                 onClick={handleAddDoctor}
//                 className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2'
//             >
//                 <FaPlus />
//                 Add Doctor
//             </button>
//         </div>

//         {/* Search Bar */}
//         <DoctorSearchBar
//             value={searchTerm}
//             onChange={setSearchTerm}
//         />

//         {/* Loading and Error States */}
//         {loading && <div className="text-center py-4">Loading...</div>}
//         {error && <div className="text-center py-4 text-red-600">{error.message}</div>}

//         {/* Doctor List */}
//         {!loading && !error && (
//             <DoctorList
//                 doctors={filteredDoctors}
//                 onEdit={handleEditDoctor}
//                 onDelete={handleDeleteDoctor}
//                 onSelect={setSelectedDoctor}
//                 selectedDoctor={selectedDoctor}
//             />
//         )}

//         {/* Modal */}
//         <DoctorModal
//             isOpen={isModalOpen}
//             onClose={() => setIsModalOpen(false)}
//             onSave={handleSaveDoctor}
//             doctor={selectedDoctor}
//         />

//         {/* Quản lý khung giờ và chứng chỉ bác sĩ */}
//         {selectedDoctor && (
//           <>
//             <DoctorTimeSlotManagement 
//               doctorId={selectedDoctor.id} 
//               doctorInfo={{
//                 full_name: selectedDoctor.fullName ?? "",
//                 phone: selectedDoctor.phone ?? "",
//                 email: selectedDoctor.email ?? "",
//                 is_active: selectedDoctor.is_active,
//                 licensce_number: selectedDoctor.licensce_number
//               }}
//             />
//             <div className="mt-6">
//               <DoctorCertificateManagement doctorId={selectedDoctor.id} />
//             </div>
//           </>
//         )}
//     </div>
//   )
// }

import React from 'react'

export default function DoctorManagement() {
  return (
    <div>DoctorManagement</div>
  )
}

