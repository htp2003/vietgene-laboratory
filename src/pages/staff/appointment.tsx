import React, { useState } from 'react';
import StaffLayout from '../../layouts/StaffLayout/StaffLayout'; // Import layout component
import { FaEdit, FaTrash } from 'react-icons/fa'; // Thêm icon cho actions

interface Appointment {
  id: string;
  customerName: string;
  date: string;
  time: string;
  serviceType: string; // Tên dịch vụ
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  locationType: 'Tại nhà' | 'Cơ sở y tế';
  legalType: 'Pháp Lý' | 'Dân Sự';
}

const appointmentsData: Appointment[] = [
  { id: 'appt-001', customerName: 'Nguyễn Văn A', date: '2025-06-08', time: '10:00', serviceType: 'Huyết thống', status: 'Pending', locationType: 'Tại nhà', legalType: 'Pháp Lý' },
  { id: 'appt-002', customerName: 'Trần Thị B', date: '2025-06-09', time: '14:30', serviceType: 'Sức khỏe', status: 'Confirmed', locationType: 'Cơ sở y tế', legalType: 'Dân Sự' },
  { id: 'appt-003', customerName: 'Lê Văn C', date: '2025-06-10', time: '09:00', serviceType: 'ADN', status: 'Pending', locationType: 'Tại nhà', legalType: 'Dân Sự' },
  { id: 'appt-004', customerName: 'Phạm Thị D', date: '2025-06-11', time: '11:00', serviceType: 'Pháp Y', status: 'Confirmed', locationType: 'Cơ sở y tế', legalType: 'Pháp Lý' },
];

const StaffAppointments: React.FC = () => {
  const [locationFilter, setLocationFilter] = useState<'Tất cả' | 'Tại nhà' | 'Cơ sở y tế'>('Tất cả');
  const [legalFilter, setLegalFilter] = useState<'Tất cả' | 'Pháp Lý' | 'Dân Sự'>('Tất cả');

  const appointments = appointmentsData.filter((a) => {
    return (locationFilter === 'Tất cả' || a.locationType === locationFilter) &&
      (legalFilter === 'Tất cả' || a.legalType === legalFilter);
  });

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Quản Lý Lịch Hẹn</h1>
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Địa điểm:</label>
          <select
            className="border rounded px-2 py-1"
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value as any)}
          >
            <option value="Tất cả">Tất cả</option>
            <option value="Tại nhà">Tại nhà</option>
            <option value="Cơ sở y tế">Cơ sở y tế</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Loại dịch vụ:</label>
          <select
            className="border rounded px-2 py-1"
            value={legalFilter}
            onChange={e => setLegalFilter(e.target.value as any)}
          >
            <option value="Tất cả">Tất cả</option>
            <option value="Pháp Lý">Pháp Lý</option>
            <option value="Dân Sự">Dân Sự</option>
          </select>
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giờ</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dịch vụ</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa điểm</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th scope="col" className="relative px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{appointment.id}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{appointment.customerName}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{appointment.date}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{appointment.time}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{appointment.serviceType}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                    appointment.locationType === 'Tại nhà' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {appointment.locationType}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                    appointment.legalType === 'Pháp Lý' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {appointment.legalType}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    appointment.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800' 
                  }`}>
                    {appointment.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                    <FaEdit className="inline-block mr-1" /> Xác nhận
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                     <FaTrash className="inline-block mr-1" /> Hủy
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default StaffAppointments;