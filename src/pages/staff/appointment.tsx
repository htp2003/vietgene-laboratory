import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Search,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import AppointmentCard from "../../components/appointment/AppointmentCard";
import AppointmentModal from "../../components/appointment/AppointmentModal";
import TestResultModal from "./TestResultModal";
import { AppointmentService } from "../../services/staffService/staffAppointmentService";

import { StatusUtils } from "../../utils/status";
import {
  Appointment,
  TestResult,
  ApiTask,
  ApiMedicalRecord,
  ApiNotification,
} from "../../types/appointment";
import { UserService } from "../../services/staffService/userService";

// ✅ Import shared types if you have them

const StaffAppointments: React.FC = () => {
  // State management
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [testResultAppointment, setTestResultAppointment] =
    useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Filters
  const [locationFilter, setLocationFilter] = useState<
    "Tất cả" | "Tại nhà" | "Cơ sở y tế"
  >("Tất cả");
  const [legalFilter, setLegalFilter] = useState<
    "Tất cả" | "Pháp Lý" | "Dân Sự"
  >("Tất cả");
  const [statusFilter, setStatusFilter] = useState<
    | "Tất cả"
    | "Pending"
    | "Confirmed"
    | "DeliveringKit"
    | "KitDelivered"
    | "Completed"
    | "Cancelled"
  >("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");
  const [doctorFilter, setDoctorFilter] = useState<
    "Tất cả" | "Có bác sĩ" | "Chưa có bác sĩ"
  >("Tất cả");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  // ✅ Add these functions
  const loadCurrentUser = async () => {
    try {
      const user = await UserService.getCurrentUserProfile();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");

    // Clear any cached data
    UserService.clearUserCache();
    // Remove all appointment status from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("appointment_status_")) {
        const appointmentId = key.replace("appointment_status_", "");
        StatusUtils.clearAppointmentStatus(appointmentId);
      }
    });

    // Redirect to login page
    window.location.href = "/login";
  };

  // ✅ Updated service calls using new AppointmentService
  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("📅 Loading appointments with simplified doctor info...");

      // ✅ Using new AppointmentService
      const serviceAppointments = await AppointmentService.getAllAppointments();

      setAppointments(serviceAppointments);
      console.log("✅ Loaded appointments:", serviceAppointments.length);

      // ✅ Updated to use new doctorInfo structure
      const withDoctors = serviceAppointments.filter((a) => a.doctorInfo);
      const facilityBased = serviceAppointments.filter(
        (a) => a.locationType === "Cơ sở y tế"
      );
      console.log(
        `👨‍⚕️ Doctor assignment status: ${withDoctors.length}/${facilityBased.length} facility appointments have doctors`
      );

      const restoredCount = serviceAppointments.filter(
        (a) => a.currentStep && a.currentStep > 1
      ).length;
      if (restoredCount > 0) {
        console.log(
          `🔄 Successfully restored status for ${restoredCount} appointments`
        );
      }
    } catch (err: any) {
      console.error("❌ Error loading appointments:", err);
      setError(err.message || "Có lỗi xảy ra khi tải danh sách lịch hẹn");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadAppointments();
    } catch (err) {
      console.error("❌ Error refreshing:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // ✅ Updated filter logic for new doctorInfo structure
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const matchesLocation =
        locationFilter === "Tất cả" || a.locationType === locationFilter;
      const matchesLegal =
        legalFilter === "Tất cả" || a.legalType === legalFilter;
      const matchesStatus =
        statusFilter === "Tất cả" || a.status === statusFilter;
      const matchesDoctor =
        doctorFilter === "Tất cả" ||
        (doctorFilter === "Có bác sĩ" && a.doctorInfo) ||
        (doctorFilter === "Chưa có bác sĩ" && !a.doctorInfo);

      const matchesSearch =
        a.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.phone && a.phone.includes(searchTerm)) ||
        (a.email && a.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.doctorInfo?.name &&
          a.doctorInfo.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        a.id.toLowerCase().includes(searchTerm.toLowerCase());

      return (
        matchesLocation &&
        matchesLegal &&
        matchesStatus &&
        matchesDoctor &&
        matchesSearch
      );
    });
  }, [
    appointments,
    locationFilter,
    legalFilter,
    statusFilter,
    doctorFilter,
    searchTerm,
  ]);

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    locationFilter,
    legalFilter,
    statusFilter,
    doctorFilter,
    searchTerm,
    itemsPerPage,
  ]);

  // ✅ Updated stats calculation for new doctorInfo structure
  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "Pending").length,
    confirmed: appointments.filter((a) => a.status === "Confirmed").length,
    completed: appointments.filter((a) => a.status === "Completed").length,
    withDoctors: appointments.filter((a) => a.doctorInfo).length,
    facilityBased: appointments.filter((a) => a.locationType === "Cơ sở y tế")
      .length,
  };

  // ✅ Updated service method calls
  const handleConfirm = async (appointment: Appointment) => {
    try {
      console.log("✅ Confirming appointment:", appointment.id);

      const success = await AppointmentService.confirmAppointment(
        appointment.id
      );

      if (success) {
        const newStatus =
          appointment.locationType === "Tại nhà"
            ? "DeliveringKit"
            : "Confirmed";
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === appointment.id
              ? {
                  ...a,
                  status: newStatus,
                  currentStep: StatusUtils.getStepFromStatus(newStatus),
                  lastStatusUpdate: new Date().toISOString(),
                }
              : a
          )
        );

        // ✅ Note: You'll need to implement notification service if needed
        // await NotificationService.sendNotification(userId, notificationData);
      } else {
        setError("Không thể xác nhận lịch hẹn");
      }
    } catch (error: any) {
      console.error("❌ Error confirming appointment:", error);
      setError("Có lỗi xảy ra khi xác nhận lịch hẹn");
    }
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      console.log("❌ Cancelling appointment:", appointmentId);

      const appointment = appointments.find((a) => a.id === appointmentId);
      if (!appointment) return;

      const success = await AppointmentService.cancelAppointment(
        appointmentId,
        "Cancelled by staff"
      );

      if (success) {
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === appointmentId
              ? {
                  ...a,
                  status: "Cancelled",
                  currentStep: 0,
                  lastStatusUpdate: new Date().toISOString(),
                }
              : a
          )
        );

        // ✅ Note: You'll need to implement notification service if needed
        // await NotificationService.sendNotification(userId, notificationData);
      } else {
        setError("Không thể hủy lịch hẹn");
      }
    } catch (error: any) {
      console.error("❌ Error cancelling appointment:", error);
      setError("Có lỗi xảy ra khi hủy lịch hẹn");
    }
  };

  // ✅ Updated with new service structure
  const updateAppointmentStatus = async (
    appointmentId: string,
    newStatus: Appointment["status"]
  ) => {
    try {
      console.log(`🔄 Updating appointment ${appointmentId}: ${newStatus}`);

      const appointment = appointments.find((a) => a.id === appointmentId);
      if (!appointment) return;

      if (newStatus === "Completed") {
        setTestResultAppointment(appointment);
        return;
      }

      // ✅ Use StatusUtils directly for persistence
      StatusUtils.saveAppointmentStatus(
        appointmentId,
        newStatus,
        StatusUtils.getStepFromStatus(newStatus)
      );

      // ✅ You may need to implement task update service separately
      // if (appointment.tasks && appointment.tasks.length > 0) {
      //   // Handle task updates...
      // }

      setAppointments((prev) =>
        prev.map((a) => {
          if (a.id === appointmentId) {
            const newStep = StatusUtils.getStepFromStatus(newStatus);
            return {
              ...a,
              status: newStatus,
              currentStep: newStep,
              completedSteps: StatusUtils.getCompletedSteps(newStep),
              lastStatusUpdate: new Date().toISOString(),
            };
          }
          return a;
        })
      );

      // ✅ Note: You'll need to implement notification service if needed
      // if (['SampleReceived', 'Testing'].includes(newStatus)) {
      //   await NotificationService.sendNotification(userId, notificationData);
      // }
    } catch (error: any) {
      console.error("❌ Error updating appointment status:", error);
      setError("Có lỗi xảy ra khi cập nhật trạng thái lịch hẹn");
    }
  };

  // ✅ Note: You'll need to implement these services separately
  const handleSaveTestResult = async (result: TestResult) => {
    try {
      console.log("💾 Saving test result:", result);

      if (!testResultAppointment) return;

      // ✅ You'll need to implement medical record and notification services
      // const medicalData: MedicalRecordData = {
      //   record_code: Date.now(),
      //   medical_history: result.resultDetails,
      //   allergies: '',
      //   medications: '',
      //   health_conditions: result.conclusion,
      //   emergency_contact_phone: testResultAppointment.phone || '',
      //   emergency_contact_name: testResultAppointment.customerName
      // };

      // For now, just update the appointment status
      setAppointments((prev) =>
        prev.map((a) => {
          if (a.id === result.appointmentId) {
            StatusUtils.saveAppointmentStatus(a.id, "Completed", 6);
            return {
              ...a,
              status: "Completed",
              currentStep: 6,
              completedSteps: StatusUtils.getCompletedSteps(6),
              lastStatusUpdate: new Date().toISOString(),
            };
          }
          return a;
        })
      );

      setTestResultAppointment(null);
      console.log("✅ Test result saved and appointment completed");
    } catch (error: any) {
      console.error("❌ Error saving test result:", error);
      setError("Có lỗi xảy ra khi lưu kết quả xét nghiệm");
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const closeModal = () => {
    setSelectedAppointment(null);
  };

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
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách lịch hẹn...</p>
          <p className="mt-2 text-sm text-gray-500">
            Đang tải thông tin bác sĩ và khôi phục trạng thái...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-w-screen bg-gray-50 flex flex-col ">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quản Lý Lịch Hẹn
            </h1>
            <p className="text-gray-600">
              Theo dõi và quản lý tất cả các lịch hẹn xét nghiệm
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Bao gồm thông tin bác sĩ phụ trách và trạng thái được tự động lưu
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Đang tải..." : "Làm mới"}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {currentUser?.full_name || currentUser?.username || "Staff"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {currentUser?.roles?.[0]?.name || "Staff"}
                  </p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    showUserMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {currentUser?.full_name ||
                            currentUser?.username ||
                            "Staff"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {currentUser?.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          {currentUser?.roles?.[0]?.name || "Staff"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Add profile management logic here if needed
                        console.log("Profile clicked");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Thông tin cá nhân</span>
                    </button>
                  </div>

                  <div className="p-2 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
            <div className="flex">
              <div className="ml-3">
                <p className="text-red-700 font-medium">{error}</p>
                <button
                  onClick={() => setError("")}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Stats Cards with doctor info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng số</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
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
                <p className="text-2xl font-bold text-amber-600">
                  {stats.pending}
                </p>
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
                <p className="text-2xl font-bold text-blue-600">
                  {stats.confirmed}
                </p>
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
                <p className="text-2xl font-bold text-green-600">
                  {stats.completed}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters with doctor filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, SĐT, email, bác sĩ hoặc mã lịch hẹn..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value as any)}
              >
                <option value="Tất cả">Tất cả địa điểm</option>
                <option value="Tại nhà">Tại nhà</option>
                <option value="Cơ sở y tế">Cơ sở y tế</option>
              </select>

              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={legalFilter}
                onChange={(e) => setLegalFilter(e.target.value as any)}
              >
                <option value="Tất cả">Tất cả loại</option>
                <option value="Pháp Lý">Pháp Lý</option>
                <option value="Dân Sự">Dân Sự</option>
              </select>

              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
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
            Hiển thị {startIndex + 1} -{" "}
            {Math.min(endIndex, filteredAppointments.length)} của{" "}
            {filteredAppointments.length} kết quả
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

        {/* Appointments List - Fixed Height Container */}
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Không tìm thấy lịch hẹn
                  </h3>
                  <p className="text-gray-500">
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                  </p>
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
                    onClick={() =>
                      typeof page === "number" && handlePageChange(page)
                    }
                    disabled={typeof page === "string"}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      page === currentPage
                        ? "bg-blue-600 text-white"
                        : typeof page === "string"
                        ? "text-gray-400 cursor-default"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
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
