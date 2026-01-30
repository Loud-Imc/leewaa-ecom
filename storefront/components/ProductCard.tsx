'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { formatPrice, calculateDiscountedPrice, getImageUrl } from '@/lib/utils';
import { RootState, AppDispatch } from '@/lib/store';
import { addToWishlist, removeFromWishlist } from '@/lib/store/wishlistSlice';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    discount: number;
    images: string[];
    stock: number;
}

export default function ProductCard({ product }: { product: Product }) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const user = useSelector((state: RootState) => state.auth.user);
    const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
    const isInWishlist = wishlistItems.some(item => item.productId === product.id);

    const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
    const imageUrl = getImageUrl(product.images[0]);
    const isDataUrl = imageUrl.startsWith('data:');

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

    return (
        <div className="group relative">
            <Link
                href={`/products/${product.slug}`}
                className="block bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 h-full"
            >
                {/* Image */}
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    {isDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                    ) : (
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                    )}

                    {/* Badge */}
                    {product.discount > 0 && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-lg shadow-red-500/30">
                            {product.discount}% OFF
                        </div>
                    )}

                    {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-white/90 text-gray-900 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest shadow-xl">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors min-h-[3rem]">
                        {product.name}
                    </h3>

                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-2xl font-black text-primary">
                            {formatPrice(discountedPrice)}
                        </span>
                        {product.discount > 0 && (
                            <span className="text-gray-400 line-through text-sm">
                                {formatPrice(product.price)}
                            </span>
                        )}
                    </div>

                    {product.stock > 0 && product.stock < 10 && (
                        <p className="text-orange-500 text-xs font-bold uppercase tracking-wide">
                            Only {product.stock} left in stock!
                        </p>
                    )}
                </div>
            </Link>

            {/* Wishlist Button - Outside Link to avoid nested Link/A issues */}
            <button
                onClick={handleToggleWishlist}
                className={`absolute top-4 right-4 z-20 p-2.5 rounded-full shadow-lg border transition-all duration-300 ${isInWishlist
                    ? 'bg-red-500 border-red-500 text-white translate-y-0 scale-110'
                    : 'bg-white/90 backdrop-blur-md border-gray-100 text-gray-400 lg:translate-y-2 lg:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:text-red-500'
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

