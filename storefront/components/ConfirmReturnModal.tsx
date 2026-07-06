'use client';

import React, { useState } from 'react';
import axios from 'axios';

interface ConfirmReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderNumber: string;
    phone: string;
    reason: string;
    onSuccess: () => void;
}

export default function ConfirmReturnModal({ isOpen, onClose, orderNumber, phone, reason, onSuccess }: ConfirmReturnModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setLoading(true);
        setError('');
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
            await axios.post(`${API_URL}/returns`, {
                orderNumber,
                phone,
                reason
            });
            setIsSuccess(true);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to submit return request. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
                {isSuccess ? (
                    <div className="text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner shadow-green-200">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-3">Return Requested!</h3>
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                            Return request submitted successfully. Our staff will contact you shortly at <strong>{phone}</strong> to proceed.
                        </p>
                        <button
                            onClick={() => {
                                setIsSuccess(false);
                                onSuccess();
                            }}
                            className="w-full py-4 px-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-xl transition-all shadow-lg shadow-green-500/30 hover:scale-[1.02]"
                        >
                            OKAY
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        
                        <h3 className="text-2xl font-black text-center text-gray-900 mb-2">Are you sure?</h3>
                        <p className="text-gray-500 text-center text-sm mb-8 leading-relaxed">
                            You are about to initiate a return for Order <strong>#{orderNumber}</strong>. 
                            This process may take some time and our staff will contact you at <strong>{phone}</strong> to verify the issue.
                        </p>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold border border-red-100 mb-6 text-center">
                                {error}
                            </div>
                        )}
                        
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className={`w-full py-4 px-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl transition-all shadow-lg shadow-red-500/30 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                            >
                                {loading ? 'SUBMITTING...' : 'YES, I WANT TO RETURN'}
                            </button>
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="w-full py-4 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all"
                            >
                                CANCEL, KEEP MY ORDER
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
