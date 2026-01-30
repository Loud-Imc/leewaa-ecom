'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { productsAPI } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
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
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md">
            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/60 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all text-sm"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                    </div>
                )}
            </form>

            {/* Suggestions Dropdown */}
            {isOpen && suggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-2">
                        {suggestions.map((product) => (
                            <Link
                                key={product.id}
                                href={`/products/${product.slug}`}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                            >
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                    <Image
                                        src={getImageUrl(product.images[0])}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {product.name}
                                    </p>
                                    <p className="text-xs text-primary font-bold">
                                        ₹{product.price.toLocaleString()}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="bg-gray-50 p-2 border-t border-gray-100">
                        <button
                            onClick={handleSearch}
                            className="w-full py-2 text-xs font-bold text-primary hover:bg-white rounded-lg transition"
                        >
                            View all results for "{query}"
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
