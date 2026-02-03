'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productsAPI } from '@/lib/api';
import { formatPrice, getImageUrl } from '@/lib/utils';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const response = await productsAPI.getAll({ limit: 50 });
            setProducts(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await productsAPI.delete(id);
            loadProducts();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete product');
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
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Products</h1>
                    <p className="text-gray-600 dark:text-gray-400">{products.length} total products</p>
                </div>
                <Link
                    href="/dashboard/products/new"
                    className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
                >
                    + Add Product
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-transparent dark:border-gray-700">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Product
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Price
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Stock
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Status
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition border-b border-gray-100 dark:border-gray-700 last:border-0">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-600">
                                            <img
                                                src={getImageUrl(product.images[0])}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-gray-200">{product.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{product.category?.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-semibold text-primary dark:text-primary-400">{formatPrice(product.price)}</p>
                                        {product.discount > 0 && (
                                            <p className="text-xs text-gray-500 dark:text-gray-500">{product.discount}% off</p>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`font-medium ${product.stock > 10 ? 'text-green-600 dark:text-green-400' : product.stock > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {product.stock}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'}`}>
                                        {product.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/dashboard/products/${product.id}`}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {products.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <p>No products found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
