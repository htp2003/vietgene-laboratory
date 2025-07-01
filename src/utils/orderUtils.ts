// ===== ORDER UTILITIES =====

export const formatPrice = (price: number): string => {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  } catch (error) {
    // Fallback formatting
    return `${price.toLocaleString("vi-VN")}đ`;
  }
};

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    return dateString;
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return dateString;
  }
};

export const generateOrderCode = (orderId: string): string => {
  return `DNA-${orderId.slice(-8).toUpperCase()}`;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ""));
};

export const validateIdentityCard = (idCard: string): boolean => {
  const idRegex = /^[0-9]{9,12}$/;
  return idRegex.test(idCard.replace(/\s+/g, ""));
};

export const sanitizeFormData = (data: any): any => {
  if (typeof data === "string") {
    return data.trim();
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeFormData);
  }

  if (typeof data === "object" && data !== null) {
    const sanitized: any = {};
    for (const key in data) {
      sanitized[key] = sanitizeFormData(data[key]);
    }
    return sanitized;
  }

  return data;
};

export const getOrderStatusBadge = (status: string) => {
  const statusMap: Record<
    string,
    { label: string; color: string; bgColor: string }
  > = {
    pending: {
      label: "Chờ xử lý",
      color: "text-yellow-800",
      bgColor: "bg-yellow-100",
    },
    confirmed: {
      label: "Đã xác nhận",
      color: "text-blue-800",
      bgColor: "bg-blue-100",
    },
    processing: {
      label: "Đang xử lý",
      color: "text-purple-800",
      bgColor: "bg-purple-100",
    },
    completed: {
      label: "Hoàn thành",
      color: "text-green-800",
      bgColor: "bg-green-100",
    },
    cancelled: {
      label: "Đã hủy",
      color: "text-red-800",
      bgColor: "bg-red-100",
    },
  };

  return statusMap[status] || statusMap.pending;
};

export const getPaymentStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    paid: { label: "Đã thanh toán", color: "text-green-600" },
    pending: { label: "Chờ thanh toán", color: "text-yellow-600" },
    failed: { label: "Thanh toán thất bại", color: "text-red-600" },
  };

  return statusMap[status] || statusMap.pending;
};

export const calculateOrderProgress = (status: string): number => {
  const progressMap: Record<string, number> = {
    pending: 10,
    confirmed: 25,
    kit_sent: 40,
    sample_collected: 60,
    processing: 80,
    completed: 100,
    cancelled: 0,
  };

  return progressMap[status] || 0;
};

export const getDayName = (dayOfWeek: number): string => {
  const days = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];
  return days[dayOfWeek] || `Ngày ${dayOfWeek}`;
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

export const addBusinessDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  let addedDays = 0;

  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    if (!isWeekend(result)) {
      addedDays++;
    }
  }

  return result;
};

export const getMinAppointmentDate = (): string => {
  // Minimum appointment date is tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};

export const getMaxAppointmentDate = (): string => {
  // Maximum appointment date is 30 days from now
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  return maxDate.toISOString().split("T")[0];
};
