// import React, { useEffect, useState } from 'react';
// import { Service } from '../../../services/serviceService';
// import { User } from '../../../services/userService';


// interface ServiceOrdersTabProps {
//   service: Service;
// }

// export default function ServiceOrdersTab({ service }: ServiceOrdersTabProps) {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     setLoading(true);
//     Promise.all([
//       orders.getAll(),
//       orderDetailsApi.getAll(),
//       usersApi.getAll()
//     ])
//       .then(([orders, orderDetails, users]) => {
//         const relatedOrderIds = orderDetails
//           .filter(od => od.service_id === service.id)
//           .map(od => od.order_id);
//         setOrders(orders.filter(o => relatedOrderIds.includes(o.id)));
//         setUsers(users);
//       })
//       .finally(() => setLoading(false));
//   }, [service.id]);

//   if (loading) return <div>Đang tải đơn hàng...</div>;
//   if (!orders.length) return <div>Chưa có đơn hàng nào cho dịch vụ này.</div>;

//   return (
//     <table className="w-full border text-sm">
//       <thead>
//         <tr>
//           <th className="border p-1">Mã đơn hàng</th>
//           <th className="border p-1">Khách hàng</th>
//           <th className="border p-1">Trạng thái</th>
//           <th className="border p-1">Ngày tạo</th>
//         </tr>
//       </thead>
//       <tbody>
//         {orders.map(order => (
//           <tr key={order.id}>
//             <td className="border p-1">{order.id}</td>
//             <td className="border p-1">{users.find(u => u.id === order.customer_id)?.fullName || order.customer_id}</td>
//             <td className="border p-1">{order.status}</td>
//             <td className="border p-1">{order.created_at}</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// }
