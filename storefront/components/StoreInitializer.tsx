'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { cartAPI, usersAPI } from '@/lib/api';
import { setCart } from '@/lib/store/cartSlice';
import { setCredentials } from '@/lib/store/authSlice';
import { fetchWishlist } from '@/lib/store/wishlistSlice';
import { AppDispatch } from '@/lib/store';

export default function StoreInitializer() {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (accessToken) {
            // 1. Restore User Session
            usersAPI.getProfile()
                .then(res => {
                    dispatch(setCredentials({
                        user: res.data,
                        accessToken,
                        refreshToken: refreshToken || ''
                    }));

                    // 2. Restore Cart and Wishlist in parallel
                    return Promise.all([
                        cartAPI.get(),
                        dispatch(fetchWishlist())
                    ]);
                })
                .then(([cartRes]) => {
                    if (cartRes) {
                        const items = cartRes.data.map((item: any) => ({
                            id: item.product.id,
                            productId: item.product.id,
                            name: item.product.name,
                            price: item.product.price,
                            discount: item.product.discount,
                            quantity: item.quantity,
                            image: item.product.images[0],
                            stock: item.product.stock
                        }));
                        dispatch(setCart(items));
                    }
                })
                .catch(err => {
                    console.error('Failed to initialize session or cart', err);
                    // If profile fetch fails, tokens might be invalid
                    if (err.response?.status === 401) {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                    }
                });
        }
    }, [dispatch]);

    return null;
}
