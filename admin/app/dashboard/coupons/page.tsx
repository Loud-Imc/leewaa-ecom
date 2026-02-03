'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { couponsAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        try {
            const response = await couponsAPI.getAll();
            setCoupons(response.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;

        try {
            await couponsAPI.delete(id);
            loadCoupons();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete coupon');
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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Coupons</h1>
                    <p className="text-gray-600 dark:text-gray-400">{coupons.length} total coupons</p>
                </div>
                <Link
                    href="/dashboard/coupons/new"
                    className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
                >
                    + Add Coupon
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-transparent dark:border-gray-700">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Code</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Value</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Validity</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Usage</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {coupons.map((coupon) => {
                            const isExpired = new Date(coupon.validTo) < new Date();
                            return (
                                <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition border-b border-gray-100 dark:border-gray-700 last:border-0 text-sm">
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white tracking-wider">
                                        {coupon.code}
                                    </td>
                                    <td className="px-6 py-4 uppercase text-gray-800 dark:text-gray-300">{coupon.type}</td>
                                    <td className="px-6 py-4 font-semibold text-primary dark:text-primary-400">
                                        {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatPrice(coupon.value)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs">
                                            <p><span className="text-gray-400 dark:text-gray-500">From:</span> <span className="text-gray-600 dark:text-gray-300">{new Date(coupon.validFrom).toLocaleDateString()}</span></p>
                                            <p className={isExpired ? 'text-red-500 font-bold' : ''}>
                                                <span className="text-gray-400 dark:text-gray-500">To:</span> <span className={isExpired ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}>{new Date(coupon.validTo).toLocaleDateString()}</span>
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs">
                                            <p><span className="text-gray-400 dark:text-gray-500">Used:</span> <span className="text-gray-600 dark:text-gray-300">{coupon.usedCount}</span></p>
                                            <p><span className="text-gray-400 dark:text-gray-500">Limit:</span> <span className="text-gray-600 dark:text-gray-300">{coupon.usageLimit || '∞'}</span></p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${coupon.isActive && !isExpired ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                                            }`}>
                                            {coupon.isActive && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Paused'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/dashboard/coupons/${coupon.id}`}
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(coupon.id)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {coupons.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <p>No coupons found. Create a promotional code to attract customers!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
