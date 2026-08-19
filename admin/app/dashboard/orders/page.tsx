'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ordersAPI, invoicesAPI } from '@/lib/api';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';

type FilterTab = 'all' | 'pending' | 'ready-to-print' | 'confirmed' | 'shipped' | 'delivered';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [readyToPrintOrders, setReadyToPrintOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [isPrinting, setIsPrinting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadOrders();
        loadReadyToPrint();
    }, []);

    // Debounced search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (activeTab === 'ready-to-print') {
                loadReadyToPrint(searchTerm);
            } else {
                loadOrders(searchTerm);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, activeTab]);

    const loadOrders = async (search?: string) => {
        try {
            setLoading(true);
            const response = await ordersAPI.getAll({
                limit: 100,
                search: search || undefined
            });
            setOrders(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const loadReadyToPrint = async (search?: string) => {
        try {
            const response = await ordersAPI.getReadyToPrint(search);
            setReadyToPrintOrders(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await ordersAPI.updateStatus(id, newStatus);
            loadOrders();
            loadReadyToPrint();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update order status');
        }
    };

    const handleSelectOrder = (orderId: string) => {
        setSelectedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const handleSelectAll = () => {
        const displayedOrders = getDisplayedOrders();
        if (selectedOrders.length === displayedOrders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(displayedOrders.map(o => o.id));
        }
    };

    const handlePrint = async (url: string, count: number) => {
        setIsPrinting(true);
        try {
            // Fetch the PDF as a blob to avoid CORS-related print security errors
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch PDF');

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            // Create a hidden iframe
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            document.body.appendChild(iframe);

            // Load the Blob URL
            iframe.src = blobUrl;

            // Wait for it to load and print
            await new Promise((resolve) => {
                iframe.onload = () => {
                    setTimeout(() => {
                        iframe.contentWindow?.focus();
                        iframe.contentWindow?.print();

                        // DELAY REMOVAL: If the iframe is removed immediately, 
                        // some browsers will snap the print dialog shut.
                        setTimeout(() => {
                            if (document.body.contains(iframe)) {
                                document.body.removeChild(iframe);
                                URL.revokeObjectURL(blobUrl);
                            }
                            resolve(true);
                        }, 5000); // Wait 5 seconds to ensure dialog stays open
                    }, 500);
                };
            });

            // After print dialog opens, ask for confirmation
            const didPrint = confirm(
                `Did you successfully print the ${count} order(s)?\n\n` +
                `Click "OK" if you printed them. This will mark them as printed.\n` +
                `Click "Cancel" if you canceled the print dialog.`
            );

            if (didPrint) {
                await ordersAPI.markAsPrinted(selectedOrders);
                setSelectedOrders([]);
                loadReadyToPrint();
                loadOrders();
                alert(`✅ ${count} order(s) marked as printed!`);
            }
        } catch (error: any) {
            console.error('Print error:', error);
            alert(`❌ Failed to print: ${error.message || 'Unknown error'}.`);
        } finally {
            setIsPrinting(false);
        }
    };

    const handleBulkPrint = async () => {
        if (selectedOrders.length === 0) return;
        const bulkUrl = invoicesAPI.getBulkPrintUrl(selectedOrders);
        await handlePrint(bulkUrl, selectedOrders.length);
    };

    const getDisplayedOrders = () => {
        switch (activeTab) {
            case 'ready-to-print':
                return readyToPrintOrders;
            case 'pending':
                return orders.filter(o => o.status === 'PENDING');
            case 'confirmed':
                return orders.filter(o => o.status === 'CONFIRMED');
            case 'shipped':
                return orders.filter(o => o.status === 'SHIPPED');
            case 'delivered':
                return orders.filter(o => o.status === 'DELIVERED');
            default:
                return orders;
        }
    };

    const displayedOrders = getDisplayedOrders();
    const allSelected = selectedOrders.length === displayedOrders.length && displayedOrders.length > 0;

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Orders</h1>
                    <p className="text-gray-600 dark:text-gray-400">{orders.length} total orders</p>
                </div>
                <button
                    onClick={async () => {
                        setLoading(true);
                        await Promise.all([loadOrders(), loadReadyToPrint()]);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-semibold shadow-sm"
                >
                    🔄 Reload Orders
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative max-w-2xl">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            '🔍'
                        )}
                    </span>
                    <input
                        type="text"
                        placeholder="Search by Order ID, Customer Name, Mobile, or Address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm transition-all"
                    />
                    {searchTerm && !loading && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {loading && orders.length === 0 ? (
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <>
                    {/* Filter Tabs */}
                    <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
                        {[
                            { key: 'all' as FilterTab, label: 'All Orders', count: orders.length },
                            { key: 'pending' as FilterTab, label: 'Pending', count: orders.filter(o => o.status === 'PENDING').length },
                            { key: 'ready-to-print' as FilterTab, label: '🖨️ Ready to Print', count: readyToPrintOrders.length },
                            { key: 'confirmed' as FilterTab, label: 'Confirmed', count: orders.filter(o => o.status === 'CONFIRMED').length },
                            { key: 'shipped' as FilterTab, label: 'Shipped', count: orders.filter(o => o.status === 'SHIPPED').length },
                            { key: 'delivered' as FilterTab, label: 'Delivered', count: orders.filter(o => o.status === 'DELIVERED').length },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => {
                                    setActiveTab(tab.key);
                                    setSelectedOrders([]);
                                }}
                                className={`px-4 py-2 font-medium text-sm transition ${activeTab === tab.key
                                    ? 'border-b-2 border-primary text-primary'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                    }`}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>

                    {/* Bulk Action Bar */}
                    {selectedOrders.length > 0 && (
                        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="font-semibold text-blue-900 dark:text-blue-300">{selectedOrders.length} order(s) selected</span>
                                <button
                                    onClick={() => setSelectedOrders([])}
                                    className="text-sm text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 underline"
                                >
                                    Clear selection
                                </button>
                            </div>
                            <button
                                onClick={handleBulkPrint}
                                disabled={isPrinting}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                            >
                                {isPrinting ? (
                                    <>
                                        <span className="animate-spin">⏳</span> Preparing Print...
                                    </>
                                ) : (
                                    <>
                                        🖨️ Print Selected ({selectedOrders.length})
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-transparent dark:border-gray-700">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    {activeTab === 'ready-to-print' && (
                                        <th className="px-6 py-4 text-left">
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                                            />
                                        </th>
                                    )}
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Total
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Payment
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {displayedOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition border-b border-gray-100 dark:border-gray-700 last:border-0">
                                        {activeTab === 'ready-to-print' && (
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrders.includes(order.id)}
                                                    onChange={() => handleSelectOrder(order.id)}
                                                    className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                                                />
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-800 dark:text-white">{order.orderNumber}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-800 dark:text-gray-200">
                                                    {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest User'}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {order.user ? order.user.email : 'N/A'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(order.createdAt)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-primary dark:text-primary-400">{formatPrice(order.total + (order.handlingFee || 0))}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${order.paymentMethod === 'COD'
                                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
                                                : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                                }`}>
                                                {order.paymentMethod === 'COD' ? '💵 COD' : '🟢 PAID'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-primary ${getStatusColor(order.status)}`}
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
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {displayedOrders.length === 0 && (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <p>No orders found</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
