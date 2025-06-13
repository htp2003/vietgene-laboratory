import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Phone, Filter, Search, CheckCircle, XCircle, Eye, AlertCircle } from 'lucide-react';

interface Appointment {
  id: string;
  customerName: string;
  phone: string;
  date: string;
  time: string;
  serviceType: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'DeliveringKit' | 'KitDelivered' | 'SampleReceived' | 'Testing';
  locationType: 'Tại nhà' | 'Cơ sở y tế';
  legalType: 'Pháp Lý' | 'Dân Sự';
  address?: string;
  notes?: string;
  doctor?: string;
}

const appointmentsData: Appointment[] = [
  {
    id: 'appt-001',
    customerName: 'Nguyễn Văn A',
    phone: '0901234567',
    date: '2025-06-08',
    time: '10:00',
    serviceType: 'Huyết thống',
    status: 'Pending',
    locationType: 'Tại nhà',
    legalType: 'Pháp Lý',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    notes: 'Khách yêu cầu gọi trước 30 phút',
    doctor: 'Bác sĩ Nguyễn Văn A'
  },
  {
    id: 'appt-002',
    customerName: 'Trần Thị B',
    phone: '0987654321',
    date: '2025-06-09',
    time: '14:30',
    serviceType: 'Sức khỏe tổng quát',
    status: 'Confirmed',
    locationType: 'Cơ sở y tế',
    legalType: 'Dân Sự'
  },
  {
    id: 'appt-003',
    customerName: 'Lê Văn C',
    phone: '0912345678',
    date: '2025-06-10',
    time: '09:00',
    serviceType: 'ADN Cha con',
    status: 'DeliveringKit',
    locationType: 'Tại nhà',
    legalType: 'Dân Sự',
    address: '456 Đường XYZ, Quận 3, TP.HCM'
  },
  {
    id: 'appt-004',
    customerName: 'Phạm Thị D',
    phone: '0923456789',
    date: '2025-06-11',
    time: '11:00',
    serviceType: 'Pháp Y',
    status: 'KitDelivered',
    locationType: 'Cơ sở y tế',
    legalType: 'Pháp Lý'
  },
  {
    id: 'appt-005',
    customerName: 'Hoàng Văn E',
    phone: '0934567890',
    date: '2025-06-12',
    time: '15:30',
    serviceType: 'ADN Anh em',
    status: 'Completed',
    locationType: 'Tại nhà',
    legalType: 'Dân Sự'
  },
];

const StaffAppointments: React.FC = () => {
  const navigate = useNavigate();
  const [locationFilter, setLocationFilter] = useState<'Tất cả' | 'Tại nhà' | 'Cơ sở y tế'>('Tất cả');
  const [legalFilter, setLegalFilter] = useState<'Tất cả' | 'Pháp Lý' | 'Dân Sự'>('Tất cả');
  const [statusFilter, setStatusFilter] = useState<'Tất cả' | 'Pending' | 'Confirmed' | 'DeliveringKit' | 'KitDelivered' | 'Completed' | 'Cancelled'>('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>(appointmentsData);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const filteredAppointments = appointments.filter((a) => {
    const matchesLocation = locationFilter === 'Tất cả' || a.locationType === locationFilter;
    const matchesLegal = legalFilter === 'Tất cả' || a.legalType === legalFilter;
    const matchesStatus = statusFilter === 'Tất cả' || a.status === statusFilter;
    const matchesSearch = a.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.phone.includes(searchTerm) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesLocation && matchesLegal && matchesStatus && matchesSearch;
  });

  const getStatusConfig = (status: string) => {
    const configs = {
      'Pending': { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: AlertCircle, text: 'Chờ xử lý' },
      'Confirmed': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle, text: 'Đã xác nhận' },
      'DeliveringKit': { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Clock, text: 'Đang giao kit' },
      'KitDelivered': { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: CheckCircle, text: 'Đã giao kit' },
      'SampleReceived': { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Clock, text: 'Đã nhận mẫu' },
      'Testing': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, text: 'Đang xét nghiệm' },
      'Completed': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, text: 'Hoàn thành' },
      'Cancelled': { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, text: 'Đã hủy' },
    };
    return configs[status] || configs['Pending'];
  };

  const handleConfirm = (appointment: Appointment) => {
    if (appointment.locationType === 'Tại nhà') {
      setAppointments(prev => prev.map(a =>
        a.id === appointment.id ? { ...a, status: 'DeliveringKit' } : a
      ));
      // navigate(`/staff/test-requests/${appointment.id}`);
    } else {
      setAppointments(prev => prev.map(a =>
        a.id === appointment.id ? { ...a, status: 'Confirmed' } : a
      ));
    }
  };

  const handleCancel = (appointmentId: string) => {
    setAppointments(prev => prev.map(a =>
      a.id === appointmentId ? { ...a, status: 'Cancelled' } : a
    ));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'Pending').length,
    confirmed: appointments.filter(a => a.status === 'Confirmed').length,
    completed: appointments.filter(a => a.status === 'Completed').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản Lý Lịch Hẹn</h1>
          <p className="text-gray-600">Theo dõi và quản lý tất cả các lịch hẹn xét nghiệm</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng số</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã xác nhận</p>
                <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, SĐT hoặc mã lịch hẹn..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value as any)}
              >
                <option value="Tất cả">Tất cả địa điểm</option>
                <option value="Tại nhà">Tại nhà</option>
                <option value="Cơ sở y tế">Cơ sở y tế</option>
              </select>

              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={legalFilter}
                onChange={e => setLegalFilter(e.target.value as any)}
              >
                <option value="Tất cả">Tất cả loại</option>
                <option value="Pháp Lý">Pháp Lý</option>
                <option value="Dân Sự">Dân Sự</option>
              </select>

              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
              >
                <option value="Tất cả">Tất cả trạng thái</option>
                <option value="Pending">Chờ xử lý</option>
                <option value="Confirmed">Đã xác nhận</option>
                <option value="DeliveringKit">Đang giao kit</option>
                <option value="KitDelivered">Đã giao kit</option>
                <option value="SampleReceived">Đã nhận mẫu</option>
                <option value="Testing">Đang xét nghiệm</option>
                <option value="Completed">Hoàn thành</option>
                <option value="Cancelled">Đã hủy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointments Grid */}
        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => {
            const statusConfig = getStatusConfig(appointment.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div key={appointment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {appointment.customerName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{appointment.customerName}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {appointment.phone}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full border ${statusConfig.color} flex items-center gap-1`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">{statusConfig.text}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{formatDate(appointment.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{appointment.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{appointment.locationType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          <span className="text-sm">{appointment.serviceType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          <span className="text-sm">{appointment.doctor}</span>
                        </div>
                      </div>

                      {appointment.address && (
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Địa chỉ:</strong> {appointment.address}
                        </div>
                      )}

                      {appointment.notes && (
                        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-4">
                          <strong>Ghi chú:</strong> {appointment.notes}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${appointment.legalType === 'Pháp Lý'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                          }`}>
                          {appointment.legalType}
                        </span>
                        <span className="text-xs text-gray-500">ID: {appointment.id}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => setSelectedAppointment(appointment)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Chi tiết
                      </button>

                      {appointment.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleConfirm(appointment)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Xác nhận
                          </button>
                          <button
                            onClick={() => handleCancel(appointment.id)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            Hủy
                          </button>
                        </>
                      )}

                      {appointment.status === 'DeliveringKit' && appointment.locationType === 'Tại nhà' && (
                        <button
                          onClick={() => navigate(`/staff/test-requests/${appointment.id}`)}
                          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Clock className="w-4 h-4" />
                          Quản lý kit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy lịch hẹn</h3>
            <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}

        {/* Detail Modal */}
        {selectedAppointment && (
          <div
            className="fixed inset-0 flex items-center justify-center p-4 z-50 pt-8 overflow-y-auto"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => setSelectedAppointment(null)} // Click outside to close
          >
            <div
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Chi tiết lịch hẹn</h2>
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Mã lịch hẹn</label>
                      <p className="text-gray-900">{selectedAppointment.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusConfig(selectedAppointment.status).color}`}>
                          {getStatusConfig(selectedAppointment.status).text}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Khách hàng</label>
                      <p className="text-gray-900">{selectedAppointment.customerName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                      <p className="text-gray-900">{selectedAppointment.phone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Ngày hẹn</label>
                      <p className="text-gray-900">{formatDate(selectedAppointment.date)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Giờ hẹn</label>
                      <p className="text-gray-900">{selectedAppointment.time}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Loại xét nghiệm</label>
                      <p className="text-gray-900">{selectedAppointment.serviceType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Địa điểm</label>
                      <p className="text-gray-900">{selectedAppointment.locationType}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Loại dịch vụ</label>
                    <p className="text-gray-900">{selectedAppointment.legalType}</p>
                  </div>

                  {selectedAppointment.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                      <p className="text-gray-900">{selectedAppointment.address}</p>
                    </div>
                  )}

                  {selectedAppointment.notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Ghi chú</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedAppointment.notes}</p>
                    </div>
                  )}

                  {selectedAppointment.doctor && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Bác sĩ phụ trách</label>
                      <p className="text-gray-900">{selectedAppointment.doctor}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6 pt-6 border-t">
                  {selectedAppointment.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleConfirm(selectedAppointment);
                          setSelectedAppointment(null);
                        }}
                        className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Xác nhận
                      </button>
                      <button
                        onClick={() => {
                          handleCancel(selectedAppointment.id);
                          setSelectedAppointment(null);
                        }}
                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Hủy lịch hẹn
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffAppointments;