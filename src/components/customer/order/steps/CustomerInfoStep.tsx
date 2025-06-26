import React from "react";
import { OrderForm } from "../../../../hooks/useOrderBooking";

interface CustomerInfoStepProps {
  formData: OrderForm;
  updateFormData: (section: keyof OrderForm, data: any) => void;
}

export const CustomerInfoStep: React.FC<CustomerInfoStepProps> = ({
  formData,
  updateFormData,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Thông tin khách hàng</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Họ và tên *
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={formData.customerInfo.fullName}
            onChange={(e) =>
              updateFormData("customerInfo", { fullName: e.target.value })
            }
            placeholder="Nhập họ và tên đầy đủ"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số điện thoại *
          </label>
          <input
            type="tel"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={formData.customerInfo.phone}
            onChange={(e) =>
              updateFormData("customerInfo", { phone: e.target.value })
            }
            placeholder="0987654321"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={formData.customerInfo.email}
            onChange={(e) =>
              updateFormData("customerInfo", { email: e.target.value })
            }
            placeholder="example@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CMND/CCCD *
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={formData.customerInfo.identityCard}
            onChange={(e) =>
              updateFormData("customerInfo", { identityCard: e.target.value })
            }
            placeholder="123456789012"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ *
          </label>
          <textarea
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={formData.customerInfo.address}
            onChange={(e) =>
              updateFormData("customerInfo", { address: e.target.value })
            }
            placeholder="Nhập địa chỉ chi tiết..."
          />
        </div>
      </div>
    </div>
  );
};
