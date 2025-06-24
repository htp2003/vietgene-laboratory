import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Search, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import AppointmentCard from '../../components/appointment/AppointmentCard';
import AppointmentModal from '../../components/appointment/AppointmentModal';
import TestResultModal from './TestResultModal';
import TestModeWrapper from '../../components/TestModalWrapper';
import StaffAppointmentService, { 
  Appointment as ApiAppointment, 
  MedicalRecordData, 
  NotificationData,
  ApiTask 
} from '../../services/staffAppointmentService';

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
  testResult?: TestResult;
  email?: string;
  serviceName?: string;
  orderId?: string;
  orderDetailId?: string;
  tasks?: ApiTask[];
  rawData?: any;
}

const StaffAppointmentsWithTestMode: React.FC = () => {
  // State management
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [testResultAppointment, setTestResultAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [locationFilter, setLocationFilter] = useState<'Tất cả' | 'Tại nhà' | 'Cơ sở y tế'>('Tất cả');
  const [legalFilter, setLegalFilter] = useState<'Tất cả' | 'Pháp Lý' | 'Dân Sự'>('Tất cả');
  const [statusFilter, setStatusFilter] = useState<'Tất cả' | 'Pending' | 'Confirmed' | 'DeliveringKit' | 'KitDelivered' | 'Completed' | 'Cancelled'>('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // ✅ Handle data loading from TestModeWrapper
  const handleDataLoad = (newAppointments: Appointment[]) => {
    setAppointments(newAppointments);
    setLoading(false);
    setError('');
    
    // Log data quality for debugging
    const dataQuality = {
      total: newAppointments.length,
      withPhone: newAppointments.filter(a => a.phone !== 'N/A').length,
      withEmail: newAppointments.filter(a => a.email !== 'N/A').length,
      withService: newAppointments.filter(a => a.serviceName !== 'N/A').length,
      withTasks: newAppointments.filter(a => a.tasks && a.tasks.length > 0).length,
      statusDistribution: {}
    };
    
    // Count status distribution
    newAppointments.forEach(apt => {
      const status = apt.status;
      dataQuality.statusDistribution[status] = (dataQuality.statusDistribution[status] || 0) + 1;
    });
    
    console.log("📊 Data Quality Report:", dataQuality);
    console.log("📋 Sample appointments:", newAppointments.slice(0, 3));
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Refresh will be handled by TestModeWrapper
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
    } catch (err) {
      console.error("❌ Error refreshing:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Filtered data
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const matchesLocation = locationFilter === 'Tất cả' || a.locationType === locationFilter;
      const matchesLegal = legalFilter === 'Tất cả' || a.legalType === legalFilter;
      const matchesStatus = statusFilter === 'Tất cả' || a.status === statusFilter;
      const matchesSearch = a.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.phone && a.phone.includes(searchTerm)) ||
        (a.email && a.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        a.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesLocation && matchesLegal && matchesStatus && matchesSearch;
    });
  }, [appointments, locationFilter, legalFilter, statusFilter, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [locationFilter, legalFilter, statusFilter, searchTerm, itemsPerPage]);

  // Statistics
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'Pending').length,
    confirmed: appointments.filter(a => a.status === 'Confirmed').length,
    completed: appointments.filter(a => a.status === 'Completed').length,
  };

  // Event handlers (simplified for demo - in test mode, these might not call real APIs)
  const handleConfirm = async (appointment: Appointment) => {
    try {
      console.log("✅ Confirming appointment:", appointment.id);
      
      // Update local state optimistically
      const newStatus = appointment.locationType === 'Tại nhà' ? 'DeliveringKit' : 'Confirmed';
      setAppointments(prev => prev.map(a =>
        a.id === appointment.id ? { ...a, status: newStatus } : a
      ));

      // In real mode, this would call API
      // const success = await StaffAppointmentService.confirmAppointment(appointment.id);

    } catch (error: any) {
      console.error("❌ Error confirming appointment:", error);
      setError('Có lỗi xảy ra khi xác nhận lịch hẹn');
    }
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      console.log("❌ Cancelling appointment:", appointmentId);
      
      // Update local state optimistically
      setAppointments(prev => prev.map(a =>
        a.id === appointmentId ? { ...a, status: 'Cancelled' } : a
      ));

    } catch (error: any) {
      console.error("❌ Error cancelling appointment:", error);
      setError('Có lỗi xảy ra khi hủy lịch hẹn');
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      console.log(`🔄 Updating appointment ${appointmentId}: ${newStatus}`);
      
      const appointment = appointments.find(a => a.id === appointmentId);
      if (!appointment) return;

      // If completing the test, open test result modal
      if (newStatus === 'Completed') {
        setTestResultAppointment(appointment);
        return;
      }

      // Update local state
      setAppointments(prev => prev.map(a => {
        if (a.id === appointmentId) {
          return { ...a, status: newStatus };
        }
        return a;
      }));

    } catch (error: any) {
      console.error("❌ Error updating appointment status:", error);
      setError('Có lỗi xảy ra khi cập nhật trạng thái lịch hẹn');
    }
  };

  const handleSaveTestResult = async (result: TestResult) => {
    try {
      console.log("💾 Saving test result:", result);
      
      if (!testResultAppointment) return;

      // Update local state
      setAppointments(prev => prev.map(a => {
        if (a.id === result.appointmentId) {
          return { ...a, status: 'Completed' };
        }
        return a;
      }));

      setTestResultAppointment(null);
      console.log('✅ Test result saved and appointment completed');

    } catch (error: any) {
      console.error("❌ Error saving test result:", error);
      setError('Có lỗi xảy ra khi lưu kết quả xét nghiệm');
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const closeModal = () => {
    setSelectedAppointment(null);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const AppointmentContent = () => (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quản Lý Lịch Hẹn
              <span className="ml-2 text-sm font-normal text-gray-500">
                (Test Mode Available)
              </span>
            </h1>
            <p className="text-gray-600">
              Theo dõi và quản lý tất cả các lịch hẹn xét nghiệm • 
              <span className="text-blue-600 font-medium"> {appointments.length} appointments loaded</span>
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
            <div className="flex">
              <div className="ml-3">
                <p className="text-red-700 font-medium">{error}</p>
                <button
                  onClick={() => setError('')}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                  placeholder="Tìm kiếm theo tên, SĐT, email hoặc mã lịch hẹn..."
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

        {/* Results Info & Items Per Page */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredAppointments.length)} của {filteredAppointments.length} kết quả
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hiển thị:</span>
            <select
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            >
              <option value={5}>5 mục</option>
              <option value={10}>10 mục</option>
              <option value={20}>20 mục</option>
              <option value={50}>50 mục</option>
            </select>
          </div>
        </div>

        {/* Appointments List */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-hidden">
          <div className="h-full flex flex-col">
            {currentAppointments.length > 0 ? (
              <div className="space-y-4 flex-1 overflow-y-auto">
                {currentAppointments.map((appointment) => (
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
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy lịch hẹn</h3>
                  <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Trước
              </button>
              
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    disabled={typeof page === 'string'}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : typeof page === 'string'
                        ? 'text-gray-400 cursor-default'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-sm text-gray-600">
              Trang {currentPage} / {totalPages}
            </div>
          </div>
        )}

        {/* Modals */}
        <TestResultModal
          appointment={testResultAppointment}
          isOpen={!!testResultAppointment}
          onClose={() => setTestResultAppointment(null)}
          onSaveResult={handleSaveTestResult}
        />

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

  return (
    <TestModeWrapper onDataLoad={handleDataLoad}>
      <AppointmentContent />
    </TestModeWrapper>
  );
};

export default StaffAppointmentsWithTestMode;