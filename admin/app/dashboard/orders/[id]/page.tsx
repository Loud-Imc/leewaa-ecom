'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ordersAPI } from '@/lib/api';
import { formatPrice, formatDate, getStatusColor, getImageUrl } from '@/lib/utils';
import Link from 'next/link';

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
        window.print();
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
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h1>
                <Link href="/dashboard/orders" className="text-primary hover:underline">
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
                        margin: 15mm;
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
                        padding: 20px !important;
                    }
                    
                    /* Professional invoice header */
                    .print-header {
                        display: flex !important;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 3px solid #2D3748;
                    }
                    
                    .print-header h1 {
                        font-size: 28pt !important;
                        color: #1A202C !important;
                        font-weight: 800 !important;
                        margin: 0 !important;
                    }
                    
                    .print-header .subtitle {
                        font-size: 11pt !important;
                        color: #4A5568 !important;
                        margin-top: 5px !important;
                    }
                    
                    /* Remove shadows and adjust colors */
                    .shadow-md,
                    .shadow-lg,
                    .shadow-xl {
                        box-shadow: none !important;
                        border: 1px solid #E2E8F0 !important;
                    }
                    
                    /* Print-specific text sizes */
                    .invoice-number {
                        font-size: 14pt !important;
                        font-weight: 700 !important;
                    }
                    
                    /* Ensure proper spacing */
                    .print-section {
                        page-break-inside: avoid;
                        margin-bottom: 20px;
                    }
                }
                
                /* Hide print area by default */
                .print-area {
                    display: none;
                }
            `}</style>

            {/* SCREEN VIEW */}
            <div className="screen-only print-hide">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/dashboard/orders" className="text-sm text-gray-500 hover:text-primary mb-2 inline-block">
                            &larr; Back to Orders
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-800">Order #{order.orderNumber}</h1>
                        <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
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
                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition flex items-center gap-2"
                            >
                                <span>🖨️</span> Print Order
                            </button>
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                        <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={updating}
                            className="mt-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
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
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ fontSize: '18pt', fontWeight: 'bold', margin: 0 }}>INVOICE</h2>
                        <p className="invoice-number" style={{ marginTop: '5px' }}>#{order.orderNumber}</p>
                        <p style={{ fontSize: '10pt', color: '#4A5568', marginTop: '5px' }}>Date: {formatDate(order.createdAt)}</p>
                    </div>
                </div>

                <div className="print-section" style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '10px', color: '#2D3748' }}>Customer Details</h3>
                    <p style={{ fontSize: '11pt', margin: '5px 0' }}><strong>Name:</strong> {order.user.firstName} {order.user.lastName}</p>
                    <p style={{ fontSize: '11pt', margin: '5px 0' }}><strong>Email:</strong> {order.user.email}</p>
                    <p style={{ fontSize: '11pt', margin: '5px 0' }}><strong>Phone:</strong> {order.user.phone}</p>
                </div>

                <div className="print-section" style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '10px', color: '#2D3748' }}>Shipping Address</h3>
                    <p style={{ fontSize: '11pt', margin: '5px 0' }}>{order.address.fullName}</p>
                    <p style={{ fontSize: '11pt', margin: '5px 0' }}>{order.address.address}</p>
                    <p style={{ fontSize: '11pt', margin: '5px 0' }}>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                    <p style={{ fontSize: '11pt', margin: '5px 0' }}>Phone: {order.address.phone}</p>
                </div>

                <div className="print-section" style={{ marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '15px', color: '#2D3748' }}>Order Items</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#F7FAFC', borderBottom: '2px solid #E2E8F0' }}>
                                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '11pt', fontWeight: 'bold' }}>Product</th>
                                <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '11pt', fontWeight: 'bold' }}>Quantity</th>
                                <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '11pt', fontWeight: 'bold' }}>Unit Price</th>
                                <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '11pt', fontWeight: 'bold' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item: any, index: number) => (
                                <tr key={index} style={{ borderBottom: '1px solid #E2E8F0' }}>
                                    <td style={{ padding: '12px 8px', fontSize: '10pt' }}>{item.product.name}</td>
                                    <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '10pt' }}>{item.quantity}</td>
                                    <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '10pt' }}>{formatPrice(item.price)}</td>
                                    <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '10pt', fontWeight: 'bold' }}>{formatPrice(item.price * item.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="print-section" style={{ marginTop: '30px', borderTop: '2px solid #E2E8F0', paddingTop: '20px' }}>
                    <div style={{ maxWidth: '300px', marginLeft: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11pt', color: '#4A5568' }}>Subtotal:</span>
                            <span style={{ fontSize: '11pt', fontWeight: 'bold' }}>{formatPrice(order.subtotal)}</span>
                        </div>
                        {order.discount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '11pt', color: '#4A5568' }}>Discount:</span>
                                <span style={{ fontSize: '11pt', color: '#DC2626', fontWeight: 'bold' }}>-{formatPrice(order.discount)}</span>
                            </div>
                        )}
                        {order.referralDiscount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '11pt', color: '#4A5568' }}>Referral Discount:</span>
                                <span style={{ fontSize: '11pt', color: '#DC2626', fontWeight: 'bold' }}>-{formatPrice(order.referralDiscount)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11pt', color: '#4A5568' }}>Shipping:</span>
                            <span style={{ fontSize: '11pt', fontWeight: 'bold', color: '#10B981' }}>FREE</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #2D3748', paddingTop: '12px', marginTop: '12px' }}>
                            <span style={{ fontSize: '14pt', fontWeight: 'bold' }}>Total:</span>
                            <span style={{ fontSize: '14pt', fontWeight: 'bold', color: '#2D3748' }}>{formatPrice(order.total)}</span>
                        </div>
                        <div style={{ marginTop: '15px', fontSize: '10pt', color: '#4A5568' }}>
                            <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                            <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '40px', fontSize: '9pt', color: '#718096', textAlign: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
                    <p>Thank you for your business!</p>
                    <p>For support, please contact us at support@leewaa.com</p>
                </div>
            </div>

            {/* SCREEN CONTENT (CONTINUES) */}
            <div className="screen-only print-hide">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Items and Totals */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Order Items</h2>
                            <div className="space-y-4">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                                        <img
                                            src={getImageUrl(item.product.images[0])}
                                            alt={item.product.name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                            <p className="text-sm text-gray-600">{formatPrice(item.price)} each</p>
                                        </div>
                                        <div className="font-bold text-lg text-gray-800">
                                            {formatPrice(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Order Summary</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">{formatPrice(order.subtotal)}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span className="font-semibold">-{formatPrice(order.discount)}</span>
                                    </div>
                                )}
                                {order.referralDiscount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Referral Discount</span>
                                        <span className="font-semibold">-{formatPrice(order.referralDiscount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="font-semibold text-green-600">FREE</span>
                                </div>
                                <div className="border-t-2 pt-3 flex justify-between text-xl font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>{formatPrice(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Customer & Address Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Customer Details</h2>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-600"><span className="font-semibold text-gray-800">Name:</span> {order.user.firstName} {order.user.lastName}</p>
                                <p className="text-gray-600"><span className="font-semibold text-gray-800">Email:</span> {order.user.email}</p>
                                <p className="text-gray-600"><span className="font-semibold text-gray-800">Phone:</span> {order.user.phone}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Shipping Address</h2>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p className="font-semibold text-gray-800">{order.address.fullName}</p>
                                <p>{order.address.address}</p>
                                <p>{order.address.city}, {order.address.state}</p>
                                <p>PIN: {order.address.pincode}</p>
                                <p>Phone: {order.address.phone}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Payment Details</h2>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-600"><span className="font-semibold text-gray-800">Method:</span> {order.paymentMethod}</p>
                                <p className="text-gray-600"><span className="font-semibold text-gray-800">Status:</span> <span className="font-semibold text-green-600">{order.paymentStatus}</span></p>
                                {order.razorpayPaymentId && (
                                    <p className="text-gray-600 break-all"><span className="font-semibold text-gray-800">Payment ID:</span> {order.razorpayPaymentId}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
