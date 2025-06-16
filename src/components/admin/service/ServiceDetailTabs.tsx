import React, { useState } from 'react';

import ServiceWorkflowTab from './ServiceWorkflowTab';
import ServiceOrdersTab from './ServiceOrdersTab';

import { Service } from '../../../api/services.api';
import ServiceInfoTab from './ServiceInfoTab';
import ServiceSamplesTab from './ServiceSamplesTab';
import ServiceDocumentsTab from './ServiceDocumentsTab';

interface ServiceDetailTabsProps {
  service: Service;
  onBack?: () => void;
}

const tabs = [
  { label: 'Thông tin', key: 'info' },
  { label: 'Quy trình', key: 'workflow' },
  { label: 'Đơn hàng', key: 'orders' },
  { label: 'Mẫu & Kết quả', key: 'samples' },
  { label: 'Tài liệu', key: 'documents' },
];

export default function ServiceDetailTabs({ service, onBack }: ServiceDetailTabsProps) {
  const [activeTab, setActiveTab] = useState('info');

  return (
    <div>
      {onBack && (
        <button
          className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
          onClick={onBack}
        >
          ← Quay lại danh sách dịch vụ
        </button>
      )}
      <div className="flex gap-2 border-b mb-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 font-medium border-b-2 ${activeTab === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {activeTab === 'info' && <ServiceInfoTab service={service} />}
        {activeTab === 'workflow' && <ServiceWorkflowTab service={service} />}
        {activeTab === 'orders' && <ServiceOrdersTab service={service} />}
        {activeTab === 'samples' && <ServiceSamplesTab service={service} />}
        {activeTab === 'documents' && <ServiceDocumentsTab service={service} />}
      </div>
    </div>
  );
}
