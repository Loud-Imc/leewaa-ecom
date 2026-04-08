'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ordersAPI, invoicesAPI } from '@/lib/api';
import { formatPrice, formatDate, getImageUrl } from '@/lib/utils';
import Link from 'next/link';
import { LOGO_BASE64 } from '@/lib/logo-base64';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const isSuccess = searchParams.get('success') === 'true';
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        ordersAPI.getOne(id)
            .then(res => {
                setOrder(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const handleDownload = async () => {
        const downloadUrl = invoicesAPI.getDownloadUrl(order.id);
        window.open(downloadUrl, '_blank');
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Not Found</h1>
                <Link href="/products" className="text-primary hover:underline">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
            {isSuccess && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                        <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-2">Order Success!</h1>
                    <p className="text-green-700 text-base sm:text-lg">Your order #{order.orderNumber} has been received. Thank you!</p>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                <div className="bg-primary p-5 sm:p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="min-w-0">
                            <p className="text-primary-100 text-[10px] uppercase font-bold tracking-widest mb-1">Order Details</p>
                            <h2 className="text-xl sm:text-2xl font-bold truncate">#{order.orderNumber}</h2>
                        </div>
                        <button
                            onClick={handleDownload}
                            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 border border-white/20 w-fit"
                        >
                            📥 Download Invoice
                        </button>
                    </div>
                    <div className="flex flex-row justify-between md:flex-col items-center md:items-end border-t border-white/10 md:border-0 pt-3 md:pt-0">
                        <p className="text-primary-100 text-[10px] uppercase font-bold tracking-widest md:mb-1">Status</p>
                        <span className="bg-white text-primary px-3 py-1 rounded-full text-xs font-bold">
                            {order.status}
                        </span>
                    </div>
                </div>

                <div className="p-5 sm:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 mb-8 sm:mb-12">
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Shipping Address
                            </h3>
                            <div className="text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm sm:text-base">
                                <p className="font-bold text-gray-800 mb-1">{order.address.fullName}</p>
                                <p className="leading-relaxed">{order.address.address}</p>
                                <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                                <p className="mt-2 font-medium text-gray-900">Phone: {order.address.phone}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Order Summary
                            </h3>
                            <div className="space-y-2 text-sm sm:text-base">
                                <div className="flex justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                                    <span className="text-gray-500">Payment</span>
                                    <span className="font-semibold text-gray-800">{order.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                                    <span className="text-gray-500">Order Date</span>
                                    <span className="font-semibold text-gray-800">{formatDate(order.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-6">Items Ordered</h3>
                    <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
                        {order.items.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm sm:shadow-none sm:hover:bg-gray-50 sm:transition group">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                        src={getImageUrl(item.product.images[0])}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <h4 className="font-bold text-gray-800 text-sm sm:text-base truncate" title={item.product.name}>{item.product.name}</h4>
                                    <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Quantity: {item.quantity}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-primary text-sm sm:text-base">{formatPrice(item.price * item.quantity)}</p>
                                    <p className="text-gray-400 text-[10px] sm:text-xs">{formatPrice(item.price)} each</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100">
                        <div className="space-y-3 max-w-sm ml-auto">
                            <div className="flex justify-between text-gray-600 text-sm">
                                <span>Subtotal</span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-red-600 text-sm">
                                    <span>Discount (Coupon)</span>
                                    <span>-{formatPrice(order.discount)}</span>
                                </div>
                            )}
                            {order.referralDiscount > 0 && (
                                <div className="flex justify-between text-indigo-600 text-sm font-medium">
                                    <span>Referral Benefit</span>
                                    <span>-{formatPrice(order.referralDiscount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-600 text-sm">
                                <span>Shipping</span>
                                <span className="text-green-600 font-bold uppercase text-[10px]">Free</span>
                            </div>
                            <div className="flex justify-between text-gray-400 text-xs border-t pt-2">
                                <span>Taxable Amount (Excl. GST)</span>
                                <span>{formatPrice(order.taxableAmount || (order.total / 1.18))}</span>
                            </div>
                            <div className="flex justify-between text-gray-400 text-xs">
                                <span>GST (18%)</span>
                                <span>{formatPrice(order.tax || (order.total - (order.total / 1.18)))}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3 flex justify-between text-xl sm:text-2xl font-black text-gray-900">
                                <span>Total</span>
                                <span className="text-primary">{formatPrice(order.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link
                    href="/products"
                    className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-100 text-center text-sm sm:text-base"
                >
                    Continue Shopping
                </Link>
                <Link
                    href="/"
                    className="px-8 py-4 border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary-50 transition text-center text-sm sm:text-base"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
