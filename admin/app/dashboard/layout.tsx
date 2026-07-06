'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { DarkModeProvider, useDarkMode } from '@/contexts/DarkModeContext';
import { usersAPI } from '@/lib/api';

function DashboardContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [pendingReturns, setPendingReturns] = useState(0);
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    useEffect(() => {
        const adminUser = localStorage.getItem('adminUser');
        if (adminUser) {
            const parsedUser = JSON.parse(adminUser);
            setUser(parsedUser);
            // Refresh profile from server to get latest permissions
            fetchProfile();
        } else {
            router.push('/');
        }

        // Prevent mouse wheel from changing number input values globally
        const handleWheel = (e: WheelEvent) => {
            const target = e.target as HTMLElement;
            if (
                document.activeElement === target && 
                target.tagName === 'INPUT' && 
                (target as HTMLInputElement).type === 'number'
            ) {
                target.blur();
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, []);

    const fetchProfile = async () => {
        try {
            console.log('🔄 Refreshing profile...');
            const response = await usersAPI.getProfile();
            const freshUser = response.data;
            console.log('✅ Fresh user profile:', freshUser);
            setUser(freshUser);
            localStorage.setItem('adminUser', JSON.stringify(freshUser));
            
            // Also fetch pending returns if user has permission
            fetchPendingReturnsCount();
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            // If unauthorized, logout
            if ((error as any).response?.status === 401) {
                handleLogout();
            }
        }
    };

    const fetchPendingReturnsCount = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) return;
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
            const res = await fetch(`${API_URL}/returns/pending/count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPendingReturns(data.count);
            }
        } catch (error) {
            console.error('Failed to fetch pending returns count', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/');
    };

    const hasPermission = (permission: string) => {
        if (!user) return false;
        if (user.role === 'SUPER_ADMIN') return true;
        console.log('user : ', user)
        const permissions = user.roleEntity?.permissions || [];

        // Special warning for Admins with no role entity assigned
        if (user.role === 'ADMIN' && !user.roleEntity && !user.roleId) {
            console.warn('⚠️ User is a SYSTEM ADMIN but has NO Custom Role assigned. Granular permissions will be empty. Go to User Management and assign a Role from the "Custom Roles" list.');
        }

        const hasPerm = permissions.includes(permission);

        if (!hasPerm && pathname !== '/dashboard') {
            console.log(`🔒 Permission denied for [${permission}]. User:`, {
                role: user.role,
                roleName: user.roleEntity?.name,
                permCount: permissions.length
            });
        }

        return hasPerm;
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            {/* Sidebar */}
            <aside className="w-64 bg-primary dark:bg-gray-800 text-white flex flex-col print-hide shadow-lg">
                <div className="p-6 border-b border-primary-700 dark:border-gray-700 flex flex-col items-center">
                    <img src="/images/Leewa_logo_web.png" alt="Leewaa Logo" className="h-12 w-auto mb-2 brightness-0 invert" />
                    <p className="text-primary-100 dark:text-gray-400 text-[10px] uppercase tracking-widest font-bold">Management Panel</p>
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
                    {hasPermission('products:view') && (
                        <Link
                            href="/dashboard/products"
                            className={`block px-4 py-3 rounded-lg transition ${pathname?.startsWith('/dashboard/products')
                                ? 'bg-primary-700 dark:bg-gray-700 text-white'
                                : 'text-primary-100 dark:text-gray-400 hover:bg-primary-600 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white'
                                }`}
                        >
                            📦 Products
                        </Link>
                    )}
                    {hasPermission('orders:view') && (
                        <Link
                            href="/dashboard/orders"
                            className={`block px-4 py-3 rounded-lg transition ${pathname?.startsWith('/dashboard/orders')
                                ? 'bg-primary-700 dark:bg-gray-700 text-white'
                                : 'text-primary-100 dark:text-gray-400 hover:bg-primary-600 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white'
                                }`}
                        >
                            🛍️ Orders
                        </Link>
                    )}
                    {hasPermission('orders:view') && (
                        <Link
                            href="/dashboard/returns"
                            className={`block px-4 py-3 rounded-lg transition flex items-center justify-between ${pathname?.startsWith('/dashboard/returns')
                                ? 'bg-primary-700 dark:bg-gray-700 text-white'
                                : 'text-primary-100 dark:text-gray-400 hover:bg-primary-600 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white'
                                }`}
                        >
                            <span>🔄 Returns</span>
                            {pendingReturns > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {pendingReturns}
                                </span>
                            )}
                        </Link>
                    )}
                    {hasPermission('categories:view') && (
                        <Link
                            href="/dashboard/categories"
                            className={`block px-4 py-3 rounded-lg transition ${pathname?.startsWith('/dashboard/categories')
                                ? 'bg-primary-700 dark:bg-gray-700 text-white'
                                : 'text-primary-100 dark:text-gray-400 hover:bg-primary-600 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white'
                                }`}
                        >
                            📁 Categories
                        </Link>
                    )}
                    {hasPermission('banners:view') && (
                        <Link
                            href="/dashboard/banners"
                            className={`block px-4 py-3 rounded-lg transition ${pathname?.startsWith('/dashboard/banners')
                                ? 'bg-primary-700 dark:bg-gray-700 text-white'
                                : 'text-primary-100 dark:text-gray-400 hover:bg-primary-600 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white'
                                }`}
                        >
                            🖼️ Banners
                        </Link>
                    )}
                    {hasPermission('coupons:view') && (
                        <Link
                            href="/dashboard/coupons"
                            className={`block px-4 py-3 rounded-lg transition ${pathname?.startsWith('/dashboard/coupons')
                                ? 'bg-primary-700 dark:bg-gray-700 text-white'
                                : 'text-primary-100 dark:text-gray-400 hover:bg-primary-600 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white'
                                }`}
                        >
                            🎫 Coupons
                        </Link>
                    )}
                    {hasPermission('users:view') && (
                        <Link
                            href="/dashboard/users"
                            className={`block px-4 py-3 rounded-lg transition ${pathname?.startsWith('/dashboard/users')
                                ? 'bg-primary-700 dark:bg-gray-700 text-white'
                                : 'text-primary-100 dark:text-gray-400 hover:bg-primary-600 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white'
                                }`}
                        >
                            👥 Users
                        </Link>
                    )}
                    {hasPermission('roles:view') && (
                        <Link
                            href="/dashboard/roles"
                            className={`block px-4 py-3 rounded-lg transition ${pathname?.startsWith('/dashboard/roles')
                                ? 'bg-primary-700 dark:bg-gray-700 text-white'
                                : 'text-primary-100 dark:text-gray-400 hover:bg-primary-600 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white'
                                }`}
                        >
                            🔐 Roles
                        </Link>
                    )}
                    {hasPermission('reports:view') && (
                        <Link
                            href="/dashboard/reports"
                            className={`block px-4 py-3 rounded-lg transition ${pathname?.startsWith('/dashboard/reports')
                                ? 'bg-primary-700 dark:bg-gray-700 text-white'
                                : 'text-primary-100 dark:text-gray-400 hover:bg-primary-600 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white'
                                }`}
                        >
                            📈 Reports
                        </Link>
                    )}
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
