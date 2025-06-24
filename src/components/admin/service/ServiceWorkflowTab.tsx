import React from 'react';
import { Service } from '../../../services/serviceService';



// Placeholder for workflow/tasks config UI
export default function ServiceWorkflowTab({ service }: { service: Service }) {
  return (
    <div>
      <h3 className="font-semibold mb-2">Quy trình xử lý dịch vụ</h3>
      {/* TODO: Hiển thị và cấu hình động các bước workflow cho từng dịch vụ */}
      <div className="text-gray-500">(Chức năng cấu hình quy trình động cho từng dịch vụ sẽ được phát triển ở đây)</div>
    </div>
  );
}
