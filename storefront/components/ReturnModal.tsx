'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ordersAPI } from '@/lib/api';

interface ReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ReturnModal({ isOpen, onClose }: ReturnModalProps) {
    const [orderNumber, setOrderNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const sanitizedOrderNumber = orderNumber.trim().replace(/^#/, '');
            const response = await ordersAPI.track(sanitizedOrderNumber, phone.trim());
            const order = response.data;
            
            // Redirect to order details page with return flags
            router.push(`/orders/${order.id}?return=true&reason=${encodeURIComponent(reason)}`);
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Order not found. Please check your details and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                >
                    &times;
                </button>
                
                <h3 className="text-2xl font-black text-gray-900 mb-2">Return Order</h3>
                <p className="text-gray-500 text-sm mb-6">Please provide your order details to initiate a return.</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Order Number</label>
                        <input
                            type="text"
                            required
                            value={orderNumber}
                            onChange={(e) => setOrderNumber(e.target.value)}
                            placeholder="ORD-123456-789"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                        <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Registered phone number"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Reason for Return</label>
                        <textarea
                            required
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please explain why you want to return this product..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-gray-900"
                        ></textarea>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold border border-red-100 animate-in shake duration-300">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 px-4 bg-primary hover:bg-primary-700 text-white font-black rounded-xl transition-all shadow-lg shadow-primary/30 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                    >
                        {loading ? 'VERIFYING...' : 'CONTINUE'}
                    </button>
                </form>
            </div>
        </div>
    );
}
