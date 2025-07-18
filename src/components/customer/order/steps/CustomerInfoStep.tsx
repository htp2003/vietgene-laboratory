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

      {/* ✅ Thông báo thân thiện cho user */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Thông tin đơn giản hóa
            </h4>
            <p className="text-sm text-blue-700">
              Chúng tôi chỉ cần <strong>3 thông tin cơ bản</strong> để tạo đơn
              hàng: Họ tên, Email và Địa chỉ giao hàng. Điều này giúp quy trình
              đặt hàng nhanh chóng và đơn giản hơn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
