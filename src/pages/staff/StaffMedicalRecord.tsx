import React, { useState, useEffect } from "react";
import {
  FileText,
  Heart,
  Pill,
  AlertTriangle,
  Phone,
  User,
  Edit3,
  Save,
  X,
  Loader,
  Search,
  Eye,
  Plus,
  Activity,
  Shield,
  Users,
} from "lucide-react";

// ✅ Import MedicalRecordService và types từ cấu trúc mới
import { MedicalRecordService } from "../../services/staffService/medical-recordService";
import { UserService } from "../../services/staffService/userService";
import {
  ApiMedicalRecord,
  MedicalRecordRequest,
  ApiUser,
} from "../../types/appointment";

const StaffMedicalRecordPage: React.FC = () => {
  // ✅ State management
  const [allRecords, setAllRecords] = useState<ApiMedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ApiMedicalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ApiMedicalRecord | null>(null);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [customerUsers, setCustomerUsers] = useState<ApiUser[]>([]); // ✅ Thêm state riêng cho customer users
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // ✅ Form data cho chỉnh sửa/tạo mới medical record
  const [formData, setFormData] = useState<MedicalRecordRequest>({
    record_code: Date.now(),
    medical_history: "",
    allergies: "",
    medications: "",
    health_conditions: "",
    emergency_contact_phone: "",
    emergency_contact_name: "",
  });

  // ✅ Load data khi component mount
  useEffect(() => {
    loadAllData();
  }, []);

  // ✅ Filter customer users when users data changes
  useEffect(() => {
    filterCustomerUsers();
  }, [users]);

  // ✅ Filter records when search term or user filter changes
  useEffect(() => {
    filterRecords();
  }, [searchTerm, userFilter, allRecords]);

  // ✅ Filter chỉ lấy users có role ROLE_USER
  const filterCustomerUsers = () => {
    const customers = users.filter((user) => 
      user.roles?.some(role => role.name === "ROLE_USER")
    );
    setCustomerUsers(customers);
    console.log("🎯 Filtered customer users:", customers.length, "customers");
  };

  // ✅ Load tất cả data cần thiết
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🏥 Loading all medical records and users...");

      // Load tất cả medical records và users
      const [medicalRecords, allUsers] = await Promise.all([
        MedicalRecordService.getAllMedicalRecords(),
        UserService.getAllUsers(),
      ]);

      setAllRecords(medicalRecords);
      setUsers(allUsers);

      // Auto-select first record if available
      if (medicalRecords.length > 0) {
        setSelectedRecord(medicalRecords[0]);
      }

      console.log(
        "✅ Loaded:",
        medicalRecords.length,
        "records and",
        allUsers.length,
        "total users"
      );
    } catch (err: any) {
      console.error("❌ Error loading data:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filter records based on search and user filter
  const filterRecords = () => {
    let filtered = allRecords;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.health_conditions
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.medical_history
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.record_code.toString().includes(searchTerm) ||
          record.allergies.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.medications.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by user (chỉ filter trong danh sách customer users)
    if (userFilter) {
      filtered = filtered.filter((record) => record.userId === userFilter);
    }

    setFilteredRecords(filtered);
  };

  // ✅ Get user info by userId (chỉ lấy customer users)
  const getUserInfo = (userId: string): ApiUser | undefined => {
    return customerUsers.find((user) => user.id === userId);
  };

  // ✅ Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Handle edit record
  const handleEditRecord = (record: ApiMedicalRecord) => {
    setSelectedRecord(record);
    setFormData({
      record_code: record.record_code,
      medical_history: record.medical_history,
      allergies: record.allergies,
      medications: record.medications,
      health_conditions: record.health_conditions,
      emergency_contact_phone: record.emergency_contact_phone,
      emergency_contact_name: record.emergency_contact_name,
    });
    setEditMode(true);
    setCreateMode(false);
  };

  // ✅ Handle create new record
  const handleCreateRecord = () => {
    setFormData({
      record_code: Date.now(),
      medical_history: "",
      allergies: "",
      medications: "",
      health_conditions: "",
      emergency_contact_phone: "",
      emergency_contact_name: "",
    });
    setSelectedUserId("");
    setCreateMode(true);
    setEditMode(false);
    setSelectedRecord(null);
  };

  // ✅ Save medical record (PUT)
  const handleSaveRecord = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!selectedRecord) {
        setError("Không tìm thấy hồ sơ để cập nhật");
        return;
      }

      console.log("💾 Updating medical record...", formData);

      // ✅ Gọi API để cập nhật medical record
      const updatedRecord = await MedicalRecordService.updateMedicalRecord(
        selectedRecord.id,
        formData
      );

      if (updatedRecord) {
        // Update records list
        setAllRecords((prev) =>
          prev.map((record) =>
            record.id === selectedRecord.id ? updatedRecord : record
          )
        );

        setSelectedRecord(updatedRecord);
        setEditMode(false);
        setSuccess("Cập nhật hồ sơ y tế thành công!");

        console.log("✅ Medical record updated successfully");

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Không thể cập nhật hồ sơ y tế");
      }
    } catch (err: any) {
      console.error("❌ Error updating medical record:", err);
      setError("Có lỗi xảy ra khi cập nhật hồ sơ y tế");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Create new medical record (POST)
  const handleCreateNewRecord = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!selectedUserId) {
        setError("Vui lòng chọn khách hàng để tạo hồ sơ y tế");
        return;
      }

      console.log(
        "🆕 Creating new medical record for user...",
        selectedUserId,
        formData
      );

      // ✅ Gọi API để tạo medical record cho user cụ thể
      const newRecord = await MedicalRecordService.createMedicalRecordForUser(
        selectedUserId,
        {
          record_code: formData.record_code,
          medical_history: formData.medical_history,
          allergies: formData.allergies,
          medications: formData.medications,
          health_conditions: formData.health_conditions,
          emergency_contact_phone: formData.emergency_contact_phone,
          emergency_contact_name: formData.emergency_contact_name,
        }
      );

      if (newRecord) {
        // Add to records list
        setAllRecords((prev) => [newRecord, ...prev]);
        setSelectedRecord(newRecord);
        setCreateMode(false);
        setSelectedUserId("");
        setSuccess("Tạo hồ sơ y tế mới thành công!");

        console.log("✅ Medical record created successfully");

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Không thể tạo hồ sơ y tế mới");
      }
    } catch (err: any) {
      console.error("❌ Error creating medical record:", err);
      setError("Có lỗi xảy ra khi tạo hồ sơ y tế");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Cancel edit/create
  const handleCancel = () => {
    setEditMode(false);
    setCreateMode(false);
    setError("");

    if (selectedRecord) {
      setFormData({
        record_code: selectedRecord.record_code,
        medical_history: selectedRecord.medical_history,
        allergies: selectedRecord.allergies,
        medications: selectedRecord.medications,
        health_conditions: selectedRecord.health_conditions,
        emergency_contact_phone: selectedRecord.emergency_contact_phone,
        emergency_contact_name: selectedRecord.emergency_contact_name,
      });
    }
  };

  // ✅ Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  // ✅ Check if record needs attention
  const needsAttention = (record: ApiMedicalRecord) => {
    return MedicalRecordService.needsAttention(record);
  };

  // ✅ Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Đang tải dữ liệu hồ sơ y tế...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Quản Lý Hồ Sơ Y Tế
          </h1>
          <p className="text-gray-600 mt-2">
            Quản lý và theo dõi hồ sơ y tế của tất cả khách hàng
          </p>
        </div>

        {!editMode && !createMode && (
          <button
            onClick={handleCreateRecord}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Tạo hồ sơ mới
          </button>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
          <div className="flex">
            <div className="ml-3">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
          <div className="flex">
            <div className="ml-3">
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng hồ sơ</p>
              <p className="text-2xl font-bold text-gray-900">
                {allRecords.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cần chú ý</p>
              <p className="text-2xl font-bold text-amber-600">
                {allRecords.filter(needsAttention).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Khách hàng</p>
              <p className="text-2xl font-bold text-green-600">
                {customerUsers.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hiển thị</p>
              <p className="text-2xl font-bold text-purple-600">
                {filteredRecords.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Records List */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            {/* Filters */}
            <div className="p-4 border-b border-gray-200 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm hồ sơ..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* User Filter - Chỉ hiển thị customer users */}
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả khách hàng</option>
                {customerUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.username} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Records List */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Danh sách hồ sơ ({filteredRecords.length})
              </h3>

              {filteredRecords.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm || userFilter
                      ? "Không tìm thấy hồ sơ phù hợp"
                      : "Chưa có hồ sơ y tế nào"}
                  </p>
                  {!searchTerm && !userFilter && (
                    <button
                      onClick={handleCreateRecord}
                      className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Tạo hồ sơ đầu tiên
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredRecords.map((record) => {
                    const userInfo = getUserInfo(record.userId);
                    return (
                      <div
                        key={record.id}
                        onClick={() => setSelectedRecord(record)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedRecord?.id === record.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-900">
                                #{record.record_code}
                              </p>
                              {needsAttention(record) && (
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                              )}
                            </div>
                            <p className="text-sm text-blue-600 mb-1">
                              {userInfo?.full_name ||
                                userInfo?.username ||
                                "Unknown User"}
                            </p>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {record.health_conditions ||
                                "Không có tình trạng đặc biệt"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(record.updatedAt)}
                            </p>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditRecord(record);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Record Details */}
        <div className="lg:col-span-2">
          {editMode || createMode ? (
            /* Edit/Create Form */
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Edit3 size={20} className="text-blue-600" />
                {createMode ? "Tạo hồ sơ y tế mới" : "Chỉnh sửa hồ sơ y tế"}
              </h2>

              <div className="space-y-6">
                {/* Record Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã hồ sơ
                  </label>
                  <input
                    type="number"
                    name="record_code"
                    value={formData.record_code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mã hồ sơ"
                    disabled={!createMode}
                  />
                </div>
                
                {/* Customer Selection - Chỉ hiển thị customer users */}
                {createMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn khách hàng *
                    </label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">-- Chọn khách hàng --</option>
                      {customerUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name || user.username} - {user.email}
                        </option>
                      ))}
                    </select>
                    {!selectedUserId && (
                      <p className="text-sm text-red-600 mt-1">
                        Vui lòng chọn khách hàng để tạo hồ sơ y tế
                      </p>
                    )}
                    
                    {/* ✅ Hiển thị số lượng customer users */}
                    <p className="text-sm text-gray-500 mt-1">
                      Có {customerUsers.length} khách hàng có thể chọn
                    </p>
                  </div>
                )}

                {/* Medical History */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Activity size={16} />
                    Tiền sử bệnh án
                  </label>
                  <textarea
                    name="medical_history"
                    value={formData.medical_history}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Mô tả tiền sử bệnh án, các bệnh đã mắc..."
                  />
                </div>

                {/* Allergies */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <AlertTriangle size={16} />
                    Dị ứng
                  </label>
                  <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Các loại dị ứng (thực phẩm, thuốc, môi trường...)..."
                  />
                </div>

                {/* Medications */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Pill size={16} />
                    Thuốc đang sử dụng
                  </label>
                  <textarea
                    name="medications"
                    value={formData.medications}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Danh sách thuốc đang sử dụng, liều lượng..."
                  />
                </div>

                {/* Health Conditions */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Heart size={16} />
                    Tình trạng sức khỏe
                  </label>
                  <textarea
                    name="health_conditions"
                    value={formData.health_conditions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Tình trạng sức khỏe hiện tại, các vấn đề cần lưu ý..."
                  />
                </div>

                {/* Emergency Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <User size={16} />
                      Người liên hệ khẩn cấp
                    </label>
                    <input
                      type="text"
                      name="emergency_contact_name"
                      value={formData.emergency_contact_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tên người liên hệ"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} />
                      Số điện thoại khẩn cấp
                    </label>
                    <input
                      type="tel"
                      name="emergency_contact_phone"
                      value={formData.emergency_contact_phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Số điện thoại"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={
                    createMode ? handleCreateNewRecord : handleSaveRecord
                  }
                  disabled={saving || (createMode && !selectedUserId)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors shadow-sm ${
                    saving || (createMode && !selectedUserId)
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {saving ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {saving
                    ? "Đang lưu..."
                    : createMode
                    ? "Tạo hồ sơ"
                    : "Lưu thay đổi"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <X size={18} />
                  Hủy bỏ
                </button>
              </div>
            </div>
          ) : selectedRecord ? (
            /* Record Details View */
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Eye size={20} className="text-green-600" />
                    Chi tiết hồ sơ y tế
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Khách hàng:{" "}
                    {getUserInfo(selectedRecord.userId)?.full_name ||
                      getUserInfo(selectedRecord.userId)?.username ||
                      "Unknown User"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {needsAttention(selectedRecord) && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                      <AlertTriangle size={16} />
                      Cần chú ý
                    </div>
                  )}

                  <button
                    onClick={() => handleEditRecord(selectedRecord)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 size={16} />
                    Chỉnh sửa
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Record Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Mã hồ sơ
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      #{selectedRecord.record_code}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Cập nhật lần cuối
                    </label>
                    <p className="text-gray-900">
                      {formatDate(selectedRecord.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Medical History */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Activity size={18} className="text-blue-600" />
                    Tiền sử bệnh án
                  </h3>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {selectedRecord.medical_history || "Chưa có thông tin"}
                    </p>
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-600" />
                    Dị ứng
                  </h3>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {selectedRecord.allergies ||
                        "Không có dị ứng được ghi nhận"}
                    </p>
                  </div>
                </div>

                {/* Medications */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Pill size={18} className="text-green-600" />
                    Thuốc đang sử dụng
                  </h3>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {selectedRecord.medications ||
                        "Không có thuốc đang sử dụng"}
                    </p>
                  </div>
                </div>

                {/* Health Conditions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Heart size={18} className="text-red-600" />
                    Tình trạng sức khỏe
                  </h3>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {selectedRecord.health_conditions ||
                        "Tình trạng sức khỏe bình thường"}
                    </p>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield size={18} className="text-purple-600" />
                    Liên hệ khẩn cấp
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                        <User size={16} />
                        Người liên hệ
                      </label>
                      <p className="text-gray-800">
                        {selectedRecord.emergency_contact_name ||
                          "Chưa cập nhật"}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                        <Phone size={16} />
                        Số điện thoại
                      </label>
                      <p className="text-gray-800">
                        {selectedRecord.emergency_contact_phone ||
                          "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users size={18} className="text-indigo-600" />
                    Thông tin khách hàng
                  </h3>
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    {getUserInfo(selectedRecord.userId) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Họ tên
                          </label>
                          <p className="text-gray-800">
                            {getUserInfo(selectedRecord.userId)?.full_name ||
                              "Chưa cập nhật"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <p className="text-gray-800">
                            {getUserInfo(selectedRecord.userId)?.email ||
                              "Chưa cập nhật"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Username
                          </label>
                          <p className="text-gray-800">
                            {getUserInfo(selectedRecord.userId)?.username ||
                              "Chưa cập nhật"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Ngày sinh
                          </label>
                          <p className="text-gray-800">
                            {getUserInfo(selectedRecord.userId)?.dob
                              ? formatDate(
                                  getUserInfo(selectedRecord.userId)!.dob
                                )
                              : "Chưa cập nhật"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        Không tìm thấy thông tin khách hàng (có thể không phải customer)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* No Record Selected */
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chọn hồ sơ để xem chi tiết
                </h3>
                <p className="text-gray-600">
                  Chọn một hồ sơ y tế từ danh sách bên trái để xem thông tin chi
                  tiết
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffMedicalRecordPage;