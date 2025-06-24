import React, { useState } from "react";
import { OrderService } from "../services/orderService";

const APITestPage: React.FC = () => {
  const [orderId, setOrderId] = useState(""); // Để trống để user nhập
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<string | null>(null);

  const testAPI = async (apiName: string, apiCall: () => Promise<any>) => {
    try {
      setLoading(apiName);
      console.log(`=== TESTING ${apiName} ===`);

      const result = await apiCall();
      console.log(`${apiName} result:`, result);

      setResults((prev) => ({
        ...prev,
        [apiName]: {
          success: true,
          data: result,
          error: null,
        },
      }));
    } catch (error) {
      console.error(`${apiName} error:`, error);
      setResults((prev) => ({
        ...prev,
        [apiName]: {
          success: false,
          data: null,
          error: error.message || "Unknown error",
        },
      }));
    } finally {
      setLoading(null);
    }
  };

  const testAllAPIs = async () => {
    // Test get all orders first để lấy order ID thật
    await testAPI("getAllOrders", () =>
      fetch(`https://dna-service-se1857.onrender.com/dna_service/orders`).then(
        (res) => res.json()
      )
    );

    if (orderId) {
      await testAPI("getOrderById", () => OrderService.getOrderById(orderId));

      await testAPI("getOrderDetails", () =>
        OrderService.getOrderDetailsByOrderId(orderId)
      );

      await testAPI("getOrderParticipants", () =>
        OrderService.getOrderParticipantsByOrderId(orderId)
      );
    }
  };

  // Test direct fetch without our service layer
  const testDirectAPI = async (endpoint: string, name: string) => {
    await testAPI(name, () =>
      fetch(
        `https://dna-service-se1857.onrender.com/dna_service${endpoint}`
      ).then((res) => res.json())
    );
  };

  const renderResult = (apiName: string) => {
    const result = results[apiName];
    if (!result) return null;

    return (
      <div className="mt-4 p-4 border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold">{apiName}</h3>
          <span
            className={`px-2 py-1 rounded text-xs ${
              result.success
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {result.success ? "SUCCESS" : "ERROR"}
          </span>
        </div>

        {result.success ? (
          <div>
            <div className="text-sm text-gray-600 mb-2">
              Response Type: {typeof result.data} | Length:{" "}
              {Array.isArray(result.data) ? result.data.length : "N/A"}
            </div>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-60">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="bg-red-50 p-3 rounded text-red-800 text-sm">
            Error: {result.error}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">API Test Page 🧪</h1>

      {/* Input Order ID */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Order ID để test (copy từ getAllOrders result):
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="VD: 673c7c6d-1eb1-4ada-bec8-81a01b0af16f"
          />
          <button
            onClick={testAllAPIs}
            disabled={loading !== null}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? `Testing ${loading}...` : "Test All APIs"}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Tip: Test "GET All Orders" trước để lấy Order ID thật từ database
        </p>
      </div>

      {/* Direct API Tests */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => testDirectAPI("/orders", "getAllOrders_Direct")}
          disabled={loading !== null}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          🔍 GET All Orders (Direct)
        </button>

        <button
          onClick={() => testDirectAPI("/service/all", "getAllServices_Direct")}
          disabled={loading !== null}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          🔍 GET All Services (Direct)
        </button>

        <button
          onClick={() =>
            orderId &&
            testDirectAPI(`/orders/${orderId}`, "getOrderById_Direct")
          }
          disabled={loading !== null || !orderId}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          🔍 GET Order By ID (Direct)
        </button>

        <button
          onClick={() =>
            orderId &&
            testDirectAPI(
              `/order-details/${orderId}/all`,
              "getOrderDetails_Direct"
            )
          }
          disabled={loading !== null || !orderId}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          🔍 GET Order Details (Direct)
        </button>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Test Results:</h2>

        {Object.keys(results).map((apiName) => renderResult(apiName))}
      </div>

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">🔧 Debug Info:</h3>
        <div className="space-y-1 text-sm">
          <p>
            <strong>Current Order ID:</strong> {orderId || "Chưa nhập"}
          </p>
          <p>
            <strong>API Base URL:</strong>{" "}
            https://dna-service-se1857.onrender.com/dna_service
          </p>
          <p>
            <strong>Suggested Steps:</strong>
          </p>
          <ol className="list-decimal list-inside ml-4 space-y-1">
            <li>Click "GET All Orders (Direct)" để lấy danh sách orders</li>
            <li>Copy một Order ID từ kết quả (field "id")</li>
            <li>Paste vào input field ở trên</li>
            <li>Test các API khác với Order ID thật</li>
          </ol>
        </div>
      </div>

      {/* Quick Access Links */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Quick Links:</h3>
        <div className="space-y-1 text-sm">
          <p>
            •{" "}
            <a href="/services" className="text-blue-600 hover:underline">
              Back to Services
            </a>
          </p>
          <p>
            •{" "}
            <a href="/order/success" className="text-blue-600 hover:underline">
              Order Success Example
            </a>
          </p>
          {orderId && (
            <p>
              •{" "}
              <a
                href={`/orders/${orderId}`}
                className="text-blue-600 hover:underline"
              >
                View Order Detail Page
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default APITestPage;
