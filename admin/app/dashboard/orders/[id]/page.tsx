'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ordersAPI, invoicesAPI } from '@/lib/api';
import { formatPrice, formatDate, getStatusColor, getImageUrl } from '@/lib/utils';
import Link from 'next/link';

export default function OrderDetailsPage({ 
    params,
    searchParams 
}: { 
    params: Promise<{ id: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { id } = use(params);
    const resolvedSearchParams = use(searchParams);
    const from = resolvedSearchParams?.from;
    const backLink = from === 'returns' ? '/dashboard/returns' : '/dashboard/orders';
    const backText = from === 'returns' ? 'Returns' : 'Orders';

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
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
        const downloadUrl = invoicesAPI.getDownloadUrl(id, true);
        window.open(downloadUrl, '_blank');
    };

    const handlePrint = async () => {
        setIsPrinting(true);
        try {
            const printUrl = invoicesAPI.getDownloadUrl(id, false);

            // Fetch the PDF as a blob to avoid CORS-related print security errors
            const response = await fetch(printUrl, {
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

                        // DELAY REMOVAL: Prevent browser from snapping dialog shut
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
        } catch (error: any) {
            console.error('Print error:', error);
            alert(`❌ Failed to print: ${error.message || 'Unknown error'}.`);
        } finally {
            setIsPrinting(false);
        }
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
                <Link href={backLink} className="text-primary dark:text-primary-400 hover:underline">
                    Back to {backText}
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* SCREEN VIEW */}
            <div className="screen-only">
                {/* Return Request Banner */}
                {order.returnRequests && order.returnRequests.length > 0 && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl shadow-md p-6 border border-orange-200 dark:border-orange-800 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-orange-800 dark:text-orange-400 flex items-center gap-2 mb-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Return Requested
                            </h2>
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                                <span className="font-bold">Reason:</span> {order.returnRequests[0].reason}
                            </p>
                        </div>
                        <div className="sm:text-right">
                            <span className="uppercase px-3 py-1 bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 rounded font-bold text-sm inline-block">
                                {order.returnRequests[0].status}
                            </span>
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                                {formatDate(order.returnRequests[0].createdAt)}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <Link href={backLink} className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-400 mb-2 inline-block">
                            &larr; Back to {backText}
                        </Link>

                        {/* Print Tracking Info */}
                        {order.lastPrintedAt && (
                            <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <span>📄</span>
                                    <span>Last Printed: {formatDate(order.lastPrintedAt)}</span>
                                </div>
                                <button
                                    onClick={handlePrint}
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
                                onClick={handlePrint}
                                disabled={isPrinting}
                                className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 border border-gray-200 dark:border-gray-700 shadow-sm"
                            >
                                {isPrinting ? (
                                    <>
                                        <span className="animate-spin">⏳</span> Preparing...
                                    </>
                                ) : (
                                    <>
                                        <span>🖨️</span> Print Invoice
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleDownload}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download PDF
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Items and Totals */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-transparent dark:border-gray-700">
                            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Order Items</h2>
                            <div className="space-y-4">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                        {item.product.images && item.product.images.length > 0 ? (
                                            <img
                                                src={getImageUrl(item.product.images[0])}
                                                alt={item.product.name}
                                                className="w-20 h-20 object-cover rounded-lg bg-gray-50 dark:bg-gray-900"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                                                🖼️
                                            </div>
                                        )}
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
                                <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Taxable Amount</span>
                                    <span className="font-semibold">{formatPrice(order.taxableAmount || (order.total / 1.18))}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>GST (18%)</span>
                                    <span className="font-semibold">{formatPrice(order.tax || (order.total - (order.total / 1.18)))}</span>
                                </div>
                                {order.handlingFee > 0 && (
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        <span>Offline Payment Handling Fee</span>
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{formatPrice(order.handlingFee)}</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                                    <span>Total Product Value</span>
                                    <span>{formatPrice(order.total)}</span>
                                </div>
                                {order.paymentMethod === 'COD' && order.handlingFee > 0 && (
                                    <div className="flex justify-between text-lg font-bold text-orange-600 dark:text-orange-400 mt-2">
                                        <span>Amount to Collect (Cash)</span>
                                        <span>{formatPrice(order.total + order.handlingFee)}</span>
                                    </div>
                                )}
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
