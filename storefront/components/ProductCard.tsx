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

interface Category {
    id: string;
    name: string;
    slug?: string;
}

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    discount: number;
    description?: string;
    images: string[];
    stock: number;
    isFeatured?: boolean;
    category?: Category;
}

export default function ProductCard({ product }: { product: Product }) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const [adding, setAdding] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);
    const user = useSelector((state: RootState) => state.auth.user);
    const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
    const isInWishlist = wishlistItems.some(item => item.productId === product.id);

    const hasMultipleImages = product.images.length > 1;
    const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
    const savings = product.price - discountedPrice;

    const primaryImage = getImageUrl(product.images[0]);
    const secondaryImage = hasMultipleImages ? getImageUrl(product.images[1]) : null;
    const currentImage = imageIndex === 0 ? primaryImage : (secondaryImage || primaryImage);
    const isDataUrl = currentImage?.startsWith('data:');

    // Urgency level based on stock
    const isLowStock = product.stock > 0 && product.stock <= 5;
    const isOutOfStock = product.stock === 0;

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

        if (isOutOfStock) return;

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

        setTimeout(() => setAdding(false), 1000);
    };

    const handleBuyNow = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOutOfStock) return;

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

        router.push('/checkout');
    };

    return (
        <div className="group relative flex flex-col h-full">
            <Link
                href={`/products/${product.slug}`}
                className="flex-1 bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_60px_-10px_rgba(21,127,184,0.2)] transition-all duration-500 overflow-hidden border border-gray-100/80 hover:border-primary/20 flex flex-col group/card relative"
                onMouseEnter={() => hasMultipleImages && setImageIndex(1)}
                onMouseLeave={() => setImageIndex(0)}
            >
                {/* ── IMAGE ZONE ─────────────────────────────────────── */}
                <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-primary-50 overflow-hidden flex-shrink-0">

                    {/* Primary / Secondary image crossfade */}
                    {isDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={primaryImage}
                            alt={product.name}
                            className={`absolute inset-0 w-full h-full object-contain transition-all duration-700 ease-in-out ${imageIndex === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                        />
                    ) : (
                        <Image
                            src={primaryImage}
                            alt={product.name}
                            fill
                            className={`object-contain transition-all duration-700 ease-in-out ${imageIndex === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    )}

                    {hasMultipleImages && secondaryImage && (
                        <>
                            {secondaryImage.startsWith('data:') ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={secondaryImage}
                                    alt={`${product.name} - alternate view`}
                                    className={`absolute inset-0 w-full h-full object-contain transition-all duration-700 ease-in-out ${imageIndex === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                                />
                            ) : (
                                <Image
                                    src={secondaryImage}
                                    alt={`${product.name} - alternate view`}
                                    fill
                                    className={`object-contain transition-all duration-700 ease-in-out ${imageIndex === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            )}
                        </>
                    )}

                    {/* Subtle shine overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-primary/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* No top-left badges */}

                    {/* ── IMAGE DOT INDICATORS ── */}
                    {hasMultipleImages && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            <span className={`block rounded-full transition-all duration-300 ${imageIndex === 0 ? 'w-4 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-gray-300'}`} />
                            <span className={`block rounded-full transition-all duration-300 ${imageIndex === 1 ? 'w-4 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-gray-300'}`} />
                        </div>
                    )}

                    {/* ── OUT-OF-STOCK OVERLAY ── */}
                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[3px] flex items-center justify-center z-20">
                            <span className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em]">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>

                {/* ── CONTENT ZONE ─────────────────────────────────── */}
                <div className="p-4 flex flex-col flex-1 gap-2">

                    {/* Category pill */}
                    {product.category && (
                        <span className="self-start text-[9px] font-bold uppercase tracking-widest text-primary/70 bg-primary-50 px-2 py-0.5 rounded-full border border-primary/10">
                            {product.category.name}
                        </span>
                    )}

                    {/* Product name */}
                    <h3 className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-2 group-hover/card:text-primary transition-colors duration-300 min-h-[2.5rem]">
                        {product.name}
                    </h3>

                    {/* Short description */}
                    {product.description && (
                        <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 min-h-[2rem]">
                            {product.description}
                        </p>
                    )}

                    {/* ── PRICE ROW ── */}
                    <div className="mt-auto pt-3 border-t border-gray-50 flex items-end justify-between gap-3">
                        <div className="flex flex-col">
                            {/* Savings callout */}
                            {product.discount > 0 && (
                                <span className="text-emerald-600 text-[11px] font-bold uppercase tracking-wider mb-0.5">
                                    Save {formatPrice(savings)}
                                </span>
                            )}

                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-black text-primary leading-none">
                                    {formatPrice(discountedPrice)}
                                </span>
                                {product.discount > 0 && (
                                    <>
                                        <span className="text-gray-500 line-through decoration-red-500 decoration-1 text-sm font-semibold">
                                            {formatPrice(product.price)}
                                        </span>
                                        <span className="inline-flex items-center bg-red-500 text-white px-2 py-1 rounded-full text-[11px] font-black leading-none">
                                            -{product.discount}%
                                        </span>
                                    </>
                                )}
                            </div>
                            <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Incl. GST</span>
                        </div>
                    </div>

                    {/* ── ACTION BUTTONS ── */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock || adding}
                            aria-label={adding ? 'Added to cart' : 'Add to cart'}
                            className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-2xl text-[13px] font-bold transition-all duration-300
                                ${isOutOfStock
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : adding
                                        ? 'bg-emerald-500 text-white scale-95'
                                        : 'bg-white text-primary border-2 border-primary/20 hover:border-primary/40 hover:bg-primary-50 active:scale-95'
                                }`}
                        >
                            {adding ? (
                                <>
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Added!
                                </>
                            ) : (
                                <>
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Cart
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleBuyNow}
                            disabled={isOutOfStock}
                            className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-2xl text-[13px] font-bold transition-all duration-300
                                ${isOutOfStock
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-primary text-white hover:bg-primary-600 shadow-[0_8px_20px_-4px_rgba(21,127,184,0.45)] hover:shadow-[0_12px_28px_-4px_rgba(21,127,184,0.6)] active:scale-95'
                                }`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Buy Now
                        </button>
                    </div>

                    {/* Low stock urgency bar */}
                    {isLowStock && (
                        <div className="flex items-center gap-2 pt-1">
                            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-400 to-red-400 rounded-full"
                                    style={{ width: `${(product.stock / 5) * 100}%` }}
                                />
                            </div>
                            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider whitespace-nowrap">
                                Only {product.stock} left!
                            </span>
                        </div>
                    )}
                </div>
            </Link>

            {/* ── WISHLIST BUTTON (absolute, outside Link) ── */}
            <button
                onClick={handleToggleWishlist}
                aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                className={`absolute top-3 right-3 z-20 h-9 w-9 flex items-center justify-center rounded-xl shadow-lg transition-all duration-300
                    ${isInWishlist
                        ? 'bg-red-500 text-white shadow-red-400/40 scale-110'
                        : 'bg-white/95 backdrop-blur-sm text-gray-300 border border-gray-100 hover:text-red-400 hover:border-red-100 hover:shadow-red-200/50'
                    }`}
            >
                <svg
                    className={`w-4 h-4 transition-transform duration-300 ${isInWishlist ? 'scale-110' : 'scale-100'}`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    fill={isInWishlist ? 'currentColor' : 'none'}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </button>
        </div>
    );
}
