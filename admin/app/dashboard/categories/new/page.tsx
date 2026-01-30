'use client';

import CategoryForm from '@/components/CategoryForm';
import Link from 'next/link';

export default function NewCategoryPage() {
    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <Link href="/dashboard/categories" className="text-primary hover:text-primary-700 font-medium flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Categories
                </Link>
                <h1 className="text-3xl font-bold text-gray-800">Add New Category</h1>
                <p className="text-gray-600">Create a new category for your products</p>
            </div>

            <CategoryForm />
        </div>
    );
}
