import axios from "axios";

const API_BASE_URL = "https://dna-service-se1857.onrender.com/dna_service";

// ✅ OPTIMIZED: API Client setup with CORS fixes
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ✅ CORS FIX: Better request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ CORS FIX: Minimize headers to avoid preflight
    if (config.method?.toLowerCase() === "get") {
      config.headers = {
        ...(token && { Authorization: `Bearer ${token}` }),
        Accept: "application/json",
      };
      delete config.headers["Content-Type"];
    } else {
      config.headers = {
        ...(token && { Authorization: `Bearer ${token}` }),
        "Content-Type": "application/json",
        Accept: "application/json",
      };
    }

    console.log(
      `🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// ✅ Response interceptor with retry logic
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    const config = error.config;

    if (!config.__retryCount) {
      config.__retryCount = 0;
    }

    if (
      config.__retryCount < 2 &&
      (error.code === "ECONNABORTED" || error.response?.status >= 500)
    ) {
      config.__retryCount += 1;
      console.log(
        `🔄 Retrying request (${config.__retryCount}/2): ${config.url}`
      );
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * config.__retryCount)
      );
      return apiClient(config);
    }

    console.error("❌ API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ✅ V12 INTERFACES
export interface Doctor {
  userId: string;
  doctorId: string;
  doctorCode: string;
  doctorName: string;
  doctorEmail: string;
  doctorPhone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: string;
  doctorId: string;
}

// ✅ V12: Sample interface
export interface Sample {
  id: string;
  sample_code: string;
  sample_type: string;
  collection_date?: string;
  received_date?: string;
  status: string;
  shipping_tracking?: string;
  notes?: string;
  sample_quality?: string;
  userId: string;
  sampleKitsId: string;
}

// ✅ V12: SampleKit interface
export interface SampleKit {
  id: string;
  kit_code: string;
  kit_type: string;
  status: string;
  shipper_data?: string;
  delivered_date?: string;
  tracking_number?: number;
  shipping_address: string;
  expiry_date?: string;
  instruction?: string;
  createdAt: string;
  updatedAt?: string;
  order_participants_id: string;
  samplesId: string;
  userId: string;
  orderId: string;
}

export interface CreateOrderRequest {
  customerInfo: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    identityCard: string;
  };
  serviceInfo: {
    serviceId: string;
    quantity: number;
    collectionMethod: "home" | "facility";
    appointmentDate?: string;
    appointmentTime?: string;
    doctorId?: string;
    timeSlotId?: string;
    notes?: string;
  };
  participantInfo: {
    participants: Array<{
      name: string;
      relationship: string;
      age: string;
    }>;
  };
  paymentInfo: {
    method: "cash" | "card" | "transfer";
  };
}
class OrderService {
  // ===== UTILITY METHODS =====
  private getCurrentUserId(): string {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.id || "unknown-user";
    } catch {
      return "unknown-user";
    }
  }

  private generateUniqueCode(prefix: string, orderId?: string): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const orderSuffix = orderId ? orderId.slice(-4) : "";
    return `${prefix}_${timestamp}_${random}_${orderSuffix}`;
  }

  private async handleUserRegistration(userData: {
    fullName: string;
    phone: string;
    email: string;
  }): Promise<string> {
    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      console.log("🔍 Current user:", currentUser);

      if (currentUser.id && token) {
        console.log("✅ Using current logged in user:", currentUser.id);
        return currentUser.id;
      }

      console.log("⚠️ No user logged in, creating guest order");
      return "guest_user_" + Date.now();
    } catch (error: any) {
      console.error("❌ User handling failed:", error);
      return "guest_user_" + Date.now();
    }
  }

  // ===== DOCTOR METHODS =====
  async getAllDoctors(): Promise<Doctor[]> {
    try {
      console.log("🔍 Fetching doctors from API...");
      const startTime = Date.now();

      const response = await apiClient.get("/doctors");

      console.log(`✅ Doctors API completed in ${Date.now() - startTime}ms`);

      if (response.data.code === 200) {
        const doctors = response.data.result || [];
        console.log("✅ Doctors loaded:", doctors.length);
        return doctors.filter((doctor: Doctor) => doctor.isActive !== false);
      }

      throw new Error("Failed to fetch doctors");
    } catch (error: any) {
      console.error(
        "❌ Doctors API failed:",
        error.response?.data || error.message
      );
      throw new Error("Không thể tải danh sách bác sĩ. Vui lòng thử lại sau.");
    }
  }

  async getDoctorTimeSlots(doctorId: string): Promise<TimeSlot[]> {
    try {
      console.log("🔍 Fetching time slots for doctor:", doctorId);
      const startTime = Date.now();

      const response = await apiClient.get(
        `/doctor-time-slots/doctor/${doctorId}`
      );

      console.log(`✅ Time slots API completed in ${Date.now() - startTime}ms`);

      if (response.data.code === 200) {
        const timeSlots = response.data.result || [];
        console.log("✅ Time slots loaded:", timeSlots.length);
        return timeSlots.filter((slot: TimeSlot) => slot.isAvailable);
      }

      throw new Error("Failed to fetch time slots");
    } catch (error: any) {
      console.error(
        "❌ Time slots API failed:",
        error.response?.data || error.message
      );
      throw new Error(
        "Không thể tải lịch khám của bác sĩ. Vui lòng thử lại sau."
      );
    }
  }

  // ===== CORE ORDER METHODS =====
  async createOrder(orderData: {
    customerId: string;
    serviceId: string;
    quantity: number;
    collectionMethod: "home" | "facility";
    notes?: string;
  }): Promise<{ orderId: string }> {
    try {
      const startTime = Date.now();
      const now = new Date().toISOString();

      // ✅ V12: Payload with collection_method
      const orderPayload = {
        order_code: Math.floor(Math.random() * 900000) + 100000,
        status: "pending",
        total_amount: 2500000 * orderData.quantity,
        collection_method: orderData.collectionMethod,
        payment_method: "transfer",
        payment_status: "pending",
        payment_date: null,
        transaction_id: null,
        notes: orderData.notes || "",
        createdAt: now,
        updatedAt: now,
      };

      console.log("📤 Creating order (V12):", orderPayload);
      const response = await apiClient.post("/orders", orderPayload);

      console.log(`✅ Order creation completed in ${Date.now() - startTime}ms`);

      if (response.data.code === 200) {
        const orderId = response.data.result.orderId || response.data.result.id;
        console.log("✅ Order created:", orderId);
        return { orderId };
      }

      throw new Error(
        `Order creation failed: ${response.data.message || "Unknown error"}`
      );
    } catch (error: any) {
      console.error("❌ Order creation error:", error.response?.data);
      throw new Error(
        "Không thể tạo đơn hàng: " +
          (error.response?.data?.message || error.message)
      );
    }
  }

  async createOrderDetail(
    orderId: string,
    serviceId: string,
    orderDetailData: {
      quantity: number;
      unitPrice: number;
      notes?: string;
    }
  ): Promise<{ orderDetailId: string }> {
    try {
      const startTime = Date.now();

      const payload = {
        quantity: orderDetailData.quantity,
        unit_price: orderDetailData.unitPrice,
        subtotal: orderDetailData.quantity * orderDetailData.unitPrice,
        note: orderDetailData.notes || "",
      };

      console.log("📤 Creating order detail:", payload);
      const response = await apiClient.post(
        `/order-details/${orderId}/${serviceId}`,
        payload
      );

      console.log(
        `✅ Order detail creation completed in ${Date.now() - startTime}ms`
      );

      if (response.data.code === 200) {
        console.log("✅ Order detail created:", response.data.result.id);
        return { orderDetailId: response.data.result.id };
      }

      throw new Error(
        `Order detail creation failed: ${
          response.data.message || "Unknown error"
        }`
      );
    } catch (error: any) {
      console.error("❌ Order detail error:", error.response?.data);
      throw new Error(
        "Không thể tạo chi tiết đơn hàng: " +
          (error.response?.data?.message || error.message)
      );
    }
  }

  async addOrderParticipants(
    orderId: string,
    participants: Array<{
      participantName: string;
      relationship: string;
      age: number;
      notes?: string;
    }>
  ): Promise<{ participantIds: string[] }> {
    try {
      console.log("👥 Adding participants in parallel:", participants.length);
      const startTime = Date.now();

      const participantPromises = participants.map(
        async (participantData, index) => {
          try {
            const payload = {
              participant_name: participantData.participantName,
              relationship: participantData.relationship,
              age: participantData.age,
              note: participantData.notes || "",
            };

            const response = await apiClient.post(
              `/OrderParticipants/${orderId}`,
              payload
            );

            if (response.data.code === 200) {
              console.log(
                `✅ Participant ${index + 1} added:`,
                response.data.result.id
              );
              return response.data.result.id;
            }

            throw new Error(`Participant ${index + 1} creation failed`);
          } catch (error) {
            console.error(`❌ Participant ${index + 1} error:`, error);
            return null;
          }
        }
      );

      const participantIds = await Promise.allSettled(participantPromises);
      const successfulIds = participantIds
        .filter((result) => result.status === "fulfilled" && result.value)
        .map((result) => (result as PromiseFulfilledResult<string>).value);

      console.log(
        `✅ Participants creation completed in ${Date.now() - startTime}ms`
      );
      console.log(
        `✅ ${successfulIds.length}/${participants.length} participants added successfully`
      );

      return { participantIds: successfulIds };
    } catch (error: any) {
      console.error("❌ Participants batch error:", error);
      throw new Error(
        "Không thể thêm người tham gia: " + (error.message || "Unknown error")
      );
    }
  }

  async createAppointment(
    orderId: string,
    appointmentData: {
      appointmentDate: string;
      appointmentTime: string;
      doctorId: string;
      timeSlotId: string;
      notes?: string;
    }
  ): Promise<{ appointmentId: string }> {
    try {
      const startTime = Date.now();

      const payload = {
        appointment_date: appointmentData.appointmentDate + "T03:24:55.300Z",
        appointment_type: "Gặp để tư vấn",
        status: true,
        notes: appointmentData.notes || "không có",
        doctor_time_slot: appointmentData.timeSlotId,
      };

      console.log("📤 Creating appointment:", payload);
      const response = await apiClient.post(`/appointment/${orderId}`, payload);

      console.log(
        `✅ Appointment creation completed in ${Date.now() - startTime}ms`
      );

      if (response.data.code === 200) {
        console.log("✅ Appointment created:", response.data.result.id);
        return { appointmentId: response.data.result.id };
      }

      throw new Error(`Appointment creation failed: ${response.data.message}`);
    } catch (error: any) {
      console.error("❌ Appointment creation failed:", error.response?.data);
      throw new Error(
        "Không thể tạo lịch hẹn: " +
          (error.response?.data?.message || error.message)
      );
    }
  }

  async processPayment(
    orderId: string,
    paymentData: {
      method: "cash" | "card" | "transfer";
      amount: number;
    }
  ): Promise<{ success: boolean; transactionId?: string; message: string }> {
    console.log("💳 Processing payment...");
    const startTime = Date.now();

    const messages = {
      transfer: `Vui lòng chuyển khoản ${new Intl.NumberFormat("vi-VN").format(
        paymentData.amount
      )}đ vào:\n\n🏦 Ngân hàng: Vietcombank\n💳 STK: 1234567890\n👤 Chủ TK: VIET GENE LAB\n📝 Nội dung: ORDER${orderId.slice(
        -6
      )}`,
      cash: "Thanh toán tiền mặt khi nhận dịch vụ. Nhân viên sẽ liên hệ xác nhận thời gian.",
      card: "Thanh toán thẻ tín dụng đang được xử lý. Bạn sẽ nhận được thông báo qua email.",
    };

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Update order payment info
    const updatePayload = {
      payment_method: paymentData.method,
      payment_status: paymentData.method === "cash" ? "pending" : "paid",
      total_amount: paymentData.amount,
    };

    console.log("📤 Updating order payment info:", updatePayload);
    apiClient
      .put(`/orders/${orderId}`, updatePayload)
      .catch((error) =>
        console.warn("⚠️ Could not update order payment info:", error)
      );

    console.log(
      `✅ Payment processing completed in ${Date.now() - startTime}ms`
    );

    return {
      success: true,
      transactionId: "TXN_" + Date.now(),
      message: messages[paymentData.method],
    };
  }
  // ===== SAMPLE KIT METHODS =====
  // ===== FIXED SAMPLE KIT CREATION METHOD =====
  async createSampleKitsForOrder(
    orderId: string,
    participantIds: string[],
    participants: Array<{ name: string; relationship: string; age: string }>,
    shippingAddress: string,
    collectionMethod: "home" | "facility" = "home"
  ): Promise<SampleKit[]> {
    console.log("📦 Creating sample kits with multiple strategies...");

    const createdKits: SampleKit[] = [];
    const errors: string[] = [];

    for (let i = 0; i < participantIds.length; i++) {
      const participantId = participantIds[i];
      const participant = participants[i];

      console.log(
        `🧪 Creating kit ${i + 1}/${participantIds.length} for: ${
          participant.name
        }`
      );

      // ✅ STRATEGY 1: Direct fetch (như Swagger)
      const success = await this.createSampleKitStrategy1(
        orderId,
        participantId,
        participant,
        shippingAddress,
        createdKits,
        errors
      );

      if (success) continue;

      // ✅ STRATEGY 2: Raw axios (bypass interceptors)
      const success2 = await this.createSampleKitStrategy2(
        orderId,
        participantId,
        participant,
        shippingAddress,
        createdKits,
        errors
      );

      if (success2) continue;

      // ✅ STRATEGY 3: ApiClient với headers tùy chỉnh
      const success3 = await this.createSampleKitStrategy3(
        orderId,
        participantId,
        participant,
        shippingAddress,
        createdKits,
        errors
      );

      if (!success3) {
        console.error(`❌ All strategies failed for participant ${i + 1}`);
      }
    }

    console.log(
      `✅ Created ${createdKits.length}/${participantIds.length} sample kits`
    );
    if (errors.length > 0) {
      console.warn("⚠️ Some kits failed:", errors);
    }

    return createdKits;
  }

  // ===== STRATEGY 1: Direct fetch (Exactly like Swagger) =====
  private async createSampleKitStrategy1(
    orderId: string,
    participantId: string,
    participant: any,
    shippingAddress: string,
    createdKits: SampleKit[],
    errors: string[]
  ): Promise<boolean> {
    try {
      console.log("🎯 Strategy 1: Direct fetch (Swagger style)");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      // ✅ EXACT payload như trong Swagger của bạn
      const payload = {
        kit_code: `KIT_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 5)}`,
        kit_type: "Hair", // Giống hệt Swagger
        status: "string", // Giống hệt Swagger (không phải "ordered")
        shipper_data: "exxxx", // Giống hệt Swagger
        delivered_date: "2025-07-08T10:16:39.001Z", // Giống hệt Swagger
        tracking_number: 0, // Giống hệt Swagger
        shipping_address: "idk", // Giống hệt Swagger
        expiry_date: "2025-07-08T10:16:39.001Z", // Giống hệt Swagger
        instruction: "plzplz", // Giống hệt Swagger
        order_participants_id: participantId,
        orderId: orderId,
      };

      console.log("📤 Strategy 1 payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(
        "https://dna-service-se1857.onrender.com/dna_service/sample-kits",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            // ✅ Thêm headers có thể cần thiết
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log(
        `📊 Strategy 1 response: ${response.status} ${response.statusText}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Strategy 1 failed:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Strategy 1 success:", data);

      if (data.code === 200 && data.result) {
        createdKits.push(data.result);
        return true;
      }

      throw new Error(`Unexpected response: ${JSON.stringify(data)}`);
    } catch (error: any) {
      console.error("❌ Strategy 1 error:", error.message);
      errors.push(`Strategy 1: ${error.message}`);
      return false;
    }
  }

  // ===== STRATEGY 2: Raw axios (No interceptors) =====
  private async createSampleKitStrategy2(
    orderId: string,
    participantId: string,
    participant: any,
    shippingAddress: string,
    createdKits: SampleKit[],
    errors: string[]
  ): Promise<boolean> {
    try {
      console.log("🎯 Strategy 2: Raw axios (bypass interceptors)");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      // ✅ Payload realistic nhưng không có samplesId (để staff tạo sau)
      const payload = {
        kit_code: `KIT_${participant.name.replace(/\s+/g, "_")}_${Date.now()}`,
        kit_type: "Hair",
        status: "ordered",
        shipper_data: "Giao hàng nhanh",
        delivered_date: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        tracking_number: Math.floor(Math.random() * 1000000),
        shipping_address: shippingAddress,
        expiry_date: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        instruction: `Hướng dẫn cho ${participant.name}. Rửa tay trước khi thu mẫu, không ăn uống 30 phút trước đó.`,
        order_participants_id: participantId,
        orderId: orderId,
        // ✅ Không có samplesId - để staff tạo sample sau
      };

      console.log("📤 Strategy 2 payload:", JSON.stringify(payload, null, 2));

      const response = await axios.post(
        "https://dna-service-se1857.onrender.com/dna_service/sample-kits",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          timeout: 30000,
        }
      );

      console.log(`📊 Strategy 2 response: ${response.status}`);

      if (response.data.code === 200 && response.data.result) {
        console.log("✅ Strategy 2 success:", response.data);
        createdKits.push(response.data.result);
        return true;
      }

      throw new Error(`Unexpected response: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      console.error(
        "❌ Strategy 2 error:",
        error.response?.data || error.message
      );
      errors.push(
        `Strategy 2: ${error.response?.data?.message || error.message}`
      );
      return false;
    }
  }

  // ===== STRATEGY 3: ApiClient với custom headers =====
  private async createSampleKitStrategy3(
    orderId: string,
    participantId: string,
    participant: any,
    shippingAddress: string,
    createdKits: SampleKit[],
    errors: string[]
  ): Promise<boolean> {
    try {
      console.log("🎯 Strategy 3: ApiClient with custom headers");

      // ✅ Minimal payload - chỉ những field cần thiết, không có samplesId
      const payload = {
        kit_code: `SIMPLE_${Date.now()}`,
        kit_type: "Hair",
        status: "ordered",
        shipping_address: shippingAddress || "Địa chỉ khách hàng",
        instruction: `Kit cho ${participant.name}`,
        order_participants_id: participantId,
        orderId: orderId,
        // ✅ Không có samplesId - staff sẽ tạo sample sau
      };

      console.log("📤 Strategy 3 payload:", JSON.stringify(payload, null, 2));

      const response = await apiClient.post("/sample-kits", payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        timeout: 30000,
      });

      console.log(`📊 Strategy 3 response: ${response.status}`);

      if (response.data.code === 200 && response.data.result) {
        console.log("✅ Strategy 3 success:", response.data);
        createdKits.push(response.data.result);
        return true;
      }

      throw new Error(`Unexpected response: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      console.error(
        "❌ Strategy 3 error:",
        error.response?.data || error.message
      );
      errors.push(
        `Strategy 3: ${error.response?.data?.message || error.message}`
      );
      return false;
    }
  }

  // ===== DEBUG METHOD: Test specific payload =====
  async testExactSwaggerPayload(): Promise<void> {
    console.log("🧪 Testing EXACT Swagger payload...");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No token found");
        return;
      }

      // ✅ Copy chính xác payload từ Swagger của bạn
      const exactPayload = {
        kit_code: "kitmare",
        kit_type: "asidata",
        status: "string",
        shipper_data: "exxxx",
        delivered_date: "2025-07-08T10:16:39.001Z",
        tracking_number: 0,
        shipping_address: "idk",
        expiry_date: "2025-07-08T10:16:39.001Z",
        instruction: "plzplz",
        order_participants_id: "983bc054-3130-46ea-9558-31dd03715a62",
        orderId: "60b60d02-904a-4d88-9e7d-f5f42fece546",
      };

      console.log(
        "📤 Exact Swagger test payload:",
        JSON.stringify(exactPayload, null, 2)
      );

      // Test with multiple methods
      const methods = [
        () =>
          fetch(
            "https://dna-service-se1857.onrender.com/dna_service/sample-kits",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(exactPayload),
            }
          ),

        () =>
          axios.post(
            "https://dna-service-se1857.onrender.com/dna_service/sample-kits",
            exactPayload,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          ),

        () => apiClient.post("/sample-kits", exactPayload),
      ];

      for (let i = 0; i < methods.length; i++) {
        try {
          console.log(`🧪 Testing method ${i + 1}...`);
          const response = await methods[i]();
          console.log(`✅ Method ${i + 1} SUCCESS:`, response);
        } catch (error: any) {
          console.error(
            `❌ Method ${i + 1} FAILED:`,
            error.response?.data || error.message
          );
        }
      }
    } catch (error: any) {
      console.error("❌ Test failed:", error);
    }
  }

  // ===== STRATEGY 1: Direct fetch (Exactly like Swagger) =====
  private async createSampleKitStrategy1(
    orderId: string,
    participantId: string,
    participant: any,
    shippingAddress: string,
    createdKits: SampleKit[],
    errors: string[]
  ): Promise<boolean> {
    try {
      console.log("🎯 Strategy 1: Direct fetch (Swagger style)");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      // ✅ EXACT payload như trong Swagger của bạn
      const payload = {
        kit_code: `KIT_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 5)}`,
        kit_type: "Hair", // Giống hệt Swagger
        status: "string", // Giống hệt Swagger (không phải "ordered")
        shipper_data: "exxxx", // Giống hệt Swagger
        delivered_date: "2025-07-08T10:16:39.001Z", // Giống hệt Swagger
        tracking_number: 0, // Giống hệt Swagger
        shipping_address: "idk", // Giống hệt Swagger
        expiry_date: "2025-07-08T10:16:39.001Z", // Giống hệt Swagger
        instruction: "plzplz", // Giống hệt Swagger
        order_participants_id: participantId,
        orderId: orderId,
      };

      console.log("📤 Strategy 1 payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(
        "https://dna-service-se1857.onrender.com/dna_service/sample-kits",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            // ✅ Thêm headers có thể cần thiết
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log(
        `📊 Strategy 1 response: ${response.status} ${response.statusText}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Strategy 1 failed:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Strategy 1 success:", data);

      if (data.code === 200 && data.result) {
        createdKits.push(data.result);
        return true;
      }

      throw new Error(`Unexpected response: ${JSON.stringify(data)}`);
    } catch (error: any) {
      console.error("❌ Strategy 1 error:", error.message);
      errors.push(`Strategy 1: ${error.message}`);
      return false;
    }
  }

  // ===== STRATEGY 2: Raw axios (No interceptors) =====
  private async createSampleKitStrategy2(
    orderId: string,
    participantId: string,
    participant: any,
    shippingAddress: string,
    createdKits: SampleKit[],
    errors: string[]
  ): Promise<boolean> {
    try {
      console.log("🎯 Strategy 2: Raw axios (bypass interceptors)");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      // ✅ Thử payload khác (more realistic)
      const payload = {
        kit_code: `KIT_${participant.name.replace(/\s+/g, "_")}_${Date.now()}`,
        kit_type: "Hair",
        status: "ordered", // Thử status khác
        shipper_data: "Giao hàng nhanh",
        delivered_date: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        tracking_number: Math.floor(Math.random() * 1000000),
        shipping_address: shippingAddress,
        expiry_date: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        instruction: `Hướng dẫn cho ${participant.name}`,
        order_participants_id: participantId,
        orderId: orderId,
      };

      console.log("📤 Strategy 2 payload:", JSON.stringify(payload, null, 2));

      const response = await axios.post(
        "https://dna-service-se1857.onrender.com/dna_service/sample-kits",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          timeout: 30000,
        }
      );

      console.log(`📊 Strategy 2 response: ${response.status}`);

      if (response.data.code === 200 && response.data.result) {
        console.log("✅ Strategy 2 success:", response.data);
        createdKits.push(response.data.result);
        return true;
      }

      throw new Error(`Unexpected response: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      console.error(
        "❌ Strategy 2 error:",
        error.response?.data || error.message
      );
      errors.push(
        `Strategy 2: ${error.response?.data?.message || error.message}`
      );
      return false;
    }
  }

  // ===== STRATEGY 3: ApiClient với custom headers =====
  private async createSampleKitStrategy3(
    orderId: string,
    participantId: string,
    participant: any,
    shippingAddress: string,
    createdKits: SampleKit[],
    errors: string[]
  ): Promise<boolean> {
    try {
      console.log("🎯 Strategy 3: ApiClient with custom headers");

      // ✅ Simplified payload
      const payload = {
        kit_code: `SIMPLE_${Date.now()}`,
        kit_type: "Hair",
        status: "string",
        order_participants_id: participantId,
        orderId: orderId,
      };

      console.log("📤 Strategy 3 payload:", JSON.stringify(payload, null, 2));

      const response = await apiClient.post("/sample-kits", payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        timeout: 30000,
      });

      console.log(`📊 Strategy 3 response: ${response.status}`);

      if (response.data.code === 200 && response.data.result) {
        console.log("✅ Strategy 3 success:", response.data);
        createdKits.push(response.data.result);
        return true;
      }

      throw new Error(`Unexpected response: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      console.error(
        "❌ Strategy 3 error:",
        error.response?.data || error.message
      );
      errors.push(
        `Strategy 3: ${error.response?.data?.message || error.message}`
      );
      return false;
    }
  }

  // ===== DEBUG METHOD: Test specific payload =====
  async testExactSwaggerPayload(): Promise<void> {
    console.log("🧪 Testing EXACT Swagger payload...");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No token found");
        return;
      }

      // ✅ Copy chính xác payload từ Swagger của bạn
      const exactPayload = {
        kit_code: "kitmare",
        kit_type: "asidata",
        status: "string",
        shipper_data: "exxxx",
        delivered_date: "2025-07-08T10:16:39.001Z",
        tracking_number: 0,
        shipping_address: "idk",
        expiry_date: "2025-07-08T10:16:39.001Z",
        instruction: "plzplz",
        order_participants_id: "983bc054-3130-46ea-9558-31dd03715a62",
        orderId: "60b60d02-904a-4d88-9e7d-f5f42fece546",
      };

      console.log(
        "📤 Exact Swagger test payload:",
        JSON.stringify(exactPayload, null, 2)
      );

      // Test with multiple methods
      const methods = [
        () =>
          fetch(
            "https://dna-service-se1857.onrender.com/dna_service/sample-kits",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(exactPayload),
            }
          ),

        () =>
          axios.post(
            "https://dna-service-se1857.onrender.com/dna_service/sample-kits",
            exactPayload,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          ),

        () => apiClient.post("/sample-kits", exactPayload),
      ];

      for (let i = 0; i < methods.length; i++) {
        try {
          console.log(`🧪 Testing method ${i + 1}...`);
          const response = await methods[i]();
          console.log(`✅ Method ${i + 1} SUCCESS:`, response);
        } catch (error: any) {
          console.error(
            `❌ Method ${i + 1} FAILED:`,
            error.response?.data || error.message
          );
        }
      }
    } catch (error: any) {
      console.error("❌ Test failed:", error);
    }
  }

  async createSamplesForKits(sampleKits: SampleKit[]): Promise<Sample[]> {
    try {
      console.log("🧬 Creating samples for kits:", sampleKits.length);
      const startTime = Date.now();
      const userId = this.getCurrentUserId();

      const samplePromises = sampleKits.map(async (kit, index) => {
        try {
          const sampleCode = kit.kit_code.replace("KIT_", "SAMPLE_");

          // ✅ V12: Payload without collection_method
          const payload = {
            sample_code: sampleCode,
            sample_type: "DNA",
            collection_date: null,
            received_date: null,
            status: "pending",
            shipping_tracking: "",
            notes: `Sample for kit ${kit.kit_code}`,
            sample_quality: "",
            userId: userId,
            sampleKitsId: kit.id,
          };

          console.log(
            `🧬 Creating sample ${index + 1}/${sampleKits.length} for kit: ${
              kit.kit_code
            }`
          );

          const response = await apiClient.post("/samples", payload, {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });

          if (response.data.code === 200) {
            const sample = response.data.result;
            console.log(`✅ Sample ${index + 1} created:`, sample.id);

            // Update kit with sample ID
            this.updateSampleKitWithSampleId(kit.id, sample.id).catch((err) =>
              console.warn("⚠️ Could not update kit with sample ID:", err)
            );

            return sample;
          }

          throw new Error(`Sample creation failed for kit ${kit.kit_code}`);
        } catch (error: any) {
          console.error(
            `❌ Sample creation error for kit ${index + 1}:`,
            error
          );
          return null;
        }
      });

      const sampleResults = await Promise.allSettled(samplePromises);
      const successfulSamples = sampleResults
        .filter((result) => result.status === "fulfilled" && result.value)
        .map((result) => (result as PromiseFulfilledResult<Sample>).value);

      console.log(
        `✅ Samples creation completed in ${Date.now() - startTime}ms`
      );
      console.log(
        `✅ ${successfulSamples.length}/${sampleKits.length} samples created successfully`
      );

      return successfulSamples;
    } catch (error: any) {
      console.error("❌ Error in createSamplesForKits:", error);
      throw new Error("Không thể tạo samples. Vui lòng thử lại.");
    }
  }

  private async updateSampleKitWithSampleId(
    kitId: string,
    sampleId: string
  ): Promise<void> {
    try {
      const cleanSampleId = sampleId.replace(/[\[\]]/g, "");
      await apiClient.put(`/sample-kits/${kitId}`, {
        samplesId: cleanSampleId,
      });
      console.log(
        "✅ Updated kit with clean sample ID:",
        kitId,
        "->",
        cleanSampleId
      );
    } catch (error) {
      console.warn("⚠️ Could not update kit with sample ID:", error);
    }
  }

  private getKitInstructions(
    collectionMethod: string,
    participantName?: string
  ): string {
    const name = participantName || "người tham gia";

    if (collectionMethod === "home") {
      return `Hướng dẫn thu mẫu tại nhà cho ${name}:
1. Rửa tay sạch sẽ trước khi thu mẫu
2. Không ăn uống, đánh răng trong 30 phút trước khi thu mẫu
3. Lấy tăm bông, chà nhẹ vào má trong 10-15 giây
4. Cho tăm bông vào ống đựng mẫu và đậy chặt
5. Ghi tên ${name} lên nhãn
6. Bảo quản ở nhiệt độ phòng, tránh ánh sáng trực tiếp
7. Gửi về phòng lab trong vòng 7 ngày`;
    } else {
      return `Hướng dẫn thu mẫu tại cơ sở cho ${name}:
1. Đến đúng giờ hẹn đã đặt
2. Mang theo CMND/CCCD và giấy tờ liên quan
3. Nhân viên sẽ hướng dẫn và hỗ trợ thu mẫu
4. Mẫu sẽ được xử lý ngay tại phòng lab`;
    }
  }

  // ===== V12 SAMPLE METHODS =====
  async getSamplesByKitId(kitId: string): Promise<Sample[]> {
    try {
      console.log("🔍 V12 Fetching samples for kit:", kitId);
      const startTime = Date.now();

      // ✅ V12: Use new endpoint
      const response = await apiClient.get(`/samples/samplekits/${kitId}`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (response.data.code === 200) {
        const samples = response.data.result || [];
        const totalTime = Date.now() - startTime;
        console.log(
          `✅ V12 Kit samples loaded in ${totalTime}ms:`,
          samples.length
        );
        return samples;
      }

      return [];
    } catch (error: any) {
      console.error(
        "❌ V12 Kit samples API failed:",
        error.response?.data || error.message
      );

      if (error.response?.status === 404) {
        console.log(`📝 No samples found for kit ${kitId} (this is normal)`);
        return [];
      }

      return [];
    }
  }

  async getSamplesByUserId(userId?: string): Promise<Sample[]> {
    try {
      const targetUserId = userId || this.getCurrentUserId();
      console.log("🔍 V12 Fetching samples for user:", targetUserId);
      const startTime = Date.now();

      const response = await apiClient.get(`/samples/user/${targetUserId}`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (response.data.code === 200) {
        const samples = response.data.result || [];
        const totalTime = Date.now() - startTime;
        console.log(
          `✅ V12 User samples loaded in ${totalTime}ms:`,
          samples.length
        );
        return samples;
      }

      return [];
    } catch (error: any) {
      console.error(
        "❌ V12 User samples API failed:",
        error.response?.data || error.message
      );
      return [];
    }
  }

  async getSampleKitsByOrderId(orderId: string): Promise<SampleKit[]> {
    try {
      console.log("🔍 V12 Fetching sample kits for order:", orderId);
      const startTime = Date.now();

      const response = await apiClient.get(`/sample-kits/order/${orderId}`);

      if (response.data.code === 200) {
        const kits = response.data.result || [];
        const totalTime = Date.now() - startTime;
        console.log(
          `✅ V12 Sample kits loaded in ${totalTime}ms:`,
          kits.length
        );
        return kits;
      }

      return [];
    } catch (error: any) {
      console.error(
        "❌ V12 Sample kits API failed:",
        error.response?.data || error.message
      );
      return [];
    }
  }

  async getSampleKitsByParticipantId(
    participantId: string
  ): Promise<SampleKit[]> {
    try {
      console.log(
        "🔍 V12 Fetching sample kits for participant:",
        participantId
      );
      const startTime = Date.now();

      const response = await apiClient.get(
        `/sample-kits/participants/${participantId}`
      );

      if (response.data.code === 200) {
        const kits = response.data.result || [];
        const totalTime = Date.now() - startTime;
        console.log(
          `✅ V12 Participant kits loaded in ${totalTime}ms:`,
          kits.length
        );
        return kits;
      }

      return [];
    } catch (error: any) {
      console.error(
        "❌ V12 Participant kits API failed:",
        error.response?.data || error.message
      );
      return [];
    }
  }

  async updateSampleKitStatus(
    kitId: string,
    status: string,
    updateData?: Partial<SampleKit>
  ): Promise<SampleKit | null> {
    try {
      console.log("🔄 V12 Updating sample kit status:", kitId, status);
      const startTime = Date.now();

      const response = await apiClient.put(`/sample-kits/${kitId}`, {
        status,
        ...updateData,
      });

      if (response.data.code === 200) {
        const totalTime = Date.now() - startTime;
        console.log(`✅ V12 Sample kit updated in ${totalTime}ms`);
        return response.data.result;
      }

      return null;
    } catch (error: any) {
      console.error(
        "❌ Error updating V12 sample kit:",
        error.response?.data || error.message
      );
      return null;
    }
  }

  async updateSampleStatus(
    sampleId: string,
    status: string,
    updateData?: Partial<Sample>
  ): Promise<Sample | null> {
    try {
      console.log("🔄 V12 Updating sample status:", sampleId, status);
      const startTime = Date.now();

      const cleanSampleId = sampleId.replace(/[\[\]]/g, "");
      console.log(`🔧 Cleaned sample ID: ${sampleId} -> ${cleanSampleId}`);

      const response = await apiClient.put(
        `/samples/${cleanSampleId}`,
        {
          status,
          ...updateData,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.code === 200) {
        const totalTime = Date.now() - startTime;
        console.log(`✅ V12 Sample updated in ${totalTime}ms`);
        return response.data.result;
      }

      return null;
    } catch (error: any) {
      console.error(
        "❌ Error updating V12 sample:",
        error.response?.data || error.message
      );
      return null;
    }
  }
  // ===== COMPLETE ORDER FLOW =====
  // ===== UPDATED COMPLETE ORDER FLOW - NO SAMPLE CREATION =====
  async createCompleteOrder(orderData: CreateOrderRequest): Promise<string> {
    console.log("🚀 Starting V12 complete order creation flow...");
    const overallStartTime = Date.now();

    try {
      // Step 1: Handle user registration
      console.log("👤 Step 1: Handling user...");
      const userId = await this.handleUserRegistration(orderData.customerInfo);

      // Step 2: Create main order
      console.log("📦 Step 2: Creating order...");
      const orderResult = await this.createOrder({
        customerId: userId,
        serviceId: orderData.serviceInfo.serviceId,
        quantity: orderData.serviceInfo.quantity,
        collectionMethod: orderData.serviceInfo.collectionMethod,
        notes: orderData.serviceInfo.notes,
      });
      const orderId = orderResult.orderId;

      // ✅ V12: Steps 3-6 run in parallel
      console.log("🚀 Steps 3-6: Parallel processing...");

      const parallelTasks = [
        // Step 3: Add order details
        this.createOrderDetail(orderId, orderData.serviceInfo.serviceId, {
          quantity: orderData.serviceInfo.quantity,
          unitPrice: 2500000,
          notes: orderData.serviceInfo.notes,
        }),

        // Step 4: Add participants
        this.addOrderParticipants(
          orderId,
          orderData.participantInfo.participants.map((p) => ({
            participantName: p.name,
            relationship: p.relationship,
            age: parseInt(p.age),
            notes: "",
          }))
        ),

        // Step 5: Process payment
        this.processPayment(orderId, {
          method: orderData.paymentInfo.method,
          amount: 2500000 * orderData.serviceInfo.quantity,
        }),
      ];

      // ✅ V12: Only add appointment if collection_method is "facility"
      if (
        orderData.serviceInfo.collectionMethod === "facility" &&
        orderData.serviceInfo.appointmentDate &&
        orderData.serviceInfo.doctorId &&
        orderData.serviceInfo.timeSlotId
      ) {
        console.log("📅 Adding appointment task (facility collection)");
        parallelTasks.push(
          this.createAppointment(orderId, {
            appointmentDate: orderData.serviceInfo.appointmentDate,
            appointmentTime: orderData.serviceInfo.appointmentTime || "09:00",
            doctorId: orderData.serviceInfo.doctorId,
            timeSlotId: orderData.serviceInfo.timeSlotId,
            notes: orderData.serviceInfo.notes,
          })
        );
      } else {
        console.log("🏠 Skipping appointment (home collection)");
      }

      const results = await Promise.allSettled(parallelTasks);

      // Check results
      const [
        orderDetailResult,
        participantsResult,
        paymentResult,
        appointmentResult,
      ] = results;

      if (orderDetailResult.status === "fulfilled") {
        console.log("✅ Order details created");
      } else {
        console.warn("⚠️ Order details failed:", orderDetailResult.reason);
      }

      let participantIds: string[] = [];
      if (participantsResult.status === "fulfilled") {
        participantIds = participantsResult.value.participantIds;
        console.log("✅ Participants added:", participantIds.length);
      } else {
        console.warn("⚠️ Participants failed:", participantsResult.reason);
        throw new Error("Failed to create participants");
      }

      if (paymentResult.status === "fulfilled") {
        console.log("✅ Payment processed");
      } else {
        console.warn("⚠️ Payment failed:", paymentResult.reason);
      }

      // Check appointment result only if it was supposed to be created
      if (orderData.serviceInfo.collectionMethod === "facility") {
        if (appointmentResult && appointmentResult.status === "fulfilled") {
          console.log("✅ Appointment created");
        } else {
          console.warn("⚠️ Appointment failed:", appointmentResult?.reason);
        }
      }

      // ✅ V12: Step 6: Create sample kits ONLY (no samples)
      console.log(
        "📦 Step 6: Creating sample kits (staff will create samples later)..."
      );
      let sampleKits: SampleKit[] = [];
      try {
        sampleKits = await this.createSampleKitsForOrder(
          orderId,
          participantIds,
          orderData.participantInfo.participants,
          orderData.customerInfo.address,
          orderData.serviceInfo.collectionMethod
        );
        console.log(
          `✅ ${sampleKits.length} sample kits created (samplesId empty for staff)`
        );

        // ✅ Log kit details for staff reference
        sampleKits.forEach((kit, index) => {
          console.log(
            `📋 Kit ${index + 1}: ${kit.kit_code} → Participant: ${
              orderData.participantInfo.participants[index]?.name
            }`
          );
        });
      } catch (error) {
        console.warn("⚠️ Sample kits creation failed:", error);
        // ✅ Non-critical: Order can continue without kits
      }

      const totalTime = Date.now() - overallStartTime;
      console.log(`🎉 V12 Order creation completed in ${totalTime}ms!`);
      console.log(
        `📊 Summary: Order created with ${participantIds.length} participants and ${sampleKits.length} sample kits`
      );
      console.log(`👨‍⚕️ Next: Staff will create samples based on sample kit IDs`);

      return orderId;
    } catch (error: any) {
      const totalTime = Date.now() - overallStartTime;
      console.error(
        `❌ V12 Order creation failed after ${totalTime}ms:`,
        error
      );
      throw new Error(
        "Có lỗi xảy ra khi tạo đơn hàng: " +
          (error.message || "Vui lòng thử lại sau")
      );
    }
  }

  // ===== REMOVE UNUSED SAMPLE METHODS =====
  // ✅ Bỏ createSamplesForKits method vì staff sẽ tạo
  // ✅ Bỏ updateSampleKitWithSampleId method vì system tự update

  // ===== STAFF WORKFLOW HELPER =====
  async getKitsForStaffProcessing(orderId: string): Promise<{
    order: any;
    participants: any[];
    sampleKits: SampleKit[];
  }> {
    try {
      console.log("👨‍⚕️ Getting kits for staff processing...");

      const [orderResponse, participantsResponse, kitsResponse] =
        await Promise.allSettled([
          apiClient.get(`/orders/${orderId}`),
          apiClient.get(`/OrderParticipants/order/${orderId}`),
          apiClient.get(`/sample-kits/order/${orderId}`),
        ]);

      let order = null;
      let participants = [];
      let sampleKits = [];

      if (orderResponse.status === "fulfilled") {
        order = orderResponse.value.data.result;
      }

      if (participantsResponse.status === "fulfilled") {
        participants = participantsResponse.value.data.result || [];
      }

      if (kitsResponse.status === "fulfilled") {
        sampleKits = kitsResponse.value.data.result || [];
      }

      // ✅ Log for staff
      console.log("📋 Staff Processing Summary:");
      console.log(`- Order: ${order?.order_code || orderId}`);
      console.log(
        `- Collection Method: ${order?.collection_method || "unknown"}`
      );
      console.log(`- Participants: ${participants.length}`);
      console.log(`- Kits to process: ${sampleKits.length}`);

      sampleKits.forEach((kit, index) => {
        const participant = participants[index];
        console.log(
          `  Kit ${index + 1}: ${kit.kit_code} → ${
            participant?.participant_name || "Unknown"
          } (${kit.status})`
        );
      });

      return { order, participants, sampleKits };
    } catch (error: any) {
      console.error("❌ Error getting staff processing data:", error);
      throw new Error("Không thể tải dữ liệu xử lý cho staff");
    }
  }

  // ===== UPDATED GET COMPLETE ORDER DATA =====
  async getCompleteOrderData(orderId: string): Promise<any> {
    try {
      console.log("🔍 V12 Fetching complete order data for:", orderId);
      const startTime = Date.now();

      const [
        orderResponse,
        orderDetailsResponse,
        participantsResponse,
        appointmentsResponse,
        sampleKitsResponse,
      ] = await Promise.allSettled([
        apiClient.get(`/orders/${orderId}`),
        apiClient.get(`/order-details/${orderId}/all`),
        apiClient.get(`/OrderParticipants/order/${orderId}`),
        apiClient.get(`/appointment/all`),
        apiClient.get(`/sample-kits/order/${orderId}`),
      ]);

      let order = null;
      let orderDetails = [];
      let participants = [];
      let appointment = null;
      let sampleKits = [];
      let samples = []; // ✅ Có thể có hoặc không có samples

      // Process Order
      if (
        orderResponse.status === "fulfilled" &&
        orderResponse.value.data.code === 200
      ) {
        order = orderResponse.value.data.result;
        console.log(
          "✅ V12 Order loaded (collection_method:",
          order.collection_method || "not set",
          ")"
        );
      } else {
        throw new Error("Order not found");
      }

      // Process Order Details
      if (
        orderDetailsResponse.status === "fulfilled" &&
        orderDetailsResponse.value.data.code === 200
      ) {
        orderDetails = orderDetailsResponse.value.data.result || [];
        console.log("✅ Order details loaded:", orderDetails.length);
      }

      // Process Participants
      if (
        participantsResponse.status === "fulfilled" &&
        participantsResponse.value.data.code === 200
      ) {
        participants = participantsResponse.value.data.result || [];
        console.log("✅ Participants loaded:", participants.length);
      }

      // Process Appointments
      if (
        appointmentsResponse.status === "fulfilled" &&
        appointmentsResponse.value.data.code === 200
      ) {
        const allAppointments = appointmentsResponse.value.data.result || [];
        appointment = allAppointments.find(
          (app: any) => app.orderId === orderId
        );
        console.log("✅ Appointment found:", !!appointment);
      }

      // Process Sample Kits (V12)
      if (
        sampleKitsResponse.status === "fulfilled" &&
        sampleKitsResponse.value.data.code === 200
      ) {
        sampleKits = sampleKitsResponse.value.data.result || [];
        console.log("✅ Sample kits loaded:", sampleKits.length);

        // ✅ V12: Try to get samples if they exist (staff might have created them)
        if (sampleKits.length > 0) {
          console.log("🧬 V12 Checking for existing samples...");

          const samplePromises = sampleKits.map(async (kit: SampleKit) => {
            try {
              // ✅ Only get samples if kit has samplesId
              if (kit.samplesId && kit.samplesId !== "") {
                console.log(
                  `🔍 Getting samples for kit: ${kit.kit_code} (${kit.id})`
                );
                const kitSamples = await this.getSamplesByKitId(kit.id);
                console.log(
                  `✅ Found ${kitSamples.length} samples for kit ${kit.kit_code}`
                );
                return kitSamples;
              } else {
                console.log(
                  `📋 Kit ${kit.kit_code} has no samples yet (staff needs to create)`
                );
                return [];
              }
            } catch (error: any) {
              console.warn(
                `⚠️ Could not fetch samples for kit ${kit.id}:`,
                error.message
              );
              return [];
            }
          });

          const sampleResults = await Promise.allSettled(samplePromises);
          samples = sampleResults
            .filter((result) => result.status === "fulfilled")
            .flatMap(
              (result) => (result as PromiseFulfilledResult<any[]>).value
            );

          console.log(
            `✅ V12 Total samples loaded: ${samples.length} for ${sampleKits.length} kits`
          );
        }
      }

      const totalTime = Date.now() - startTime;
      console.log(`✅ V12 Complete order data assembled in ${totalTime}ms`);

      return {
        ...order,
        orderDetails,
        participants,
        appointment,
        sampleKits,
        samples, // ✅ May be empty if staff hasn't created samples yet
      };
    } catch (error: any) {
      console.error("❌ Error fetching V12 order data:", error);
      throw new Error(
        "Không thể tải thông tin đơn hàng: " +
          (error.response?.data?.message || error.message)
      );
    }
  }
  // ===== GET ORDER DATA =====
  async getCompleteOrderData(orderId: string): Promise<any> {
    try {
      console.log("🔍 V12 Fetching complete order data for:", orderId);
      const startTime = Date.now();

      const [
        orderResponse,
        orderDetailsResponse,
        participantsResponse,
        appointmentsResponse,
        sampleKitsResponse,
      ] = await Promise.allSettled([
        apiClient.get(`/orders/${orderId}`),
        apiClient.get(`/order-details/${orderId}/all`),
        apiClient.get(`/OrderParticipants/order/${orderId}`),
        apiClient.get(`/appointment/all`),
        apiClient.get(`/sample-kits/order/${orderId}`),
      ]);

      let order = null;
      let orderDetails = [];
      let participants = [];
      let appointment = null;
      let sampleKits = [];
      let samples = [];

      // Process Order
      if (
        orderResponse.status === "fulfilled" &&
        orderResponse.value.data.code === 200
      ) {
        order = orderResponse.value.data.result;
        console.log(
          "✅ V12 Order loaded (collection_method:",
          order.collection_method || "not set",
          ")"
        );
      } else {
        throw new Error("Order not found");
      }

      // Process Order Details
      if (
        orderDetailsResponse.status === "fulfilled" &&
        orderDetailsResponse.value.data.code === 200
      ) {
        orderDetails = orderDetailsResponse.value.data.result || [];
        console.log("✅ Order details loaded:", orderDetails.length);
      }

      // Process Participants
      if (
        participantsResponse.status === "fulfilled" &&
        participantsResponse.value.data.code === 200
      ) {
        participants = participantsResponse.value.data.result || [];
        console.log("✅ Participants loaded:", participants.length);
      }

      // Process Appointments
      if (
        appointmentsResponse.status === "fulfilled" &&
        appointmentsResponse.value.data.code === 200
      ) {
        const allAppointments = appointmentsResponse.value.data.result || [];
        appointment = allAppointments.find(
          (app: any) => app.orderId === orderId
        );
        console.log("✅ Appointment found:", !!appointment);
      }

      // Process Sample Kits & Samples (V12)
      if (
        sampleKitsResponse.status === "fulfilled" &&
        sampleKitsResponse.value.data.code === 200
      ) {
        sampleKits = sampleKitsResponse.value.data.result || [];
        console.log("✅ Sample kits loaded:", sampleKits.length);

        // ✅ V12: Get samples using new endpoint
        if (sampleKits.length > 0) {
          console.log(
            "🧬 V12 Fetching samples using new samplekits endpoint..."
          );

          const samplePromises = sampleKits.map(async (kit: SampleKit) => {
            try {
              console.log(
                `🔍 Getting samples for kit: ${kit.kit_code} (${kit.id})`
              );
              const kitSamples = await this.getSamplesByKitId(kit.id);
              console.log(
                `✅ Found ${kitSamples.length} samples for kit ${kit.kit_code}`
              );
              return kitSamples;
            } catch (error: any) {
              console.warn(
                `⚠️ Could not fetch samples for kit ${kit.id}:`,
                error.message
              );
              return [];
            }
          });

          const sampleResults = await Promise.allSettled(samplePromises);
          samples = sampleResults
            .filter((result) => result.status === "fulfilled")
            .flatMap(
              (result) => (result as PromiseFulfilledResult<any[]>).value
            );

          console.log(
            `✅ V12 Total samples loaded: ${samples.length} for ${sampleKits.length} kits`
          );
        }
      }

      const totalTime = Date.now() - startTime;
      console.log(`✅ V12 Complete order data assembled in ${totalTime}ms`);

      return {
        ...order,
        orderDetails,
        participants,
        appointment,
        sampleKits,
        samples,
      };
    } catch (error: any) {
      console.error("❌ Error fetching V12 order data:", error);
      throw new Error(
        "Không thể tải thông tin đơn hàng: " +
          (error.response?.data?.message || error.message)
      );
    }
  }

  // ===== USER ORDERS =====
  async getUserOrders(userId?: string): Promise<any[]> {
    try {
      const startTime = Date.now();
      console.log("🔍 Fetching user orders...");

      let ordersData = [];

      if (userId) {
        console.log("🔍 Fetching orders for user:", userId);
        const response = await apiClient.get(`/orders/user/${userId}`);
        ordersData = response.data.result || [];
      } else {
        console.log("🔍 Fetching all orders for current user");
        const response = await apiClient.get(`/orders/all`);
        ordersData = response.data.result || [];
      }

      if (ordersData.length > 0) {
        const totalTime = Date.now() - startTime;
        console.log(`✅ Orders loaded in ${totalTime}ms:`, ordersData.length);

        const sortedOrders = ordersData.sort((a: any, b: any) => {
          const dateA = new Date(
            a.createdAt || a.created_at || a.createddate || 0
          );
          const dateB = new Date(
            b.createdAt || b.created_at || b.createddate || 0
          );
          return dateB.getTime() - dateA.getTime();
        });

        return sortedOrders;
      }

      return [];
    } catch (error: any) {
      console.error(
        "❌ Error fetching user orders:",
        error.response?.data || error.message
      );
      return [];
    }
  }

  // ===== APPOINTMENT METHODS =====
  async getAllAppointments(): Promise<any[]> {
    try {
      console.log("🔍 Fetching all appointments...");
      const startTime = Date.now();

      const response = await apiClient.get("/appointment/all");

      if (response.data.code === 200) {
        const appointments = response.data.result || [];
        const totalTime = Date.now() - startTime;
        console.log(
          `✅ All appointments loaded in ${totalTime}ms:`,
          appointments.length
        );
        return appointments;
      }

      return [];
    } catch (error: any) {
      console.error(
        "❌ Error fetching all appointments:",
        error.response?.data || error.message
      );
      throw new Error("Không thể tải danh sách lịch hẹn");
    }
  }

  async getUserAppointments(): Promise<any[]> {
    try {
      console.log("🔍 Fetching user appointments...");
      const startTime = Date.now();

      const response = await apiClient.get("/appointment/user/all");

      if (response.data.code === 200) {
        const appointments = response.data.result || [];
        const totalTime = Date.now() - startTime;
        console.log(
          `✅ User appointments loaded in ${totalTime}ms:`,
          appointments.length
        );
        return appointments;
      }

      return [];
    } catch (error: any) {
      console.error(
        "❌ Error fetching user appointments:",
        error.response?.data || error.message
      );
      throw new Error("Không thể tải lịch hẹn của bạn");
    }
  }

  // ===== PROGRESS CALCULATION =====
  private progressCache = new Map<
    string,
    { result: number; timestamp: number }
  >();

  calculateOrderProgress(
    order: any,
    sampleKits: any[] = [],
    samples: any[] = [],
    appointment: any = null
  ): number {
    const cacheKey = `${order.id || order.orderId}_${order.status}_${
      order.collection_method
    }_${sampleKits.length}_${samples.length}_${!!appointment}`;
    const cached = this.progressCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < 30000) {
      return cached.result;
    }

    console.log(
      "🔢 V12 Calculating order progress for:",
      order.id || order.orderId,
      "| Collection method:",
      order.collection_method
    );

    const statusInfo = this.getOrderStatusInfo(order.status);
    let baseProgress = statusInfo.progress;

    console.log(
      `📊 Base progress from status "${order.status}": ${baseProgress}%`
    );

    // Factor in sample kit progress
    let kitProgress = 0;
    if (sampleKits && sampleKits.length > 0) {
      const kitStatusMap: Record<string, number> = {
        ordered: 25,
        preparing: 30,
        shipped: 45,
        delivered: 55,
        ready: 50,
        expired: 0,
      };

      kitProgress =
        sampleKits.reduce((acc, kit) => {
          const progress = kitStatusMap[kit.status] || 0;
          return acc + progress;
        }, 0) / sampleKits.length;

      console.log(`📦 Average kit progress: ${kitProgress}%`);
    }

    // Factor in sample progress
    let sampleProgress = 0;
    if (samples && samples.length > 0) {
      const sampleStatusMap: Record<string, number> = {
        pending: 10,
        collected: 60,
        shipped: 70,
        received: 75,
        analyzing: 85,
        completed: 95,
        failed: 0,
      };

      sampleProgress =
        samples.reduce((acc, sample) => {
          const progress = sampleStatusMap[sample.status] || 0;
          return acc + progress;
        }, 0) / samples.length;

      console.log(`🧪 Average sample progress: ${sampleProgress}%`);
    }

    // Factor in appointment progress (only for facility collection)
    let appointmentProgress = 0;
    if (order.collection_method === "facility" && appointment) {
      if (appointment.status === true || appointment.status === "confirmed") {
        appointmentProgress = 40;
      } else if (appointment.status === "completed") {
        appointmentProgress = 70;
      } else {
        appointmentProgress = 20;
      }
      console.log(`📅 Appointment progress: ${appointmentProgress}%`);
    } else if (order.collection_method === "home") {
      console.log(`🏠 Home collection - no appointment needed`);
    }

    const finalProgress = Math.max(
      baseProgress,
      kitProgress,
      sampleProgress,
      appointmentProgress
    );
    const result = Math.min(100, Math.max(0, finalProgress));

    this.progressCache.set(cacheKey, { result, timestamp: Date.now() });

    console.log(`🎯 V12 Final calculated progress: ${result}%`);
    return result;
  }

  // ===== STATUS INFO HELPERS =====
  getOrderStatusInfo(status: string) {
    const statusMap: Record<string, any> = {
      pending: {
        label: "Chờ xử lý",
        color: "bg-yellow-100 text-yellow-800",
        icon: "Clock",
        description: "Đơn hàng đang được xử lý",
        progress: 10,
      },
      confirmed: {
        label: "Đã xác nhận",
        color: "bg-blue-100 text-blue-800",
        icon: "CheckCircle",
        description: "Đơn hàng đã được xác nhận",
        progress: 25,
      },
      kit_preparing: {
        label: "Chuẩn bị kit",
        color: "bg-purple-100 text-purple-800",
        icon: "Package",
        description: "Đang chuẩn bị bộ kit xét nghiệm",
        progress: 35,
      },
      kit_sent: {
        label: "Đã gửi kit",
        color: "bg-indigo-100 text-indigo-800",
        icon: "Truck",
        description: "Kit đã được gửi đến địa chỉ của bạn",
        progress: 50,
      },
      sample_collected: {
        label: "Đã thu mẫu",
        color: "bg-cyan-100 text-cyan-800",
        icon: "TestTube",
        description: "Mẫu đã được thu thập",
        progress: 65,
      },
      sample_received: {
        label: "Đã nhận mẫu",
        color: "bg-teal-100 text-teal-800",
        icon: "CheckCircle",
        description: "Phòng lab đã nhận được mẫu",
        progress: 75,
      },
      processing: {
        label: "Đang xử lý",
        color: "bg-orange-100 text-orange-800",
        icon: "RefreshCw",
        description: "Đang tiến hành xét nghiệm",
        progress: 85,
      },
      completed: {
        label: "Hoàn thành",
        color: "bg-green-100 text-green-800",
        icon: "CheckCircle",
        description: "Xét nghiệm hoàn thành, kết quả đã sẵn sàng",
        progress: 100,
      },
      cancelled: {
        label: "Đã hủy",
        color: "bg-red-100 text-red-800",
        icon: "AlertCircle",
        description: "Đơn hàng đã bị hủy",
        progress: 0,
      },
    };
    return statusMap[status] || statusMap.pending;
  }

  getKitStatusInfo(status: string) {
    const statusMap: Record<string, any> = {
      ordered: {
        label: "Đã đặt hàng",
        color: "bg-blue-100 text-blue-800",
        icon: "ShoppingCart",
        description: "Kit đã được đặt hàng",
      },
      preparing: {
        label: "Đang chuẩn bị",
        color: "bg-yellow-100 text-yellow-800",
        icon: "Package",
        description: "Kit đang được chuẩn bị",
      },
      shipped: {
        label: "Đã gửi",
        color: "bg-blue-100 text-blue-800",
        icon: "Truck",
        description: "Kit đã được gửi đi",
      },
      delivered: {
        label: "Đã giao",
        color: "bg-green-100 text-green-800",
        icon: "CheckCircle",
        description: "Kit đã được giao thành công",
      },
      expired: {
        label: "Hết hạn",
        color: "bg-red-100 text-red-800",
        icon: "AlertCircle",
        description: "Kit đã hết hạn sử dụng",
      },
      ready: {
        label: "Sẵn sàng",
        color: "bg-green-100 text-green-800",
        icon: "CheckCircle",
        description: "Kit sẵn sàng để sử dụng",
      },
    };
    return statusMap[status] || statusMap.preparing;
  }

  getSampleStatusInfo(status: string) {
    const statusMap: Record<string, any> = {
      pending: {
        label: "Chờ xử lý",
        color: "bg-yellow-100 text-yellow-800",
        icon: "Clock",
        description: "Đang chờ xử lý",
      },
      collected: {
        label: "Đã thu mẫu",
        color: "bg-blue-100 text-blue-800",
        icon: "TestTube",
        description: "Mẫu đã được thu thập",
      },
      shipped: {
        label: "Đang vận chuyển",
        color: "bg-purple-100 text-purple-800",
        icon: "Truck",
        description: "Mẫu đang được vận chuyển về lab",
      },
      received: {
        label: "Đã nhận",
        color: "bg-indigo-100 text-indigo-800",
        icon: "Building",
        description: "Lab đã nhận được mẫu",
      },
      analyzing: {
        label: "Đang phân tích",
        color: "bg-orange-100 text-orange-800",
        icon: "Microscope",
        description: "Mẫu đang được phân tích",
      },
      completed: {
        label: "Hoàn thành",
        color: "bg-green-100 text-green-800",
        icon: "CheckCircle",
        description: "Phân tích hoàn thành",
      },
      failed: {
        label: "Thất bại",
        color: "bg-red-100 text-red-800",
        icon: "AlertCircle",
        description: "Mẫu không đạt chất lượng",
      },
    };
    return statusMap[status] || statusMap.pending;
  }

  // ===== DEBUG METHODS =====
  async testV12SampleAPI(): Promise<void> {
    console.log("🧪 V12 API Test - New sample endpoints");

    try {
      console.log("1. Getting user sample kits...");
      const userOrders = await this.getUserOrders();

      if (userOrders.length > 0) {
        const orderId = userOrders[0].orderId;
        console.log(`2. Testing with order: ${orderId}`);

        const kits = await this.getSampleKitsByOrderId(orderId);
        console.log(`✅ Found ${kits.length} kits`);

        if (kits.length > 0) {
          console.log("3. Testing new V12 samples endpoint...");
          const samples = await this.getSamplesByKitId(kits[0].id);
          console.log(
            `✅ V12 API SUCCESS: Found ${samples.length} samples for kit ${kits[0].kit_code}`
          );
        }
      } else {
        console.log("📝 No orders found for testing");
      }
    } catch (error: any) {
      console.error("❌ V12 API Test failed:", error.message);
    }
  }

  clearProgressCache(): void {
    this.progressCache.clear();
    console.log("🗑️ Progress cache cleared");
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.progressCache.size,
      keys: Array.from(this.progressCache.keys()),
    };
  }
}

export const orderService = new OrderService();
