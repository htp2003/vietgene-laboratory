// import React from 'react'
// import { Doctor } from '../../../services/doctorService'
// import { FaEdit, FaTrash } from 'react-icons/fa'

// interface DoctorListProps {
//     doctors: Doctor[]
//     onEdit: (doctor: Doctor) => void
//     onDelete: (id: number) => void
//     onSelect: (doctor: Doctor) => void
//     selectedDoctor?: Doctor | null
// }

// export default function DoctorList({ doctors, onEdit, onDelete, onSelect, selectedDoctor }: DoctorListProps) {
//   return (
//     <div className='overflow-x-auto'>
//       <table className='min-w-full bg-white'>
//         <thead>
//           <tr>
//             <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>STT</th>
//             <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Full Name</th>
//             <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Email</th>
//             <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Phone</th>
//             <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Doctor Code</th>
//             <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>License Number</th>
//             <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
//             <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {doctors.length === 0 ? (
//             <tr>
//               <td colSpan={8} className='text-center py-4 text-gray-500'>Không có bác sĩ nào.</td>
//             </tr>
//           ) : (
//             doctors.map((doctor, idx) => (
//               <tr key={doctor.doctorId}
//                   className={`cursor-pointer hover:bg-blue-50 ${selectedDoctor?.id === doctor.doctorId ? 'bg-blue-100' : ''}`}
//                   onClick={e => {
//                     // Nếu click vào nút Edit/Delete thì không gọi onSelect
//                     if ((e.target as HTMLElement).closest('button')) return;
//                     onSelect(doctor);
//                   }}
//               >
//                 <td className='px-6 py-3 text-center'>{idx + 1}</td>
//                 <td className='px-6 py-3'>{doctor.doctorCode || '-'}</td>
//                 <td className='px-6 py-3'>{doctor.email || '-'}</td>
//                 <td className='px-6 py-3'>{doctor.phone || '-'}</td>
//                 <td className='px-6 py-3'>{doctor.doctor_code}</td>
//                 <td className='px-6 py-3'>{doctor.doctorCode}</td>
//                 <td className='px-6 py-3'>
//                   {doctor.isActive ? (
//                     <span className='text-green-600 font-semibold'>Hoạt động</span>
//                   ) : (
//                     <span className='text-red-500 font-semibold'>Ngưng</span>
//                   )}
//                 </td>
//                 <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
//                   <div className="flex items-center gap-3">
//                     <button
//                       className='text-blue-600 hover:text-blue-900'
//                       onClick={() => onEdit(doctor)}
//                     >
//                     <FaEdit size={18} />
//                   </button>
//                   <button
//                     className='text-red-600 hover:text-red-900'
//                     onClick={() => onDelete(doctor.doctorId)}
//                   >
//                     <FaTrash size={18} />
//                   </button>
//                   </div>
//                   </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   )
// }

