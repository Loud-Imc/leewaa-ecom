'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { categoriesAPI, uploadAPI } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

interface CategoryFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function CategoryForm({ initialData, isEditing = false }: CategoryFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        parentId: '',
        isActive: true,
        position: 0,
        image: '',
    });
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadCategories();
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                slug: initialData.slug || '',
                description: initialData.description || '',
                parentId: initialData.parentId || '',
                isActive: initialData.isActive ?? true,
                position: initialData.position || 0,
                image: initialData.image || '',
            });
        }
    }, [initialData]);

    const loadCategories = async () => {
        try {
            const response = await categoriesAPI.getAll();
            // Filter out current category from parent options if editing
            const filtered = isEditing
                ? response.data.filter((c: any) => c.id !== initialData?.id)
                : response.data;
            setCategories(filtered);
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setFormData(prev => {
            const newData = { ...prev, [name]: val };
            // Auto-generate slug from name if it's a new category
            if (name === 'name' && !isEditing) {
                newData.slug = value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
            }
            return newData;
        });
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

        try {
            const data = {
                ...formData,
                position: Number(formData.position),
                parentId: formData.parentId || null,
            };

            if (isEditing) {
                await categoriesAPI.update(initialData.id, data);
            } else {
                await categoriesAPI.create(data);
            }
            router.push('/dashboard/categories');
            router.refresh();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save category');
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
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            placeholder="e.g. Water Purifiers"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Slug</label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition cursor-not-allowed"
                            readOnly
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Parent Category</label>
                        <select
                            name="parentId"
                            value={formData.parentId}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                        >
                            <option value="">None (Top Level)</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Position</label>
                        <input
                            type="number"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                        />
                    </div>
                </div>

                {/* Media & Settings */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category Image</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-primary dark:hover:border-primary-400 transition">
                            <div className="space-y-1 text-center">
                                {formData.image ? (
                                    <div className="relative inline-block">
                                        <img
                                            src={getImageUrl(formData.image)}
                                            alt="Preview"
                                            className="h-32 w-32 object-cover rounded-lg shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                            <label className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-primary dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 focus-within:outline-none px-1">
                                                <span>Upload a file</span>
                                                <input
                                                    type="file"
                                                    className="sr-only"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    disabled={uploading}
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 5MB</p>
                                    </>
                                )}
                            </div>
                        </div>
                        {uploading && <p className="text-xs text-primary mt-2 flex items-center gap-2"><div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> Uploading...</p>}
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="w-5 h-5 text-primary border-gray-300 dark:border-gray-500 rounded focus:ring-primary transition dark:bg-gray-800"
                        />
                        <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                            Active Category (Visible to customers)
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            placeholder="Briefly describe what's in this category..."
                        />
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
                    {isEditing ? 'Update Category' : 'Create Category'}
                </button>
            </div>
        </form>
    );
}
