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
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current
                            ? 'opacity-100 z-10'
                            : 'opacity-0 z-0'
                            }`}
                        onMouseEnter={() => setIsAutoPlaying(false)}
                        onMouseLeave={() => setIsAutoPlaying(true)}
                    >
                        {banner.link ? (
                            <Link href={banner.link} className="block w-full h-full">
                                <Image
                                    src={getImageUrl(banner.image)}
                                    alt={banner.title || 'Banner'}
                                    fill
                                    priority={index === 0}
                                    className="object-cover"
                                />
                            </Link>
                        ) : (
                            <Image
                                src={getImageUrl(banner.image)}
                                alt={banner.title || 'Banner'}
                                fill
                                priority={index === 0}
                                className="object-cover"
                            />
                        )}
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
