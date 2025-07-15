import axios from "axios";

const API_BASE_URL = "https://dna-service-se1857.onrender.com/dna_service";

// ✅ API Client setup (reuse from orderService pattern)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ✅ Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `💳 Payment API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor with retry
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `✅ Payment API Response: ${response.config.url} - ${response.status}`
    );
    return response;
  },
  async (error) => {
    const config = error.config;
    if (!config.__retryCount) config.__retryCount = 0;

    if (
      config.__retryCount < 2 &&
      (error.code === "ECONNABORTED" || error.response?.status >= 500)
    ) {
      config.__retryCount += 1;
      console.log(
        `🔄 Retrying payment request (${config.__retryCount}/2): ${config.url}`
      );
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * config.__retryCount)
      );
      return apiClient(config);
    }

    console.error(
      "❌ Payment API Error:",
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

// ===== 🏦 INTERFACES =====
export interface VietQRRequest {
  accountNo: string;
  accountName: string;
  acqId: string;
  amount: string;
  addInfo: string;
  template: string;
}

export interface VietQRData {
  qrCode: string;
  qrDataURL: string;
}

export interface VietQRResponse {
  code: string;
  desc: string;
  data: VietQRData;
}

export interface PaymentInfo {
  method: "transfer" | "cash" | "card";
  amount: number;
  orderCode: string;
  customerName?: string;
}

export interface QRCodeResult {
  success: boolean;
  qrCode?: string;
  qrDataURL?: string;
  imageUrl?: string;
  message?: string;
  bankInfo: {
    accountNo: string;
    accountName: string;
    bankCode: string;
    amount: string;
    content: string;
  };
}

// ===== 💳 PAYMENT SERVICE CLASS =====
class PaymentService {
  // ===== 🔧 CONSTANTS =====
  private readonly FIXED_BANK_INFO = {
    accountNo: "00001427469",
    accountName: "VO TRUONG THANH PHAT",
    acqId: "970423", // Vietcombank bank code
    template: "compact",
  } as const;

  private readonly PAYMENT_CONFIG = {
    minAmount: 1000, // Minimum 1,000 VND
    maxAmount: 500000000, // Maximum 500M VND
    defaultTimeout: 30000,
    retryAttempts: 3,
  } as const;

  // ===== 🧮 VALIDATION METHODS =====
  validateAmount(amount: number): { isValid: boolean; message?: string } {
    if (!amount || isNaN(amount)) {
      return { isValid: false, message: "Số tiền không hợp lệ" };
    }

    if (amount < this.PAYMENT_CONFIG.minAmount) {
      return {
        isValid: false,
        message: `Số tiền tối thiểu là ${this.formatCurrency(
          this.PAYMENT_CONFIG.minAmount
        )}`,
      };
    }

    if (amount > this.PAYMENT_CONFIG.maxAmount) {
      return {
        isValid: false,
        message: `Số tiền tối đa là ${this.formatCurrency(
          this.PAYMENT_CONFIG.maxAmount
        )}`,
      };
    }

    return { isValid: true };
  }

  validateOrderCode(orderCode: string): { isValid: boolean; message?: string } {
    if (!orderCode || orderCode.trim().length === 0) {
      return { isValid: false, message: "Mã đơn hàng không được để trống" };
    }

    // Remove special characters for bank transfer content
    const cleanCode = orderCode.replace(/[^a-zA-Z0-9]/g, "");
    if (cleanCode.length < 3) {
      return { isValid: false, message: "Mã đơn hàng quá ngắn" };
    }

    if (cleanCode.length > 50) {
      return { isValid: false, message: "Mã đơn hàng quá dài" };
    }

    return { isValid: true };
  }

  // ===== 🏷️ FORMATTING METHODS =====
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }

  formatOrderInfo(orderCode: string, customerName?: string): string {
    // Clean order code for bank transfer
    const cleanCode = orderCode.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

    // Create transfer content
    if (customerName) {
      const cleanName = customerName
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .trim()
        .toUpperCase();
      return `THANH TOAN ${cleanCode} ${cleanName}`.substring(0, 50);
    }

    return `THANH TOAN HOA DON ${cleanCode}`.substring(0, 50);
  }

  formatAmountForAPI(amount: number): string {
    // API expects amount as string
    return Math.round(amount).toString();
  }

  // ===== 🎯 MAIN QR GENERATION METHOD =====
  async generateQRCode(
    amount: number,
    orderCode: string,
    customerName?: string
  ): Promise<QRCodeResult> {
    console.log("💳 Generating QR code...", {
      amount,
      orderCode,
      customerName: customerName || "none",
    });

    try {
      // ✅ Step 1: Validate inputs
      const amountValidation = this.validateAmount(amount);
      if (!amountValidation.isValid) {
        return {
          success: false,
          message: amountValidation.message,
          bankInfo: this.getBankInfo(amount, orderCode, customerName),
        };
      }

      const orderValidation = this.validateOrderCode(orderCode);
      if (!orderValidation.isValid) {
        return {
          success: false,
          message: orderValidation.message,
          bankInfo: this.getBankInfo(amount, orderCode, customerName),
        };
      }

      // ✅ Step 2: Prepare API request
      const transferContent = this.formatOrderInfo(orderCode, customerName);
      const apiAmount = this.formatAmountForAPI(amount);

      const requestPayload: VietQRRequest = {
        ...this.FIXED_BANK_INFO,
        amount: apiAmount,
        addInfo: transferContent,
      };

      console.log("📤 QR API Request:", requestPayload);

      // ✅ Step 3: Call API
      const response = await apiClient.post<VietQRResponse>(
        "/qr/generate",
        requestPayload
      );

      console.log("📥 QR API Response:", {
        code: response.data.code,
        desc: response.data.desc,
        hasData: !!response.data.data,
      });

      // ✅ Step 4: Process response
      if (response.data.code === "00" || response.data.code === "200") {
        const qrData = response.data.data;

        if (qrData && (qrData.qrCode || qrData.qrDataURL)) {
          console.log("✅ QR code generated successfully");

          return {
            success: true,
            qrCode: qrData.qrCode,
            qrDataURL: qrData.qrDataURL,
            imageUrl: qrData.qrDataURL, // Use qrDataURL as image source
            message: "QR code tạo thành công",
            bankInfo: this.getBankInfo(amount, orderCode, customerName),
          };
        } else {
          console.warn("⚠️ QR API success but no QR data");
          return {
            success: false,
            message: "Không thể tạo QR code, vui lòng chuyển khoản thủ công",
            bankInfo: this.getBankInfo(amount, orderCode, customerName),
          };
        }
      } else {
        console.warn("⚠️ QR API returned error code:", response.data.code);
        return {
          success: false,
          message: response.data.desc || "Không thể tạo QR code",
          bankInfo: this.getBankInfo(amount, orderCode, customerName),
        };
      }
    } catch (error: any) {
      console.error("❌ QR generation failed:", error);

      // Determine error message
      let errorMessage = "Không thể tạo QR code";

      if (error.code === "ECONNABORTED") {
        errorMessage = "Tạo QR code bị timeout, vui lòng thử lại";
      } else if (error.response?.status === 400) {
        errorMessage = "Thông tin thanh toán không hợp lệ";
      } else if (error.response?.status >= 500) {
        errorMessage = "Hệ thống QR tạm thời bị lỗi";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      return {
        success: false,
        message: errorMessage,
        bankInfo: this.getBankInfo(amount, orderCode, customerName),
      };
    }
  }

  // ===== 📋 BANK INFO METHODS =====
  getBankInfo(amount: number, orderCode: string, customerName?: string) {
    return {
      accountNo: this.FIXED_BANK_INFO.accountNo,
      accountName: this.FIXED_BANK_INFO.accountName,
      bankCode: "VCB", // Vietcombank
      amount: this.formatAmountForAPI(amount),
      content: this.formatOrderInfo(orderCode, customerName),
    };
  }

  getPaymentInstructions(
    amount: number,
    orderCode: string
  ): {
    transfer: string[];
    cash: string[];
    card: string[];
  } {
    const bankInfo = this.getBankInfo(amount, orderCode);

    return {
      transfer: [
        `Chuyển khoản ${this.formatCurrency(amount)} vào:`,
        `🏦 Ngân hàng: Vietcombank`,
        `💳 STK: ${bankInfo.accountNo}`,
        `👤 Chủ TK: ${bankInfo.accountName}`,
        `📝 Nội dung: ${bankInfo.content}`,
        `⚡ Hoặc quét mã QR để chuyển nhanh`,
      ],
      cash: [
        `Thanh toán tiền mặt ${this.formatCurrency(amount)}`,
        `📞 Nhân viên sẽ liên hệ xác nhận`,
        `📍 Thanh toán khi nhận dịch vụ`,
        `💡 Chuẩn bị đúng số tiền để thuận tiện`,
      ],
      card: [
        `Thanh toán thẻ ${this.formatCurrency(amount)}`,
        `💳 Hỗ trợ Visa, Mastercard, JCB`,
        `🔒 Bảo mật 3D Secure`,
        `⚡ Xử lý tự động`,
      ],
    };
  }

  // ===== 🔄 FALLBACK METHODS =====
  getFallbackQRUrl(amount: number, orderCode: string): string {
    // Fallback to old QR generation if API fails
    const bankInfo = this.getBankInfo(amount, orderCode);

    const params = new URLSearchParams({
      accountNumber: bankInfo.accountNo,
      bankCode: "VCB",
      accountName: bankInfo.accountName,
      amount: bankInfo.amount,
    });

    return `${API_BASE_URL}/pay/generate?${params.toString()}`;
  }

  // ===== 🎯 CONVENIENCE METHODS FOR INTEGRATION =====
  async generateOrderQR(orderData: {
    amount: number;
    orderCode: string;
    customerName?: string;
  }): Promise<QRCodeResult> {
    return this.generateQRCode(
      orderData.amount,
      orderData.orderCode,
      orderData.customerName
    );
  }

  async generatePaymentQR(paymentInfo: PaymentInfo): Promise<QRCodeResult> {
    if (paymentInfo.method !== "transfer") {
      return {
        success: false,
        message: "QR code chỉ hỗ trợ cho chuyển khoản",
        bankInfo: this.getBankInfo(paymentInfo.amount, paymentInfo.orderCode),
      };
    }

    return this.generateQRCode(
      paymentInfo.amount,
      paymentInfo.orderCode,
      paymentInfo.customerName
    );
  }

  // ===== 🔍 UTILITY METHODS =====
  getSupportedPaymentMethods(): Array<{
    value: "transfer" | "cash" | "card";
    label: string;
    description: string;
    available: boolean;
  }> {
    return [
      {
        value: "transfer",
        label: "Chuyển khoản",
        description: "Thanh toán qua ngân hàng, có QR code",
        available: true,
      },
      {
        value: "cash",
        label: "Tiền mặt",
        description: "Thanh toán khi nhận dịch vụ",
        available: true,
      },
      {
        value: "card",
        label: "Thẻ tín dụng",
        description: "Thanh toán online (sắp có)",
        available: false,
      },
    ];
  }

  getBankDetails() {
    return {
      bankName: "Ngân hàng Ngoại thương Việt Nam (Vietcombank)",
      bankCode: "VCB",
      accountNumber: this.FIXED_BANK_INFO.accountNo,
      accountName: this.FIXED_BANK_INFO.accountName,
      swiftCode: "BFTV VNVX",
      branch: "Chi nhánh TP.HCM",
    };
  }

  // ===== 📊 DEBUGGING & MONITORING =====
  getServiceStats(): {
    config: typeof this.PAYMENT_CONFIG;
    bankInfo: typeof this.FIXED_BANK_INFO;
    apiUrl: string;
  } {
    return {
      config: this.PAYMENT_CONFIG,
      bankInfo: this.FIXED_BANK_INFO,
      apiUrl: API_BASE_URL,
    };
  }
}

// ===== 🎯 EXPORT SINGLETON INSTANCE =====
export const paymentService = new PaymentService();

// ===== 📚 EXPORT UTILITY FUNCTIONS =====
export const PaymentUtils = {
  formatPrice: (amount: number) => paymentService.formatCurrency(amount),
  validateAmount: (amount: number) => paymentService.validateAmount(amount),
  getBankInfo: (amount: number, orderCode: string) =>
    paymentService.getBankInfo(amount, orderCode),
} as const;
