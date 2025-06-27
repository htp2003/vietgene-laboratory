import React from "react";
import { ArrowLeft, CreditCard } from "lucide-react";
import {
  formatDate,
  getStatusInfo,
  getPaymentMethodName,
  getPaymentStatusName,
  formatPrice,
} from "../../../utils/orderDetailUtils";

interface OrderHeaderProps {
  orderData: any;
  onBackClick: () => void;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({
  orderData,
  onBackClick,
}) => {
  const statusInfo = getStatusInfo(orderData.status);
  const StatusIcon = statusInfo.icon;

  return (
    <>
      {/* Top Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBackClick}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Quay lại Dashboard
              </button>
              <span className="text-gray-400">|</span>
              <h1 className="text-xl font-semibold text-gray-900">
                Chi tiết đơn hàng
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${statusInfo.color}`}
              >
                <StatusIcon className="w-4 h-4" />
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Header Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Đơn hàng #{orderData.orderCode}
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-semibold text-red-600 font-mono">
                  {orderData.orderCode}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Ngày đặt:</span>
                <span className="font-medium">
                  {formatDate(orderData.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Cập nhật cuối:</span>
                <span className="font-medium">
                  {formatDate(orderData.updatedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <span
                  className={`font-medium px-2 py-1 rounded text-xs ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Thông tin thanh toán
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng tiền:</span>
                  <span className="font-bold text-lg text-red-600">
                    {formatPrice(orderData.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức:</span>
                  <span className="font-medium">
                    {getPaymentMethodName(orderData.paymentMethod)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span
                    className={`font-medium px-2 py-1 rounded text-xs ${
                      orderData.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {getPaymentStatusName(orderData.paymentStatus)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
