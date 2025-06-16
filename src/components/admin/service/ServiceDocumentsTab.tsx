import React from 'react';
import { Service } from '../../../api/services.api';

// Placeholder for documents/files UI
export default function ServiceDocumentsTab({ service }: { service: Service }) {
  return (
    <div>
      <h3 className="font-semibold mb-2">Tài liệu dịch vụ</h3>
      {/* TODO: Quản lý tài liệu, file đính kèm liên quan đến dịch vụ */}
      <div className="text-gray-500">(Chức năng quản lý tài liệu sẽ được phát triển ở đây)</div>
    </div>
  );
}
