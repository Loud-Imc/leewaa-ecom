'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ordersAPI } from '@/lib/api';
import { formatPrice, formatDate, getImageUrl } from '@/lib/utils';
import Link from 'next/link';
import html2pdf from 'html2pdf.js';
import { LOGO_BASE64 } from '@/lib/logo-base64';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    const isSuccess = searchParams.get('success') === 'true';
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        ordersAPI.getOne(id)
            .then(res => {
                setOrder(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const handleDownload = async () => {
        const element = document.getElementById('printable-invoice');
        if (!element) return;

        setDownloading(true);

        const opt = {
            margin: 10,
            filename: `Invoice-${order.orderNumber}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
        };

        try {
            // Using innerHTML is the most robust way to capture hidden elements
            // as html2pdf will render the string in its own internal worker
            await html2pdf().set(opt).from(element.innerHTML).save();
        } catch (err: any) {
            console.error('PDF generation failed:', err);
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Not Found</h1>
                <Link href="/products" className="text-primary hover:underline">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {isSuccess && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-green-800 mb-2">Order Placed Successfully!</h1>
                    <p className="text-green-700 text-lg">Thank you for your purchase. Your order #{order.orderNumber} has been received.</p>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                <div className="bg-primary p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-primary-100 text-sm uppercase font-bold tracking-wider mb-1">Order Details</p>
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold">#{order.orderNumber}</h2>
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-white/30"
                            >
                                {downloading ? '⏳ Generating...' : '📥 Download Invoice'}
                            </button>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-primary-100 text-sm mb-1">Status</p>
                        <span className="bg-white text-primary px-4 py-1 rounded-full text-sm font-bold">
                            {order.status}
                        </span>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Delivery Address
                            </h3>
                            <div className="text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="font-bold text-gray-800">{order.address.fullName}</p>
                                <p>{order.address.address}</p>
                                <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                                <p className="mt-2 text-sm">Phone: {order.address.phone}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Payment & Date
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                                    <span className="text-gray-500">Method</span>
                                    <span className="font-semibold text-gray-800">{order.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                                    <span className="text-gray-500">Date</span>
                                    <span className="font-semibold text-gray-800">{formatDate(order.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-6">Items Ordered</h3>
                    <div className="space-y-4 mb-12">
                        {order.items.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                        src={getImageUrl(item.product.images[0])}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-grow">
                                    <h4 className="font-bold text-gray-800">{item.product.name}</h4>
                                    <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                                    <p className="text-gray-400 text-xs">{formatPrice(item.price)} each</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                        <div className="space-y-3 max-w-sm ml-auto">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-red-600">
                                    <span>Discount</span>
                                    <span>-{formatPrice(order.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600 font-bold uppercase text-xs">Free</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3 flex justify-between text-2xl font-black text-gray-900">
                                <span>Total</span>
                                <span className="text-primary">{formatPrice(order.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                    href="/products"
                    className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-100 text-center"
                >
                    Continue Shopping
                </Link>
                <Link
                    href="/"
                    className="px-8 py-4 border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary-50 transition text-center"
                >
                    Back to Home
                </Link>
            </div>

            {/* Hidden Printable Invoice Area */}
            <div id="printable-invoice" style={{ display: 'none' }}>
                <div style={{ padding: '40px', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif', color: '#333', backgroundColor: '#fff' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', borderBottom: '2px solid #157fb8', paddingBottom: '20px' }}>
                        <div>
                            <img
                                src={LOGO_BASE64}
                                alt="LEEWAA"
                                style={{ height: '60px', marginBottom: '10px' }}
                            />
                            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Premium Water Filtration Solutions</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h1 style={{ margin: 0, fontSize: '32px', color: '#157fb8', fontWeight: 'bold', letterSpacing: '1px' }}>INVOICE</h1>
                            <p style={{ margin: '5px 0', fontSize: '16px', fontWeight: '600' }}>#{order.orderNumber}</p>
                            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{formatDate(order.createdAt)}</p>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                        <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px' }}>
                            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', textTransform: 'uppercase', color: '#157fb8', letterSpacing: '0.5px' }}>Customer</h3>
                            <p style={{ margin: '4px 0', fontSize: '16px', fontWeight: 'bold' }}>{order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest User'}</p>
                            <p style={{ margin: '4px 0', fontSize: '14px' }}>{order.user ? order.user.email : 'N/A'}</p>
                            {order.user?.phone && <p style={{ margin: '4px 0', fontSize: '14px' }}>{order.user.phone}</p>}
                        </div>
                        <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px' }}>
                            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', textTransform: 'uppercase', color: '#157fb8', letterSpacing: '0.5px' }}>Shipping To</h3>
                            <p style={{ margin: '4px 0', fontSize: '16px', fontWeight: 'bold' }}>{order.address.fullName}</p>
                            <p style={{ margin: '4px 0', fontSize: '14px', lineHeight: '1.4' }}>
                                {order.address.address}<br />
                                {order.address.city}, {order.address.state} - {order.address.pincode}
                            </p>
                            <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}><strong>Phone:</strong> {order.address.phone}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', marginBottom: '30px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#157fb8', color: '#fff' }}>
                                <th style={{ padding: '15px', textAlign: 'left', borderRadius: '8px 0 0 0', fontSize: '14px' }}>Item Description</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontSize: '14px' }}>Qty</th>
                                <th style={{ padding: '15px', textAlign: 'right', fontSize: '14px' }}>Unit Price</th>
                                <th style={{ padding: '15px', textAlign: 'right', borderRadius: '0 8px 0 0', fontSize: '14px' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item: any, idx: number) => (
                                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#fcfcfc' }}>
                                    <td style={{ padding: '15px', borderBottom: '1px solid #edf2f7', fontSize: '15px', fontWeight: '500' }}>{item.product.name}</td>
                                    <td style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #edf2f7', fontSize: '15px' }}>{item.quantity}</td>
                                    <td style={{ padding: '15px', textAlign: 'right', borderBottom: '1px solid #edf2f7', fontSize: '15px' }}>{formatPrice(item.price)}</td>
                                    <td style={{ padding: '15px', textAlign: 'right', borderBottom: '1px solid #edf2f7', fontSize: '15px', fontWeight: 'bold' }}>{formatPrice(item.price * item.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Summary */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: '300px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#666' }}>
                                <span>Subtotal</span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#dc2626' }}>
                                    <span>Discount</span>
                                    <span>-{formatPrice(order.discount)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#666' }}>
                                <span>Shipping Fees</span>
                                <span style={{ color: '#10b981', fontWeight: 'bold' }}>FREE</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', marginTop: '10px', borderTop: '2px solid #157fb8', fontSize: '20px', fontWeight: 'bold', color: '#157fb8' }}>
                                <span>Total Amount</span>
                                <span>{formatPrice(order.total)}</span>
                            </div>
                            <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px', fontSize: '12px', textAlign: 'center' }}>
                                <p style={{ margin: 0 }}>Payment Method: <strong>{order.paymentMethod}</strong></p>
                                <p style={{ margin: '4px 0 0 0' }}>Status: <span style={{ color: order.paymentStatus === 'PAID' ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>{order.paymentStatus}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: '60px', textAlign: 'center', borderTop: '1px solid #edf2f7', paddingTop: '20px' }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#157fb8' }}>Thank you for choosing LEEWAA!</p>
                        <p style={{ margin: '5px 0', fontSize: '12px', color: '#999' }}>For support, contact us at support@leewaa.com or visit www.leewaa.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
