'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/utils';

interface Banner {
    id: string;
    title: string;
    description: string | null;
    image: string;
    link: string | null;
}

interface HeroSliderProps {
    banners: Banner[];
}

export default function HeroSlider({ banners }: HeroSliderProps) {
    const [current, setCurrent] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const nextSlide = useCallback(() => {
        setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, [banners.length]);

    const prevSlide = () => {
        setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    };

    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [nextSlide, isAutoPlaying]);

    if (banners.length === 0) return null;

    return (
        <section className="relative h-[50vh] min-h-[300px] w-full overflow-hidden group">
            {/* Slides */}
            <div className="relative h-full w-full">
                {banners.map((banner, index) => (
                    <div
                        key={banner.id}
                        className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${index === current
                            ? 'opacity-100 translate-x-0 z-10'
                            : 'opacity-0 translate-x-full z-0'
                            }`}
                        onMouseEnter={() => setIsAutoPlaying(false)}
                        onMouseLeave={() => setIsAutoPlaying(true)}
                    >
                        {/* Background Image */}
                        <Image
                            src={getImageUrl(banner.image)}
                            alt={banner.title}
                            fill
                            priority={index === 0}
                            className="object-cover"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>

                        {/* Content */}
                        <div className="container mx-auto px-4 h-full flex items-center relative z-20">
                            <div className={`max-w-2xl transition-all duration-700 delay-300 transform ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                                }`}>
                                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight drop-shadow-xl">
                                    {banner.title}
                                </h1>
                                <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed drop-shadow-lg">
                                    {banner.description}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Link
                                        href={banner.link || '/products'}
                                        className="bg-primary text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-primary-600 transition-all shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95"
                                    >
                                        Shop Now
                                    </Link>
                                    <Link
                                        href="/about"
                                        className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-10 py-4 rounded-xl text-lg font-bold hover:bg-white/20 transition-all active:scale-95"
                                    >
                                        Our Story
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all translate-x-[-20px] group-hover:translate-x-0"
                        aria-label="Previous slide"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-all translate-x-[20px] group-hover:translate-x-0"
                        aria-label="Next slide"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            {/* Indicators */}
            {banners.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrent(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${index === current ? 'w-10 bg-primary' : 'w-2 bg-white/50 hover:bg-white'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        ></button>
                    ))}
                </div>
            )}
        </section>
    );
}
