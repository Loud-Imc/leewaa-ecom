'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ordersAPI } from '@/lib/api';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const response = await ordersAPI.getAll({ limit: 50 });
            setOrders(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await ordersAPI.updateStatus(id, newStatus);
            loadOrders();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update order status');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
                <p className="text-gray-600">{orders.length} total orders</p>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                Order ID
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                Customer
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                Date
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                Total
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                Payment
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                Status
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <p className="font-medium text-gray-800">{order.orderNumber}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-medium">{order.user.firstName} {order.user.lastName}</p>
                                        <p className="text-sm text-gray-500">{order.user.email}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-semibold text-primary">{formatPrice(order.total)}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-600">{order.paymentMethod}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(order.status)}`}
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="CONFIRMED">Confirmed</option>
                                        <option value="PROCESSING">Processing</option>
                                        <option value="SHIPPED">Shipped</option>
                                        <option value="DELIVERED">Delivered</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <Link
                                        href={`/dashboard/orders/${order.id}`}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        View Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {orders.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p>No orders found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
