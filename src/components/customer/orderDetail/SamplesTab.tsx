import React from "react";
import { TestTube } from "lucide-react";
import {
  getSampleStatusInfo,
  formatDateTime,
  getCollectionMethodDisplay,
  extractParticipantName,
  getSampleProgress,
  getSampleProgressColor,
} from "../../../utils/orderDetailUtils";

interface Sample {
  id?: string;
  sample_code?: string;
  sample_type?: string;
  status: string;
  collection_method?: string;
  collection_date?: string;
  received_date?: string;
  shipping_tracking?: string;
  sample_quality?: string;
  notes?: string;
}

interface SamplesSummary {
  total: number;
  collected: number;
  received: number;
  completed: number;
}

interface SamplesTabProps {
  samples: Sample[];
  samplesSummary: SamplesSummary;
}

export const SamplesTab: React.FC<SamplesTabProps> = ({
  samples,
  samplesSummary,
}) => {
  if (!samples || samples.length === 0) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Mẫu xét nghiệm</h3>

        <div className="text-center py-12">
          <TestTube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có mẫu xét nghiệm
          </h4>
          <p className="text-gray-500 mb-4">
            Mẫu sẽ được tạo tự động sau khi đơn hàng được xác nhận
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              💡 <strong>Lưu ý:</strong> Số lượng mẫu sẽ tương ứng với số người
              tham gia xét nghiệm
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Mẫu xét nghiệm</h3>

      {/* Samples List */}
      <div className="space-y-4">
        {samples.map((sample, index) => {
          const sampleStatusInfo = getSampleStatusInfo(sample.status);
          const SampleIcon = sampleStatusInfo.icon;
          const progress = getSampleProgress(sample.status);
          const progressColor = getSampleProgressColor(sample.status);

          return (
            <div
              key={sample.id || index}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              {/* Sample Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <TestTube className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {sample.sample_code || `SAM-${index + 1}`}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {sample.sample_type || "Mẫu nước bọt"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${sampleStatusInfo.color}`}
                  >
                    <SampleIcon className="w-3 h-3" />
                    {sampleStatusInfo.label}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {sampleStatusInfo.description}
                  </p>
                </div>
              </div>

              {/* Sample Details */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 font-medium">Phương thức:</p>
                  <p className="text-gray-900">
                    {getCollectionMethodDisplay(
                      sample.collection_method || "home"
                    )}
                  </p>
                </div>

                {sample.collection_date && (
                  <div>
                    <p className="text-gray-600 font-medium">Ngày thu thập:</p>
                    <p className="text-gray-900">
                      {formatDateTime(sample.collection_date)}
                    </p>
                  </div>
                )}

                {sample.received_date && (
                  <div>
                    <p className="text-gray-600 font-medium">
                      Ngày nhận tại lab:
                    </p>
                    <p className="text-gray-900">
                      {formatDateTime(sample.received_date)}
                    </p>
                  </div>
                )}

                {sample.shipping_tracking && (
                  <div>
                    <p className="text-gray-600 font-medium">Mã vận chuyển:</p>
                    <p className="text-gray-900 font-mono text-xs">
                      {sample.shipping_tracking}
                    </p>
                  </div>
                )}

                {sample.sample_quality && (
                  <div>
                    <p className="text-gray-600 font-medium">Chất lượng:</p>
                    <p className="text-gray-900">{sample.sample_quality}</p>
                  </div>
                )}

                <div>
                  <p className="text-gray-600 font-medium">Người tham gia:</p>
                  <p className="text-gray-900">
                    {extractParticipantName(sample.notes || "")}
                  </p>
                </div>
              </div>

              {/* Sample Notes */}
              {sample.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-red-500">
                  <p className="text-gray-600 text-sm font-medium mb-1">
                    Ghi chú:
                  </p>
                  <p className="text-sm text-gray-800">{sample.notes}</p>
                </div>
              )}

              {/* Sample Progress Bar */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Tiến độ mẫu
                  </span>
                  <span className="text-sm text-gray-500">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Samples Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Tổng quan mẫu xét nghiệm
        </h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {samplesSummary.total}
            </p>
            <p className="text-gray-600">Tổng số mẫu</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">
              {samplesSummary.collected}
            </p>
            <p className="text-gray-600">Đã thu thập</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {samplesSummary.received}
            </p>
            <p className="text-gray-600">Đã nhận lab</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {samplesSummary.completed}
            </p>
            <p className="text-gray-600">Hoàn thành</p>
          </div>
        </div>
      </div>
    </div>
  );
};
