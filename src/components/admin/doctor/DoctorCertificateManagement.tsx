// import React, { useState } from 'react';
// import { useDoctorCertificates } from '../../../hooks/useDoctorCertificates';
// import { Doctor } from '../../../services/doctorService';
// import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

// interface Props {
//   doctor: Doctor;
// }

// export default function DoctorCertificateManagement({ doctor }: Props) {
//   const {
//     certificates,
//     loading,
//     error,
//     addCertificate,
//     updateCertificate,
//     deleteCertificate,
//   } = useDoctorCertificates(doctor.doctorId);

//   const [showModal, setShowModal] = useState(false);
//   const [editing, setEditing] = useState<DoctorCertificate | null>(null);
//   const [form, setForm] = useState<Omit<DoctorCertificate, 'id' | 'created_at'>>({
//     doctorId: doctor.doctorId,
//     doctorCode: doctor.doctorCode,
//     certificate_name: '',
//     issue_date: '',
//     expiry_date: '',
//     isActive: true,
//     issued_by: '',
//   });

//   const handleOpenAdd = () => {
//     setEditing(null);
//     setForm({
//       doctorId: doctor.doctorId,
//       doctorCode: doctor.doctorCode,
//       certificate_name: '',
//       issue_date: '',
//       expiry_date: '',
//       isActive: true,
//       issued_by: '',
//     });
//     setShowModal(true);
//   };
//   const handleOpenEdit = (cert: DoctorCertificate) => {
//     setEditing(cert);
//     setForm({ ...cert });
//     setShowModal(true);
//   };
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const target = e.target as HTMLInputElement | HTMLSelectElement;
//     const { name, value, type } = target;
//     setForm((prev) => ({
//       ...prev,
//       [name]: type === 'checkbox' ? (target as HTMLInputElement).checked : value,
//     }));
//   };
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (editing) {
//       await updateCertificate({ ...editing, ...form });
//     } else {
//       await addCertificate(form);
//     }
//     setShowModal(false);
//   };

//   return (
//     <div className="bg-white rounded-xl shadow p-6 mt-6">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-lg font-semibold text-gray-700">Chứng chỉ hành nghề</h2>
//         <button
//           className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-2"
//           onClick={handleOpenAdd}
//         >
//           <FaPlus /> Thêm chứng chỉ
//         </button>
//       </div>
//       {loading && <div className="text-blue-600">Đang tải...</div>}
//       {error && <div className="text-red-600">{error}</div>}
//       <div className="overflow-x-auto">
//         <table className="min-w-full border text-sm">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-3 py-2 border">Tên chứng chỉ</th>
//               <th className="px-3 py-2 border">Số hiệu</th>
//               <th className="px-3 py-2 border">Ngày cấp</th>
//               <th className="px-3 py-2 border">Ngày hết hạn</th>
//               <th className="px-3 py-2 border">Nơi cấp</th>
//               <th className="px-3 py-2 border">Trạng thái</th>
//               <th className="px-3 py-2 border">Thao tác</th>
//             </tr>
//           </thead>
//           <tbody>
//             {certificates.map((cert) => (
//               <tr key={cert.id} className="hover:bg-gray-100">
//                 <td className="px-3 py-2 border">{cert.certificate_name}</td>
//                 <td className="px-3 py-2 border">{cert.doctorCode}</td>
//                 <td className="px-3 py-2 border">{cert.issue_date}</td>
//                 <td className="px-3 py-2 border">{cert.expiry_date}</td>
//                 <td className="px-3 py-2 border">{cert.issued_by}</td>
//                 <td className="px-3 py-2 border">
//                   {cert.isActive ? (
//                     <span className="text-green-600 font-semibold">Còn hiệu lực</span>
//                   ) : (
//                     <span className="text-red-500 font-semibold">Hết hạn</span>
//                   )}
//                 </td>
//                 <td className="px-3 py-2 border flex gap-2">
//                   <button
//                     className="p-1 text-blue-500 hover:text-blue-700"
//                     onClick={() => handleOpenEdit(cert)}
//                   >
//                     <FaEdit />
//                   </button>
//                   <button
//                     className="p-1 text-red-500 hover:text-red-700"
//                     onClick={() => deleteCertificate(cert.id)}
//                   >
//                     <FaTrash />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//             {certificates.length === 0 && (
//               <tr>
//                 <td colSpan={7} className="text-center py-4 text-gray-400">Chưa có chứng chỉ nào</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Modal thêm/sửa chứng chỉ */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
//           <form
//             className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg space-y-4 relative"
//             onSubmit={handleSubmit}
//           >
//             <button
//               type="button"
//               className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
//               onClick={() => setShowModal(false)}
//             >
//               ×
//             </button>
//             <h3 className="text-lg font-bold mb-2">{editing ? 'Cập nhật chứng chỉ' : 'Thêm chứng chỉ'}</h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium">Tên chứng chỉ</label>
//                 <input
//                   type="text"
//                   name="certificate_name"
//                   value={form.certificate_name}
//                   onChange={handleChange}
//                   className="w-full border px-3 py-2 rounded mt-1"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium">Số hiệu</label>
//                 <input
//                   type="text"
//                   name="doctorCode"
//                   value={form.doctorCode}
//                   onChange={handleChange}
//                   className="w-full border px-3 py-2 rounded mt-1"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium">Ngày cấp</label>
//                 <input
//                   type="date"
//                   name="issue_date"
//                   value={form.issue_date}
//                   onChange={handleChange}
//                   className="w-full border px-3 py-2 rounded mt-1"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium">Ngày hết hạn</label>
//                 <input
//                   type="date"
//                   name="expiry_date"
//                   value={form.expiry_date}
//                   onChange={handleChange}
//                   className="w-full border px-3 py-2 rounded mt-1"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium">Nơi cấp</label>
//                 <input
//                   type="text"
//                   name="issued_by"
//                   value={form.issued_by}
//                   onChange={handleChange}
//                   className="w-full border px-3 py-2 rounded mt-1"
//                   required
//                 />
//               </div>
//               <div className="flex items-center gap-2 mt-6">
//                 <input
//                   type="checkbox"
//                   name="isActive"
//                   checked={form.isActive}
//                   onChange={handleChange}
//                   className="h-4 w-4"
//                 />
//                 <label className="text-sm">Còn hiệu lực</label>
//               </div>
//             </div>
//             <div className="flex justify-end gap-2 mt-4">
//               <button
//                 type="button"
//                 className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
//                 onClick={() => setShowModal(false)}
//               >
//                 Hủy
//               </button>
//               <button
//                 type="submit"
//                 className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
//               >
//                 {editing ? 'Cập nhật' : 'Thêm mới'}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// }
