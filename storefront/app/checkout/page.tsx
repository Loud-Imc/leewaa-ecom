'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/lib/store';
import { clearCart } from '@/lib/store/cartSlice';
import { addressesAPI, ordersAPI } from '@/lib/api';
import { formatPrice, calculateDiscountedPrice } from '@/lib/utils';

export default function CheckoutPage() {
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const cartTotal = useSelector((state: RootState) => state.cart.total);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    const dispatch = useDispatch();
    const router = useRouter();

    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [referralDiscount, setReferralDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');
    const [loading, setLoading] = useState(false);
    const [couponLoading, setCouponLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(!isAuthenticated);

    useEffect(() => {
        if (cartItems.length === 0 && !orderSuccess) {
            router.push('/cart');
        }
    }, [cartItems.length, orderSuccess, router]);

    useEffect(() => {
        console.log('DEBUG: CheckoutPage rendered, isAuthenticated:', isAuthenticated);
    }, [isAuthenticated]);

    // Guest checkout enabled - no redirect required here

    // Load addresses
    useEffect(() => {
        if (isAuthenticated) {
            addressesAPI.getAll().then((res) => {
                setAddresses(res.data);
                const defaultAddr = res.data.find((a: any) => a.isDefault);
                if (defaultAddr) setSelectedAddress(defaultAddr.id);

                // If no addresses for authenticated user, show form by default
                if (res.data.length === 0) {
                    setShowAddressForm(true);
                } else {
                    setShowAddressForm(false);
                }
            }).catch(() => {
                setShowAddressForm(true);
            });
        } else {
            // Guest user - always show address form by default
            setShowAddressForm(true);
            setAddresses([]);
            setSelectedAddress('');
        }
    }, [isAuthenticated]);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // Fetch initial discounts (e.g. referral discount) if authenticated
    useEffect(() => {
        if (isAuthenticated && cartTotal > 0) {
            ordersAPI.validateCoupon('', cartTotal, cartItems)
                .then(res => {
                    if (res.data.referralDiscount) {
                        setReferralDiscount(res.data.referralDiscount);
                    }
                })
                .catch(err => console.error('Error fetching initial discounts:', err));
        }
    }, [isAuthenticated, cartTotal]);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setCouponLoading(true);
        setCouponError('');
        try {
            const res = await ordersAPI.validateCoupon(couponCode, cartTotal, cartItems);
            setAppliedCoupon(res.data);
            if (res.data.referralDiscount) {
                setReferralDiscount(res.data.referralDiscount);
            }
            alert('Coupon applied successfully!');
        } catch (error: any) {
            setCouponError(error.response?.data?.message || 'Invalid coupon code');
            setAppliedCoupon(null);
        } finally {
            setCouponLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            alert('Please select a delivery address');
            return;
        }

        setLoading(true);
        try {
            const orderData: any = {
                addressId: selectedAddress,
                paymentMethod: paymentMethod,
            };

            if (couponCode) {
                orderData.couponCode = couponCode;
            }

            // For guests, we must send current cart items
            if (!isAuthenticated) {
                orderData.items = cartItems.map((item: any) => ({
                    productId: item.productId,
                    quantity: item.quantity
                }));
            }

            const response = await ordersAPI.create(orderData);
            const order = response.data;

            if (paymentMethod === 'ONLINE') {
                const res = await loadRazorpayScript();

                if (!res) {
                    alert('Razorpay SDK failed to load. Are you online?');
                    setLoading(false);
                    return;
                }

                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: order.total * 100,
                    currency: 'INR',
                    name: 'Leewaa Ventures LLP',
                    description: `Payment for Order ${order.orderNumber}`,
                    order_id: order.razorpayOrderId,
                    handler: async function (response: any) {
                        try {
                            setLoading(true);
                            await ordersAPI.verifyPayment(order.id, {
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                            });

                            setOrderSuccess(true);
                            dispatch(clearCart());
                            setTimeout(() => {
                                router.push(`/orders/${order.id}?success=true`);
                            }, 2000);
                        } catch (error: any) {
                            alert('Payment verification failed. Please contact support.');
                            setLoading(false);
                        }
                    },
                    prefill: {
                        name: '', // Will be filled from user profile if needed
                        email: '',
                        contact: '',
                    },
                    theme: {
                        color: '#157fb8',
                    },
                    modal: {
                        ondismiss: async function () {
                            setLoading(false);
                            try {
                                await ordersAPI.cancel(order.id);
                                alert('Payment process was closed. The order has been cancelled, but your items are still in your cart. You can try again whenever you are ready!');
                            } catch (e) {
                                console.error('Failed to cancel order after dismissal', e);
                            }
                        }
                    }
                };

                const paymentObject = new (window as any).Razorpay(options);
                paymentObject.open();
                setLoading(false);
            } else {
                // COD Flow
                setOrderSuccess(true);
                dispatch(clearCart());
                setTimeout(() => {
                    router.push(`/orders/${order.id}?success=true`);
                }, 2000);
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to place order');
            setLoading(false);
        }
    };

    if (cartItems.length === 0 && !orderSuccess) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {orderSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-95 animate-in fade-in duration-300">
                    <div className="text-center p-8 max-w-md w-full animate-in zoom-in duration-500 scale-100">
                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200 ring-8 ring-green-50">
                            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 mb-4">Success!</h2>
                        <p className="text-xl text-gray-600 mb-8">Your order has been placed. Redirecting to confirmation...</p>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-primary h-full animate-progress-fast"></div>
                        </div>
                    </div>
                </div>
            )}
            {!isAuthenticated && (
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-8 rounded-r-lg">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-orange-700 font-medium">
                                You are checking out as a <span className="font-bold">Guest User</span>.
                                <button
                                    onClick={() => router.push('/login?redirect=/checkout')}
                                    className="ml-2 underline hover:text-orange-800"
                                >
                                    Login for a better experience
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <h1 className="text-4xl font-bold text-gray-800 mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Checkout Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Delivery Address */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Delivery Address
                            </h2>
                            <button
                                onClick={() => setShowAddressForm(!showAddressForm)}
                                className="text-primary hover:text-primary-700 font-medium"
                            >
                                + Add New
                            </button>
                        </div>

                        {addresses.length === 0 && !showAddressForm && (
                            <p className="text-red-500 font-medium">Please add a delivery address to proceed.</p>
                        )}

                        {showAddressForm && (
                            <AddressForm
                                onSuccess={(newAddress) => {
                                    setAddresses([...addresses, newAddress]);
                                    setSelectedAddress(newAddress.id);
                                    setShowAddressForm(false);
                                }}
                                onCancel={() => setShowAddressForm(false)}
                            />
                        )}

                        <div className="space-y-3">
                            {addresses.map((address) => (
                                <label
                                    key={address.id}
                                    className={`block p-4 border-2 rounded-lg cursor-pointer transition ${selectedAddress === address.id
                                        ? 'border-primary bg-primary-50'
                                        : 'border-gray-200 hover:border-primary'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="radio"
                                            name="address"
                                            value={address.id}
                                            checked={selectedAddress === address.id}
                                            onChange={(e) => setSelectedAddress(e.target.value)}
                                            className="mt-1 flex-shrink-0"
                                        />
                                        <div className="flex-grow min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{address.fullName}</p>
                                            <p className="text-gray-600 text-sm leading-snug mt-1">
                                                {address.address}, {address.city}, {address.state} -{' '}
                                                {address.pincode}
                                            </p>
                                            <p className="text-gray-600 text-xs mt-1 font-medium">Phone: {address.phone}</p>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Payment Method
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className={`p-4 border-2 rounded-xl cursor-pointer transition flex items-start gap-4 ${paymentMethod === 'COD' ? 'border-primary bg-primary-50' : 'border-gray-100 hover:border-primary/30'}`}>
                                <input
                                    type="radio"
                                    name="payment_method"
                                    checked={paymentMethod === 'COD'}
                                    onChange={() => setPaymentMethod('COD')}
                                    className="w-5 h-5 text-primary focus:ring-primary mt-1 flex-shrink-0"
                                />
                                <div>
                                    <p className="font-bold text-gray-900">Cash on Delivery</p>
                                    <p className="text-xs text-gray-500 mt-1">Pay when you receive the order</p>
                                </div>
                            </label>

                            <label className={`p-4 border-2 rounded-xl cursor-pointer transition flex items-start gap-4 ${paymentMethod === 'ONLINE' ? 'border-primary bg-primary-50' : 'border-gray-100 hover:border-primary/30'}`}>
                                <input
                                    type="radio"
                                    name="payment_method"
                                    checked={paymentMethod === 'ONLINE'}
                                    onChange={() => setPaymentMethod('ONLINE')}
                                    className="w-5 h-5 text-primary focus:ring-primary mt-1 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 overflow-hidden">
                                        <p className="font-bold text-gray-900 truncate">Online</p>
                                        <div className="flex gap-1 flex-shrink-0">
                                            <div className="w-8 h-4 bg-gray-100 rounded flex items-center justify-center text-[7px] font-bold text-gray-400">VISA</div>
                                            <div className="w-8 h-4 bg-gray-100 rounded flex items-center justify-center text-[7px] font-bold text-gray-400">UPI</div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Secure via Razorpay</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Coupon Code */}
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center sm:text-left">
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
                            Have a Coupon?
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                placeholder="Enter code"
                                className="w-full sm:flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none uppercase font-semibold tracking-wider text-center sm:text-left"
                                disabled={couponLoading || !!appliedCoupon}
                            />
                            <button
                                onClick={handleApplyCoupon}
                                disabled={couponLoading || !couponCode || !!appliedCoupon}
                                className={`w-full sm:w-auto px-6 py-3 rounded-lg transition font-medium flex items-center justify-center min-h-[50px] ${appliedCoupon
                                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                    : 'bg-primary text-white hover:bg-primary-700 disabled:bg-gray-200'
                                    }`}
                            >
                                {couponLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : appliedCoupon ? 'Applied' : 'Apply'}
                            </button>
                        </div>
                        {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
                        {appliedCoupon && (
                            <p className="text-green-600 text-xs mt-2 font-medium">
                                Coupon "{appliedCoupon.code}" applied! You saved {formatPrice(appliedCoupon.discount)}
                            </p>
                        )}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>

                        {/* Items */}
                        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                            {cartItems.map((item) => {
                                const price = calculateDiscountedPrice(item.price, item.discount);
                                return (
                                    <div key={item.productId} className="flex justify-between items-start gap-4 text-sm">
                                        <span className="text-gray-600 truncate flex-1" title={`${item.name} x ${item.quantity}`}>
                                            {item.name} x {item.quantity}
                                        </span>
                                        <span className="font-medium flex-shrink-0">{formatPrice(price * item.quantity)}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="space-y-3 mb-6 border-t pt-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatPrice(cartTotal)}</span>
                            </div>
                            {appliedCoupon && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount ({appliedCoupon.code})</span>
                                    <span>-{formatPrice(appliedCoupon.discount)}</span>
                                </div>
                            )}
                            {referralDiscount > 0 && (
                                <div className="flex justify-between text-indigo-600 font-medium">
                                    <span>Referral Benefit</span>
                                    <span>-{formatPrice(referralDiscount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600">FREE</span>
                            </div>
                            <div className="border-t pt-3 flex flex-col items-end">
                                <div className="flex justify-between w-full text-xl font-bold">
                                    <span>Total Amount</span>
                                    <span className="text-primary">{formatPrice(cartTotal - (appliedCoupon?.discount || 0) - referralDiscount)}</span>
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium">Price includes GST</span>
                            </div>
                        </div>

                        {(!selectedAddress && addresses.length > 0) && (
                            <p className="text-red-500 text-sm mb-2 text-center">Please select a delivery address</p>
                        )}
                        {!selectedAddress && addresses.length === 0 && (
                            <p className="text-red-500 text-sm mb-2 text-center">Please add a delivery address</p>
                        )}

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading || !selectedAddress || orderSuccess}
                            className={`w-full py-4 rounded-lg font-semibold transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${loading || !selectedAddress || orderSuccess
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-primary text-white hover:bg-primary-700'
                                }`}
                        >
                            {loading || orderSuccess ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    {orderSuccess ? 'Success!' : 'Placing Order...'}
                                </>
                            ) : (
                                `Pay ${formatPrice(cartTotal - (appliedCoupon?.discount || 0) - referralDiscount)}`
                            )}
                        </button>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            By placing your order, you agree to our terms and conditions
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AddressForm({ onSuccess, onCancel }: { onSuccess: (addr: any) => void; onCancel: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await addressesAPI.create(formData);
            onSuccess(res.data);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to add address');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg space-y-4 bg-gray-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                    <input
                        type="text"
                        placeholder="Full Name"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <input
                        type="tel"
                        placeholder="Phone Number"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <input
                        type="email"
                        placeholder="Email Address"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Pincode"
                        required
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>
                <div className="sm:col-span-2">
                    <textarea
                        placeholder="Detailed Address (House No, Street, Landmark)"
                        required
                        rows={3}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="City"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="State"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>
            </div>
            <div className="flex justify-end gap-2 text-sm">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400"
                >
                    {loading ? 'Saving...' : 'Save Address'}
                </button>
            </div>
        </form>
    );
}
