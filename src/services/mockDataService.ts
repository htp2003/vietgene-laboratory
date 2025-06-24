// mockData.ts - Centralized mock data for development

export interface MockDoctor {
  id: string;
  doctorCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
}

export interface MockTimeSlot {
  id: number;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface MockService {
  id: string;
  service_name: string;
  service_type: string;
  service_category: string;
  price: number;
  duration_days: number;
  description: string;
  collection_methods: string[];
  requires_legal_documents: boolean;
  is_active: boolean;
}

export interface MockOrder {
  id: string;
  orderCode: string;
  userId: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentDate?: string;
  transactionId?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockOrderDetail {
  id: string;
  orderId: string;
  serviceId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes: string;
}

export interface MockParticipant {
  id: string;
  orderId: string;
  participantName: string;
  relationship: string;
  age: number;
  notes: string;
}

class MockDataService {
  // ===== DOCTORS =====
  private mockDoctors: MockDoctor[] = [
    {
      id: "1",
      doctorCode: "DR001",
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      user: {
        id: "user1",
        fullName: "Dr. Nguyễn Văn An",
        email: "nguyenvanan@vietgene.vn",
        phone: "0912345678",
      },
    },
    {
      id: "2",
      doctorCode: "DR002",
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      user: {
        id: "user2",
        fullName: "Dr. Trần Thị Bình",
        email: "tranthibinh@vietgene.vn",
        phone: "0987654321",
      },
    },
    {
      id: "3",
      doctorCode: "DR003",
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      user: {
        id: "user3",
        fullName: "Dr. Lê Minh Châu",
        email: "leminhchau@vietgene.vn",
        phone: "0901234567",
      },
    },
    {
      id: "4",
      doctorCode: "DR004",
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      user: {
        id: "user4",
        fullName: "Dr. Phạm Thị Diệu",
        email: "phamthidieu@vietgene.vn",
        phone: "0905678901",
      },
    },
  ];

  // ===== TIME SLOTS =====
  private generateTimeSlots(doctorId: string): MockTimeSlot[] {
    const timeSlotTemplates = [
      // Monday
      { dayOfWeek: 1, startTime: "08:00", endTime: "10:00" },
      { dayOfWeek: 1, startTime: "10:30", endTime: "12:30" },
      { dayOfWeek: 1, startTime: "13:30", endTime: "15:30" },
      { dayOfWeek: 1, startTime: "16:00", endTime: "18:00" },

      // Tuesday
      { dayOfWeek: 2, startTime: "08:00", endTime: "10:00" },
      { dayOfWeek: 2, startTime: "10:30", endTime: "12:30" },
      { dayOfWeek: 2, startTime: "13:30", endTime: "15:30" },

      // Wednesday
      { dayOfWeek: 3, startTime: "08:00", endTime: "10:00" },
      { dayOfWeek: 3, startTime: "10:30", endTime: "12:30" },
      { dayOfWeek: 3, startTime: "16:00", endTime: "18:00" },

      // Thursday
      { dayOfWeek: 4, startTime: "08:00", endTime: "10:00" },
      { dayOfWeek: 4, startTime: "13:30", endTime: "15:30" },
      { dayOfWeek: 4, startTime: "16:00", endTime: "18:00" },

      // Friday
      { dayOfWeek: 5, startTime: "08:00", endTime: "10:00" },
      { dayOfWeek: 5, startTime: "10:30", endTime: "12:30" },

      // Saturday
      { dayOfWeek: 6, startTime: "08:00", endTime: "12:00" },
    ];

    return timeSlotTemplates.map((slot, index) => ({
      id: parseInt(
        `${doctorId}${slot.dayOfWeek}${index.toString().padStart(2, "0")}`
      ),
      doctorId,
      ...slot,
      isAvailable: Math.random() > 0.2, // 80% availability
    }));
  }

  // ===== SERVICES =====
  private mockServices: MockService[] = [
    {
      id: "1",
      service_name: "Xét nghiệm quan hệ cha con (dân sự)",
      service_type: "paternity",
      service_category: "civil",
      price: 2500000,
      duration_days: 5,
      description:
        "Xét nghiệm ADN xác định quan hệ huyết thống cha con cho mục đích dân sự",
      collection_methods: ["home", "facility"],
      requires_legal_documents: false,
      is_active: true,
    },
    {
      id: "2",
      service_name: "Xét nghiệm quan hệ cha con (pháp lý)",
      service_type: "paternity",
      service_category: "legal",
      price: 3500000,
      duration_days: 7,
      description:
        "Xét nghiệm ADN xác định quan hệ huyết thống cha con có giá trị pháp lý",
      collection_methods: ["facility"],
      requires_legal_documents: true,
      is_active: true,
    },
    {
      id: "3",
      service_name: "Xét nghiệm anh chị em ruột",
      service_type: "sibling",
      service_category: "civil",
      price: 3000000,
      duration_days: 6,
      description: "Xét nghiệm ADN xác định quan hệ anh chị em ruột",
      collection_methods: ["home", "facility"],
      requires_legal_documents: false,
      is_active: true,
    },
  ];

  // Storage for created orders (simulate database)
  private orders: Map<string, MockOrder> = new Map();
  private orderDetails: Map<string, MockOrderDetail[]> = new Map();
  private participants: Map<string, MockParticipant[]> = new Map();

  // ===== PUBLIC METHODS =====

  getDoctors(): Promise<MockDoctor[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.mockDoctors.filter((d) => d.isActive));
      }, 300); // Simulate network delay
    });
  }

  getDoctorTimeSlots(doctorId: string): Promise<MockTimeSlot[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const timeSlots = this.generateTimeSlots(doctorId);
        resolve(timeSlots);
      }, 500);
    });
  }

  getServices(): Promise<MockService[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.mockServices.filter((s) => s.is_active));
      }, 200);
    });
  }

  getServiceById(id: string): Promise<MockService | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const service = this.mockServices.find(
          (s) => s.id === id && s.is_active
        );
        resolve(service || null);
      }, 300);
    });
  }

  createOrder(orderData: Partial<MockOrder>): Promise<MockOrder> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orderId =
          "ORD_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
        const order: MockOrder = {
          id: orderId,
          orderCode: "DNA-" + orderId.slice(-8).toUpperCase(),
          userId: orderData.userId || "guest_" + Date.now(),
          status: orderData.status || "pending",
          totalAmount: orderData.totalAmount || 0,
          paymentMethod: orderData.paymentMethod || "transfer",
          paymentStatus: orderData.paymentStatus || "pending",
          paymentDate: orderData.paymentDate,
          transactionId: orderData.transactionId,
          notes: orderData.notes || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        this.orders.set(orderId, order);
        resolve(order);
      }, 400);
    });
  }

  addOrderDetail(
    orderId: string,
    detail: Omit<MockOrderDetail, "id" | "orderId">
  ): Promise<MockOrderDetail> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const detailId =
          "DTL_" + Date.now() + "_" + Math.random().toString(36).substr(2, 3);
        const orderDetail: MockOrderDetail = {
          id: detailId,
          orderId,
          ...detail,
        };

        const existing = this.orderDetails.get(orderId) || [];
        this.orderDetails.set(orderId, [...existing, orderDetail]);

        resolve(orderDetail);
      }, 200);
    });
  }

  addParticipant(
    orderId: string,
    participant: Omit<MockParticipant, "id" | "orderId">
  ): Promise<MockParticipant> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const participantId =
          "PTC_" + Date.now() + "_" + Math.random().toString(36).substr(2, 3);
        const mockParticipant: MockParticipant = {
          id: participantId,
          orderId,
          ...participant,
        };

        const existing = this.participants.get(orderId) || [];
        this.participants.set(orderId, [...existing, mockParticipant]);

        resolve(mockParticipant);
      }, 200);
    });
  }

  processPayment(
    orderId: string,
    paymentData: { method: string; amount: number }
  ): Promise<{ success: boolean; transactionId: string; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const transactionId = "TXN_" + Date.now();

        // Update order with payment info
        const order = this.orders.get(orderId);
        if (order) {
          order.paymentMethod = paymentData.method;
          order.totalAmount = paymentData.amount;
          order.transactionId = transactionId;
          order.paymentStatus =
            paymentData.method === "cash" ? "pending" : "paid";
          order.paymentDate =
            paymentData.method === "cash"
              ? undefined
              : new Date().toISOString();
          order.updatedAt = new Date().toISOString();
          this.orders.set(orderId, order);
        }

        const messages: Record<string, string> = {
          transfer: `Vui lòng chuyển khoản ${new Intl.NumberFormat(
            "vi-VN"
          ).format(
            paymentData.amount
          )}đ vào:\n\n🏦 Ngân hàng: Vietcombank\n💳 STK: 1234567890\n👤 Chủ TK: VIET GENE LAB\n📝 Nội dung: ${transactionId}`,
          cash: "Thanh toán tiền mặt khi nhận dịch vụ. Nhân viên sẽ liên hệ xác nhận thời gian.",
          card: "Thanh toán thẻ tín dụng đang được xử lý. Bạn sẽ nhận được thông báo qua email.",
        };

        resolve({
          success: true,
          transactionId,
          message: messages[paymentData.method] || "Thanh toán thành công",
        });
      }, 800);
    });
  }

  getCompleteOrderData(orderId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const order = this.orders.get(orderId);
        if (!order) {
          reject(new Error("Order not found"));
          return;
        }

        const orderDetails = this.orderDetails.get(orderId) || [];
        const participants = this.participants.get(orderId) || [];

        resolve({
          ...order,
          orderDetails,
          participants,
        });
      }, 400);
    });
  }

  getUserOrders(userId: string): Promise<MockOrder[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userOrders = Array.from(this.orders.values())
          .filter((order) => order.userId === userId)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

        resolve(userOrders);
      }, 300);
    });
  }

  // Utility method to get all stored data (for debugging)
  getAllStoredData() {
    return {
      orders: Array.from(this.orders.entries()),
      orderDetails: Array.from(this.orderDetails.entries()),
      participants: Array.from(this.participants.entries()),
    };
  }

  // Method to clear all stored data (for testing)
  clearAllData() {
    this.orders.clear();
    this.orderDetails.clear();
    this.participants.clear();
  }

  // Generate sample order statuses for tracking
  getOrderTracking(orderId: string): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = this.orders.get(orderId);
        if (!order) {
          resolve([]);
          return;
        }

        const baseSteps = [
          {
            step: 1,
            title: "Đơn hàng được xác nhận",
            status: "completed",
            date: order.createdAt,
            description: "Đơn hàng đã được tạo và xác nhận thành công",
          },
          {
            step: 2,
            title: "Chuẩn bị kit xét nghiệm",
            status: order.status === "pending" ? "current" : "completed",
            date: order.status === "pending" ? "" : order.updatedAt,
            description: "Kit xét nghiệm đang được chuẩn bị và đóng gói",
          },
          {
            step: 3,
            title: "Gửi kit đến khách hàng",
            status:
              order.status === "processing"
                ? "current"
                : order.status === "completed"
                ? "completed"
                : "pending",
            date: order.status === "completed" ? order.updatedAt : "",
            description: "Kit được gửi qua đường vận chuyển",
          },
          {
            step: 4,
            title: "Phân tích tại phòng lab",
            status: order.status === "completed" ? "completed" : "pending",
            date: order.status === "completed" ? order.updatedAt : "",
            description: "Mẫu đang được phân tích tại phòng lab",
          },
          {
            step: 5,
            title: "Kết quả hoàn thành",
            status: order.status === "completed" ? "completed" : "pending",
            date: order.status === "completed" ? order.updatedAt : "",
            description: "Kết quả đã hoàn thành và sẵn sàng tải về",
          },
        ];

        resolve(baseSteps);
      }, 200);
    });
  }
}

// Export singleton instance
export const mockDataService = new MockDataService();
export default mockDataService;
