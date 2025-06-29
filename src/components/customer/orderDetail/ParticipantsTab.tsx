import React from "react";
import { User, Users } from "lucide-react";
import {
  getStatusInfo,
  formatDateTime,
  formatPrice,
  getPaymentMethodName,
} from "../../../utils/orderDetailUtils";

// ParticipantsTab Component
interface Participant {
  participantName?: string;
  participant_name?: string;
  relationship?: string;
  age?: number | string;
}

interface ParticipantsTabProps {
  participants: Participant[];
}

export const ParticipantsTab: React.FC<ParticipantsTabProps> = ({
  participants,
}) => {
  if (!participants || participants.length === 0) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Người tham gia xét nghiệm
        </h3>

        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có thông tin người tham gia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Người tham gia xét nghiệm
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        {participants.map((participant, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  {participant.participantName ||
                    participant.participant_name ||
                    `Người tham gia ${index + 1}`}
                </h4>
                <p className="text-sm text-gray-500">
                  Người tham gia #{index + 1}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mối quan hệ:</span>
                <span className="font-medium">
                  {participant.relationship || "Chưa xác định"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tuổi:</span>
                <span className="font-medium">
                  {participant.age || "Chưa xác định"} tuổi
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// DetailsTab Component
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
