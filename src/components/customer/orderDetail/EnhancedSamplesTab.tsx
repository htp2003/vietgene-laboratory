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

// ✅ V9 API Interfaces
interface SampleKit {
  id: string;
  kit_code: string;
  kit_type: string;
  status: string;
  shipper_data?: string;
  delivered_date?: string | null;
  tracking_number?: number;
  shipping_address?: string;
  expiry_date?: string;
  instruction?: string;
  createdAt: string;
  updatedAt?: string;
  samplesId: string; // V9: Single sample ID reference
  userId: string; // V9: User who owns this kit
  orderId: string; // V9: Direct order reference
}

interface Sample {
  id: string;
  sample_code: string;
  sample_type: string;
  collection_method: string;
  collection_date?: string;
  received_date?: string;
  status: string;
  shipping_tracking?: string;
  notes?: string;
  sample_quality?: string;
  userId: string; // V9: User who owns this sample
  sampleKitsId: string; // V9: Single kit ID reference
}

interface KitsAndSamplesSummary {
  totalKits: number;
  kitsPreparing: number;
  kitsShipped: number;
  kitsDelivered: number;
  kitsExpired: number;
  totalSamples: number;
  samplesCollected: number;
  samplesReceived: number;
  samplesCompleted: number;
  samplesAnalyzing: number;
  // Legacy fields for compatibility
  total: number;
  collected: number;
  received: number;
  completed: number;
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

const getKitStatusInfo = (status: string) => {
  const statusMap: Record<string, any> = {
    ordered: {
      label: "Đã đặt hàng",
      color: "bg-blue-100 text-blue-800",
      icon: Package,
      description: "Kit đã được đặt hàng",
    },
    preparing: {
      label: "Đang chuẩn bị",
      color: "bg-yellow-100 text-yellow-800",
      icon: Package,
      description: "Kit đang được chuẩn bị",
    },
    shipped: {
      label: "Đã gửi",
      color: "bg-blue-100 text-blue-800",
      icon: Truck,
      description: "Kit đã được gửi đi",
    },
    delivered: {
      label: "Đã giao",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
      description: "Kit đã được giao thành công",
    },
    expired: {
      label: "Hết hạn",
      color: "bg-red-100 text-red-800",
      icon: AlertCircle,
      description: "Kit đã hết hạn sử dụng",
    },
    ready: {
      label: "Sẵn sàng",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
      description: "Kit sẵn sàng để sử dụng",
    },
  };
  return statusMap[status] || statusMap.preparing;
};

const getSampleStatusInfo = (status: string) => {
  const statusMap: Record<string, any> = {
    pending: {
      label: "Chờ xử lý",
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
      description: "Đang chờ xử lý",
    },
    collected: {
      label: "Đã thu mẫu",
      color: "bg-blue-100 text-blue-800",
      icon: TestTube,
      description: "Mẫu đã được thu thập",
    },
    shipped: {
      label: "Đang vận chuyển",
      color: "bg-purple-100 text-purple-800",
      icon: Truck,
      description: "Mẫu đang được vận chuyển về lab",
    },
    received: {
      label: "Đã nhận",
      color: "bg-indigo-100 text-indigo-800",
      icon: CheckCircle,
      description: "Lab đã nhận được mẫu",
    },
    analyzing: {
      label: "Đang phân tích",
      color: "bg-orange-100 text-orange-800",
      icon: Eye,
      description: "Mẫu đang được phân tích",
    },
    completed: {
      label: "Hoàn thành",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
      description: "Phân tích hoàn thành",
    },
    failed: {
      label: "Thất bại",
      color: "bg-red-100 text-red-800",
      icon: AlertCircle,
      description: "Mẫu không đạt chất lượng",
    },
  };
  return statusMap[status] || statusMap.pending;
};

const getCollectionMethodDisplay = (method: string): string => {
  const methodMap: Record<string, string> = {
    home: "Thu mẫu tại nhà",
    facility: "Thu mẫu tại cơ sở",
    clinic: "Thu mẫu tại phòng khám",
    pending: "Chưa xác định",
  };
  return methodMap[method] || method;
};

const extractParticipantInfo = (
  instruction: string,
  notes: string
): { name: string; relationship: string } => {
  // Try to extract from instruction first
  if (instruction) {
    const instructionMatch = instruction.match(/cho (.+?) \((.+?)\)/);
    if (instructionMatch) {
      return {
        name: instructionMatch[1].trim(),
        relationship: instructionMatch[2].split(",")[0].trim(),
      };
    }
  }

  // Try to extract from notes
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

const calculateProgress = (status: string, type: "kit" | "sample"): number => {
  if (type === "kit") {
    const kitProgress: Record<string, number> = {
      ordered: 15,
      preparing: 30,
      shipped: 70,
      delivered: 100,
      expired: 0,
      ready: 100,
    };
    return kitProgress[status] || 0;
  } else {
    const sampleProgress: Record<string, number> = {
      pending: 10,
      collected: 40,
      shipped: 60,
      received: 70,
      analyzing: 85,
      completed: 100,
      failed: 0,
    };
    return sampleProgress[status] || 0;
  }
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

  // ✅ Filter data by current user and create kit-sample pairs
  useEffect(() => {
    console.log("🔍 Filtering kits and samples for user:", currentUserId);
    console.log("📦 Total kits received:", sampleKits.length);
    console.log("🧬 Total samples received:", samples.length);

    // Filter kits for current user
    const userKits = sampleKits.filter((kit) => {
      // Check multiple possible user ID fields
      const kitUserId =
        kit.userId || (kit as any).user_id || (kit as any).customerId;
      const belongs = kitUserId === currentUserId;

      if (!belongs) {
        console.log(
          `📦 Kit ${kit.kit_code} belongs to user ${kitUserId}, not current user ${currentUserId}`
        );
      }

      return belongs;
    });

    // Filter samples for current user
    const userSamples = samples.filter((sample) => {
      const sampleUserId =
        sample.userId || (sample as any).user_id || (sample as any).customerId;
      const belongs = sampleUserId === currentUserId;

      if (!belongs) {
        console.log(
          `🧬 Sample ${sample.sample_code} belongs to user ${sampleUserId}, not current user ${currentUserId}`
        );
      }

      return belongs;
    });

    console.log("✅ Filtered kits for current user:", userKits.length);
    console.log("✅ Filtered samples for current user:", userSamples.length);

    setFilteredKits(userKits);
    setFilteredSamples(userSamples);

    // ✅ Create kit-sample pairs based on V9 relationships
    const pairs: Array<{ kit: SampleKit; sample?: Sample }> = [];

    userKits.forEach((kit) => {
      // V9: Find sample by kit's samplesId OR find sample that references this kit
      let associatedSample = userSamples.find(
        (sample) =>
          sample.id === kit.samplesId || sample.sampleKitsId === kit.id
      );

      pairs.push({ kit, sample: associatedSample });

      if (associatedSample) {
        console.log(
          `🔗 Kit ${kit.kit_code} paired with sample ${associatedSample.sample_code}`
        );
      } else {
        console.log(`📦 Kit ${kit.kit_code} has no associated sample yet`);
      }
    });

    setKitSamplePairs(pairs);
    console.log("🔗 Created kit-sample pairs:", pairs.length);
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

  // ✅ Show message if no kits found for user
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              💡 <strong>Lưu ý:</strong> Số lượng kit sẽ tương ứng với số người
              tham gia xét nghiệm
            </p>
          </div>
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

        {/* User Info Display */}
        <div className="text-sm text-gray-500">
          <User className="w-4 h-4 inline mr-1" />
          User ID: {currentUserId.slice(0, 8)}...
        </div>

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

      {/* Summary Cards - Updated with filtered data */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">
                {
                  filteredKits.filter((kit) =>
                    ["delivered", "ready"].includes(kit.status)
                  ).length
                }
              </p>
              <p className="text-sm text-green-600">Kit sẵn sàng</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <TestTube className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-700">
                {
                  filteredSamples.filter((sample) =>
                    ["collected", "received"].includes(sample.status)
                  ).length
                }
              </p>
              <p className="text-sm text-purple-600">Mẫu đã thu</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-700">
                {
                  filteredSamples.filter((sample) =>
                    ["analyzing", "completed"].includes(sample.status)
                  ).length
                }
              </p>
              <p className="text-sm text-orange-600">Đang/Đã phân tích</p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Kit-Sample Pairs View (Main view) */}
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
              const kitProgress = calculateProgress(kit.status, "kit");
              const sampleProgress = sample
                ? calculateProgress(sample.status, "sample")
                : 0;
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
                    {/* Kit Section */}
                    <div className="space-y-4">
                      <h6 className="font-medium text-gray-900 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Thông tin Kit
                      </h6>

                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-gray-600 font-medium">
                            Trạng thái:
                          </p>
                          <p className="text-gray-900">
                            {kitStatusInfo.description}
                          </p>
                        </div>

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

                        {kit.expiry_date && (
                          <div>
                            <p className="text-gray-600 font-medium">
                              Hạn sử dụng:
                            </p>
                            <p className="text-gray-900">
                              {formatDateTime(kit.expiry_date)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Kit Progress */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Tiến độ kit
                          </span>
                          <span className="text-sm text-gray-500">
                            {kitProgress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${kitProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Sample Section */}
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

                          {sample.sample_quality && (
                            <div>
                              <p className="text-gray-600 font-medium">
                                Chất lượng:
                              </p>
                              <p className="text-gray-900">
                                {sample.sample_quality}
                              </p>
                            </div>
                          )}

                          {/* Sample Progress */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Tiến độ mẫu
                              </span>
                              <span className="text-sm text-gray-500">
                                {sampleProgress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${sampleProgress}%` }}
                              ></div>
                            </div>
                          </div>
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
              const progress = calculateProgress(sample.status, "sample");
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
                      <p className="text-xs text-gray-500 mt-1">
                        {sampleStatusInfo.description}
                      </p>
                    </div>
                  </div>

                  {/* Sample Details */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4">
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

                    {sample.shipping_tracking && (
                      <div>
                        <p className="text-gray-600 font-medium">
                          Mã vận chuyển:
                        </p>
                        <p className="text-gray-900 font-mono text-xs">
                          {sample.shipping_tracking}
                        </p>
                      </div>
                    )}

                    {sample.sample_quality && (
                      <div>
                        <p className="text-gray-600 font-medium">Chất lượng:</p>
                        <p className="text-gray-900">{sample.sample_quality}</p>
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

                  {/* Sample Progress Bar */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Tiến độ mẫu
                      </span>
                      <span className="text-sm text-gray-500">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
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
                <li>• Thời gian xử lý: 7-10 ngày làm việc</li>
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
                <li>• Thời gian xử lý: 5-7 ngày làm việc</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Process Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">
          Quy trình xử lý mẫu
        </h4>
        <div className="space-y-3">
          {collectionMethod === "home" ? (
            <>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                  1
                </div>
                <span>
                  Chuẩn bị và gửi kit → Giao kit → Thu mẫu → Gửi về lab
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-medium">
                  2
                </div>
                <span>
                  Nhận mẫu → Kiểm tra chất lượng → Phân tích → Báo cáo kết quả
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                  1
                </div>
                <span>
                  Xác nhận lịch hẹn → Thu mẫu tại cơ sở → Chuyển vào lab
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-medium">
                  2
                </div>
                <span>
                  Xử lý mẫu → Phân tích → Kiểm tra kết quả → Báo cáo hoàn thành
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ✅ Debug Info */}
      <details className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <summary className="font-medium text-yellow-800 cursor-pointer">
          🔍 Debug Info
        </summary>
        <div className="mt-3 text-sm space-y-2">
          <div>
            <strong>Current User ID:</strong> {currentUserId}
          </div>
          <div>
            <strong>Total Kits Received:</strong> {sampleKits.length}
          </div>
          <div>
            <strong>Filtered Kits (User):</strong> {filteredKits.length}
          </div>
          <div>
            <strong>Total Samples Received:</strong> {samples.length}
          </div>
          <div>
            <strong>Filtered Samples (User):</strong> {filteredSamples.length}
          </div>
          <div>
            <strong>Kit-Sample Pairs:</strong> {kitSamplePairs.length}
          </div>
          <div>
            <strong>Collection Method:</strong> {collectionMethod}
          </div>
          <div>
            <strong>Active View:</strong> {activeView}
          </div>
        </div>
      </details>
    </div>
  );
};
