'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { DarkModeProvider, useDarkMode } from '@/contexts/DarkModeContext';

function DashboardContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const { isDarkMode, toggleDarkMode } = useDarkMode();

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
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            {/* Sidebar */}
            <aside className="w-64 bg-primary dark:bg-gray-800 text-white flex flex-col print-hide shadow-lg">
                <div className="p-6 border-b border-primary-700 dark:border-gray-700">
                    <h1 className="text-2xl font-bold">Leewaa Admin</h1>
                    <p className="text-primary-100 dark:text-gray-400 text-sm mt-1">Management Panel</p>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    <Link
                        href="/dashboard"
                        className={`block px-4 py-3 rounded-lg transition ${pathname === '/dashboard'
                            ? 'bg-primary-700 dark:bg-gray-700 text-white'
                            : 'text-primary-100 dark:text-gray-400 hover:bg-primary-600 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white'
                            }`}
                    >
                        📊 Dashboard
                    </Link>
                    <Link
                        href="/dashboard/products"
                        className={`block px-4 py-3 rounded-lg transition ${pathname?.startsWith('/dashboard/products')
                            ? 'bg-primary-700 dark:bg-gray-700 text-white'
                            : 'text-primary-100 dark:text-gray-400 hover:bg-primary-600 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white'
                            }`}
                    >
                        📦 Products
                    </Link>
                    <Link
                        href="/dashboard/orders"
                        className={`block px-4 py-3 rounded-lg transition ${pathname?.startsWith('/dashboard/orders')
                            ? 'bg-primary-700 dark:bg-gray-700 text-white'
                            : 'text-primary-100 dark:text-gray-400 hover:bg-primary-600 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white'
                            }`}
                    >
                        🛍️ Orders
                    </Link>
                    <Link
                        href="/dashboard/categories"
                        className={`block px-4 py-3 rounded-lg transition ${pathname?.startsWith('/dashboard/categories')
                            ? 'bg-primary-700 dark:bg-gray-700 text-white'
                            : 'text-primary-100 dark:text-gray-400 hover:bg-primary-600 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white'
                            }`}
                    >
                        📁 Categories
                    </Link>
                    <Link
                        href="/dashboard/banners"
                        className={`block px-4 py-3 rounded-lg transition ${pathname?.startsWith('/dashboard/banners')
                            ? 'bg-primary-700 dark:bg-gray-700 text-white'
                            : 'text-primary-100 dark:text-gray-400 hover:bg-primary-600 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white'
                            }`}
                    >
                        🖼️ Banners
                    </Link>
                    <Link
                        href="/dashboard/coupons"
                        className={`block px-4 py-3 rounded-lg transition ${pathname?.startsWith('/dashboard/coupons')
                            ? 'bg-primary-700 dark:bg-gray-700 text-white'
                            : 'text-primary-100 dark:text-gray-400 hover:bg-primary-600 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white'
                            }`}
                    >
                        🎫 Coupons
                    </Link>
                    <Link
                        href="/dashboard/users"
                        className={`block px-4 py-3 rounded-lg transition ${pathname?.startsWith('/dashboard/users')
                            ? 'bg-primary-700 dark:bg-gray-700 text-white'
                            : 'text-primary-100 dark:text-gray-400 hover:bg-primary-600 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white'
                            }`}
                    >
                        👥 Users
                    </Link>
                    <Link
                        href="/dashboard/reports"
                        className={`block px-4 py-3 rounded-lg transition ${pathname?.startsWith('/dashboard/reports')
                            ? 'bg-primary-700 dark:bg-gray-700 text-white'
                            : 'text-primary-100 dark:text-gray-400 hover:bg-primary-600 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white'
                            }`}
                    >
                        📈 Reports
                    </Link>
                </nav>

                <div className="p-4 border-t border-primary-600 dark:border-gray-700 space-y-3">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="w-full flex items-center justify-between px-4 py-2 bg-primary-700 dark:bg-gray-700 hover:bg-primary-800 dark:hover:bg-gray-600 rounded-lg transition group"
                        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        <span className="text-sm font-medium">
                            {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
                        </span>
                        <div className={`w-12 h-6 bg-primary-900 dark:bg-gray-500 rounded-full p-1 transition-all duration-300 ${isDarkMode ? 'bg-opacity-50' : ''}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold">{user?.firstName?.[0]}</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                            <p className="text-primary-100 dark:text-gray-400 text-xs">{user?.email}</p>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full py-2 bg-primary-700 dark:bg-gray-700 hover:bg-primary-800 dark:hover:bg-gray-600 rounded-lg transition text-sm"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900">
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DarkModeProvider>
            <DashboardContent>{children}</DashboardContent>
        </DarkModeProvider>
    );
}
