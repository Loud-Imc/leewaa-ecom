'use client';

import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState, AppDispatch } from '@/lib/store';
import { productsAPI, cartAPI } from '@/lib/api';
import { addToCart } from '@/lib/store/cartSlice';
import { addToWishlist, removeFromWishlist } from '@/lib/store/wishlistSlice';
import { formatPrice, calculateDiscountedPrice, getImageUrl } from '@/lib/utils';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
    const [showZoom, setShowZoom] = useState(false);

    // Fetch product
    useEffect(() => {
        productsAPI
            .getBySlug(slug)
            .then((res) => {
                setProduct(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [slug]);

    const isWishlisted = product && wishlistItems.some((item: any) => item.product.id === product.id);

    const toggleWishlist = () => {
        if (!isAuthenticated) {
            router.push('/login?redirect=' + window.location.pathname);
            return;
        }
        if (isWishlisted) {
            dispatch(removeFromWishlist(product.id));
        } else {
            dispatch(addToWishlist(product.id));
        }
    };

    // Swipe State
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe || isRightSwipe) {
            if (isLeftSwipe) {
                setActiveImage((prev) => (prev + 1) % product.images.length);
            } else {
                setActiveImage((prev) => (prev - 1 + product.images.length) % product.images.length);
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left) / width) * 100;
        const y = ((e.pageY - top) / height) * 100;
        setZoomPos({ x, y });
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Product Not Found</h1>
                <button
                    onClick={() => router.push('/products')}
                    className="text-primary hover:underline"
                >
                    Back to Products
                </button>
            </div>
        );
    }



    const discountedPrice = calculateDiscountedPrice(product.price, product.discount);

    const handleAddToCart = async () => {
        setAddingToCart(true);
        // Sync with backend if authenticated
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                await cartAPI.add({ productId: product.id, quantity });
            } catch (error) {
                console.error('Failed to sync cart with backend', error);
            }
        }

        dispatch(
            addToCart({
                id: product.id,
                productId: product.id,
                name: product.name,
                price: product.price,
                discount: product.discount,
                quantity,
                image: product.images[0],
                stock: product.stock,
            })
        );

        // Brief delay for visual feedback before redirect
        setTimeout(() => {
            router.push('/cart');
        }, 500);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Images */}
                <div className="space-y-4">
                    {/* Main Image */}
                    <div
                        className="relative h-96 lg:h-[500px] bg-gray-100 rounded-2xl overflow-hidden shadow-inner group cursor-zoom-in"
                        onMouseEnter={() => setShowZoom(true)}
                        onMouseLeave={() => setShowZoom(false)}
                        onMouseMove={handleMouseMove}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        {getImageUrl(product.images[activeImage]).startsWith('data:') ? (
                            <img
                                src={getImageUrl(product.images[activeImage])}
                                alt={product.name}
                                className={`w-full h-full object-cover transition-transform duration-500 ${showZoom ? 'scale-110' : 'scale-100'}`}
                            />
                        ) : (
                            <div className="relative w-full h-full">
                                <Image
                                    src={getImageUrl(product.images[activeImage])}
                                    alt={product.name}
                                    fill
                                    className={`object-cover transition-transform duration-500 ${showZoom ? 'scale-110' : 'scale-100'}`}
                                    priority
                                />
                                {showZoom && (
                                    <div
                                        className="absolute inset-0 z-10 pointer-events-none hidden lg:block"
                                        style={{
                                            backgroundImage: `url(${getImageUrl(product.images[activeImage])})`,
                                            backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                                            backgroundSize: '250%',
                                        }}
                                    />
                                )}
                            </div>
                        )}

                        <button
                            onClick={(e) => { e.preventDefault(); toggleWishlist(); }}
                            className={`absolute top-4 left-4 z-20 p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'
                                }`}
                        >
                            <svg className="w-6 h-6" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>

                        {product.discount > 0 && (
                            <div className="absolute top-4 right-4 z-20 bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                                {product.discount}% OFF
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {product.images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {product.images.map((image: string, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImage(index)}
                                    className={`relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 border-2 ${activeImage === index
                                        ? 'border-primary ring-2 ring-primary ring-opacity-20 scale-95'
                                        : 'border-transparent hover:border-gray-300'
                                        }`}
                                >
                                    <Image
                                        src={getImageUrl(image)}
                                        alt={`${product.name} thumbnail ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    {activeImage !== index && (
                                        <div className="absolute inset-0 bg-white bg-opacity-10 hover:bg-opacity-0 transition-all"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">{product.name}</h1>

                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-4xl font-bold text-primary">
                            {formatPrice(discountedPrice)}
                        </span>
                        {product.discount > 0 && (
                            <span className="text-2xl text-gray-400 line-through">
                                {formatPrice(product.price)}
                            </span>
                        )}
                    </div>

                    <div className="mb-6">
                        <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
                    </div>

                    {/* Stock Status */}
                    <div className="mb-6">
                        {product.stock > 0 ? (
                            <div className="flex items-center gap-2 text-green-600">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="font-medium">In Stock ({product.stock} available)</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-red-600">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="font-medium">Out of Stock</span>
                            </div>
                        )}
                    </div>

                    {/* Quantity */}
                    {product.stock > 0 && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-100 transition flex items-center justify-center"
                                >
                                    -
                                </button>
                                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-100 transition flex items-center justify-center"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Add to Cart */}
                    {product.stock > 0 && (
                        <button
                            onClick={handleAddToCart}
                            disabled={addingToCart}
                            className={`w-full py-4 rounded-lg text-lg font-semibold transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${addingToCart
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-primary text-white hover:bg-primary-700'
                                }`}
                        >
                            {addingToCart ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Adding to Cart...
                                </>
                            ) : (
                                'Add to Cart'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
