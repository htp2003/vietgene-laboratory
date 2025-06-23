import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader,
  Shield,
  Calendar,
  User,
  Phone,
  Heart,
  Pill,
  AlertTriangle,
  History,
} from "lucide-react";

// Mock medical records service
const medicalRecordsService = {
  async getMyMedicalRecords() {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const savedRecord = localStorage.getItem("medicalRecord");

    if (savedRecord) {
      return [JSON.parse(savedRecord)];
    }

    return [];
  },

  async createMedicalRecord(data: any) {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const record = {
      id: "record_" + Date.now(),
      recordCode: Math.floor(Math.random() * 1000000),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem("medicalRecord", JSON.stringify(record));
    return record;
  },

  async updateMedicalRecord(id: string, data: any) {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const record = {
      id,
      recordCode: 123456,
      ...data,
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem("medicalRecord", JSON.stringify(record));
    return record;
  },
};

interface MedicalRecord {
  id: string;
  recordCode: number;
  medicalHistory: string;
  allergies: string;
  medications: string;
  healthConditions: string;
  emergencyContactPhone: string;
  emergencyContactName: string;
  createdAt: string;
  updatedAt: string;
}

const MedicalRecords: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    medicalHistory: "",
    allergies: "",
    medications: "",
    healthConditions: "",
    emergencyContactPhone: "",
    emergencyContactName: "",
  });

  useEffect(() => {
    loadMedicalRecords();
  }, []);

  const loadMedicalRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      const userRecords = await medicalRecordsService.getMyMedicalRecords();
      setRecords(userRecords);

      if (userRecords.length > 0) {
        const latest = userRecords[0];
        setFormData({
          medicalHistory: latest.medicalHistory,
          allergies: latest.allergies,
          medications: latest.medications,
          healthConditions: latest.healthConditions,
          emergencyContactPhone: latest.emergencyContactPhone,
          emergencyContactName: latest.emergencyContactName,
        });
      }
    } catch (err) {
      setError("Không thể tải hồ sơ y tế");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (records.length > 0) {
        await medicalRecordsService.updateMedicalRecord(
          records[0].id,
          formData
        );
        setSuccess("Hồ sơ y tế đã được cập nhật!");
      } else {
        await medicalRecordsService.createMedicalRecord(formData);
        setSuccess("Hồ sơ y tế đã được tạo!");
      }

      await loadMedicalRecords();
      setEditMode(false);
      setShowCreateForm(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Có lỗi xảy ra khi lưu hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setShowCreateForm(false);
    setError(null);

    if (records.length > 0) {
      const latest = records[0];
      setFormData({
        medicalHistory: latest.medicalHistory,
        allergies: latest.allergies,
        medications: latest.medications,
        healthConditions: latest.healthConditions,
        emergencyContactPhone: latest.emergencyContactPhone,
        emergencyContactName: latest.emergencyContactName,
      });
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Không xác định";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-red-600 animate-spin mr-3" />
          <span className="text-gray-600">Đang tải hồ sơ y tế...</span>
        </div>
      </div>
    );
  }

  const hasRecords = records.length > 0;
  const isFormMode = editMode || showCreateForm;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Hồ sơ y tế</h2>
              <p className="text-gray-600">
                Quản lý thông tin sức khỏe của bạn
              </p>
            </div>
          </div>

          {hasRecords && !isFormMode && (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Edit className="w-4 h-4" />
              Chỉnh sửa
            </button>
          )}

          {!hasRecords && !isFormMode && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tạo hồ sơ
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        {isFormMode ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {hasRecords ? "Chỉnh sửa hồ sơ y tế" : "Tạo hồ sơ y tế mới"}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <History className="w-4 h-4 inline mr-2" />
                  Tiền sử bệnh lý
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Mô tả tiền sử bệnh lý, phẫu thuật..."
                  value={formData.medicalHistory}
                  onChange={(e) =>
                    updateField("medicalHistory", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  Dị ứng
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Dị ứng thuốc, thực phẩm..."
                  value={formData.allergies}
                  onChange={(e) => updateField("allergies", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Pill className="w-4 h-4 inline mr-2" />
                  Thuốc đang sử dụng
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Liệt kê các loại thuốc..."
                  value={formData.medications}
                  onChange={(e) => updateField("medications", e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Heart className="w-4 h-4 inline mr-2" />
                  Tình trạng sức khỏe hiện tại
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Mô tả tình trạng sức khỏe..."
                  value={formData.healthConditions}
                  onChange={(e) =>
                    updateField("healthConditions", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Người liên hệ khẩn cấp
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Họ và tên"
                  value={formData.emergencyContactName}
                  onChange={(e) =>
                    updateField("emergencyContactName", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Số điện thoại khẩn cấp
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="0987654321"
                  value={formData.emergencyContactPhone}
                  onChange={(e) =>
                    updateField("emergencyContactPhone", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        ) : hasRecords ? (
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Hồ sơ y tế của bạn
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  Cập nhật: {formatDate(records[0].updatedAt)}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <History className="w-4 h-4 text-red-600" />
                    Tiền sử bệnh lý
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {records[0].medicalHistory || "Chưa có thông tin"}
                  </p>
                </div>
              </div>

              <div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    Dị ứng
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {records[0].allergies || "Không có dị ứng đã biết"}
                  </p>
                </div>
              </div>

              <div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-blue-600" />
                    Thuốc đang sử dụng
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {records[0].medications ||
                      "Không sử dụng thuốc thường xuyên"}
                  </p>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-green-600" />
                    Tình trạng sức khỏe hiện tại
                  </h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {records[0].healthConditions || "Tình trạng sức khỏe tốt"}
                  </p>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-600" />
                    Thông tin liên hệ khẩn cấp
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Người liên hệ:
                      </p>
                      <p className="font-medium text-gray-900">
                        {records[0].emergencyContactName || "Chưa cung cấp"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Số điện thoại:
                      </p>
                      <p className="font-medium text-gray-900">
                        {records[0].emergencyContactPhone || "Chưa cung cấp"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>
                  Mã hồ sơ:{" "}
                  <span className="font-mono">{records[0].recordCode}</span>
                </div>
                <div>Tạo lúc: {formatDate(records[0].createdAt)}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có hồ sơ y tế
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Tạo hồ sơ y tế để chúng tôi có thể cung cấp dịch vụ tốt nhất cho
              bạn.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Tạo hồ sơ y tế
            </button>
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              Bảo mật thông tin
            </h4>
            <p className="text-sm text-blue-800">
              Hồ sơ y tế của bạn được mã hóa và bảo mật tuyệt đối. Chúng tôi
              tuân thủ nghiêm ngặt các quy định về bảo vệ dữ liệu cá nhân.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecords;
