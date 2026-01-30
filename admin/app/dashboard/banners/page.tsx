'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { bannersAPI } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

export default function BannersPage() {
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBanners();
    }, []);

    const loadBanners = async () => {
        try {
            const response = await bannersAPI.getAll();
            setBanners(response.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;

        try {
            await bannersAPI.delete(id);
            loadBanners();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete banner');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Hero Banners</h1>
                    <p className="text-gray-600">{banners.length} total banners</p>
                </div>
                <Link
                    href="/dashboard/banners/new"
                    className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
                >
                    + Add Banner
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((banner) => (
                    <div key={banner.id} className="bg-white rounded-xl shadow-md overflow-hidden group">
                        <div className="relative h-48 bg-gray-100 italic">
                            <img
                                src={getImageUrl(banner.image)}
                                alt={banner.title}
                                className="w-full h-full object-cover"
                            />
                            {!banner.isActive && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-xs font-bold">INACTIVE</span>
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-lg text-gray-800 mb-1">{banner.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                {banner.description || 'No description'}
                            </p>
                            <div className="flex items-center justify-between border-t pt-4">
                                <span className="text-xs text-gray-400">Pos: {banner.position}</span>
                                <div className="flex gap-3">
                                    <Link
                                        href={`/dashboard/banners/${banner.id}`}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(banner.id)}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {banners.length === 0 && (
                    <div className="col-span-full bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 py-12 text-center text-gray-500">
                        <p>No banners found. Create your first hero slider image!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
