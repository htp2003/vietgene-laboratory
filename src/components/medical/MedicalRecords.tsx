// components/medical/MedicalRecords.tsx (View-Only Version)
import React, { useState, useEffect } from "react";
import {
  FileText,
  AlertCircle,
  Loader,
  Shield,
  Calendar,
  User,
  Phone,
  Heart,
  Pill,
  AlertTriangle,
  History,
  RefreshCw,
  Eye,
  UserX,
  MessageCircle,
} from "lucide-react";
import {
  medicalRecordService,
  MedicalRecord,
} from "../../services/medicalRecordsService";

const MedicalRecords: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMedicalRecords();
  }, []);

  const loadMedicalRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await medicalRecordService.getMyMedicalRecords();

      if (response.success && response.data) {
        setRecords(response.data);
      } else {
        setError(response.message);
        setRecords([]);
      }
    } catch (err: any) {
      console.error("Load medical records error:", err);
      setError("Không thể tải hồ sơ y tế. Vui lòng thử lại sau.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
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
  const latestRecord = hasRecords ? records[0] : null;

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
              <p className="text-gray-600">Xem thông tin sức khỏe của bạn</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button
              onClick={() => {
                setError(null);
                loadMedicalRecords();
              }}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* View-only indicator */}
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm">
              <Eye className="w-4 h-4" />
              Chỉ xem
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">
                Không thể tải hồ sơ y tế
              </p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        {hasRecords && latestRecord ? (
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Hồ sơ y tế của bạn
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  Cập nhật: {formatDate(latestRecord.updatedAt)}
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
                    {latestRecord.medical_history || "Chưa có thông tin"}
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
                    {latestRecord.allergies || "Không có dị ứng đã biết"}
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
                    {latestRecord.medications ||
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
                    {latestRecord.health_conditions ||
                      "Tình trạng sức khỏe tốt"}
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
                        {latestRecord.emergency_contact_name || "Chưa cung cấp"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Số điện thoại:
                      </p>
                      <p className="font-medium text-gray-900">
                        {latestRecord.emergency_contact_phone ||
                          "Chưa cung cấp"}
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
                  <span className="font-mono">{latestRecord.record_code}</span>
                </div>
                <div>Tạo lúc: {formatDate(latestRecord.createdAt)}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <UserX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có hồ sơ y tế
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Hồ sơ y tế của bạn sẽ được tạo bởi nhân viên y tế khi bạn đặt dịch
              vụ xét nghiệm.
            </p>

            {/* Contact staff info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <h4 className="font-medium text-blue-900 text-sm">
                    Cần hỗ trợ?
                  </h4>
                  <p className="text-blue-800 text-xs">
                    Liên hệ nhân viên để được hỗ trợ tạo hồ sơ y tế
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Notice for View-Only */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Eye className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              Thông tin quan trọng
            </h4>
            <p className="text-sm text-blue-800 mb-2">
              • Bạn chỉ có thể xem hồ sơ y tế, không thể chỉnh sửa
            </p>
            <p className="text-sm text-blue-800 mb-2">
              • Nhân viên y tế sẽ tạo và cập nhật hồ sơ cho bạn
            </p>
            <p className="text-sm text-blue-800">
              • Hồ sơ được bảo mật tuyệt đối theo quy định y tế
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecords;
