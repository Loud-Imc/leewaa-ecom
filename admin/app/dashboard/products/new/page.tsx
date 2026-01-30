'use client';

import ProductForm from '@/components/ProductForm';

export default function NewProductPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Add New Product</h1>
                <p className="text-gray-600">Create a new product for the store</p>
            </div>

            <ProductForm />
        </div>
    );
}
