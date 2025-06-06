import React from 'react'
import { Doctor } from '../../../api/doctors.api'

interface DoctorListProps {
    doctors: Doctor[]
    onEdit: (doctor: Doctor) => void
    onDelete: (id: number) => void
}

export default function DoctorList({ doctors, onEdit, onDelete }: DoctorListProps) {
  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full bg-white border border-gray-200 rounded-lg'>
        <thead>
          <tr className='bg-gray-100'>
            <th className='px-4 py-2 border-b'>STT</th>
            <th className='px-4 py-2 border-b'>Họ tên</th>
            <th className='px-4 py-2 border-b'>Email</th>
            <th className='px-4 py-2 border-b'>Số điện thoại</th>
            <th className='px-4 py-2 border-b'>Mã bác sĩ</th>
            <th className='px-4 py-2 border-b'>License</th>
            <th className='px-4 py-2 border-b'>Trạng thái</th>
            <th className='px-4 py-2 border-b'>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {doctors.length === 0 ? (
            <tr>
              <td colSpan={8} className='text-center py-4 text-gray-500'>Không có bác sĩ nào.</td>
            </tr>
          ) : (
            doctors.map((doctor, idx) => (
              <tr key={doctor.id} className='hover:bg-gray-50'>
                <td className='px-4 py-2 border-b text-center'>{idx + 1}</td>
                <td className='px-4 py-2 border-b'>{doctor.fullName || '-'}</td>
                <td className='px-4 py-2 border-b'>{doctor.email || '-'}</td>
                <td className='px-4 py-2 border-b'>{doctor.phone || '-'}</td>
                <td className='px-4 py-2 border-b'>{doctor.doctor_code}</td>
                <td className='px-4 py-2 border-b'>{doctor.licensce_number}</td>
                <td className='px-4 py-2 border-b'>
                  {doctor.is_active ? (
                    <span className='text-green-600 font-semibold'>Hoạt động</span>
                  ) : (
                    <span className='text-red-500 font-semibold'>Ngưng</span>
                  )}
                </td>
                <td className='px-4 py-2 border-b flex gap-2 justify-center'>
                  <button
                    className='px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded'
                    onClick={() => onEdit(doctor)}
                  >
                    Sửa
                  </button>
                  <button
                    className='px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded'
                    onClick={() => onDelete(doctor.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

