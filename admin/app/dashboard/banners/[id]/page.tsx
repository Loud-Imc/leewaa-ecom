'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { bannersAPI } from '@/lib/api';
import BannerForm from '@/components/BannerForm';
import Link from 'next/link';

export default function EditBannerPage() {
    const { id } = useParams();
    const [banner, setBanner] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            loadBanner();
        }
    }, [id]);

    const loadBanner = async () => {
        try {
            const response = await bannersAPI.getOne(id as string);
            setBanner(response.data);
            setLoading(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load banner');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 max-w-2xl mx-auto mt-10">
                <h2 className="text-xl font-bold mb-2">Error</h2>
                <p>{error}</p>
                <Link href="/dashboard/banners" className="mt-4 inline-block text-primary font-semibold hover:underline">
                    &larr; Back to Banners
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <Link href="/dashboard/banners" className="text-primary hover:text-primary-700 font-medium flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Banners
                </Link>
                <h1 className="text-3xl font-bold text-gray-800 text-balance">Edit Banner: {banner?.title}</h1>
                <p className="text-gray-600">Update banner image and destination link</p>
            </div>

            <BannerForm initialData={banner} isEditing={true} />
        </div>
    );
}
