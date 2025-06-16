import React, { useState } from 'react';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { TimeSlot } from '../../../api/doctorTimeSlot.api';
import { useDoctorTimeSlots } from '../../../hooks/useDoctorTimeSlots';



const dayOptions = [
  'Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'
];



type DoctorTimeSlotManagementProps = {
  doctorId: number;
  doctorInfo?: {
    full_name: string;
    phone?: string;
    email?: string;
    is_active?: boolean;
    licensce_number?: string;
  }
};

export default function DoctorTimeSlotManagement({ doctorId, doctorInfo }: DoctorTimeSlotManagementProps) {

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [form, setForm] = useState({
    day_of_week: '',
    start_time: '',
    end_time: '',
    is_available: true
  });

  const handleOpenModal = (slot: TimeSlot | null = null) => {
    if (slot) {
      setForm({
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_available: slot.is_available
      });
      setEditingSlot(slot);
    } else {
      setForm({ day_of_week: '', start_time: '', end_time: '', is_available: true });
      setEditingSlot(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingSlot(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const { slots, loading, error, addSlot, updateSlot, deleteSlot, toggleAvailable } = useDoctorTimeSlots(doctorId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.day_of_week || !form.start_time || !form.end_time) return;
    if (editingSlot) {
      await updateSlot({ ...editingSlot, ...form });
    } else {
      await addSlot(form);
    }
    handleCloseModal();
  };


  const handleDelete = async (slotId: number) => {
    await deleteSlot(slotId);
  };


  const handleToggleAvailable = async (slotId: number) => {
    await toggleAvailable(slotId);
  };



  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Thông tin bác sĩ */}
      {doctorInfo && (
        <div className="mb-4 p-4 bg-white rounded shadow flex flex-col md:flex-row md:items-center gap-2">
          <div className="font-bold text-lg text-blue-800">{doctorInfo.full_name}</div>
          {doctorInfo.phone && <div className="text-gray-600 ml-0 md:ml-6">{doctorInfo.phone}</div>}
          {doctorInfo.email && <div className="text-gray-600 ml-0 md:ml-6">{doctorInfo.licensce_number}</div>}
          {doctorInfo.is_active !== undefined && (
            <div className={`ml-0 md:ml-6 px-2 py-1 rounded text-xs ${doctorInfo.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{doctorInfo.is_active ? 'Đang hoạt động' : 'Ngưng hoạt động'}</div>
          )}
        </div>
      )}

      {/* Bảng time slot */}
      <div className="bg-white rounded shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg text-blue-700">Danh sách khung giờ làm việc</h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => handleOpenModal(null)}
          >
            + Thêm khung giờ
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Thứ</th>
                <th className="px-4 py-2 border">Bắt đầu</th>
                <th className="px-4 py-2 border">Kết thúc</th>
                <th className="px-4 py-2 border">Trạng thái</th>
                <th className="px-4 py-2 border">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {slots.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-4 text-gray-400">Chưa có khung giờ</td></tr>
              ) : (
                slots.map(slot => (
                  <tr key={slot.id} className="hover:bg-blue-50">
                    <td className="px-4 py-2 border">{slot.day_of_week}</td>
                    <td className="px-4 py-2 border">{slot.start_time}</td>
                    <td className="px-4 py-2 border">{slot.end_time}</td>
                    <td className="px-4 py-2 border">
                      <button onClick={() => handleToggleAvailable(slot.id)} title="Chuyển trạng thái">
                        {slot.is_available ? <FaToggleOn className="text-green-500" size={22}/> : <FaToggleOff className="text-gray-400" size={22}/>}
                      </button>
                    </td>
                    <td className="px-4 py-2 border">
                      <button className="text-blue-600 hover:text-blue-900 mr-2" onClick={() => handleOpenModal(slot)} title="Sửa"><FaEdit /></button>
                      <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(slot.id)} title="Xóa"><FaTrash /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal thêm/sửa */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={handleCloseModal}>&times;</button>
            <h3 className="font-semibold text-lg mb-4">{editingSlot ? 'Sửa khung giờ' : 'Thêm khung giờ'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Thứ</label>
                <select
                  name="day_of_week"
                  className="border rounded px-3 py-2 w-full"
                  value={form.day_of_week}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Chọn thứ</option>
                  {dayOptions.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1 font-medium">Bắt đầu</label>
                  <input
                    type="time"
                    name="start_time"
                    className="border rounded px-3 py-2 w-full"
                    value={form.start_time}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-medium">Kết thúc</label>
                  <input
                    type="time"
                    name="end_time"
                    className="border rounded px-3 py-2 w-full"
                    value={form.end_time}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={form.is_available}
                  onChange={handleFormChange}
                  id="is_available"
                />
                <label htmlFor="is_available" className="font-medium">Khả dụng</label>
              </div>
              <div className="text-right">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >{editingSlot ? 'Lưu' : 'Thêm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
