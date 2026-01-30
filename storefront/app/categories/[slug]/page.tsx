'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { productsAPI, categoriesAPI } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [products, setProducts] = useState<any[]>([]);
    const [category, setCategory] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategoryData = async () => {
            setLoading(true);
            try {
                // In a real app, we might have a getByCategorySlug API
                // For now, we'll fetch all products and filter, or use the search API
                const [productsRes, categoriesRes] = await Promise.all([
                    productsAPI.getAll({ category: slug }),
                    categoriesAPI.getAll()
                ]);

                setProducts(productsRes.data.data);

                const currentCat = categoriesRes.data.find((c: any) => c.slug === slug);
                setCategory(currentCat);
                setError(null);
            } catch (err: any) {
                console.error('Failed to fetch category products:', err);
                setError('Failed to load products for this category.');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchCategoryData();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-500 font-medium">Loading products...</p>
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Category not found</h2>
                <p className="text-gray-600 mb-8">{error || "We couldn't find the category you're looking for."}</p>
                <Link href="/products" className="bg-primary text-white px-8 py-3 rounded-xl font-bold">
                    Back to All Products
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <header className="mb-12">
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Link href="/" className="hover:text-primary">Home</Link>
                    <span>/</span>
                    <Link href="/products" className="hover:text-primary">Products</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{category.name}</span>
                </nav>
                <h1 className="text-4xl font-black text-gray-900 mb-2">{category.name}</h1>
                <p className="text-gray-500">{products.length} products found</p>
            </header>

            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No products found</h2>
                    <p className="text-gray-500 mb-8">There are no products available in this category yet.</p>
                    <Link
                        href="/products"
                        className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-600 transition"
                    >
                        Explore Other Products
                    </Link>
                </div>
            )}
        </div>
    );
}
