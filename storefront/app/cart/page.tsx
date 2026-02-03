'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RootState } from '@/lib/store';
import { updateQuantity, removeFromCart, setCart } from '@/lib/store/cartSlice';
import { cartAPI } from '@/lib/api';
import { formatPrice, calculateDiscountedPrice, getImageUrl } from '@/lib/utils';

export default function CartPage() {
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const cartTotal = useSelector((state: RootState) => state.cart.total);
    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            cartAPI.get()
                .then(res => {
                    const items = res.data.map((item: any) => ({
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
                })
                .catch(err => console.error('Failed to fetch cart', err));
        }
    }, [dispatch]);

    const handleUpdateQuantity = async (productId: string, quantity: number) => {
        if (quantity < 1) return;

        // Sync with backend if authenticated
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                // Find the cart item ID from the items if available, or fetch fresh
                // For simplicity, we can fetch the cart first or update by productId if the backend supports it
                // My backend implementation uses cart item ID. So I need to map item.productId to cart item.id
                // Since this page might not have the cart item ID from backend yet, let's just dispatch to Redux
                // and we'll fix the initial load to include those IDs.

                // Fetching cart anyway to get IDs
                const res = await cartAPI.get();
                const cartItem = res.data.find((i: any) => i.productId === productId);
                if (cartItem) {
                    await cartAPI.update(cartItem.id, { quantity });
                }
            } catch (error) {
                console.error('Failed to update cart on backend', error);
            }
        }

        dispatch(updateQuantity({ productId, quantity }));
    };

    const handleRemove = async (productId: string) => {
        // Sync with backend if authenticated
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const res = await cartAPI.get();
                const cartItem = res.data.find((i: any) => i.productId === productId);
                if (cartItem) {
                    await cartAPI.remove(cartItem.id);
                }
            } catch (error) {
                console.error('Failed to remove item from backend cart', error);
            }
        }
        dispatch(removeFromCart(productId));
    };

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <svg
                    className="w-32 h-32 text-gray-300 mx-auto mb-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                </svg>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
                <p className="text-gray-600 mb-8">Add some products to get started!</p>
                <button
                    onClick={() => router.push('/products')}
                    className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map((item) => {
                        const discountedPrice = calculateDiscountedPrice(item.price, item.discount);
                        const itemTotal = discountedPrice * item.quantity;

                        return (
                            <div
                                key={item.productId}
                                className="bg-white rounded-lg shadow-md p-4 flex gap-4"
                            >
                                <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                    <Image
                                        src={getImageUrl(item.image)}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                <div className="flex-grow">
                                    <h3 className="font-semibold text-lg text-gray-800 mb-1">
                                        {item.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-primary font-bold">
                                            {formatPrice(discountedPrice)}
                                        </span>
                                        {item.discount > 0 && (
                                            <span className="text-gray-400 line-through text-sm">
                                                {formatPrice(item.price)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-3 mt-3">
                                        <button
                                            onClick={() =>
                                                handleUpdateQuantity(item.productId, item.quantity - 1)
                                            }
                                            className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 transition"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center font-semibold">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() =>
                                                handleUpdateQuantity(item.productId, item.quantity + 1)
                                            }
                                            className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 transition"
                                            disabled={item.quantity >= item.stock}
                                        >
                                            +
                                        </button>
                                        <span className="text-sm text-gray-500 ml-2">
                                            {item.quantity >= item.stock && '(Max)'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end justify-between">
                                    <button
                                        onClick={() => handleRemove(item.productId)}
                                        className="text-red-500 hover:text-red-700 transition"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                    <span className="text-xl font-bold text-gray-800">
                                        {formatPrice(itemTotal)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatPrice(cartTotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600">FREE</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-800">
                                <span>Total</span>
                                <span className="text-primary">{formatPrice(cartTotal)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                console.log('DEBUG: Proceed to Checkout clicked');
                                router.push('/checkout');
                            }}
                            className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-primary-700 transition shadow-lg hover:shadow-xl"
                        >
                            Proceed to Checkout
                        </button>

                        <button
                            onClick={() => router.push('/products')}
                            className="w-full mt-3 border border-primary text-primary py-3 rounded-lg font-semibold hover:bg-primary-50 transition"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
