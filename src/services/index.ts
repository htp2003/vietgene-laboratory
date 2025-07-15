// Export existing services
export { orderService } from "./orderService";
export { ServiceService } from "./serviceService";

// Export new payment service
export { paymentService } from "./paymentService";
export type {
  VietQRRequest,
  VietQRResponse,
  PaymentInfo,
  PaymentStatus,
} from "./paymentService";
