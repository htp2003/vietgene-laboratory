import React, { useState } from 'react';
import { Calendar, Search, CheckCircle, AlertCircle } from 'lucide-react';
import AppointmentCard from '../../components/appointment/AppointmentCard';
import AppointmentModal from '../../components/appointment/AppointmentModal';
import TestResultModal from './TestResultModal';

interface TestResult {
  id: string;
  appointmentId: string;
  resultType: 'Positive' | 'Negative' | 'Inconclusive';
  resultPercentage?: number;
  conclusion: string;
  resultDetails: string;
  resultFile?: File;
  testedDate: string;
  verifiedByStaffId: string;
}
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
  testResult?: TestResult; // Add test result to appointment
}


// Sample data
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
    notes: 'Khách yêu cầu gọi trước 30 phút'
  },
  {
    id: 'appt-002',
    customerName: 'Trần Thị B',
    phone: '0987654321',
    date: '2025-06-09',
    time: '14:30',
    serviceType: 'Sức khỏe tổng quát',
    status: 'Pending',
    locationType: 'Cơ sở y tế',
    legalType: 'Dân Sự',
    doctor: 'Bác sĩ Nguyễn Văn B'
  },
  {
    id: 'appt-003',
    customerName: 'Lê Văn C',
    phone: '0912345678',
    date: '2025-06-10',
    time: '09:00',
    serviceType: 'ADN Cha con',
    status: 'SampleReceived',
    locationType: 'Cơ sở y tế',
    legalType: 'Dân Sự',
    doctor: 'Bác sĩ Trần Văn C'
  },
  {
    id: 'appt-004',
    customerName: 'Phạm Thị D',
    phone: '0923456789',
    date: '2025-06-11',
    time: '11:00',
    serviceType: 'Pháp Y',
    status: 'Testing',
    locationType: 'Cơ sở y tế',
    legalType: 'Pháp Lý',
    doctor: 'Bác sĩ Lê Thị C'
  },
  {
    id: 'appt-005',
    customerName: 'Hoàng Văn E',
    phone: '0934567890',
    date: '2025-06-12',
    time: '15:30',
    serviceType: 'ADN Anh em',
    status: 'DeliveringKit',
    locationType: 'Tại nhà',
    legalType: 'Dân Sự',
    address: '789 Đường DEF, Quận 7, TP.HCM'
  },
  {
    id: 'appt-006',
    customerName: 'Đỗ Thị F',
    phone: '0945678901',
    date: '2025-06-13',
    time: '08:00',
    serviceType: 'ADN Cha con',
    status: 'Completed',
    locationType: 'Tại nhà',
    legalType: 'Dân Sự'
  }
];

const StaffAppointments: React.FC = () => {
  // State management
  const [appointments, setAppointments] = useState<Appointment[]>(appointmentsData);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [testResultAppointment, setTestResultAppointment] = useState<Appointment | null>(null);
  
  // Filters
  const [locationFilter, setLocationFilter] = useState<'Tất cả' | 'Tại nhà' | 'Cơ sở y tế'>('Tất cả');
  const [legalFilter, setLegalFilter] = useState<'Tất cả' | 'Pháp Lý' | 'Dân Sự'>('Tất cả');
  const [statusFilter, setStatusFilter] = useState<'Tất cả' | 'Pending' | 'Confirmed' | 'DeliveringKit' | 'KitDelivered' | 'Completed' | 'Cancelled'>('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered data
  const filteredAppointments = appointments.filter((a) => {
    const matchesLocation = locationFilter === 'Tất cả' || a.locationType === locationFilter;
    const matchesLegal = legalFilter === 'Tất cả' || a.legalType === legalFilter;
    const matchesStatus = statusFilter === 'Tất cả' || a.status === statusFilter;
    const matchesSearch = a.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.phone.includes(searchTerm) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesLocation && matchesLegal && matchesStatus && matchesSearch;
  });

  // Statistics
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'Pending').length,
    confirmed: appointments.filter(a => a.status === 'Confirmed').length,
    completed: appointments.filter(a => a.status === 'Completed').length,
  };

  // Event handlers
  const handleConfirm = (appointment: Appointment) => {
    const newStatus = appointment.locationType === 'Tại nhà' ? 'DeliveringKit' : 'Confirmed';
    setAppointments(prev => prev.map(a =>
      a.id === appointment.id ? { ...a, status: newStatus } : a
    ));
  };

  const handleCancel = (appointmentId: string) => {
    setAppointments(prev => prev.map(a =>
      a.id === appointmentId ? { ...a, status: 'Cancelled' } : a
    ));
  };

  const updateAppointmentStatus = (appointmentId: string, newStatus: Appointment['status']) => {
    setAppointments(prev => prev.map(a => {
      if (a.id === appointmentId) {
        console.log(`Cập nhật ${appointmentId}: ${a.status} → ${newStatus}`);
        
        // If completing the test, open test result modal
        if (newStatus === 'Completed') {
          const appointment = prev.find(ap => ap.id === appointmentId);
          if (appointment && !appointment.testResult) {
            setTestResultAppointment(appointment);
            return a; // Don't update status yet, wait for test result
          }
        }
        
        return { ...a, status: newStatus };
      }
      return a;
    }));
  };

  const handleSaveTestResult = (result: TestResult) => {
    setAppointments(prev => prev.map(a => {
      if (a.id === result.appointmentId) {
        return { ...a, status: 'Completed', testResult: result };
      }
      return a;
    }));
    
    setTestResultAppointment(null);
    console.log('Đã lưu kết quả xét nghiệm:', result);
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const closeModal = () => {
    setSelectedAppointment(null);
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

            {/* Filter Dropdowns */}
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

        {/* Appointments List */}
        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onViewDetails={handleViewDetails}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              onUpdateStatus={updateAppointmentStatus}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy lịch hẹn</h3>
            <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}

        {/* Test Result Modal */}
        <TestResultModal
          appointment={testResultAppointment}
          isOpen={!!testResultAppointment}
          onClose={() => setTestResultAppointment(null)}
          onSaveResult={handleSaveTestResult}
        />

        {/* Detail Modal */}
        <AppointmentModal
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={closeModal}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onUpdateStatus={updateAppointmentStatus}
        />
      </div>
    </div>
  );
};

export default StaffAppointments;