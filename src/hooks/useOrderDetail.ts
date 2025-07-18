import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderService } from "../services/orderService";
import { testResultService } from "../services/testResultService";

export const useOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // States
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("progress");

  // ✅ FIXED: Test results state
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testResultsLoading, setTestResultsLoading] = useState(false);
  const [testResultsError, setTestResultsError] = useState<string | null>(null);

  // ✅ FIXED: Fetch test results by ORDER ID (not sample IDs)
  const fetchTestResultsByOrderId = async (orderId: string) => {
    if (!orderId) {
      console.warn("❌ Order ID is required to fetch test results");
      setTestResults([]);
      return;
    }

    try {
      setTestResultsLoading(true);
      setTestResultsError(null);

      console.log("🔍 Fetching test results for ORDER ID:", orderId);
      console.log("🌐 API endpoint:", `/test-results/order/${orderId}`);

      // ✅ Use the correct API endpoint: /test-results/order/{orderId}
      const results = await testResultService.getTestResultsByOrderId(orderId);

      console.log("✅ Test results API response:", {
        orderId,
        count: results?.length || 0,
        results: results || [],
        rawResponse: results,
      });

      // ✅ Extra debug: Check if results array is actually populated
      if (results && Array.isArray(results)) {
        console.log("📊 Test results details:");
        results.forEach((result, index) => {
          console.log(`  Result ${index + 1}:`, {
            id: result.id,
            type: result.result_type,
            percentage: result.result_percentage,
            conclusion: result.conclusion ? "Yes" : "No",
            orderId: result.orders_id,
            userId: result.userId,
          });
        });
      } else {
        console.log("⚠️ No test results found or invalid response format");
      }

      setTestResults(results || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải kết quả xét nghiệm";
      console.error("❌ Error fetching test results for order:", {
        orderId,
        error: err,
        message: errorMessage,
        stack: err instanceof Error ? err.stack : "No stack trace",
      });

      setTestResultsError(errorMessage);
      setTestResults([]);
    } finally {
      setTestResultsLoading(false);
    }
  };

  // ✅ Refresh test results function
  const refreshTestResults = async () => {
    if (order?.id) {
      await fetchTestResultsByOrderId(order.id);
    }
  };

  // Fetch order detail on mount
  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!id) {
        console.warn("❌ No order ID provided, redirecting to dashboard");
        navigate("/dashboard");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("🔍 Fetching order detail for ID:", id);

        const completeOrderData = await orderService.getCompleteOrderData(id);

        if (!completeOrderData) {
          throw new Error("Không tìm thấy thông tin đơn hàng");
        }

        console.log("📦 Complete order data received:", completeOrderData);
        setOrder(completeOrderData);

        // ✅ FIXED: Fetch test results by ORDER ID (the URL parameter)
        console.log("🔍 Now fetching test results for ORDER ID:", id);
        await fetchTestResultsByOrderId(id);
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
      orderCode:
        orderData.orderCode ||
        orderData.order_code ||
        `DNA-${(orderData.orderId || orderData.id || "").slice(-8)}`,
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

  // ✅ Enhanced tracking steps with test results
  const getTrackingSteps = (orderData: any) => {
    if (!orderData) return [];

    const sampleKits = orderData.sampleKits || [];
    const samples = orderData.samples || [];
    const appointment = orderData.appointment;
    const hasTestResults = testResults.length > 0;
    const orderStatus = orderData.status;

    // 🔍 DEBUG: Log actual order data
    console.log("🔍 DEBUG getTrackingSteps:", {
      orderId: orderData.id,
      rawStatus: orderStatus,
      statusType: typeof orderStatus,
      sampleKitsCount: sampleKits.length,
      samplesCount: samples.length,
      hasTestResults,
      testResultsCount: testResults.length,
      sampleKitsStatuses: sampleKits.map((k) => k.status),
      samplesStatuses: samples.map((s) => s.status),
      samplesWithDates: samples.map((s) => ({
        id: s.id,
        collection_date: s.collection_date,
        received_date: s.received_date,
        status: s.status,
      })),
    });

    // Determine collection method
    const collectionMethod =
      orderData.orderDetails?.[0]?.collection_method ||
      (appointment ? "Tại cơ sở" : "Tại nhà");

    console.log("🔍 Collection method determined:", collectionMethod);

    // 🚀 IMPROVED: Base progress calculation on ACTUAL DATA, not just status
    const hasKitsDelivered = sampleKits.some(
      (kit) =>
        kit.status === "delivered" ||
        kit.delivered_date ||
        kit.status === "KitDelivered"
    );
    const hasSamplesReceived = samples.some(
      (sample) =>
        sample.received_date ||
        sample.status === "received" ||
        sample.status === "SampleReceived"
    );
    const hasSamplesCollected = samples.some(
      (sample) => sample.collection_date || sample.status === "collected"
    );
    const hasSamplesAnalyzing = samples.some(
      (sample) => sample.status === "analyzing" || sample.status === "Testing"
    );

    console.log("🔍 Data-based progress indicators:", {
      hasKitsDelivered,
      hasSamplesReceived,
      hasSamplesCollected,
      hasSamplesAnalyzing,
      hasTestResults,
    });

    if (collectionMethod === "Tại nhà") {
      return [
        {
          step: 1,
          title: "Đặt lịch",
          status: "completed" as const,
          date: orderData.createdAt || orderData.created_at || "",
          description: "Khách hàng đặt lịch hẹn",
        },
        {
          step: 2,
          title: "Giao kit",
          status:
            hasKitsDelivered ||
            hasSamplesReceived ||
            hasSamplesAnalyzing ||
            hasTestResults
              ? ("completed" as const)
              : sampleKits.length > 0 ||
                ["DeliveringKit", "confirmed", "Confirmed"].includes(
                  orderStatus
                )
              ? ("current" as const)
              : ("pending" as const),
          date: sampleKits.length > 0 ? sampleKits[0].createdAt || "" : "",
          description: "Đang giao kit xét nghiệm",
        },
        {
          step: 3,
          title: "Đã giao kit",
          status:
            hasSamplesReceived || hasSamplesAnalyzing || hasTestResults
              ? ("completed" as const)
              : hasKitsDelivered
              ? ("current" as const)
              : ("pending" as const),
          date:
            sampleKits.find(
              (kit) => kit.delivered_date || kit.status === "delivered"
            )?.delivered_date || "",
          description: "Kit đã được giao thành công",
        },
        {
          step: 4,
          title: "Nhận mẫu",
          status:
            hasSamplesAnalyzing || hasTestResults
              ? ("completed" as const)
              : hasSamplesReceived
              ? ("current" as const)
              : ("pending" as const),
          date: samples.find((s) => s.received_date)?.received_date || "",
          description: "Đã nhận mẫu từ khách hàng",
        },
        {
          step: 5,
          title: "Xét nghiệm",
          status: hasTestResults
            ? ("completed" as const)
            : hasSamplesAnalyzing
            ? ("current" as const)
            : ("pending" as const),
          date: samples.find((s) => s.status === "analyzing")?.updated_at || "",
          description: "Đang tiến hành xét nghiệm",
        },
        {
          step: 6,
          title: "Hoàn thành",
          status: hasTestResults
            ? ("completed" as const)
            : ("pending" as const),
          date: hasTestResults ? testResults[0]?.tested_date || "" : "",
          description: `Có kết quả xét nghiệm${
            hasTestResults ? ` (${testResults.length} kết quả)` : ""
          }`,
        },
      ];
    } else {
      // Facility service flow
      return [
        {
          step: 1,
          title: "Đặt lịch",
          status: "completed" as const,
          date: orderData.createdAt || orderData.created_at || "",
          description: "Khách hàng đặt lịch hẹn",
        },
        {
          step: 2,
          title: "Check-in",
          status:
            hasSamplesCollected || hasSamplesAnalyzing || hasTestResults
              ? ("completed" as const)
              : appointment || ["Confirmed", "confirmed"].includes(orderStatus)
              ? ("current" as const)
              : ("pending" as const),
          date: appointment?.createdAt || "",
          description: "Khách hàng check-in tại cơ sở",
        },
        {
          step: 3,
          title: "Nhận mẫu",
          status:
            hasSamplesAnalyzing || hasTestResults
              ? ("completed" as const)
              : hasSamplesCollected
              ? ("current" as const)
              : ("pending" as const),
          date: samples.find((s) => s.collection_date)?.collection_date || "",
          description: "Thu thập mẫu xét nghiệm",
        },
        {
          step: 4,
          title: "Xét nghiệm",
          status: hasTestResults
            ? ("completed" as const)
            : hasSamplesAnalyzing
            ? ("current" as const)
            : ("pending" as const),
          date: samples.find((s) => s.status === "analyzing")?.updated_at || "",
          description: "Đang tiến hành xét nghiệm",
        },
        {
          step: 5,
          title: "Hoàn thành",
          status: hasTestResults
            ? ("completed" as const)
            : ("pending" as const),
          date: hasTestResults ? testResults[0]?.tested_date || "" : "",
          description: `Có kết quả xét nghiệm${
            hasTestResults ? ` (${testResults.length} kết quả)` : ""
          }`,
        },
      ];
    }
  };

  // ✅ Enhanced: Get both sample kits and samples summary
  const getKitsAndSamplesSummary = (sampleKits: any[], samples: any[]) => {
    const kits = sampleKits || [];
    const samplesList = samples || [];

    return {
      // Sample Kits stats
      totalKits: kits.length,
      kitsPreparing: kits.filter((k: any) => k.status === "preparing").length,
      kitsShipped: kits.filter((k: any) => k.status === "shipped").length,
      kitsDelivered: kits.filter((k: any) => k.status === "delivered").length,
      kitsExpired: kits.filter((k: any) => k.status === "expired").length,

      // Samples stats
      totalSamples: samplesList.length,
      samplesCollected: samplesList.filter((s: any) => s.collection_date)
        .length,
      samplesReceived: samplesList.filter((s: any) => s.received_date).length,
      samplesCompleted: samplesList.filter((s: any) => s.status === "completed")
        .length,
      samplesAnalyzing: samplesList.filter((s: any) => s.status === "analyzing")
        .length,

      // ✅ Test Results stats
      totalTestResults: testResults.length,
      testResultsCompleted: testResults.filter(
        (tr: any) => tr.conclusion && tr.result_percentage
      ).length,

      // Legacy compatibility
      total: Math.max(kits.length, samplesList.length),
      collected: samplesList.filter((s: any) => s.collection_date).length,
      received: samplesList.filter((s: any) => s.received_date).length,
      completed: samplesList.filter((s: any) => s.status === "completed")
        .length,
    };
  };

  // ✅ Enhanced: Calculate overall progress including test results
  const calculateOverallProgress = (orderData: any) => {
    if (!orderData) return 0;

    const sampleKits = orderData.sampleKits || [];
    const samples = orderData.samples || [];
    const status = orderData.status;
    const hasTestResults = testResults.length > 0;

    console.log("🔍 DEBUG calculateOverallProgress:", {
      orderId: orderData.id,
      status,
      sampleKitsCount: sampleKits.length,
      samplesCount: samples.length,
      testResultsCount: testResults.length,
      hasTestResults,
    });

    // 🚀 PRIORITY: Test results = 100% regardless of status
    if (hasTestResults) {
      console.log("✅ Has test results → 100% progress");
      return 100;
    }

    // 🚀 QUICK FIX: If you had progress before, keep the old logic
    if (samples.length > 0) {
      const samplesReceived = samples.filter(
        (s: any) => s.received_date
      ).length;
      const samplesCompleted = samples.filter(
        (s: any) => s.status === "completed"
      ).length;

      if (samplesCompleted > 0) return 90;
      if (samplesReceived > 0) return 80;
      if (samples.length > 0) return 60;
    }

    if (sampleKits.length > 0) {
      const kitsDelivered = sampleKits.filter(
        (k: any) => k.delivered_date || k.status === "delivered"
      ).length;
      if (kitsDelivered > 0) return 60;
      return 30;
    }

    // Check actual data states
    const hasKitsDelivered = sampleKits.some(
      (kit) => kit.status === "delivered" || kit.delivered_date
    );
    const hasSamplesReceived = samples.some(
      (sample) => sample.received_date || sample.status === "received"
    );
    const hasSamplesCollected = samples.some(
      (sample) => sample.collection_date || sample.status === "collected"
    );
    const hasSamplesAnalyzing = samples.some(
      (sample) =>
        sample.status === "analyzing" || sample.status === "processing"
    );

    console.log("🔍 Data indicators:", {
      hasKitsDelivered,
      hasSamplesReceived,
      hasSamplesCollected,
      hasSamplesAnalyzing,
    });

    // Calculate based on actual progress, not just status
    let progress = 10; // Base: order created

    // Status-based progress (fallback)
    if (["confirmed", "Confirmed"].includes(status)) {
      progress = Math.max(progress, 25);
    }
    if (["DeliveringKit", "kit_sent"].includes(status)) {
      progress = Math.max(progress, 40);
    }
    if (["KitDelivered"].includes(status)) {
      progress = Math.max(progress, 60);
    }
    if (["SampleReceived", "sample_collected"].includes(status)) {
      progress = Math.max(progress, 70);
    }
    if (["Testing", "processing"].includes(status)) {
      progress = Math.max(progress, 80);
    }
    if (["Completed", "completed"].includes(status)) {
      progress = Math.max(progress, 90);
    }

    // Data-based progress (takes priority)
    if (sampleKits.length > 0) {
      progress = Math.max(progress, 30);
    }
    if (hasKitsDelivered) {
      progress = Math.max(progress, 60);
    }
    if (hasSamplesCollected || hasSamplesReceived) {
      progress = Math.max(progress, 70);
    }
    if (hasSamplesAnalyzing) {
      progress = Math.max(progress, 80);
    }

    console.log("📊 Final calculated progress:", progress);
    return Math.round(progress);
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
    console.log("Contact support clicked");
  };

  // ✅ Enhanced: Handle download results with test results
  const handleDownloadResults = async () => {
    console.log("Download results clicked for order:", id);

    if (testResults.length > 0) {
      try {
        const resultsWithFiles = testResults.filter(
          (result: any) => result.result_file
        );

        if (resultsWithFiles.length > 0) {
          console.log(
            `Downloading ${resultsWithFiles.length} test result files`
          );
          for (const result of resultsWithFiles) {
            await testResultService.downloadTestResultFile(result);
          }
        } else {
          alert("Chưa có file kết quả để tải xuống");
        }
      } catch (error) {
        console.error("Error downloading test results:", error);
        alert("Có lỗi xảy ra khi tải kết quả. Vui lòng thử lại sau.");
      }
    } else {
      alert("Kết quả chưa sẵn sàng để tải xuống");
    }
  };

  const handleOrderNewService = () => {
    navigate("/services");
  };

  const handleTrackKit = (kitId: string, trackingNumber: string) => {
    console.log("📦 Tracking kit:", { kitId, trackingNumber });
  };

  return {
    // State
    order,
    loading,
    error,
    activeTab,

    // ✅ Test results state
    testResults,
    testResultsLoading,
    testResultsError,

    // Computed data
    orderData: getOrderData(order),
    trackingSteps: order ? getTrackingSteps(order) : [],
    kitsAndSamplesSummary: getKitsAndSamplesSummary(
      order?.sampleKits,
      order?.samples
    ),
    overallProgress: calculateOverallProgress(order),

    // Actions
    handleTabChange,
    handleBackToDashboard,
    handleContactSupport,
    handleDownloadResults,
    handleOrderNewService,
    handleTrackKit,

    // ✅ Test results actions
    refreshTestResults,

    // Additional computed data
    collectionMethod:
      order?.orderDetails?.[0]?.collection_method ||
      (order?.appointment ? "facility" : "home"),
    hasAppointment: !!order?.appointment,
    totalParticipants: order?.participants?.length || 0,

    // ✅ Test results computed data
    hasTestResults: testResults.length > 0,
    testResultsCount: testResults.length,
  };
};
