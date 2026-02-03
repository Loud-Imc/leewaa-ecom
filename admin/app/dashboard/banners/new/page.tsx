'use client';

import BannerForm from '@/components/BannerForm';
import Link from 'next/link';

export default function NewBannerPage() {
    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <Link href="/dashboard/banners" className="text-primary dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Banners
                </Link>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Add New Banner</h1>
                <p className="text-gray-600 dark:text-gray-400">Upload a new hero slider image and content</p>
            </div>

            <BannerForm />
        </div>
    );
}
