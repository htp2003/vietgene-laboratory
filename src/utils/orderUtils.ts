/**
 * Order utilities and helper functions
 */

// Format price to Vietnamese currency
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// Get Vietnamese day name
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
  return days[dayOfWeek] || "Không xác định";
};

// Format date to Vietnamese format
export const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

// Format date with time
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Validation functions
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

// Customer info validation
export const validateCustomerInfo = (customerInfo: any): boolean => {
  return !!(
    customerInfo.fullName &&
    customerInfo.phone &&
    validatePhone(customerInfo.phone) &&
    customerInfo.email &&
    validateEmail(customerInfo.email) &&
    customerInfo.address &&
    customerInfo.identityCard &&
    validateIdentityCard(customerInfo.identityCard)
  );
};

// Participants validation
export const validateParticipants = (participants: any[]): boolean => {
  if (participants.length < 2) return false;

  return participants.every(
    (p) =>
      p.name?.trim() &&
      p.relationship?.trim() &&
      p.age &&
      Number(p.age) > 0 &&
      Number(p.age) <= 150
  );
};

// Collection method validation
export const validateCollectionMethod = (serviceInfo: any): boolean => {
  if (serviceInfo.collectionMethod === "facility") {
    return !!(
      serviceInfo.doctorId &&
      serviceInfo.timeSlotId &&
      serviceInfo.appointmentDate
    );
  }
  return true; // Home collection doesn't need additional validation
};

// Payment method validation
export const validatePaymentMethod = (paymentInfo: any): boolean => {
  return !!(
    paymentInfo.method &&
    (paymentInfo.method === "cash" || paymentInfo.method === "transfer")
  );
};

// Generate order code
export const generateOrderCode = (orderId: string): string => {
  return "DNA-" + orderId.slice(-8).toUpperCase();
};

// Get doctor display name
export const getDoctorDisplayName = (doctor: any): string => {
  return (
    doctor.doctorName ||
    doctor.name ||
    `Bác sĩ ${doctor.doctorCode || doctor.code || "N/A"}`
  );
};

// Get collection method display text
export const getCollectionMethodText = (method: string): string => {
  return method === "home" ? "Lấy mẫu tại nhà" : "Lấy mẫu tại cơ sở";
};

// Get payment method display text
export const getPaymentMethodText = (method: string): string => {
  const methods: { [key: string]: string } = {
    transfer: "Chuyển khoản",
    cash: "Tiền mặt",
  };
  return methods[method] || method;
};

// Calculate age from birth year
export const calculateAge = (birthYear: number): number => {
  return new Date().getFullYear() - birthYear;
};

// Get relationship options
export const getRelationshipOptions = (): string[] => {
  return ["Cha", "Mẹ", "Con", "Anh/Chị", "Em", "Ông", "Bà", "Cháu", "Khác"];
};

// Sanitize participant name for payment reference
export const sanitizeNameForPayment = (name: string): string => {
  return name.replace(/\s+/g, "").toUpperCase();
};

// Check if date is in the future
export const isFutureDate = (dateString: string): boolean => {
  const selectedDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate >= today;
};

// Format currency without symbol (for calculations)
export const parsePrice = (priceString: string): number => {
  return Number(priceString.replace(/[^\d]/g, ""));
};

// Generate payment reference
export const generatePaymentReference = (
  customerName: string,
  orderId?: string
): string => {
  const sanitizedName = sanitizeNameForPayment(customerName);
  const orderSuffix = orderId
    ? orderId.slice(-4)
    : Date.now().toString().slice(-4);
  return `DNA-${sanitizedName}-${orderSuffix}`;
};
