import ProductCard from '@/components/ProductCard';
import { productsAPI } from '@/lib/api';

async function getProducts(searchParams: any) {
    try {
        const response = await productsAPI.getAll(searchParams);
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        return { data: [], meta: { total: 0, page: 1, totalPages: 0 } };
    }
}

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: { page?: string; search?: string; category?: string };
}) {
    const page = Number(searchParams.page) || 1;
    const result = await getProducts({ ...searchParams, page });
    const { data: products, meta } = result;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Products</h1>
                <p className="text-gray-600">
                    Showing {products.length} of {meta.total} products
                </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {products.length === 0 && (
                <div className="text-center py-20">
                    <svg
                        className="w-24 h-24 text-gray-300 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                    </svg>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                        No products found
                    </h3>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
            )}

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                    {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <a
                            key={pageNum}
                            href={`/products?page=${pageNum}`}
                            className={`px-4 py-2 rounded-lg font-medium transition ${pageNum === page
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {pageNum}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
