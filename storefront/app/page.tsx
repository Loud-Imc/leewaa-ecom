import Link from 'next/link';
import Image from 'next/image';
import { productsAPI, bannersAPI } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { getImageUrl } from '@/lib/utils';
import HeroSlider from '@/components/HeroSlider';

async function getFeaturedProducts() {
    try {
        const response = await productsAPI.getAll({ isFeatured: true, limit: 8 });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

async function getBanners() {
    try {
        const response = await bannersAPI.getActive();
        return response.data;
    } catch (error) {
        console.error('Error fetching banners:', error);
        return [];
    }
}

export default async function Home() {
    const products = await getFeaturedProducts();
    const banners = await getBanners();

    return (
        <div>
            {/* Hero Section */}
            <HeroSlider banners={banners} />

            {/* Featured Products */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">Featured Products</h2>
                        <Link
                            href="/products"
                            className="text-primary font-semibold hover:text-primary-700 transition"
                        >
                            View All →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {products.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <p className="text-lg">No products available at the moment.</p>
                            <p className="text-sm mt-2">Please check back later!</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Features */}
            <section className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
                        Why Choose Leewaa?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
                            <p className="text-gray-600">Premium water filtration products</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                            <p className="text-gray-600">Quick and reliable shipping</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                            <p className="text-gray-600">Always here to help you</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
