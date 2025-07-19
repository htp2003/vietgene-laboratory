import React, { useState, useEffect } from "react";
import {
  TestTube,
  Package,
  Truck,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  User,
  Home,
  Building,
} from "lucide-react";

// ✅ Simplified Interfaces
interface SampleKit {
  id: string;
  kit_code: string;
  kit_type: string;
  status: string; // Keep simple status
  shipper_data?: string;
  delivered_date?: string | null;
  tracking_number?: number;
  shipping_address?: string;
  expiry_date?: string;
  instruction?: string;
  createdAt: string;
  updatedAt?: string;
  samplesId: string;
  userId: string;
  orderId: string;
}

interface Sample {
  id: string;
  sample_code: string;
  sample_type: string;
  collection_method: string;
  collection_date?: string;
  received_date?: string;
  status: string; // 🚀 SIMPLIFIED: Only basic status
  shipping_tracking?: string;
  notes?: string;
  sample_quality?: string;
  userId: string;
  sampleKitsId: string;
}

interface KitsAndSamplesSummary {
  totalKits: number;
  totalSamples: number;
  // 🚀 REMOVED: Complex counting
}

interface EnhancedSamplesTabProps {
  sampleKits?: SampleKit[];
  samples?: Sample[];
  kitsAndSamplesSummary: KitsAndSamplesSummary;
  collectionMethod?: string;
  onTrackKit?: (kitId: string, trackingNumber: string) => void;
}

// ✅ Helper Functions
const getCurrentUserId = (): string => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.id || "";
  } catch {
    return "";
  }
};

const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

// 🚀 SIMPLIFIED: Basic kit status only
const getKitStatusInfo = (status: string) => {
  const statusMap: Record<string, any> = {
    // Simple states only
    preparing: {
      label: "Đang chuẩn bị",
      color: "bg-blue-100 text-blue-800",
      icon: Package,
    },
    shipped: {
      label: "Đã gửi",
      color: "bg-purple-100 text-purple-800",
      icon: Truck,
    },
    delivered: {
      label: "Đã giao",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
  };
  return statusMap[status] || statusMap.preparing;
};

// 🚀 SIMPLIFIED: Sample status matching staff pattern
const getSampleStatusInfo = (status: string) => {
  const statusMap: Record<string, any> = {
    // 🎯 MATCH STAFF PATTERN: RECEIVED → PROCESSING → COMPLETED
    RECEIVED: {
      label: "Mẫu đã được nhận",
      color: "bg-blue-100 text-blue-800",
      icon: CheckCircle,
    },
    received: {
      label: "Mẫu đã được nhận",
      color: "bg-blue-100 text-blue-800",
      icon: CheckCircle,
    },
    Received: {
      label: "Mẫu đã được nhận",
      color: "bg-blue-100 text-blue-800",
      icon: CheckCircle,
    },
    PROCESSING: {
      label: "Bắt đầu xét nghiệm",
      color: "bg-orange-100 text-orange-800",
      icon: Eye,
    },
    processing: {
      label: "Bắt đầu xét nghiệm",
      color: "bg-orange-100 text-orange-800",
      icon: Eye,
    },
    Processing: {
      label: "Bắt đầu xét nghiệm",
      color: "bg-orange-100 text-orange-800",
      icon: Eye,
    },
    COMPLETED: {
      label: "Xét nghiệm hoàn thành",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
    completed: {
      label: "Xét nghiệm hoàn thành",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
    Completed: {
      label: "Xét nghiệm hoàn thành",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
    // 🚀 REMOVED: All complex statuses (pending, collected, shipped, analyzing, failed, etc.)
  };
  return (
    statusMap[status] || {
      label: "Đang xử lý",
      color: "bg-gray-100 text-gray-800",
      icon: Clock,
    }
  );
};

const getCollectionMethodDisplay = (method: string): string => {
  const methodMap: Record<string, string> = {
    home: "Thu mẫu tại nhà",
    facility: "Thu mẫu tại cơ sở",
    clinic: "Thu mẫu tại phòng khám",
  };
  return methodMap[method] || method;
};

const extractParticipantInfo = (
  instruction: string,
  notes: string
): { name: string; relationship: string } => {
  if (instruction) {
    const instructionMatch = instruction.match(/cho (.+?) \((.+?)\)/);
    if (instructionMatch) {
      return {
        name: instructionMatch[1].trim(),
        relationship: instructionMatch[2].split(",")[0].trim(),
      };
    }
  }

  if (notes) {
    const notesMatch = notes.match(/for (.+?) \((.+?)\)/);
    if (notesMatch) {
      return {
        name: notesMatch[1].trim(),
        relationship: notesMatch[2].split(",")[0].trim(),
      };
    }
  }

  return { name: "Không xác định", relationship: "Không xác định" };
};

export const EnhancedSamplesTab: React.FC<EnhancedSamplesTabProps> = ({
  sampleKits = [],
  samples = [],
  kitsAndSamplesSummary,
  collectionMethod = "home",
  onTrackKit,
}) => {
  const [activeView, setActiveView] = useState<"kits" | "samples">("kits");
  const [filteredKits, setFilteredKits] = useState<SampleKit[]>([]);
  const [filteredSamples, setFilteredSamples] = useState<Sample[]>([]);
  const [kitSamplePairs, setKitSamplePairs] = useState<
    Array<{ kit: SampleKit; sample?: Sample }>
  >([]);

  const currentUserId = getCurrentUserId();

  // ✅ Filter data by current user
  useEffect(() => {
    console.log("🔍 Filtering kits and samples for user:", currentUserId);

    const userKits = sampleKits.filter((kit) => {
      const kitUserId =
        kit.userId || (kit as any).user_id || (kit as any).customerId;
      return kitUserId === currentUserId;
    });

    // Find samples that belong to customer's kits
    const customerSamples: Sample[] = [];
    const customerKitIds = userKits.map((kit) => kit.id);

    samples.forEach((sample) => {
      const belongsToCustomerKit = customerKitIds.includes(sample.sampleKitsId);
      if (belongsToCustomerKit) {
        customerSamples.push(sample);
      }
    });

    setFilteredKits(userKits);
    setFilteredSamples(customerSamples);

    // Create kit-sample pairs
    const pairs: Array<{ kit: SampleKit; sample?: Sample }> = [];
    userKits.forEach((kit) => {
      let associatedSample = customerSamples.find(
        (sample) =>
          sample.id === kit.samplesId || sample.sampleKitsId === kit.id
      );
      pairs.push({ kit, sample: associatedSample });
    });

    setKitSamplePairs(pairs);
  }, [sampleKits, samples, currentUserId]);

  // ✅ Show message if no user is logged in
  if (!currentUserId) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Bộ kit & Mẫu xét nghiệm
        </h3>
        <div className="text-center py-12 bg-yellow-50 rounded-lg border-2 border-yellow-200">
          <User className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-yellow-800 mb-2">
            Vui lòng đăng nhập
          </h4>
          <p className="text-yellow-600">
            Bạn cần đăng nhập để xem thông tin kit và mẫu xét nghiệm
          </p>
        </div>
      </div>
    );
  }

  // ✅ Show message if no kits found
  if (filteredKits.length === 0 && filteredSamples.length === 0) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Bộ kit & Mẫu xét nghiệm
        </h3>

        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có kit xét nghiệm
          </h4>
          <p className="text-gray-500 mb-4">
            Kit sẽ được tạo tự động sau khi đơn hàng được xác nhận
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">
          Bộ kit & Mẫu xét nghiệm
        </h3>

        {/* View Toggle */}
        {filteredKits.length > 0 && (
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveView("kits")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === "kits"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Kit xét nghiệm ({filteredKits.length})
            </button>
            <button
              onClick={() => setActiveView("samples")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === "samples"
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Mẫu đã thu ({filteredSamples.length})
            </button>
          </div>
        )}
      </div>

      {/* 🚀 SIMPLIFIED: Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-700">
                {filteredKits.length}
              </p>
              <p className="text-sm text-blue-600">Kit của bạn</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <TestTube className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-700">
                {filteredSamples.length}
              </p>
              <p className="text-sm text-purple-600">Mẫu đã thu</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">
                {
                  filteredSamples.filter((sample) =>
                    ["COMPLETED", "completed"].includes(sample.status)
                  ).length
                }
              </p>
              <p className="text-sm text-green-600">Đã hoàn thành</p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Kit-Sample Pairs View */}
      {activeView === "kits" && (
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Kit xét nghiệm & Mẫu tương ứng
          </h4>

          {kitSamplePairs.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h5 className="text-lg font-medium text-gray-700 mb-2">
                Chưa có kit nào
              </h5>
              <p className="text-gray-500 text-sm">
                Kit sẽ được tạo sau khi đơn hàng được xác nhận
              </p>
            </div>
          ) : (
            kitSamplePairs.map(({ kit, sample }, index) => {
              const kitStatusInfo = getKitStatusInfo(kit.status);
              const sampleStatusInfo = sample
                ? getSampleStatusInfo(sample.status)
                : null;
              const KitIcon = kitStatusInfo.icon;
              const SampleIcon = sampleStatusInfo?.icon || TestTube;
              const participantInfo = extractParticipantInfo(
                kit.instruction || "",
                sample?.notes || ""
              );

              return (
                <div
                  key={kit.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">
                          {kit.kit_code}
                        </h5>
                        <p className="text-sm text-gray-500">
                          {participantInfo.name} ({participantInfo.relationship}
                          )
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${kitStatusInfo.color}`}
                      >
                        <KitIcon className="w-3 h-3" />
                        {kitStatusInfo.label}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* 🚀 SIMPLIFIED: Kit Section */}
                    <div className="space-y-4">
                      <h6 className="font-medium text-gray-900 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Kit xét nghiệm
                      </h6>

                      <div className="space-y-3 text-sm">
                        {kit.shipping_address && (
                          <div>
                            <p className="text-gray-600 font-medium">
                              Địa chỉ giao:
                            </p>
                            <p className="text-gray-900">
                              {kit.shipping_address}
                            </p>
                          </div>
                        )}

                        {kit.delivered_date && (
                          <div>
                            <p className="text-gray-600 font-medium">
                              Ngày giao:
                            </p>
                            <p className="text-gray-900">
                              {formatDateTime(kit.delivered_date)}
                            </p>
                          </div>
                        )}

                        {kit.tracking_number && (
                          <div>
                            <p className="text-gray-600 font-medium">
                              Mã vận chuyển:
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-gray-900 font-mono text-xs">
                                {kit.tracking_number}
                              </p>
                              {onTrackKit && (
                                <button
                                  onClick={() =>
                                    onTrackKit(
                                      kit.id,
                                      kit.tracking_number?.toString() || ""
                                    )
                                  }
                                  className="text-blue-600 hover:text-blue-700 text-xs"
                                >
                                  Theo dõi
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 🚀 SIMPLIFIED: Sample Section */}
                    <div className="space-y-4">
                      <h6 className="font-medium text-gray-900 flex items-center gap-2">
                        <TestTube className="w-4 h-4" />
                        Mẫu xét nghiệm
                      </h6>

                      {sample ? (
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${sampleStatusInfo?.color}`}
                            >
                              <SampleIcon className="w-3 h-3" />
                              {sampleStatusInfo?.label}
                            </span>
                          </div>

                          <div>
                            <p className="text-gray-600 font-medium">Mã mẫu:</p>
                            <p className="text-gray-900 font-mono text-xs">
                              {sample.sample_code}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-600 font-medium">
                              Phương thức:
                            </p>
                            <p className="text-gray-900">
                              {getCollectionMethodDisplay(
                                sample.collection_method
                              )}
                            </p>
                          </div>

                          {sample.collection_date && (
                            <div>
                              <p className="text-gray-600 font-medium">
                                Ngày thu:
                              </p>
                              <p className="text-gray-900">
                                {formatDateTime(sample.collection_date)}
                              </p>
                            </div>
                          )}

                          {sample.received_date && (
                            <div>
                              <p className="text-gray-600 font-medium">
                                Ngày nhận tại lab:
                              </p>
                              <p className="text-gray-900">
                                {formatDateTime(sample.received_date)}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                          <TestTube className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Chưa có mẫu</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Mẫu sẽ được tạo sau khi thu thập
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Instructions */}
                  {kit.instruction && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-blue-800 text-sm font-medium mb-2">
                        Hướng dẫn sử dụng:
                      </p>
                      <div className="text-sm text-blue-700 whitespace-pre-line">
                        {kit.instruction.length > 300
                          ? kit.instruction.substring(0, 300) + "..."
                          : kit.instruction}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ✅ Samples Only View */}
      {activeView === "samples" && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Mẫu xét nghiệm đã thu thập
          </h4>

          {filteredSamples.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h5 className="text-lg font-medium text-gray-700 mb-2">
                Chưa có mẫu nào được thu thập
              </h5>
              <p className="text-gray-500 text-sm">
                {collectionMethod === "home"
                  ? "Mẫu sẽ xuất hiện sau khi bạn thu thập theo hướng dẫn trong kit"
                  : "Mẫu sẽ được thu thập tại cơ sở y tế theo lịch hẹn"}
              </p>
            </div>
          ) : (
            filteredSamples.map((sample, index) => {
              const sampleStatusInfo = getSampleStatusInfo(sample.status);
              const SampleIcon = sampleStatusInfo.icon;
              const participantInfo = extractParticipantInfo(
                "",
                sample.notes || ""
              );

              return (
                <div
                  key={sample.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  {/* Sample Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <TestTube className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">
                          {sample.sample_code}
                        </h5>
                        <p className="text-sm text-gray-500">
                          {sample.sample_type || "Mẫu nước bọt"} •{" "}
                          {participantInfo.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${sampleStatusInfo.color}`}
                      >
                        <SampleIcon className="w-3 h-3" />
                        {sampleStatusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* 🚀 SIMPLIFIED: Sample Details */}
                  <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-600 font-medium">Phương thức:</p>
                      <p className="text-gray-900">
                        {getCollectionMethodDisplay(sample.collection_method)}
                      </p>
                    </div>

                    {sample.collection_date && (
                      <div>
                        <p className="text-gray-600 font-medium">
                          Ngày thu thập:
                        </p>
                        <p className="text-gray-900">
                          {formatDateTime(sample.collection_date)}
                        </p>
                      </div>
                    )}

                    {sample.received_date && (
                      <div>
                        <p className="text-gray-600 font-medium">
                          Ngày nhận tại lab:
                        </p>
                        <p className="text-gray-900">
                          {formatDateTime(sample.received_date)}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-gray-600 font-medium">
                        Kit liên quan:
                      </p>
                      <p className="text-gray-900 font-mono text-xs">
                        {sample.sampleKitsId || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Sample Notes */}
                  {sample.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-red-500">
                      <p className="text-gray-600 text-sm font-medium mb-1">
                        Ghi chú:
                      </p>
                      <p className="text-sm text-gray-800">{sample.notes}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ✅ Collection Method Info */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          {collectionMethod === "home" ? (
            <Home className="w-5 h-5" />
          ) : (
            <Building className="w-5 h-5" />
          )}
          Phương thức thu mẫu
        </h4>
        <div className="text-sm text-gray-700">
          {collectionMethod === "home" ? (
            <div>
              <p className="font-medium text-blue-800 mb-2">
                🏠 Thu mẫu tại nhà
              </p>
              <ul className="space-y-1 text-gray-600">
                <li>• Kit sẽ được gửi đến địa chỉ của bạn</li>
                <li>• Làm theo hướng dẫn trong kit để thu mẫu</li>
                <li>• Gửi mẫu về lab theo địa chỉ có trong kit</li>
              </ul>
            </div>
          ) : (
            <div>
              <p className="font-medium text-green-800 mb-2">
                🏥 Thu mẫu tại cơ sở
              </p>
              <ul className="space-y-1 text-gray-600">
                <li>• Đến cơ sở y tế theo lịch hẹn đã đặt</li>
                <li>• Nhân viên sẽ hỗ trợ thu mẫu chuyên nghiệp</li>
                <li>• Mẫu được xử lý ngay tại phòng lab</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
