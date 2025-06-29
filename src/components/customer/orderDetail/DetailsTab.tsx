import React from "react";
import { User, Users } from "lucide-react";
import {
  getStatusInfo,
  formatDateTime,
  formatPrice,
  getPaymentMethodName,
} from "../../../utils/orderDetailUtils";

interface DetailsTabProps {
  orderData: any;
}

export const DetailsTab: React.FC<DetailsTabProps> = ({ orderData }) => {
  const statusInfo = getStatusInfo(orderData.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thông tin đơn hàng
        </h3>
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Mã đơn hàng</p>
                <p className="font-medium text-gray-900 font-mono">
                  {orderData.orderCode}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái</p>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {statusInfo.label}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày tạo</p>
                <p className="font-medium text-gray-900">
                  {formatDateTime(orderData.createdAt)}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Tổng tiền</p>
                <p className="font-bold text-lg text-red-600">
                  {formatPrice(orderData.totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Thanh toán</p>
                <p className="font-medium text-gray-900">
                  {getPaymentMethodName(orderData.paymentMethod)}
                </p>
              </div>
              {orderData.notes && (
                <div>
                  <p className="text-sm text-gray-600">Ghi chú</p>
                  <p className="font-medium text-gray-900">{orderData.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
