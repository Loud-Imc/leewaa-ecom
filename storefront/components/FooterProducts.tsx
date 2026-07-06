'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { productsAPI } from '@/lib/api';

export const FooterProducts = () => {
    const [products, setProducts] = useState<any[]>([]);
    
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productsAPI.getAll();
                setProducts(response.data?.data || response.data || []);
            } catch (err) {
                console.error('Failed to fetch products for footer:', err);
            }
        };
        fetchProducts();
    }, []);

    // Extract product names (unique)
    const productNames = Array.from(new Set(products.map(p => p.name))).slice(0, 12);

    return (
        <ul className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-white/90">
            {productNames.map((item) => (
                <li key={item}>
                    <Link href={`/products?search=${item}`} className="hover:underline transition-colors text-white">
                        {item}
                    </Link>
                </li>
            ))}
            {productNames.length === 0 && (
                <li>
                    <span className="text-white/50">Loading products...</span>
                </li>
            )}
        </ul>
    );
};
