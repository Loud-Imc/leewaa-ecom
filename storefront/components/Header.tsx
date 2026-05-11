'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { categoriesAPI } from '@/lib/api';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';

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
        <header className="bg-white/90 dark:bg-black/95 text-gray-900 dark:text-white sticky top-0 z-50 backdrop-blur-xl border-b-2 border-primary/10 dark:border-primary/20 shadow-[0_2px_15px_-3px_rgba(21,127,184,0.07)] dark:shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)] transition-all">
            <div className="container mx-auto px-4">
                {/* Main Header Row */}
                <div className="flex items-center justify-between h-16 lg:grid lg:grid-cols-3">

                    {/* Left Section: Search (Mobile & Desktop) */}
                    <div className="flex items-center justify-start">
                        <div className="flex items-center w-full max-w-[200px] lg:max-w-md">
                            <SearchBar />
                        </div>
                    </div>

                    {/* Center Section: Logo */}
                    <div className="flex items-center justify-center">
                        <Link href="/" className="hover:opacity-90 transition flex-shrink-0 py-1">
                            <div className="relative h-10 w-32 lg:h-12 lg:w-40">
                                <Image
                                    src="/images/Leewa_logo_web.png"
                                    alt="Leewaa Logo"
                                    fill
                                    className="object-contain dark:brightness-0 dark:invert transition-all"
                                    priority
                                />
                            </div>
                        </Link>
                    </div>

                    {/* Right Section: Nav & Actions */}
                    <div className="flex items-center justify-end gap-2 lg:gap-4">
                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-6 mr-2">
                            <Link href="/products" className="font-semibold hover:text-white/80 transition text-xs uppercase tracking-widest">
                                Products
                            </Link>
                            <Link href="/track-order" className="font-semibold hover:text-white/80 transition text-xs uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-lg">
                                Track Order
                            </Link>

                            {/* Categories Dropdown */}
                            <div className="relative group">
                                <button className="flex items-center gap-1 font-semibold hover:text-white/80 transition py-2 text-xs uppercase tracking-widest">
                                    Categories
                                    <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <div className="absolute top-full right-0 w-64 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[70]">
                                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-white/10 py-3 overflow-hidden text-gray-800 dark:text-gray-200">
                                        {categories.map((cat: any) => (
                                            <div key={cat.id} className="group/sub relative">
                                                <Link
                                                    href={`/products?category=${cat.id}`}
                                                    className="flex items-center justify-between px-4 py-2 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary transition font-medium text-sm"
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
                                                    <div className="absolute top-0 right-full w-64 pr-1 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200">
                                                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-white/10 py-2">
                                                            {cat.children.map((sub: any) => (
                                                                <Link
                                                                    key={sub.id}
                                                                    href={`/products?category=${sub.id}`}
                                                                    className="block px-4 py-2 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary transition text-xs font-semibold"
                                                                >
                                                                    {sub.name}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </nav>

                        {/* Common Actions */}
                        <div className="flex items-center gap-1 lg:gap-3">
                            <ThemeToggle />
                            <Link href="/wishlist" className="p-2 hover:bg-white/10 rounded-xl transition relative" title="Wishlist">
                                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </Link>

                            <Link href="/cart" className="p-2 hover:bg-white/10 rounded-xl transition relative" title="Cart">
                                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center border-2 border-primary">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {user ? (
                                <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-xl transition flex items-center gap-2">
                                    <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="hidden xl:inline text-xs font-bold truncate max-w-[80px]">{user.firstName}</span>
                                </Link>
                            ) : (
                                <Link href="/login" className="ml-2 bg-primary text-white dark:bg-white dark:text-primary px-4 py-1.5 rounded-xl hover:bg-primary-700 dark:hover:bg-primary-50 transition text-xs font-black uppercase tracking-wider hidden sm:block">
                                    Login
                                </Link>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition"
                            >
                                <svg className="w-6 h-6 text-gray-700 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-gray-100 dark:border-white/10 animate-in slide-in-from-top duration-300">
                        <nav className="flex flex-col gap-4">
                            <Link
                                href="/products"
                                onClick={() => setIsMenuOpen(false)}
                                className="text-sm font-bold uppercase tracking-[0.2em] px-3 py-3.5 bg-gray-50 dark:bg-white/5 hover:bg-primary-50 dark:hover:bg-primary/10 text-gray-700 dark:text-gray-300 rounded-xl transition border border-gray-100 dark:border-white/5"
                            >
                                📦 Products
                            </Link>
                            <Link
                                href="/track-order"
                                onClick={() => setIsMenuOpen(false)}
                                className="text-sm font-bold uppercase tracking-[0.2em] px-3 py-3.5 bg-primary dark:bg-primary/20 text-white dark:text-primary-300 rounded-xl transition flex items-center justify-between shadow-sm"
                            >
                                🔍 Track Order
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>

                             <div className="px-1 mt-2">
                                <p className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest mb-3 pl-2">Categories</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {categories.map((cat: any) => (
                                        <Link
                                            key={cat.id}
                                            href={`/products?category=${cat.id}`}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="text-xs font-bold p-3 bg-gray-50 dark:bg-white/5 hover:bg-primary-50 dark:hover:bg-primary/10 text-gray-700 dark:text-gray-300 rounded-xl transition border border-gray-100 dark:border-white/5"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                             {!user && (
                                <Link
                                    href="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="sm:hidden text-center bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] mt-4 shadow-lg shadow-primary/20"
                                >
                                    Login to Account
                                </Link>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
