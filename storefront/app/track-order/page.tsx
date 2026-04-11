'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ordersAPI } from '@/lib/api';
import Link from 'next/link';

export default function TrackOrderPage() {
    const [orderNumber, setOrderNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await ordersAPI.track(orderNumber, phone);
            const order = response.data;
            // Redirect to order details page with a track flag
            router.push(`/orders/${order.id}?track=true`);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Order not found. Please check your details and try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
            <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-gray-100 animate-in fade-in zoom-in duration-500">
                <div className="text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 group transition-transform hover:scale-110">
                        <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">Track Order</h2>
                    <p className="mt-4 text-gray-500 font-medium">Enter your details below to see your order status.</p>
                </div>

                <form className="mt-10 space-y-6" onSubmit={handleTrack}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="order-number" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                Order Number
                            </label>
                            <input
                                id="order-number"
                                type="text"
                                required
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                className="appearance-none relative block w-full px-5 py-4 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 font-bold text-lg uppercase tracking-wider"
                                placeholder="ORD-123456-789"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                Phone Number
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="appearance-none relative block w-full px-5 py-4 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300 font-bold text-lg"
                                placeholder="Enter registered phone"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border border-red-100 animate-in shake duration-300">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-5 px-4 border border-transparent text-base font-black rounded-2xl text-white transition-all duration-300 shadow-xl ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-primary hover:bg-primary-700 hover:scale-[1.02] shadow-primary/20'
                                }`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                'FIND MY ORDER'
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center pt-4">
                    <p className="text-gray-400 font-medium text-sm">
                        Forgot your order details?{' '}
                        <Link href="/contact" className="text-primary hover:text-primary-700 font-bold underline underline-offset-4">
                            Contact Support
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
