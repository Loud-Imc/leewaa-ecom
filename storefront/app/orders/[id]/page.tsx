'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ordersAPI } from '@/lib/api';
import { formatPrice, formatDate, getImageUrl } from '@/lib/utils';
import Link from 'next/link';

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
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {isSuccess && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-green-800 mb-2">Order Placed Successfully!</h1>
                    <p className="text-green-700 text-lg">Thank you for your purchase. Your order #{order.orderNumber} has been received.</p>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                <div className="bg-primary p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-primary-100 text-sm uppercase font-bold tracking-wider mb-1">Order Details</p>
                        <h2 className="text-2xl font-bold">#{order.orderNumber}</h2>
                    </div>
                    <div className="text-right">
                        <p className="text-primary-100 text-sm mb-1">Status</p>
                        <span className="bg-white text-primary px-4 py-1 rounded-full text-sm font-bold">
                            {order.status}
                        </span>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Delivery Address
                            </h3>
                            <div className="text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="font-bold text-gray-800">{order.address.fullName}</p>
                                <p>{order.address.address}</p>
                                <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                                <p className="mt-2 text-sm">Phone: {order.address.phone}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Payment & Date
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                                    <span className="text-gray-500">Method</span>
                                    <span className="font-semibold text-gray-800">{order.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                                    <span className="text-gray-500">Date</span>
                                    <span className="font-semibold text-gray-800">{formatDate(order.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-6">Items Ordered</h3>
                    <div className="space-y-4 mb-12">
                        {order.items.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                        src={getImageUrl(item.product.images[0])}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-grow">
                                    <h4 className="font-bold text-gray-800">{item.product.name}</h4>
                                    <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                                    <p className="text-gray-400 text-xs">{formatPrice(item.price)} each</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                        <div className="space-y-3 max-w-sm ml-auto">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-red-600">
                                    <span>Discount</span>
                                    <span>-{formatPrice(order.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600 font-bold uppercase text-xs">Free</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3 flex justify-between text-2xl font-black text-gray-900">
                                <span>Total</span>
                                <span className="text-primary">{formatPrice(order.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                    href="/products"
                    className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-100 text-center"
                >
                    Continue Shopping
                </Link>
                <Link
                    href="/"
                    className="px-8 py-4 border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary-50 transition text-center"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
