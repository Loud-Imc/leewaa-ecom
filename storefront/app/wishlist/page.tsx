'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store';
import { removeFromWishlist } from '@/lib/store/wishlistSlice';
import { addToCart } from '@/lib/store/cartSlice';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { formatPrice, calculateDiscountedPrice } from '@/lib/utils';

export default function WishlistPage() {
    const { items, loading } = useSelector((state: RootState) => state.wishlist);
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch<AppDispatch>();

    const handleAddToCart = (product: any) => {
        dispatch(addToCart({
            id: product.id,
            productId: product.id,
            name: product.name,
            price: product.price,
            discount: product.discount,
            quantity: 1,
            image: product.images[0],
            stock: product.stock
        }));
    };

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Wishlist awaits</h1>
                    <p className="text-gray-600 mb-8">Login to see the products you've saved and access them from any device.</p>
                    <Link
                        href="/login?redirect=/wishlist"
                        className="block w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-600 transition shadow-lg shadow-primary/20"
                    >
                        Login to Wishlist
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <header className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">My Wishlist</h1>
                    <p className="text-gray-500">{items.length} products saved</p>
                </div>
                <Link
                    href="/products"
                    className="text-primary font-bold hover:underline transition-all hover:pr-2"
                >
                    Continue Shopping →
                </Link>
            </header>

            {items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {items.map((item) => (
                        <div key={item.id}>
                            <ProductCard product={item.product} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Empty Wishlist</h2>
                    <p className="text-gray-500 mb-8">You haven't saved any products yet.</p>
                    <Link
                        href="/products"
                        className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-600 transition"
                    >
                        Explore Products
                    </Link>
                </div>
            )}
        </div>
    );
}
