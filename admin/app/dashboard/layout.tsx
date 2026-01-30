'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const adminUser = localStorage.getItem('adminUser');
        if (adminUser) {
            setUser(JSON.parse(adminUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-primary text-white flex flex-col print-hide">
                <div className="p-6">
                    <h1 className="text-2xl font-bold">Leewaa Admin</h1>
                    <p className="text-primary-200 text-sm mt-1">Management Panel</p>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <Link
                        href="/dashboard"
                        className={`block px-4 py-3 rounded-lg transition ${pathname === '/dashboard'
                            ? 'bg-primary-700 text-white'
                            : 'hover:bg-primary-600'
                            }`}
                    >
                        📊 Dashboard
                    </Link>
                    <Link
                        href="/dashboard/products"
                        className={`block px-4 py-3 rounded-lg transition ${pathname?.startsWith('/dashboard/products')
                            ? 'bg-primary-700 text-white'
                            : 'hover:bg-primary-600'
                            }`}
                    >
                        📦 Products
                    </Link>
                    <Link
                        href="/dashboard/orders"
                        className={`block px-4 py-3 rounded-lg transition ${pathname?.startsWith('/dashboard/orders')
                            ? 'bg-primary-700 text-white'
                            : 'hover:bg-primary-600'
                            }`}
                    >
                        🛍️ Orders
                    </Link>
                    <Link
                        href="/dashboard/categories"
                        className={`block px-4 py-3 rounded-lg transition ${pathname?.startsWith('/dashboard/categories')
                            ? 'bg-primary-700 text-white'
                            : 'hover:bg-primary-600'
                            }`}
                    >
                        📁 Categories
                    </Link>
                    <Link
                        href="/dashboard/banners"
                        className={`block px-4 py-3 rounded-lg transition ${pathname?.startsWith('/dashboard/banners')
                            ? 'bg-primary-700 text-white'
                            : 'hover:bg-primary-600'
                            }`}
                    >
                        🖼️ Banners
                    </Link>
                    <Link
                        href="/dashboard/coupons"
                        className={`block px-4 py-3 rounded-lg transition ${pathname?.startsWith('/dashboard/coupons')
                            ? 'bg-primary-700 text-white'
                            : 'hover:bg-primary-600'
                            }`}
                    >
                        🎫 Coupons
                    </Link>
                    <Link
                        href="/dashboard/users"
                        className={`block px-4 py-3 rounded-lg transition ${pathname?.startsWith('/dashboard/users')
                            ? 'bg-primary-700 text-white'
                            : 'hover:bg-primary-600'
                            }`}
                    >
                        👥 Users
                    </Link>
                    <Link
                        href="/dashboard/reports"
                        className={`block px-4 py-3 rounded-lg transition ${pathname?.startsWith('/dashboard/reports')
                            ? 'bg-primary-700 text-white'
                            : 'hover:bg-primary-600'
                            }`}
                    >
                        📈 Reports
                    </Link>
                </nav>

                <div className="p-4 border-t border-primary-600">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold">{user?.firstName?.[0]}</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                            <p className="text-primary-200 text-xs">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full py-2 bg-primary-700 hover:bg-primary-800 rounded-lg transition text-sm"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
