'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ordersAPI } from '@/lib/api';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';

type FilterTab = 'all' | 'pending' | 'ready-to-print' | 'confirmed' | 'shipped' | 'delivered';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [readyToPrintOrders, setReadyToPrintOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [isPrinting, setIsPrinting] = useState(false);

    useEffect(() => {
        loadOrders();
        loadReadyToPrint();
    }, []);

    const loadOrders = async () => {
        try {
            const response = await ordersAPI.getAll({ limit: 100 });
            setOrders(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const loadReadyToPrint = async () => {
        try {
            const response = await ordersAPI.getReadyToPrint();
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

    const handleBulkPrint = async () => {
        if (selectedOrders.length === 0) return;

        setIsPrinting(true);
        let printContainer: HTMLElement | null = null;

        try {
            // Fetch full details for all selected orders
            const orderDetails = await Promise.all(
                selectedOrders.map(id => ordersAPI.getOne(id))
            );

            // Create print container
            printContainer = document.createElement('div');
            printContainer.id = 'bulk-print-container';
            printContainer.className = 'bulk-print-area';

            // Build all invoices
            orderDetails.forEach((response, index) => {
                const order = response.data;
                const invoiceDiv = document.createElement('div');
                invoiceDiv.className = 'invoice-page';
                invoiceDiv.style.pageBreakAfter = index < orderDetails.length - 1 ? 'always' : 'auto';
                invoiceDiv.innerHTML = generateInvoiceHTML(order, false);
                printContainer!.appendChild(invoiceDiv);
            });

            document.body.appendChild(printContainer);

            // Wait a moment for rendering
            await new Promise(resolve => setTimeout(resolve, 300));

            // Open print dialog
            window.print();

            // Ask user if they actually printed (since we can't detect if they canceled)
            const didPrint = confirm(
                `Did you successfully print the ${selectedOrders.length} order(s)?\n\n` +
                `Click "OK" if you printed them.\n` +
                `Click "Cancel" if you canceled the print dialog.`
            );

            // Cleanup first
            if (printContainer && printContainer.parentNode) {
                document.body.removeChild(printContainer);
            }

            if (didPrint) {
                // User confirmed they printed - mark as printed
                await ordersAPI.markAsPrinted(selectedOrders);
                setSelectedOrders([]);
                loadReadyToPrint();
                loadOrders();
                alert(`✅ ${selectedOrders.length} order(s) marked as printed!`);
            } else {
                // User canceled - don't mark as printed, keep selection
                alert(`Orders were NOT marked as printed. You can print them again later.`);
            }

        } catch (error: any) {
            console.error('Print error:', error);
            alert(`❌ Failed to prepare print: ${error.message || 'Unknown error'}.`);

            // Cleanup on error
            if (printContainer && printContainer.parentNode) {
                document.body.removeChild(printContainer);
            }
        } finally {
            setIsPrinting(false);
        }
    };

    const generateInvoiceHTML = (order: any, addPageBreak: boolean) => {
        const pageBreakStyle = addPageBreak ? 'page-break-after: always;' : '';
        return `
            <div class="print-area" style="${pageBreakStyle} padding: 20px; max-width: 100%;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="font-size: 20pt; margin: 0; color: #2D3748;">LEEWAA E-COMMERCE</h1>
                    <p style="font-size: 10pt; color: #718096; margin: 5px 0;">Tax Invoice</p>
                    <p style="font-size: 9pt; color: #718096;">Order: ${order.orderNumber}</p>
                </div>

                <div class="details-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <h3 style="font-size: 11pt; font-weight: bold; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 8px;">Customer Details</h3>
                        <p style="font-size: 9pt; margin: 4px 0;"><strong>${order.user.firstName} ${order.user.lastName}</strong></p>
                        <p style="font-size: 9pt; margin: 4px 0;">${order.user.email}</p>
                        <p style="font-size: 9pt; margin: 4px 0;">${order.user.phone || 'N/A'}</p>
                    </div>
                    <div>
                        <h3 style="font-size: 11pt; font-weight: bold; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 8px;">Shipping Address</h3>
                        <p style="font-size: 9pt; margin: 4px 0;"><strong>${order.address.fullName}</strong></p>
                        <p style="font-size: 9pt; margin: 4px 0;">${order.address.address}</p>
                        <p style="font-size: 9pt; margin: 4px 0;">${order.address.city}, ${order.address.state} - ${order.address.pincode}</p>
                        <p style="font-size: 9pt; margin: 4px 0;">Phone: ${order.address.phone}</p>
                    </div>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background: #F7FAFC;">
                            <th style="border: 1px solid #E2E8F0; padding: 8px; text-align: left; font-size: 9pt;">Item</th>
                            <th style="border: 1px solid #E2E8F0; padding: 8px; text-align: center; font-size: 9pt;">Qty</th>
                            <th style="border: 1px solid #E2E8F0; padding: 8px; text-align: right; font-size: 9pt;">Price</th>
                            <th style="border: 1px solid #E2E8F0; padding: 8px; text-align: right; font-size: 9pt;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map((item: any) => `
                            <tr>
                                <td style="border: 1px solid #E2E8F0; padding: 8px; font-size: 9pt;">${item.product.name}</td>
                                <td style="border: 1px solid #E2E8F0; padding: 8px; text-align: center; font-size: 9pt;">${item.quantity}</td>
                                <td style="border: 1px solid #E2E8F0; padding: 8px; text-align: right; font-size: 9pt;">₹${item.price.toFixed(2)}</td>
                                <td style="border: 1px solid #E2E8F0; padding: 8px; text-align: right; font-size: 9pt;">₹${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div style="max-width: 300px; margin-left: auto;">
                    <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 9pt;">
                        <span>Subtotal:</span>
                        <span>₹${order.subtotal.toFixed(2)}</span>
                    </div>
                    ${order.discount > 0 ? `
                        <div style="display: flex; justify-content: space-between; margin: 4px 0; font-size: 9pt; color: #48BB78;">
                            <span>Discount:</span>
                            <span>- ₹${order.discount.toFixed(2)}</span>
                        </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; margin: 8px 0; padding-top: 8px; border-top: 2px solid #2D3748; font-size: 11pt; font-weight: bold;">
                        <span>Total:</span>
                        <span>₹${order.total.toFixed(2)}</span>
                    </div>
                    <p style="font-size: 9pt; margin-top: 8px; color: #718096;">
                        Payment: ${order.paymentMethod} ${order.paymentMethod === 'COD' ? '(Cash on Delivery)' : '(Online)'}
                    </p>
                </div>
            </div>
        `;
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <style jsx global>{`
                @media print {
                    /* Hide everything except the bulk print container */
                    body > *:not(#bulk-print-container) {
                        display: none !important;
                    }
                    
                    #bulk-print-container {
                        display: block !important;
                        position: static !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    
                    .invoice-page {
                        page-break-after: always;
                        padding: 20px;
                    }
                    
                    .invoice-page:last-child {
                        page-break-after: auto;
                    }
                }
                
                .bulk-print-area {
                    display: none;
                }
            `}</style>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
                <p className="text-gray-600">{orders.length} total orders</p>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 flex gap-2 border-b border-gray-200">
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
                            : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Bulk Action Bar */}
            {selectedOrders.length > 0 && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="font-semibold text-blue-900">{selectedOrders.length} order(s) selected</span>
                        <button
                            onClick={() => setSelectedOrders([])}
                            className="text-sm text-blue-700 hover:text-blue-900 underline"
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
                                <span className="animate-spin">⏳</span> Generating PDF...
                            </>
                        ) : (
                            <>
                                🖨️ Print Selected ({selectedOrders.length})
                            </>
                        )}
                    </button>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            {activeTab === 'ready-to-print' && (
                                <th className="px-6 py-4 text-left">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                                    />
                                </th>
                            )}
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
                        {displayedOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition">
                                {activeTab === 'ready-to-print' && (
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.includes(order.id)}
                                            onChange={() => handleSelectOrder(order.id)}
                                            className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                                        />
                                    </td>
                                )}
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
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${order.paymentMethod === 'COD'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-green-100 text-green-800'
                                        }`}>
                                        {order.paymentMethod === 'COD' ? '💵 COD' : '🟢 PAID'}
                                    </span>
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

                {displayedOrders.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p>No orders found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
