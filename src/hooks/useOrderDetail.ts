import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderService } from "../services/orderService";

export const useOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // States
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("progress");

  // Fetch order detail on mount
  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!id) {
        navigate("/dashboard");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const completeOrderData = await orderService.getCompleteOrderData(id);
        setOrder(completeOrderData);
      } catch (err) {
        console.error("❌ Error fetching order detail:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải thông tin đơn hàng. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id, navigate]);

  // Get order data with fallback properties
  const getOrderData = (orderData: any) => {
    if (!orderData)
      return {
        orderCode: "",
        totalAmount: 0,
        paymentMethod: "",
        paymentStatus: "",
        paymentDate: "",
        transactionId: "",
        notes: "",
        createdAt: "",
        updatedAt: "",
        status: "pending",
      };

    return {
      orderCode: orderData.orderCode || orderData.order_code || orderData.id,
      totalAmount: orderData.totalAmount || orderData.total_amount || 0,
      paymentMethod: orderData.paymentMethod || orderData.payment_method || "",
      paymentStatus: orderData.paymentStatus || orderData.payment_status || "",
      paymentDate: orderData.paymentDate || orderData.payment_date,
      transactionId: orderData.transactionId || orderData.transaction_id,
      notes: orderData.notes || "",
      createdAt: orderData.createdAt || orderData.created_at,
      updatedAt:
        orderData.updatedAt || orderData.updated_at || orderData.update_at,
      status: orderData.status || "pending",
    };
  };

  // Generate tracking steps based on order data
  const getTrackingSteps = (orderData: any) => {
    if (!orderData) return [];

    return [
      {
        step: 1,
        title: "Đơn hàng được xác nhận",
        status: "completed" as const,
        date: orderData.createdAt || orderData.created_at || "",
        description: "Đơn hàng đã được tạo và xác nhận thành công",
      },
      {
        step: 2,
        title: "Chuẩn bị thu thập mẫu",
        status:
          orderData.status === "pending"
            ? ("current" as const)
            : ("completed" as const),
        date:
          orderData.status !== "pending"
            ? orderData.updatedAt || orderData.update_at || ""
            : "",
        description: "Chuẩn bị kit xét nghiệm và lịch thu thập mẫu",
      },
      {
        step: 3,
        title: "Thu thập mẫu",
        status:
          orderData.status === "processing"
            ? ("current" as const)
            : orderData.status === "completed"
            ? ("completed" as const)
            : ("pending" as const),
        date:
          orderData.status === "completed"
            ? orderData.updatedAt || orderData.update_at || ""
            : "",
        description: "Mẫu xét nghiệm đang được thu thập",
      },
      {
        step: 4,
        title: "Phân tích tại phòng lab",
        status:
          orderData.status === "completed"
            ? ("completed" as const)
            : ("pending" as const),
        date:
          orderData.status === "completed"
            ? orderData.updatedAt || orderData.update_at || ""
            : "",
        description: "Mẫu đang được phân tích tại phòng lab",
      },
      {
        step: 5,
        title: "Kết quả hoàn thành",
        status:
          orderData.status === "completed"
            ? ("completed" as const)
            : ("pending" as const),
        date:
          orderData.status === "completed"
            ? orderData.updatedAt || orderData.update_at || ""
            : "",
        description: "Kết quả đã hoàn thành và sẵn sàng tải về",
      },
    ];
  };

  // Get samples summary statistics
  const getSamplesSummary = (samples: any[]) => {
    if (!samples || samples.length === 0) {
      return {
        total: 0,
        collected: 0,
        received: 0,
        completed: 0,
      };
    }

    return {
      total: samples.length,
      collected: samples.filter((s: any) => s.collection_date).length,
      received: samples.filter((s: any) => s.received_date).length,
      completed: samples.filter((s: any) => s.status === "completed").length,
    };
  };

  // Handle tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Handle navigation
  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleContactSupport = () => {
    // TODO: Implement contact support logic
    console.log("Contact support clicked");
  };

  const handleDownloadResults = () => {
    // TODO: Implement download results logic
    console.log("Download results clicked");
  };

  const handleOrderNewService = () => {
    navigate("/services");
  };

  return {
    // State
    order,
    loading,
    error,
    activeTab,

    // Computed data
    orderData: getOrderData(order),
    trackingSteps: order ? getTrackingSteps(order) : [],
    samplesSummary: getSamplesSummary(order?.samples),

    // Actions
    handleTabChange,
    handleBackToDashboard,
    handleContactSupport,
    handleDownloadResults,
    handleOrderNewService,
  };
};
