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
import ProductCard from '@/components/ProductCard';
import {
    FaDroplet,
    FaFilter,
    FaFlask,
    FaVial,
    FaMicrochip,
    FaMobile,
    FaTv,
    FaBolt,
    FaSun,
    FaShieldHalved,
    FaLeaf,
    FaGem,
    FaCheckDouble,
    FaMedal,
    FaCartPlus,
    FaBagShopping
} from 'react-icons/fa6';

const IconMap: any = {
    FaDroplet: <FaDroplet />,
    FaFilter: <FaFilter />,
    FaFlask: <FaFlask />,
    FaVial: <FaVial />,
    FaMicrochip: <FaMicrochip />,
    FaMobile: <FaMobile />,
    FaTv: <FaTv />,
    FaBolt: <FaBolt />,
    FaSun: <FaSun />,
    FaShieldHalved: <FaShieldHalved />,
    FaLeaf: <FaLeaf />,
    FaGem: <FaGem />,
    FaCheckDouble: <FaCheckDouble />,
    FaMedal: <FaMedal />,
};

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    // const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
    // const [showZoom, setShowZoom] = useState(false);

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

    // Fetch related products
    useEffect(() => {
        if (product) {
            productsAPI.getAll({ limit: 5 })
                .then(res => {
                    // Filter out current product and take 4
                    const filtered = res.data.data.filter((p: any) => p.id !== product.id);
                    setRelatedProducts(filtered.slice(0, 4));
                })
                .catch(err => console.error('Error fetching related products:', err));
        }
    }, [product]);

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

    // const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    //     const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    //     const x = ((e.pageX - left) / width) * 100;
    //     const y = ((e.pageY - top) / height) * 100;
    //     setZoomPos({ x, y });
    // };

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

    const handleBuyNow = async () => {
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
        router.push('/checkout');
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Images - Sticky on Desktop */}
                <div className="space-y-3 lg:sticky lg:top-24 self-start">
                    {/* Main Image Slider */}
                    <div
                        className="relative h-[320px] sm:h-[400px] lg:h-[520px] max-w-[400px] lg:max-w-none mx-auto bg-white dark:bg-[#111111] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5 group cursor-default"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        {/* Navigation Arrows */}
                        {product.images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setActiveImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm text-gray-800 dark:text-white shadow-md hover:bg-white dark:hover:bg-black transition-all"
                                    aria-label="Previous image"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setActiveImage((prev) => (prev + 1) % product.images.length)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm text-gray-800 dark:text-white shadow-md hover:bg-white dark:hover:bg-black transition-all"
                                    aria-label="Next image"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </>
                        )}

                        <div
                            className="flex h-full transition-transform duration-500 ease-out"
                            style={{ transform: `translateX(-${activeImage * 100}%)` }}
                        >
                            {product.images.map((image: string, index: number) => (
                                <div key={index} className="w-full h-full flex-shrink-0 relative">
                                    {getImageUrl(image).startsWith('data:') ? (
                                        <img
                                            src={getImageUrl(image)}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={getImageUrl(image)}
                                                alt={`${product.name} ${index + 1}`}
                                                fill
                                                className="object-cover transition-all duration-700"
                                                priority={index === 0}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={(e) => { e.preventDefault(); toggleWishlist(); }}
                            className={`absolute top-4 left-4 z-20 p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-400 hover:text-red-500'
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
                        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                            {product.images.map((image: string, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImage(index)}
                                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 border-2 ${activeImage === index
                                        ? 'border-primary scale-95'
                                        : 'border-transparent hover:border-gray-200 dark:hover:border-white/10'
                                        }`}
                                >
                                    <Image
                                        src={getImageUrl(image)}
                                        alt={`${product.name} thumbnail ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="lg:pl-4">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">{product.name}</h1>

                    <div className="mb-6">
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-3xl font-black text-primary">
                                {formatPrice(discountedPrice)}
                            </span>
                            {product.discount > 0 && (
                                <span className="text-lg text-red-500 line-through font-medium opacity-80">
                                    {formatPrice(product.price)}
                                </span>
                            )}
                        </div>

                        {product.discount > 0 && (
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                    {product.discount}% OFF
                                </span>
                                <span className="text-green-600 dark:text-green-400 text-xs font-bold">
                                    Save {formatPrice(product.price - discountedPrice)}
                                </span>
                            </div>
                        )}

                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Inclusive of GST</p>
                    </div>

                    <div className="mb-6">
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed border-l-2 border-primary/20 pl-4">{product.description}</p>
                    </div>

                    {/* Colors */}
                    {product.colors && product.colors.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Available Variations</h3>
                            <div className="flex flex-wrap gap-2 bg-gray-300 dark:bg-gray-800 p-2 rounded-xl w-fit border border-gray-200 dark:border-white/5">
                                {product.colors.map((color: string, index: number) => (
                                    <div
                                        key={index}
                                        className="w-8 h-8 rounded-full border-2 border-gray-900 dark:border-gray-900 shadow-sm ring-1 ring-gray-200 dark:ring-white/20 cursor-pointer hover:ring-primary hover:scale-110 transition-all"
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stock Status */}
                    <div className="mb-6">
                        {product.stock > 0 ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs font-bold">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                <span>In Stock ({product.stock} Units)</span>
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-xs font-bold">
                                <span>Out of Stock</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    {product.stock > 0 && (
                        <div className="space-y-4 mb-10">
                            {/* Quantity Selector Inline */}
                            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-xl w-fit border border-transparent dark:border-white/5">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Qty</span>
                                <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-white/10">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary transition"
                                    >
                                        -
                                    </button>
                                    <span className="text-sm font-bold w-6 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary transition"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart}
                                    className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 ${addingToCart
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                        : 'bg-white dark:bg-gray-800 text-primary dark:text-primary-300 border-2 border-primary/10 dark:border-white/10 hover:border-primary/30 dark:hover:border-primary/40 hover:bg-primary-50 dark:hover:bg-primary/10'
                                        }`}
                                >
                                    <FaCartPlus className="text-lg" />
                                    Add to Cart
                                </button>

                                <button
                                    onClick={handleBuyNow}
                                    disabled={addingToCart}
                                    className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${addingToCart
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-primary text-white hover:bg-primary-700'
                                        }`}
                                >
                                    <FaBagShopping className="text-lg" />
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Features Grid - NOW UNDER BUTTONS */}
                    {product.features && product.features.length > 0 && (
                        <div className="pt-8 border-t border-gray-100 dark:border-white/5">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Product Highlights</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {product.features.map((feature: any) => (
                                    <div key={feature.id} className="flex gap-3 items-center p-3 bg-gray-50/50 dark:bg-gray-900/50 rounded-xl border border-gray-50 dark:border-white/5 hover:bg-white dark:hover:bg-gray-900 hover:border-primary/10 dark:hover:border-primary/20 transition-all group">
                                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg text-primary shadow-sm border border-gray-50 dark:border-white/5 group-hover:scale-110 transition-transform">
                                            {IconMap[feature.icon] || <FaDroplet />}
                                        </div>
                                        <span className="text-[11px] text-gray-600 dark:text-gray-400 font-bold leading-snug">{feature.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Showcase Section */}
            {product.images.length > 1 && (
                <div className="mt-20">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Product Gallery</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {(() => {
                            const showcaseImages = product.images.slice(1);
                            const finalShowcase = showcaseImages.length % 2 === 0 ? showcaseImages : showcaseImages.slice(0, -1);
                            return finalShowcase.map((image: string, index: number) => (
                                <div key={index} className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-md border border-gray-100 dark:border-white/5 group">
                                    <Image
                                        src={getImageUrl(image)}
                                        alt={`Gallery image ${index + 1}`}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            )}

            {/* Explore More Section */}
            {relatedProducts.length > 0 && (
                <div className="mt-20">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-1">Explore More Products</h2>
                            <div className="h-1 w-12 bg-primary rounded-full"></div>
                        </div>
                        <button
                            onClick={() => router.push('/products')}
                            className="text-xs font-black text-primary uppercase tracking-widest hover:underline transition-all flex items-center gap-1 group"
                        >
                            View All
                            <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                        {relatedProducts.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
