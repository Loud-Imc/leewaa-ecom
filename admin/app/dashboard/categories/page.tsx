'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { categoriesAPI } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await categoriesAPI.getAll();
            setCategories(response.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category? All products in this category will become un-categorized.')) return;

        try {
            await categoriesAPI.delete(id);
            loadCategories();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete category');
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
                    <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
                    <p className="text-gray-600">{categories.length} total categories</p>
                </div>
                <Link
                    href="/dashboard/categories/new"
                    className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
                >
                    + Add Category
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Image</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Slug</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Parent</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {categories.map((category) => (
                            <tr key={category.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div className="w-10 h-10 relative bg-gray-100 rounded-lg overflow-hidden border">
                                        {category.image ? (
                                            <img
                                                src={getImageUrl(category.image)}
                                                alt={category.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                📁
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-800">{category.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{category.slug}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {category.parent?.name || <span className="text-gray-300">-</span>}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {category.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex gap-3">
                                        <Link
                                            href={`/dashboard/categories/${category.id}`}
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            className="text-red-600 hover:text-red-800 font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
