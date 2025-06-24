// import React, { useEffect, useState } from 'react';
// import { Doctor } from '../../../services/doctorService';
// import { User, mockUsers } from '../../../api/users.api';

// interface DoctorModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: (data: Omit<Doctor, 'id' | 'created_at'> & { user_id: string }) => void | Promise<void>;
//   doctor?: Doctor;
// }

// export default function DoctorModal({ isOpen, onClose, onSave, doctor }: DoctorModalProps) {
//   // Find the user linked to this doctor (if any)
//   const linkedUser = doctor ? mockUsers.find(u => u.doctor_id === doctor.doctorId) : undefined;
//   // List users who can be linked (role staff/admin, not already linked)
//   const availableUsers = mockUsers.filter(
//     u => (u.role === 'staff' || u.role === 'admin') && (u.doctor_id == null || (doctor && u.doctor_id === doctor.doctorId))
//   );

//   const [formData, setFormData] = useState<{
//     user_id: string;
//     doctor_code: string;
//     licensce_number: string;
//     is_active: boolean;
//   }>({
//     user_id: linkedUser?.id || '',
//     doctor_code: doctor?.doctorCode || '',
//     licensce_number: doctor?.licensce_number || '',
//     is_active: doctor?.isActive ?? true,
//   });

//   useEffect(() => {
//     setFormData({
//       user_id: linkedUser?.id || '',
//       doctor_code: doctor?.doctorCode || '',
//       licensce_number: doctor?.licensce_number || '',
//       is_active: doctor?.isActive ?? true,
//     });
//   }, [doctor]);

//   // Get selected user info
//   const selectedUser = mockUsers.find(u => u.id === formData.user_id);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value, type } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox'
//         ? (e.target as HTMLInputElement).checked
//         : value
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.user_id || !formData.doctor_code || !formData.licensce_number) {
//       alert('Vui lòng điền đầy đủ thông tin!');
//       return;
//     }
//     onSave(formData);
//   };

//   if (!isOpen) return null;

//   return (
//     <div className='fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40'>
//       <div className='bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative'>
//         <h2 className='text-xl font-bold mb-4'>{doctor ? 'Chỉnh sửa bác sĩ' : 'Thêm bác sĩ mới'}</h2>
//         <form onSubmit={handleSubmit} className='space-y-4'>
//           <div>
//             <label className='block text-sm font-medium text-gray-700 mb-1'>Chọn nhân viên</label>
//             <select
//               name='user_id'
//               value={formData.user_id}
//               onChange={handleChange}
//               required
//               className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none'
//               disabled={!!doctor}
//             >
//               <option value=''>-- Chọn nhân viên --</option>
//               {availableUsers.map(u => (
//                 <option key={u.id} value={u.id}>
//                   {u.fullName} ({u.email})
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className='block text-sm font-medium text-gray-700 mb-1'>Full Name</label>
//             <input
//               type='text'
//               value={selectedUser?.fullName || ''}
//               readOnly
//               className='w-full p-2 border rounded bg-gray-100'/>
//           </div>

//           <div>
//             <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
//             <input
//               type='email'
//               value={selectedUser?.email || ''}
//               readOnly
//               className='w-full p-2 border rounded bg-gray-100'/>
//           </div>

//           <div>
//             <label className='block text-sm font-medium text-gray-700 mb-1'>Phone</label>
//             <input
//               type='text'
//               value={selectedUser?.phone || ''}
//               readOnly
//               className='w-full p-2 border rounded bg-gray-100'/>
//           </div>

//           <div>
//             <label className='block text-sm font-medium text-gray-700 mb-1'>Doctor Code</label>
//             <input
//               type='text'
//               name='doctor_code'
//               value={formData.doctor_code}
//               onChange={handleChange}
//               required
//               className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none'/>
//           </div>

//           <div>
//             <label className='block text-sm font-medium text-gray-700 mb-1'>License Number</label>
//             <input
//               type='text'
//               name='licensce_number'
//               value={formData.licensce_number}
//               onChange={handleChange}
//               required
//               className='w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none'/>
//           </div>

//           <div className='flex items-center gap-2'>
//             <input
//               type='checkbox'
//               name='is_active'
//               checked={formData.is_active}
//               onChange={handleChange}
//               className='h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500'/>
//             <label className='text-sm font-medium text-gray-700'>Active</label>
//           </div>

//           <div className='flex justify-end gap-3 mt-6'>
//             <button
//               type='button'
//               onClick={onClose}
//               className='px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200'>
//               Cancel
//             </button>
//             <button
//               type='submit'
//               className='px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600'>
//               {doctor ? 'Save Changes' : 'Add Doctor'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }