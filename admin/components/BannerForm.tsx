'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { bannersAPI, uploadAPI } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

interface BannerFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function BannerForm({ initialData, isEditing = false }: BannerFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '',
        link: '',
        position: 0,
        isActive: true,
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                image: initialData.image || '',
                link: initialData.link || '',
                position: initialData.position || 0,
                isActive: initialData.isActive ?? true,
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as any;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const response = await uploadAPI.upload(file);
            setFormData(prev => ({ ...prev, image: response.data.url }));
        } catch (err: any) {
            setError('Image upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.image) {
            setError('Banner image is required');
            setLoading(false);
            return;
        }

        try {
            const data = {
                ...formData,
                position: Number(formData.position),
            };

            if (isEditing) {
                await bannersAPI.update(initialData.id, data);
            } else {
                await bannersAPI.create(data);
            }
            router.push('/dashboard/banners');
            router.refresh();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save banner');
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
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Banner Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            placeholder="e.g. Summer Sale 2024"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description (Optional)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            placeholder="Briefly describe the promotion..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Link/URL (Optional)</label>
                        <input
                            type="text"
                            name="link"
                            value={formData.link}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            placeholder="e.g. /products/new-arrivals"
                        />
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Display Position</label>
                            <input
                                type="number"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            />
                        </div>
                        <div className="flex items-end pb-1">
                            <div className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 transition">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                    className="w-5 h-5 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:bg-gray-800 transition"
                                />
                                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                                    Active
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Media */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Banner Image</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Recommended size: 1920x800px for best quality.</p>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-primary dark:hover:border-primary-400 transition h-[260px] relative">
                            <div className="space-y-1 text-center flex flex-col items-center justify-center">
                                {formData.image ? (
                                    <div className="relative group/img">
                                        <img
                                            src={getImageUrl(formData.image)}
                                            alt="Preview"
                                            className="max-h-[220px] w-full object-contain rounded-lg shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-gray-600 dark:text-gray-400 mt-4">
                                            <label className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-primary dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 focus-within:outline-none px-1">
                                                <span className="text-lg">Upload a banner image</span>
                                                <input
                                                    type="file"
                                                    className="sr-only"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    disabled={uploading}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG up to 10MB</p>
                                    </>
                                )}
                            </div>
                        </div>
                        {uploading && (
                            <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 flex items-center justify-center rounded-lg">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 border-4 border-primary dark:border-primary-400 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm font-bold text-primary dark:text-primary-400">Uploading...</span>
                                </div>
                            </div>
                        )}
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
                    disabled={loading || uploading}
                    className="px-10 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-700 transition shadow-lg hover:shadow-xl disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center gap-3"
                >
                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    {isEditing ? 'Update Banner' : 'Create Banner'}
                </button>
            </div>
        </form>
    );
}
