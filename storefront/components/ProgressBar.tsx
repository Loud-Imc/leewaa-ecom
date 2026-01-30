'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function ProgressBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500); // Small delay to show it's working

        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    if (!loading) return null;

    return (
        <div className="fixed top-0 left-0 right-0 h-1 z-[9999]">
            <div className="h-full bg-primary animate-progress shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            <style jsx>{`
                .animate-progress {
                    width: 0%;
                    animation: progress 0.5s ease-out forwards;
                }
                @keyframes progress {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    );
}
