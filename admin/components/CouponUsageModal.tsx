'use client';

import React, { useEffect, useState } from 'react';
import { couponsAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface CouponUsageModalProps {
    isOpen: boolean;
    onClose: () => void;
    couponId: string | null;
}

export default function CouponUsageModal({ isOpen, onClose, couponId }: CouponUsageModalProps) {
    const [usageData, setUsageData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && couponId) {
            setLoading(true);
            couponsAPI.getUsage(couponId)
                .then(res => setUsageData(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        } else {
            setUsageData(null);
        }
    }, [isOpen, couponId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Coupon Usage Insights</h2>
                        {usageData && <p className="text-sm text-gray-500 mt-1">Code: <span className="font-mono font-bold tracking-wider">{usageData.coupon.code}</span></p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : usageData ? (
                        <div className="space-y-8">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                                    <h3 className="text-blue-800 dark:text-blue-300 text-sm font-medium">Total Orders</h3>
                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{usageData.totalOrders}</p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                    <h3 className="text-indigo-800 dark:text-indigo-300 text-sm font-medium">Revenue Generated</h3>
                                    <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mt-1">{formatPrice(usageData.totalRevenueGenerated)}</p>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800">
                                    <h3 className="text-red-800 dark:text-red-300 text-sm font-medium">Total Discount Given</h3>
                                    <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">{formatPrice(usageData.totalDiscountProvided)}</p>
                                </div>
                            </div>

                            {/* Product Insights */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Products Purchased</h3>
                                {usageData.productInsights.length > 0 ? (
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {usageData.productInsights.map((insight: any, i: number) => (
                                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {insight.product.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right font-medium">
                                                            {insight.unitsSold}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium text-right">
                                                            {formatPrice(insight.revenue)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 italic">No products associated with this coupon's usage yet.</p>
                                )}
                            </div>

                            {/* Recent Orders */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Orders (Top 10)</h3>
                                {usageData.recentOrders.length > 0 ? (
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {usageData.recentOrders.map((order: any, i: number) => (
                                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            #{order.orderNumber}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                            {order.customer}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 text-right">
                                                            -{formatPrice(order.discount)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-bold text-right">
                                                            {formatPrice(order.total)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 italic">No recent orders found.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <p className="text-gray-500 dark:text-gray-400">No usage data found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
