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
                    <h1 className="text-3xl font-bold text-gray-800">Coupons</h1>
                    <p className="text-gray-600">{coupons.length} total coupons</p>
                </div>
                <Link
                    href="/dashboard/coupons/new"
                    className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
                >
                    + Add Coupon
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Code</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Value</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Validity</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Usage</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {coupons.map((coupon) => {
                            const isExpired = new Date(coupon.validTo) < new Date();
                            return (
                                <tr key={coupon.id} className="hover:bg-gray-50 transition text-sm">
                                    <td className="px-6 py-4 font-bold text-gray-900 tracking-wider">
                                        {coupon.code}
                                    </td>
                                    <td className="px-6 py-4 uppercase">{coupon.type}</td>
                                    <td className="px-6 py-4 font-semibold text-primary">
                                        {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatPrice(coupon.value)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs">
                                            <p><span className="text-gray-400">From:</span> {new Date(coupon.validFrom).toLocaleDateString()}</p>
                                            <p className={isExpired ? 'text-red-500 font-bold' : ''}>
                                                <span className="text-gray-400">To:</span> {new Date(coupon.validTo).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs">
                                            <p><span className="text-gray-400">Used:</span> {coupon.usedCount}</p>
                                            <p><span className="text-gray-400">Limit:</span> {coupon.usageLimit || '∞'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${coupon.isActive && !isExpired ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {coupon.isActive && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Paused'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/dashboard/coupons/${coupon.id}`}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(coupon.id)}
                                                className="text-red-600 hover:text-red-800 font-medium"
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
                    <div className="text-center py-12 text-gray-500">
                        <p>No coupons found. Create a promotional code to attract customers!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
