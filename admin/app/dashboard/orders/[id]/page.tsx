'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ordersAPI } from '@/lib/api';
import { formatPrice, formatDate, getStatusColor, getImageUrl } from '@/lib/utils';
import Link from 'next/link';
import html2pdf from 'html2pdf.js';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadOrder();
    }, [id]);

    const loadOrder = async () => {
        try {
            const response = await ordersAPI.getOne(id);
            setOrder(response.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        setUpdating(true);
        try {
            await ordersAPI.updateStatus(id, newStatus);
            await loadOrder();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update order status');
        } finally {
            setUpdating(false);
        }
    };

    const handleDownload = () => {
        const element = document.querySelector('.print-area') as HTMLElement;
        if (!element) return;

        // Temporarily show the print area for PDF generation
        element.style.display = 'block';
        element.style.maxWidth = '100%';
        element.style.margin = '0';
        element.style.padding = '20px';

        const opt = {
            margin: 10,
            filename: `Invoice-${order.orderNumber}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            // Hide the print area again after PDF is generated
            element.style.display = 'none';
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-xl">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Order Not Found</h1>
                <Link href="/dashboard/orders" className="text-primary dark:text-primary-400 hover:underline">
                    Back to Orders
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 10mm;
                        size: A4;
                    }
                    
                    /* Hide all admin UI */
                    .print-hide,
                    aside,
                    nav,
                    header,
                    select,
                    button,
                    .print\\:hidden,
                    [class*="print:hidden"],
                    a {
                        display: none !important;
                    }
                    
                    /* Reset body and main container */
                    body,
                    html {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        font-family: ui-sans-serif, system-ui, sans-serif;
                    }
                    
                    main {
                        padding: 0 !important;
                        margin: 0 !important;
                        max-width: 100% !important;
                    }
                    
                    /* Show only the printable area */
                    .print-area {
                        display: block !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    
                    /* Professional invoice header */
                    .print-header {
                        display: flex !important;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 20px;
                        padding-bottom: 10px;
                        border-bottom: 2px solid #2D3748;
                    }
                    
                    .print-header h1 {
                        font-size: 20pt !important;
                        color: #1A202C !important;
                        font-weight: 800 !important;
                        margin: 0 !important;
                    }
                    
                    .print-header .subtitle {
                        font-size: 9pt !important;
                        color: #4A5568 !important;
                        margin-top: 2px !important;
                    }

                    .invoice-info h2 {
                        font-size: 16pt !important;
                        font-weight: bold !important;
                        margin: 0 !important;
                        text-align: right;
                    }
                    
                    /* Grid for details to save vertical space */
                    .details-grid {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        gap: 20px !important;
                        margin-bottom: 20px !important;
                    }
                    
                    .print-section {
                        page-break-inside: avoid;
                    }
                    
                    .section-title {
                        font-size: 11pt !important;
                        font-weight: bold !important;
                        border-bottom: 1px solid #E2E8F0;
                        padding-bottom: 4px;
                        margin-bottom: 8px !important;
                        color: #2D3748;
                    }
                    
                    p, td, th {
                        font-size: 9pt !important;
                        line-height: 1.4 !important;
                    }
                    
                    /* Table adjustments */
                    th {
                        padding: 8px 4px !important;
                        background-color: #F7FAFC !important;
                    }
                    
                    td {
                        padding: 6px 4px !important;
                    }

                    .summary-section {
                        margin-top: 15px !important;
                        border-top: 1px solid #E2E8F0;
                        padding-top: 10px !important;
                    }
                    
                    /* Remove shadows */
                    .shadow-md, .shadow-lg {
                        box-shadow: none !important;
                        border: none !important;
                    }
                }
                
                .print-area {
                    display: none;
                }
            `}</style>

            {/* SCREEN VIEW */}
            <div className="screen-only print-hide">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <Link href="/dashboard/orders" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-400 mb-2 inline-block">
                            &larr; Back to Orders
                        </Link>

                        {/* Print Tracking Info */}
                        {order.lastPrintedAt && (
                            <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <span>📄</span>
                                    <span>Last Printed: {formatDate(order.lastPrintedAt)}</span>
                                </div>
                                <button
                                    onClick={handleDownload}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium underline"
                                >
                                    Reprint
                                </button>
                            </div>
                        )}

                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Order #{order.orderNumber}</h1>
                        <p className="text-gray-600 dark:text-gray-400">Placed on {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex flex-wrap justify-end gap-2">
                            <button
                                onClick={handleDownload}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download PDF
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2 border border-transparent dark:border-gray-600"
                            >
                                <span>🖨️</span> Print Order
                            </button>
                            <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                        <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={updating}
                            className="mt-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* PRINT AREA */}
            <div className="print-area">
                <div className="print-header">
                    <div>
                        <h1>LEEWAA E-COMMERCE</h1>
                        <p className="subtitle">Premium Water Purification Systems</p>
                        <p className="subtitle">support@leewaa.com | www.leewaa.com</p>
                    </div>
                    <div className="invoice-info">
                        <h2>INVOICE</h2>
                        <p style={{ margin: '4px 0 0 0', fontWeight: 'bold' }}>#{order.orderNumber}</p>
                        <p style={{ margin: '2px 0 0 0', color: '#4A5568' }}>Date: {formatDate(order.createdAt)}</p>
                    </div>
                </div>

                {/* 2-Column layout for details */}
                <div className="details-grid">
                    <div className="print-section">
                        <h3 className="section-title">Customer Details</h3>
                        <p><strong>Name:</strong> {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest User'}</p>
                        <p><strong>Email:</strong> {order.user ? order.user.email : 'N/A'}</p>
                        <p><strong>Phone:</strong> {order.user ? order.user.phone : 'N/A'}</p>
                    </div>

                    <div className="print-section">
                        <h3 className="section-title">Shipping Address</h3>
                        <p>{order.address.fullName}</p>
                        <p>{order.address.address}</p>
                        <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                        <p>Phone: {order.address.phone}</p>
                    </div>
                </div>

                <div className="print-section">
                    <h3 className="section-title">Order Items</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                                <th style={{ textAlign: 'left' }}>Product</th>
                                <th style={{ textAlign: 'center' }}>Qty</th>
                                <th style={{ textAlign: 'right' }}>Price</th>
                                <th style={{ textAlign: 'right' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item: any, index: number) => (
                                <tr key={index} style={{ borderBottom: '1px solid #FaFaFa' }}>
                                    <td>{item.product.name}</td>
                                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ textAlign: 'right' }}>{formatPrice(item.price)}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatPrice(item.price * item.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="summary-section">
                    <div style={{ maxWidth: '250px', marginLeft: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#4A5568' }}>Subtotal:</span>
                            <span style={{ fontWeight: 'bold' }}>{formatPrice(order.subtotal)}</span>
                        </div>
                        {order.discount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ color: '#4A5568' }}>Discount:</span>
                                <span style={{ color: '#DC2626', fontWeight: 'bold' }}>-{formatPrice(order.discount)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#4A5568' }}>Shipping:</span>
                            <span style={{ fontWeight: 'bold', color: '#10B981' }}>FREE</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2D3748', paddingTop: '8px', marginTop: '4px' }}>
                            <span style={{ fontSize: '11pt', fontWeight: 'bold' }}>Total:</span>
                            <span style={{ fontSize: '11pt', fontWeight: 'bold', color: '#2D3748' }}>{formatPrice(order.total)}</span>
                        </div>
                        <div style={{ marginTop: '10px', fontSize: '9pt', color: '#4A5568' }}>
                            <p><strong>Payment:</strong> {order.paymentMethod} ({order.paymentStatus})</p>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '20px', fontSize: '8pt', color: '#A0AEC0', textAlign: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                    <p>Computer generated invoice. No signature required. | Thank you for your business!</p>
                </div>
            </div>

            {/* SCREEN CONTENT (CONTINUES) */}
            <div className="screen-only print-hide">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Items and Totals */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-transparent dark:border-gray-700">
                            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Order Items</h2>
                            <div className="space-y-4">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                        <img
                                            src={getImageUrl(item.product.images[0])}
                                            alt={item.product.name}
                                            className="w-20 h-20 object-cover rounded-lg bg-gray-50 dark:bg-gray-900"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800 dark:text-white">{item.product.name}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{formatPrice(item.price)} each</p>
                                        </div>
                                        <div className="font-bold text-lg text-gray-800 dark:text-white">
                                            {formatPrice(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-transparent dark:border-gray-700">
                            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Order Summary</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="font-semibold dark:text-gray-200">{formatPrice(order.subtotal)}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400">
                                        <span>Discount</span>
                                        <span className="font-semibold">-{formatPrice(order.discount)}</span>
                                    </div>
                                )}
                                {order.referralDiscount > 0 && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400">
                                        <span>Referral Discount</span>
                                        <span className="font-semibold">-{formatPrice(order.referralDiscount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Shipping</span>
                                    <span className="font-semibold text-green-600 dark:text-green-400">FREE</span>
                                </div>
                                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                                    <span>Total</span>
                                    <span>{formatPrice(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Customer & Address Info */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-transparent dark:border-gray-700">
                            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Customer Details</h2>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-600 dark:text-gray-400">
                                    <span className="font-semibold text-gray-800 dark:text-gray-300">Name:</span> {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest User'}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                    <span className="font-semibold text-gray-800 dark:text-gray-300">Email:</span> {order.user ? order.user.email : 'N/A'}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                    <span className="font-semibold text-gray-800 dark:text-gray-300">Phone:</span> {order.user ? order.user.phone : 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-transparent dark:border-gray-700">
                            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Shipping Address</h2>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <p className="font-semibold text-gray-800 dark:text-gray-300">{order.address.fullName}</p>
                                <p>{order.address.address}</p>
                                <p>{order.address.city}, {order.address.state}</p>
                                <p>PIN: {order.address.pincode}</p>
                                <p>Phone: {order.address.phone}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-transparent dark:border-gray-700">
                            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Payment Details</h2>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-600 dark:text-gray-400"><span className="font-semibold text-gray-800 dark:text-gray-300">Method:</span> {order.paymentMethod}</p>
                                <p className="text-gray-600 dark:text-gray-400"><span className="font-semibold text-gray-800 dark:text-gray-300">Status:</span> <span className="font-semibold text-green-600 dark:text-green-400">{order.paymentStatus}</span></p>
                                {order.razorpayPaymentId && (
                                    <p className="text-gray-600 dark:text-gray-400 break-all"><span className="font-semibold text-gray-800 dark:text-gray-300">Payment ID:</span> {order.razorpayPaymentId}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
