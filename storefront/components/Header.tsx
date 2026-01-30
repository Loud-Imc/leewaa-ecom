'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { categoriesAPI } from '@/lib/api';
import SearchBar from './SearchBar';

export default function Header() {
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const user = useSelector((state: RootState) => state.auth.user);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const [categories, setCategories] = useState<any[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoriesAPI.getTree();
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    return (
        <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="hover:opacity-90 transition flex-shrink-0 py-1">
                        <div className="relative h-12 w-40 hidden lg:block">
                            <Image
                                src="/images/Leewa_logo_web.png"
                                alt="Leewaa Logo"
                                fill
                                className="object-contain object-left brightness-0 invert"
                                priority
                            />
                        </div>
                        <div className="relative h-10 w-10 lg:hidden">
                            <Image
                                src="/images/Leewa_logo_mobile.png"
                                alt="Leewaa"
                                fill
                                className="object-contain brightness-0 invert"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
                        <SearchBar />
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {/* Categories Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-1 font-semibold hover:text-white/80 transition py-2 text-sm uppercase tracking-wider">
                                Categories
                                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <div className="absolute top-full left-0 w-64 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[70]">
                                <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-3 overflow-hidden text-gray-800">
                                    {categories.map((cat: any) => (
                                        <div key={cat.id} className="group/sub relative">
                                            <Link
                                                href={`/products?category=${cat.id}`}
                                                className="flex items-center justify-between px-4 py-2 hover:bg-primary/5 hover:text-primary transition font-medium text-sm"
                                            >
                                                {cat.name}
                                                {cat.children && cat.children.length > 0 && (
                                                    <svg className="w-4 h-4 -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                )}
                                            </Link>

                                            {/* Subcategories */}
                                            {cat.children && cat.children.length > 0 && (
                                                <div className="absolute top-0 left-full w-64 pl-1 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200">
                                                    <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-2">
                                                        {cat.children.map((sub: any) => (
                                                            <Link
                                                                key={sub.id}
                                                                href={`/products?category=${sub.id}`}
                                                                className="block px-4 py-2 hover:bg-primary/5 hover:text-primary transition text-xs font-semibold"
                                                            >
                                                                {sub.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {categories.length === 0 && (
                                        <p className="px-4 py-2 text-xs text-gray-400">Loading categories...</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Link href="/products" className="font-semibold hover:text-white/80 transition text-sm uppercase tracking-wider">
                            Products
                        </Link>
                    </nav>

                    {/* Right section */}
                    <div className="flex items-center gap-4">
                        {/* Wishlist */}
                        <Link
                            href="/wishlist"
                            className="p-2 hover:bg-white/10 rounded-full transition relative group"
                            title="My Wishlist"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </Link>

                        {/* Cart */}
                        <Link
                            href="/cart"
                            className="relative hover:text-primary-200 transition flex items-center gap-2"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User */}
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="hover:text-primary-200 transition flex items-center gap-2"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                                <span className="hidden md:inline">{user.firstName}</span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-white text-primary px-4 py-2 rounded-lg hover:bg-primary-50 transition font-medium"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
