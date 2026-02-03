'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { couponsAPI } from '@/lib/api';

interface CouponFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function CouponForm({ initialData, isEditing = false }: CouponFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        code: '',
        type: 'PERCENTAGE',
        value: 0,
        minPurchase: 0,
        maxDiscount: 0,
        validFrom: '',
        validTo: '',
        usageLimit: 0,
        isActive: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                code: initialData.code || '',
                type: initialData.type || 'PERCENTAGE',
                value: initialData.value || 0,
                minPurchase: initialData.minPurchase || 0,
                maxDiscount: initialData.maxDiscount || 0,
                validFrom: initialData.validFrom ? new Date(initialData.validFrom).toISOString().split('T')[0] : '',
                validTo: initialData.validTo ? new Date(initialData.validTo).toISOString().split('T')[0] : '',
                usageLimit: initialData.usageLimit || 0,
                isActive: initialData.isActive ?? true,
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = {
                ...formData,
                value: Number(formData.value),
                minPurchase: Number(formData.minPurchase),
                maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
                validFrom: new Date(formData.validFrom).toISOString(),
                validTo: new Date(formData.validTo).toISOString(),
            };

            if (isEditing) {
                await couponsAPI.update(initialData.id, data);
            } else {
                await couponsAPI.create(data);
            }
            router.push('/dashboard/coupons');
            router.refresh();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save coupon');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center gap-3 border border-red-100 dark:border-red-900/50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Coupon Code</label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition uppercase font-mono"
                            placeholder="e.g. SUMMER50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            >
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="FIXED">Fixed Amount (₹)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Value</label>
                            <input
                                type="number"
                                name="value"
                                value={formData.value}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Min Purchase (₹)</label>
                            <input
                                type="number"
                                name="minPurchase"
                                value={formData.minPurchase}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Max Discount (₹)</label>
                            <input
                                type="number"
                                name="maxDiscount"
                                value={formData.maxDiscount}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                placeholder="Optional"
                            />
                        </div>
                    </div>
                </div>

                {/* Validity & Limits */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Valid From</label>
                            <input
                                type="date"
                                name="validFrom"
                                value={formData.validFrom}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Valid To</label>
                            <input
                                type="date"
                                name="validTo"
                                value={formData.validTo}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Usage Limit (Total)</label>
                        <input
                            type="number"
                            name="usageLimit"
                            value={formData.usageLimit}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            placeholder="Leave 0 for unlimited"
                        />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 transition">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="w-5 h-5 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:bg-gray-800 transition"
                        />
                        <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                            Active Coupon (Can be used by customers)
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 border-t border-gray-100 dark:border-gray-700 pt-8">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-8 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-10 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-700 transition shadow-lg hover:shadow-xl disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center gap-3"
                >
                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    {isEditing ? 'Update Coupon' : 'Create Coupon'}
                </button>
            </div>
        </form>
    );
}
