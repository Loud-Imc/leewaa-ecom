'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { productsAPI } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

function SearchBarContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setLoading(true);
                try {
                    const response = await productsAPI.getAll({ search: query, limit: 5 });
                    setSuggestions(response.data.data);
                    setIsOpen(true);
                } catch (error) {
                    console.error('Search error:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setSuggestions([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            setIsOpen(false);
            setIsMobileModalOpen(false);
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md">
            {/* Desktop View Form */}
            <form onSubmit={handleSearch} className="hidden lg:block relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full bg-gray-100/80 dark:bg-white/10 border-2 border-primary/50 dark:border-primary/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/60 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white dark:focus:bg-white/20 transition-all text-sm"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-200 dark:border-white/20 border-t-primary dark:border-t-white"></div>
                    </div>
                )}
            </form>

            {/* Mobile View Lens Icon Button */}
            <button
                type="button"
                onClick={() => setIsMobileModalOpen(true)}
                className="lg:hidden p-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition flex items-center justify-center"
                aria-label="Open search"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>

            {/* Suggestions Dropdown for Desktop */}
            {isOpen && suggestions.length > 0 && (
                <div className="hidden lg:block absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-2">
                        {suggestions.map((product) => (
                            <Link
                                key={product.id}
                                href={`/products/${product.slug}`}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                            >
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                                    <Image
                                        src={getImageUrl(product.images[0])}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {product.name}
                                    </p>
                                    <p className="text-xs text-primary font-bold">
                                        ₹{product.price.toLocaleString()}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="bg-gray-50 dark:bg-black/20 p-2 border-t border-gray-100 dark:border-white/10">
                        <button
                            onClick={handleSearch}
                            className="w-full py-2 text-xs font-bold text-primary dark:text-primary-400 hover:bg-white dark:hover:bg-white/5 rounded-lg transition"
                        >
                            View all results for "{query}"
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile Search Modal Overlay */}
            {isMobileModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 lg:hidden flex flex-col p-4">
                    <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col max-h-[80vh] mt-16 animate-in slide-in-from-top-4 duration-300">
                        {/* Search Input Bar inside Modal */}
                        <form onSubmit={handleSearch} className="relative border-b border-gray-100 dark:border-white/10 flex items-center p-2">
                            <input
                                autoFocus
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search products..."
                                className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 pl-3 pr-10 py-2 outline-none text-base"
                            />
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-200 border-t-primary mr-3"></div>
                            ) : (
                                <button type="submit" className="p-2 text-gray-400 hover:text-primary">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            )}
                        </form>

                        {/* Suggestions in Modal */}
                        {suggestions.length > 0 ? (
                            <div className="overflow-y-auto flex-1 divide-y divide-gray-50 dark:divide-white/5">
                                {suggestions.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/products/${product.slug}`}
                                        onClick={() => { setIsOpen(false); setIsMobileModalOpen(false); }}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                                    >
                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                                            <Image src={getImageUrl(product.images[0])} alt={product.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{product.name}</p>
                                            <p className="text-xs text-primary font-bold">₹{product.price.toLocaleString()}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : query.trim().length >= 2 && !loading ? (
                            <div className="p-6 text-center text-gray-400 text-xs">No products found</div>
                        ) : null}

                        {/* Close Modal Footer Button */}
                        <div className="p-3 bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsMobileModalOpen(false)}
                                className="px-4 py-1.5 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white rounded-lg text-xs font-bold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SearchBar() {
    return (
        <Suspense fallback={
            <div className="relative w-full max-w-md">
                <div className="hidden lg:block relative">
                    <input
                        type="text"
                        placeholder="Search products..."
                        disabled
                        className="w-full bg-gray-100/80 dark:bg-white/10 border-2 border-primary/10 dark:border-primary/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/60 pl-10 pr-4 py-2 rounded-lg text-sm"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/60">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
                <div className="lg:hidden p-2 text-gray-400 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>
        }>
            <SearchBarContent />
        </Suspense>
    );
}
