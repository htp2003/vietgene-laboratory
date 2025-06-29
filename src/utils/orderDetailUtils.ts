import {
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  TestTube,
  Package,
} from "lucide-react";

// Date formatting functions
export const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return "Chưa có";
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Không hợp lệ";
  }
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return "Chưa có";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "Không hợp lệ";
  }
};

// Status information functions
export const getStatusInfo = (status: string) => {
  const statusMap: Record<string, any> = {
    pending: {
      label: "Chờ xử lý",
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
      description: "Đơn hàng đang được xử lý",
    },
    confirmed: {
      label: "Đã xác nhận",
      color: "bg-blue-100 text-blue-800",
      icon: CheckCircle,
      description: "Đơn hàng đã được xác nhận",
    },
    processing: {
      label: "Đang xử lý",
      color: "bg-purple-100 text-purple-800",
      icon: RefreshCw,
      description: "Đang chuẩn bị và xử lý mẫu",
    },
    completed: {
      label: "Hoàn thành",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
      description: "Xét nghiệm hoàn thành, kết quả đã sẵn sàng",
    },
    cancelled: {
      label: "Đã hủy",
      color: "bg-red-100 text-red-800",
      icon: AlertCircle,
      description: "Đơn hàng đã bị hủy",
    },
  };
  return statusMap[status] || statusMap.pending;
};

export const getSampleStatusInfo = (status: string) => {
  const statusMap: Record<string, any> = {
    pending_collection: {
      label: "Chờ thu thập",
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
      description: "Đang chờ thu thập mẫu",
    },
    scheduled: {
      label: "Đã lên lịch",
      color: "bg-blue-100 text-blue-800",
      icon: Clock,
      description: "Đã lên lịch thu thập mẫu",
    },
    collected: {
      label: "Đã thu thập",
      color: "bg-purple-100 text-purple-800",
      icon: TestTube,
      description: "Mẫu đã được thu thập",
    },
    shipped: {
      label: "Đang vận chuyển",
      color: "bg-indigo-100 text-indigo-800",
      icon: Package,
      description: "Mẫu đang được vận chuyển về lab",
    },
    received: {
      label: "Đã nhận tại lab",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
      description: "Lab đã nhận được mẫu",
    },
    analyzing: {
      label: "Đang phân tích",
      color: "bg-orange-100 text-orange-800",
      icon: RefreshCw,
      description: "Mẫu đang được phân tích",
    },
    completed: {
      label: "Hoàn thành",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
      description: "Phân tích mẫu đã hoàn thành",
    },
  };
  return statusMap[status] || statusMap.pending_collection;
};

// Payment method and status functions
export const getPaymentMethodName = (method: string): string => {
  const methods: Record<string, string> = {
    transfer: "Chuyển khoản ngân hàng",
    cash: "Tiền mặt",
    card: "Thẻ tín dụng",
  };
  return methods[method] || method;
};

export const getPaymentStatusName = (status: string): string => {
  const statuses: Record<string, string> = {
    pending: "Chờ thanh toán",
    paid: "Đã thanh toán",
    failed: "Thanh toán thất bại",
    refunded: "Đã hoàn tiền",
  };
  return statuses[status] || status;
};

// Sample progress calculation
export const getSampleProgress = (status: string): number => {
  const progressMap: Record<string, number> = {
    pending_collection: 10,
    scheduled: 20,
    collected: 40,
    shipped: 50,
    received: 60,
    analyzing: 80,
    completed: 100,
  };
  return progressMap[status] || 10;
};

export const getSampleProgressColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending_collection: "bg-gray-400",
    scheduled: "bg-yellow-500",
    collected: "bg-purple-500",
    shipped: "bg-indigo-500",
    received: "bg-blue-500",
    analyzing: "bg-orange-500",
    completed: "bg-green-500",
  };
  return colorMap[status] || "bg-gray-400";
};

// Collection method display
export const getCollectionMethodDisplay = (method: string): string => {
  return method === "home" ? "🏠 Lấy mẫu tại nhà" : "🏥 Lấy mẫu tại cơ sở";
};

// Extract participant name from sample notes
export const extractParticipantName = (notes: string): string => {
  if (!notes) return "Chưa xác định";

  if (notes.includes("Sample for")) {
    return notes.split("Sample for ")[1]?.split(" (")[0] || "Chưa xác định";
  }

  return "Chưa xác định";
};

// Tab configuration
export const getTabsConfig = () => [
  { id: "progress", label: "Tiến trình", icon: Clock },
  { id: "details", label: "Thông tin chi tiết", icon: TestTube },
  { id: "participants", label: "Người tham gia", icon: TestTube },
  { id: "samples", label: "Mẫu xét nghiệm", icon: TestTube },
];

// Validation functions
export const hasValidOrderData = (order: any): boolean => {
  return !!(order && (order.orderCode || order.order_code || order.id));
};

export const hasParticipants = (order: any): boolean => {
  return !!(order?.participants && order.participants.length > 0);
};

export const hasSamples = (order: any): boolean => {
  return !!(order?.samples && order.samples.length > 0);
};

// Price formatting (import from service or define here)
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};
