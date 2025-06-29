import React from "react";
import { MessageCircle, Download, Package } from "lucide-react";

interface ActionButtonsProps {
  orderStatus: string;
  onContactSupport: () => void;
  onDownloadResults: () => void;
  onOrderNewService: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  orderStatus,
  onContactSupport,
  onDownloadResults,
  onOrderNewService,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button
        onClick={onContactSupport}
        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        <MessageCircle className="w-5 h-5" />
        Liên hệ hỗ trợ
      </button>

      {orderStatus === "completed" && (
        <button
          onClick={onDownloadResults}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Tải kết quả xét nghiệm
        </button>
      )}

      <button
        onClick={onOrderNewService}
        className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center flex items-center justify-center gap-2"
      >
        <Package className="w-5 h-5" />
        Đặt dịch vụ mới
      </button>
    </div>
  );
};
