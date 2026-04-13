'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { formatPrice, calculateDiscountedPrice, getImageUrl } from '@/lib/utils';
import { RootState, AppDispatch } from '@/lib/store';
import { addToWishlist, removeFromWishlist } from '@/lib/store/wishlistSlice';
import { addToCart } from '@/lib/store/cartSlice';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    discount: number;
    images: string[];
    stock: number;
    isFeatured?: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const [adding, setAdding] = useState(false);
    const user = useSelector((state: RootState) => state.auth.user);
    const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
    const isInWishlist = wishlistItems.some(item => item.productId === product.id);

    const hasMultipleImages = product.images.length > 1;
    const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
    const imageUrl = getImageUrl(product.images[0]);
    const isDataUrl = imageUrl?.startsWith('data:');

    const handleToggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            router.push(`/login?redirect=${window.location.pathname}`);
            return;
        }

        if (isInWishlist) {
            dispatch(removeFromWishlist(product.id));
        } else {
            dispatch(addToWishlist(product.id));
        }
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (product.stock === 0) return;

        setAdding(true);
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

        setTimeout(() => setAdding(false), 800);
    };

    return (
        <div className="group relative flex flex-col h-full">
            <Link
                href={`/products/${product.slug}`}
                className="flex-1 bg-white rounded-3xl shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-700 overflow-hidden border border-gray-100 flex flex-col group/card"
            >
                {/* Image Section */}
                <div
                    className="relative aspect-[4/5] bg-gray-50 overflow-hidden group/image"
                >
                    {isDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-contain p-4 group-hover/card:scale-110 transition-transform duration-1000 ease-out"
                        />
                    ) : (
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-contain p-4 group-hover/card:scale-110 transition-transform duration-1000 ease-out"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.discount > 0 && (
                            <div className="bg-red-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-xl shadow-red-600/30">
                                {product.discount}% OFF
                            </div>
                        )}
                    </div>

                    {product.stock === 0 && (
                        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center transition-all duration-500">
                            <span className="bg-white text-gray-900 px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-2xl">
                                Depleted
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 leading-snug group-hover/card:text-primary transition-colors text-lg min-h-[3.125rem]">
                        {product.name}
                    </h3>

                    <div className="mt-auto pt-4 border-t border-gray-50">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-col">
                                {product.discount > 0 && (
                                    <span className="text-gray-400 line-through text-[10px] font-bold tracking-wider mb-0.5">
                                        {formatPrice(product.price)}
                                    </span>
                                )}
                                <div className="flex flex-col">
                                    <span className="text-xl font-black text-primary tracking-tight">
                                        {formatPrice(discountedPrice)}
                                    </span>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Inc. GST</span>
                                </div>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0 || adding}
                                className={`h-12 w-12 flex items-center justify-center rounded-2xl transition-all duration-300 relative overflow-hidden ${adding
                                    ? 'bg-green-500 scale-95'
                                    : 'bg-primary hover:bg-primary-dark shadow-[0_10px_20px_-5px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_15px_25px_-5px_rgba(var(--primary-rgb),0.5)] active:scale-90 disabled:bg-gray-100 disabled:shadow-none'
                                    }`}
                                title="Quick Add to Cart"
                            >
                                {adding ? (
                                    <svg className="w-6 h-6 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Wishlist Button */}
            <button
                onClick={handleToggleWishlist}
                className={`absolute top-4 right-4 z-20 h-10 w-10 flex items-center justify-center rounded-2xl shadow-xl transition-all duration-500 ${isInWishlist
                    ? 'bg-red-500 text-white scale-110 border-none'
                    : 'bg-white/90 backdrop-blur-md text-gray-400 border border-gray-100 hover:text-red-500 hover:bg-white'
                    }`}
                title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
                <svg
                    className={`w-5 h-5 ${isInWishlist ? 'fill-current' : 'fill-none'}`}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </svg>
            </button>
        </div>
    );
}

