'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RootState } from '@/lib/store';
import { clearCart, removeFromCart, updateQuantity } from '@/lib/store/cartSlice';
import { addressesAPI, ordersAPI, cartAPI } from '@/lib/api';
import { formatPrice, calculateDiscountedPrice, getImageUrl } from '@/lib/utils';
import { FaChevronDown, FaSearch, FaInfoCircle, FaLock, FaRegCreditCard, FaTrash } from 'react-icons/fa';
import { IoArrowBack } from 'react-icons/io5';
import { SiVisa, SiMastercard, SiPhonepe, SiGooglepay } from 'react-icons/si';

export default function CheckoutPage() {
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const cartTotal = useSelector((state: RootState) => state.cart.total);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    const dispatch = useDispatch();
    const router = useRouter();

    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('ONLINE');
    const [billingAddressType, setBillingAddressType] = useState<'SAME' | 'DIFFERENT'>('SAME');
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [referralDiscount, setReferralDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');
    const [loading, setLoading] = useState(false);
    const [couponLoading, setCouponLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(!isAuthenticated);
    const [policyChecked, setPolicyChecked] = useState(false);
    const [showPolicyModal, setShowPolicyModal] = useState(false);

    // Address form state
    const [addressFormData, setAddressFormData] = useState({
        country: 'India',
        fullName: '',
        address: '',
        apartment: '',
        city: '',
        state: 'Kerala',
        pincode: '',
        phone: '',
    });

    // Form states for direct entry
    const [guestEmail, setGuestEmail] = useState('');
    const [emailConsent, setEmailConsent] = useState(true);
    const [saveInfoConsent, setSaveInfoConsent] = useState(false);
    const [textConsent, setTextConsent] = useState(false);

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

    const handleUpdateQuantity = async (productId: string, quantity: number) => {
        if (quantity < 1) return;
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
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

    const handleRemoveItem = async (productId: string) => {
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

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            let finalAddressId = selectedAddress;

            // If no address selected, or if guest, create a new address first
            if (!finalAddressId || !isAuthenticated) {
                // Basic validation
                if (!addressFormData.fullName || !addressFormData.address || !addressFormData.phone) {
                    alert('Please fill in all required delivery details');
                    setLoading(false);
                    return;
                }

                const res = await addressesAPI.create({
                    fullName: addressFormData.fullName,
                    phone: addressFormData.phone,
                    address: `${addressFormData.address}${addressFormData.apartment ? `, ${addressFormData.apartment}` : ''}`,
                    city: addressFormData.city,
                    state: addressFormData.state,
                    pincode: addressFormData.pincode,
                });
                finalAddressId = res.data.id;
            }

            const orderData: any = {
                addressId: finalAddressId,
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

            if (paymentMethod === 'COD') {
                // Cash on Delivery orders do not go through Razorpay
                setOrderSuccess(true);
                dispatch(clearCart());
                setTimeout(() => {
                    router.push(`/orders/${order.id}?success=true`);
                }, 2000);
                return;
            }

            // Both ONLINE and COD now require Razorpay payment (COD pays the handling fee)
            // Note: COD is now confirmed offline without Razorpay, only ONLINE needs Razorpay!
            const res = await loadRazorpayScript();

            if (!res) {
                alert('Razorpay SDK failed to load. Are you online?');
                setLoading(false);
                return;
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: Math.round(order.total * 100),
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
            paymentObject.on('payment.failed', function (response: any) {
                alert(response.error.description);
                setLoading(false);
            });
            paymentObject.open();
        } catch (error: any) {
            console.error('Checkout error:', error);
            alert(error.response?.data?.message || 'An error occurred during checkout');
            setLoading(false);
        }
    };

    if (cartItems.length === 0 && !orderSuccess) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
            {orderSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-95 animate-in fade-in duration-300">
                    <div className="text-center p-8 max-w-md w-full animate-in zoom-in duration-500 scale-100">
                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-200 ring-8 ring-green-50">
                            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-gray-100 mb-4">Success!</h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Your order has been placed. Redirecting to confirmation...</p>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-primary h-full animate-progress-fast"></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
                {/* Left Column: Form */}
                <div className="p-4 sm:p-8 lg:p-16 xl:p-24 bg-white dark:bg-[#0a0a0a]">
                    <div className="max-w-xl ml-auto w-full space-y-10">
                        {/* Guest Alert */}
                        {!isAuthenticated && (
                            <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400 p-4 rounded-r-lg">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
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

                        {/* Delivery Section */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Delivery Address</h2>
                                {isAuthenticated && (
                                    <button
                                        onClick={() => setShowAddressForm(!showAddressForm)}
                                        className="text-primary hover:text-primary-700 font-medium text-sm"
                                    >
                                        {showAddressForm ? 'Cancel' : '+ Add New'}
                                    </button>
                                )}
                            </div>
                            
                            {showAddressForm ? (
                                <div className="space-y-4">
                                    <AddressForm 
                                        formData={addressFormData}
                                        setFormData={setAddressFormData}
                                        loading={loading}
                                    />
                                    {isAuthenticated && (
                                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                            <button
                                                type="button"
                                                onClick={() => setShowAddressForm(false)}
                                                className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    setLoading(true);
                                                    try {
                                                        const res = await addressesAPI.create({
                                                            fullName: addressFormData.fullName,
                                                            phone: addressFormData.phone,
                                                            address: `${addressFormData.address}${addressFormData.apartment ? `, ${addressFormData.apartment}` : ''}`,
                                                            city: addressFormData.city,
                                                            state: addressFormData.state,
                                                            pincode: addressFormData.pincode,
                                                        });
                                                        setAddresses([...addresses, res.data]);
                                                        setSelectedAddress(res.data.id);
                                                        setShowAddressForm(false);
                                                    } catch (error: any) {
                                                        alert(error.response?.data?.message || 'Failed to add address');
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }}
                                                disabled={loading}
                                                className="px-8 py-3 bg-primary text-white rounded font-bold text-sm hover:bg-primary-700 disabled:bg-gray-400 transition-all shadow-md active:scale-95"
                                            >
                                                {loading ? 'Saving...' : 'Save and Deliver Here'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {addresses.length === 0 && !showAddressForm && (
                                        <p className="text-red-500 text-sm font-medium">Please add a delivery address to proceed.</p>
                                    )}
                                    {addresses.map((address) => (
                                        <label
                                            key={address.id}
                                            className={`block p-4 border rounded-lg cursor-pointer transition-all ${selectedAddress === address.id
                                                ? 'border-primary bg-primary-50/10 ring-1 ring-primary'
                                                : 'border-gray-200 dark:border-white/10 hover:border-primary'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    value={address.id}
                                                    checked={selectedAddress === address.id}
                                                    onChange={(e) => setSelectedAddress(e.target.value)}
                                                    className="mt-1 flex-shrink-0 text-primary focus:ring-primary"
                                                />
                                                <div className="flex-grow min-w-0">
                                                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{address.fullName}</p>
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-snug mt-1">
                                                        {address.address}, {address.city}, {address.state} -{' '}
                                                        {address.pincode}
                                                    </p>
                                                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 font-medium">Phone: {address.phone}</p>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Shipping Method */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Shipping method</h2>
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-lg flex justify-between items-center shadow-sm ring-1 ring-emerald-500/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-400 tracking-tight">Free and fast shipping</span>
                                </div>
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tracking-widest uppercase bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 rounded-full">FREE</span>
                            </div>
                        </section>

                        {/* Payment Section */}
                        <section className="space-y-4">
                            <div className="space-y-1">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Payment</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">All transactions are secure and encrypted.</p>
                            </div>

                            <div className="space-y-3">
                                {/* Online Payment Option */}
                                <div 
                                    className={`border rounded-lg transition-all ${
                                        paymentMethod === 'ONLINE' 
                                        ? 'border-primary ring-1 ring-primary bg-primary-50/5' 
                                        : 'border-gray-200'
                                    }`}
                                >
                                    <label className="p-4 flex justify-between items-center cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                checked={paymentMethod === 'ONLINE'}
                                                onChange={() => setPaymentMethod('ONLINE')}
                                                className="w-4 h-4 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Online Payment</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex gap-2 items-center">
                                                <div className="h-4 w-7 flex items-center justify-center">
                                                    <img src="/payment icons/visacard.png" alt="Visa" className="max-h-full object-contain" />
                                                </div>
                                                <div className="h-4 w-7 flex items-center justify-center">
                                                    <img src="/payment icons/Mastercard.png" alt="Mastercard" className="max-h-full object-contain" />
                                                </div>
                                                <div className="w-px h-4 bg-gray-200 mx-1" />
                                                <div className="flex gap-1.5 items-center">
                                                    <SiPhonepe className="text-[#5f259f] text-base" title="PhonePe" />
                                                    <SiGooglepay className="text-gray-700 text-xl" title="Google Pay" />
                                                </div>
                                            </div>

                                            {/* +11 More Methods Badge */}
                                            <div className="relative group/tooltip">
                                                <div className="flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded text-[11px] font-bold text-gray-500 hover:border-gray-300 transition-colors cursor-help">
                                                    +11
                                                </div>

                                                {/* Premium Dark Tooltip */}
                                                <div className="absolute bottom-full right-0 mb-4 w-60 bg-[#1a1a1a] shadow-2xl rounded-xl p-3 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-50 transform translate-y-2 group-hover/tooltip:translate-y-0 border border-white/5">
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {/* RuPay */}
                                                        <div className="bg-white rounded p-1 h-8 flex items-center justify-center">
                                                            <span className="text-[10px] font-black italic text-[#1b2f7d]">RuPay</span>
                                                        </div>
                                                        {/* Paytm */}
                                                        <div className="bg-white rounded p-1 h-8 flex items-center justify-center">
                                                            <span className="text-black font-black text-[10px]">pay<span className="text-[#00baf2]">tm</span></span>
                                                        </div>
                                                        {/* Amex */}
                                                        <div className="bg-[#0070d1] rounded p-1 h-8 flex items-center justify-center">
                                                            <span className="text-white font-bold text-[8px] italic">AMEX</span>
                                                        </div>
                                                        {/* Amazon Pay */}
                                                        <div className="bg-white rounded p-1 h-8 flex items-center justify-center">
                                                            <span className="text-black font-bold text-[8px]">amazon</span>
                                                        </div>
                                                        {/* Apple Pay / GPay */}
                                                        <div className="bg-white rounded p-1 h-8 flex items-center justify-center">
                                                            <SiGooglepay className="text-gray-800 text-xl" />
                                                        </div>
                                                        {/* Grab */}
                                                        <div className="bg-[#00b14f] rounded p-1 h-8 flex items-center justify-center">
                                                            <span className="text-white font-bold text-[10px]">Grab</span>
                                                        </div>
                                                        {/* PhonePe */}
                                                        <div className="bg-white rounded p-1 h-8 flex items-center justify-center">
                                                            <SiPhonepe className="text-[#5f259f] text-sm" />
                                                        </div>
                                                        {/* UPI */}
                                                        <div className="bg-white rounded p-1 h-8 flex items-center justify-center">
                                                            <img src="/payment icons/UPI.webp" alt="UPI" className="max-h-full object-contain" />
                                                        </div>
                                                        {/* More */}
                                                        <div className="bg-[#333] rounded p-1 h-8 flex items-center justify-center">
                                                            <span className="text-white/40 text-[8px] font-bold">+6</span>
                                                        </div>
                                                    </div>
                                                    {/* Triangle pointer */}
                                                    <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-[#1a1a1a] transform rotate-45" />
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                    
                                    {paymentMethod === 'ONLINE' && (
                                        <div className="p-6 bg-gray-50 dark:bg-[#151515] border-t border-primary/10 text-center space-y-3 animate-in slide-in-from-top-1 duration-200">
                                            <div className="flex justify-center">
                                                <div className="p-3 bg-white dark:bg-[#222] rounded-full shadow-sm">
                                                    <FaLock className="text-primary text-xl" />
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
                                                After clicking “Pay now”, you’ll be redirected to <span className="font-bold">Razorpay Secure</span> to complete your purchase securely.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* COD Option */}
                                <div 
                                    className={`border rounded-lg transition-all ${
                                        paymentMethod === 'COD' 
                                        ? 'border-primary ring-1 ring-primary bg-primary-50/5' 
                                        : 'border-gray-200'
                                    }`}
                                >
                                    <label className="p-4 flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={paymentMethod === 'COD'}
                                            onChange={() => setPaymentMethod('COD')}
                                            className="w-4 h-4 text-primary focus:ring-primary"
                                        />
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Cash on Delivery</span>
                                            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">COD</span>
                                        </div>
                                    </label>
                                    
                                    {paymentMethod === 'COD' && (
                                        <div className="p-6 bg-gray-50 dark:bg-[#151515] border-t border-primary/10 text-center animate-in slide-in-from-top-1 duration-200">
                                            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded p-3 text-left">
                                                <p className="text-xs text-orange-800 dark:text-orange-400 font-medium">
                                                    Note: An offline payment handling fee of <strong>₹499</strong> will be added to your order total and is payable at the time of delivery. No upfront online payment is required.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Right Column: Order Summary */}
                <div className="bg-gray-50 dark:bg-[#111111] p-4 sm:p-8 lg:p-16 xl:p-24 border-l border-gray-200 dark:border-white/10">
                    <div className="max-w-md mr-auto w-full space-y-8 lg:sticky lg:top-16">
                        {/* Product List */}
                        <div className="space-y-4">
                            {cartItems.map((item) => {
                                const price = calculateDiscountedPrice(item.price, item.discount);
                                return (
                                    <div key={item.productId} className="flex items-center gap-4 group">
                                        <div className="relative w-16 h-16 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden flex-shrink-0 p-1">
                                            <Image
                                                src={getImageUrl(item.image)}
                                                alt={item.name}
                                                fill
                                                className="object-contain"
                                            />
                                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white dark:border-[#111111]">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.name}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Water Purifier</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {formatPrice(price * item.quantity)}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                                    className="w-6 h-6 rounded border border-gray-300 dark:border-white/10 flex items-center justify-center text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50"
                                                    disabled={item.quantity <= 1}
                                                    title="Decrease quantity"
                                                >
                                                    -
                                                </button>
                                                <span className="text-sm w-4 text-center font-medium text-gray-900 dark:text-gray-100">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                                    className="w-6 h-6 rounded border border-gray-300 dark:border-white/10 flex items-center justify-center text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50"
                                                    disabled={item.quantity >= item.stock}
                                                    title="Increase quantity"
                                                >
                                                    +
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveItem(item.productId)}
                                                    className="text-red-500 hover:text-red-700 transition-colors p-1 ml-1"
                                                    title="Remove item"
                                                    aria-label="Remove item"
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Discount Code */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                            <input
                                type="text"
                                placeholder="Discount code"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                className="flex-grow px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/10 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm dark:text-white"
                            />
                             <button
                                onClick={handleApplyCoupon}
                                disabled={couponLoading || !couponCode || !!appliedCoupon}
                                className={`px-6 py-3 rounded font-semibold text-sm transition-all ${
                                    !couponCode || !!appliedCoupon 
                                    ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                                    : 'bg-primary text-white hover:bg-primary-600 shadow-md active:scale-95'
                                }`}
                            >
                                {couponLoading ? '...' : 'Apply'}
                            </button>
                        </div>
                        {couponError && <p className="text-red-500 text-xs">{couponError}</p>}

                        {/* Totals */}
                        <div className="space-y-3 pt-6">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{formatPrice(cartTotal)}</span>
                            </div>
                            {appliedCoupon && (
                                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                    <span>Discount ({appliedCoupon.code})</span>
                                    <span>-{formatPrice(appliedCoupon.discount)}</span>
                                </div>
                            )}
                            {referralDiscount > 0 && (
                                <div className="flex justify-between text-sm text-indigo-600 dark:text-indigo-400">
                                    <span>Referral Benefit</span>
                                    <span>-{formatPrice(referralDiscount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Shipping</span>
                                <span className="text-green-600 dark:text-green-400 font-medium tracking-tight">FREE</span>
                            </div>
                            
                            <div className="flex justify-between items-center pt-4 text-xl">
                                <span className="font-bold text-gray-900 dark:text-gray-100 uppercase text-lg tracking-tight">Total Product Value</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest">INR</span>
                                    <span className="font-black text-gray-900 dark:text-gray-100 text-2xl tracking-tighter">
                                        {formatPrice(Math.max(0, cartTotal - (appliedCoupon?.discount || 0) - referralDiscount)).replace('₹', '')}
                                    </span>
                                </div>
                            </div>

                            {paymentMethod === 'COD' && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 space-y-3">
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                        <span>Offline Payment Handling Fee</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">₹499.00</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 font-semibold">
                                        <span>To Pay Now (Online)</span>
                                        <span className="text-green-600">₹0.00</span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg text-orange-600 dark:text-orange-400 font-bold">
                                        <span>To Pay on Delivery</span>
                                        <span>{formatPrice(Math.max(0, cartTotal - (appliedCoupon?.discount || 0) - referralDiscount) + 499)}</span>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'ONLINE' && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 space-y-3">
                                    <div className="flex justify-between items-center text-lg text-primary dark:text-primary-400 font-bold">
                                        <span>To Pay Now (Online)</span>
                                        <span>{formatPrice(Math.max(0, cartTotal - (appliedCoupon?.discount || 0) - referralDiscount))}</span>
                                    </div>
                                </div>
                            )}

                            {/* Terms & Return Policy Acceptance Checkbox */}
                            <div className="mt-6 flex items-start gap-3 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 text-left">
                                <input
                                    type="checkbox"
                                    id="policy-acceptance"
                                    checked={policyChecked}
                                    onChange={(e) => setPolicyChecked(e.target.checked)}
                                    className="mt-1 w-4 h-4 text-primary focus:ring-primary rounded border-gray-300 dark:border-white/10 cursor-pointer"
                                />
                                <label htmlFor="policy-acceptance" className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed cursor-pointer select-none">
                                    I agree to the{' '}
                                    <button
                                        type="button"
                                        onClick={() => setShowPolicyModal(true)}
                                        className="text-primary font-bold hover:underline inline-block focus:outline-none"
                                    >
                                        Cancellation, Return & Refund Policy
                                    </button>
                                    . I understand and accept these terms.
                                </label>
                            </div>

                            {/* Moved Pay Now Button */}
                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading || orderSuccess || !policyChecked}
                                className={`w-full mt-6 py-5 rounded text-lg font-bold text-white transition-all shadow-xl ${
                                    loading || orderSuccess || !policyChecked
                                    ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                                    : 'bg-primary hover:bg-primary-600 active:scale-[0.98]'
                                }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    paymentMethod === 'COD' ? 'Place Order (COD)' : 'Pay now'
                                )}
                            </button>
                            <p className="text-[10px] text-center text-gray-400 mt-4 font-medium uppercase tracking-widest">
                                Secure Checkout Powered by Razorpay
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Return Policy Modal */}
            {showPolicyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#151515] rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 text-gray-800 dark:text-gray-200">
                        {/* Close button */}
                        <button 
                            type="button"
                            onClick={() => setShowPolicyModal(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-500 dark:text-gray-400 transition-colors font-bold text-lg"
                        >
                            &times;
                        </button>
                        
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Cancellation, Return & Refund Policy</h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 uppercase font-bold tracking-wider">Leewaa Ventures LLP</p>
                        
                        {/* Scrollable Content */}
                        <div className="flex-grow overflow-y-auto pr-2 text-sm leading-relaxed space-y-6 text-gray-600 dark:text-gray-300">
                            <div className="bg-primary-50/50 dark:bg-primary-950/10 border border-primary-100 dark:border-primary-900/30 rounded-2xl p-4 space-y-2">
                                <h4 className="font-bold text-primary-900 dark:text-primary-400">A. Quick Summary (Simple)</h4>
                                <ul className="list-disc pl-5 space-y-1 text-xs">
                                    <li>After full payment, your order is confirmed and will be delivered.</li>
                                    <li>Cancellation is allowed only if delivery is not done within 15 days from payment date.</li>
                                    <li>Once delivered, products are under 7 days conditional return policy outlined in Policy Point E herein.</li>
                                    <li>If you receive a damaged or defective product, contact Leewaa Customer Care immediately. Our service team will inspect and decide repair or replacement.</li>
                                    <li>Refunds are not offered except where legally applicable.</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-gray-900 dark:text-white">B. Order Confirmation & Delivery</h4>
                                <p className="text-xs">Your order becomes final and confirmed once full payment is received by company. Leewaa Ventures LLP will process and deliver the product to the address shared by you at checkout. Delivery is normally completed within 15 (fifteen) days from the date of full payment. Delivery time may vary due to location/logistics/product availability, but we will make reasonable efforts to deliver within the above timeline.</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-gray-900 dark:text-white">C. Cancellation Policy</h4>
                                <p className="text-xs">Cancellation is not allowed after payment (please refer Clause E herein), as a standard rule.</p>
                                <p className="text-xs"><strong>Only Exception:</strong> You may cancel only if the product is NOT delivered within 15 days from payment date (subject to force majeure events like natural disasters, strikes or regional lockdowns etc.) To request cancellation under the above exception, you must contact Customer Care or email us with your Order ID, Transaction/payment reference, and Registered phone number. No cancellation will be accepted for any other reason.</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-gray-900 dark:text-white">D. Transit Damage / Defect Policy (After Delivery)</h4>
                                <p className="text-xs">Please check the outer box/packaging at the time of delivery. If the package appears torn, crushed, wet, or tampered, inform delivery personnel and contact Leewaa Customer Care within 24 hours of delivery. Customers must provide continuous unboxing video and clear high-resolution photos within 24 hours of delivery / Leewaa’s technician visit for installation; to claim transit damage.</p>
                                <p className="text-xs">If the product is received damaged, non-functional, or defective, you must contact Leewaa Customer Care immediately upon delivery. Leewaa’s authorized service centre will inspect the product and decide whether the issue will be resolved through Repair or Replacement. Leewaa’s decision will be final.</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-gray-900 dark:text-white">E. Return / Refund Policy</h4>
                                <p className="text-xs">Return acceptable with prior approval within 7 days from the date of delivery / installation. For Return: Call the company and take confirmation through WhatsApp before returning.</p>
                                <p className="text-xs"><strong>Return acceptable only in case of:</strong> Failure to operate as per written product specifications, verified manufacturing defects, or confirmed transit damage evaluated by Leewaa’s Technical team.</p>
                                <p className="text-xs"><strong>Returns/refunds are NOT allowed for any other reason, including:</strong> Products installed by non-authorized technicians, change of mind, product not required anymore, wrong order placed by customer, performance/feature subjective personal dissatisfaction, compatibility issues with local water/electricity, cosmetic expectations, or any issue repairable under warranty.</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-gray-900 dark:text-white">F. Contact for Cancellation / Damage / Defect / Return</h4>
                                <p className="text-xs">Customer Care: <strong>+91 8943 371000</strong> | Email: <strong>service@Leewaa.in</strong></p>
                                <p className="text-xs">Please share: Ordered Platform, Order ID, transaction reference, phone number, delivery address, and issue details.</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-gray-900 dark:text-white">G. Reverse Logistics & Shipping Costs</h4>
                                <p className="text-xs">When returning; the Original packaging, boxes, manuals, accessories, freebies, and invoices must be intact. Leewaa’s logistics partner shall contact customer for pick up or we shall request you to dispatch the product back and the carrier charges will be refunded to you by Leewaa.</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-gray-900 dark:text-white">H. Refund</h4>
                                <p className="text-xs">Once refund is approved, the full order value will be refunded to the original payment method used at checkout. Payment gateway charges if any, shall be deducted from the refund amount. Refunds will be initiated within 5–7 business days after receipt, inspection, and approval of the returned item.</p>
                            </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10 flex justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setPolicyChecked(true);
                                    setShowPolicyModal(false);
                                }}
                                className="px-6 py-2.5 bg-primary hover:bg-primary-600 text-white text-sm font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                I Agree & Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function AddressForm({ formData, setFormData, loading }: any) {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Country Selector */}
            <div className="relative">
                <label className="absolute left-4 top-1.5 text-[10px] text-gray-500 dark:text-gray-400 font-medium">Country/Region</label>
                <select 
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full pl-4 pr-10 pt-5 pb-2 border border-gray-300 dark:border-white/10 rounded appearance-none focus:ring-1 focus:ring-primary outline-none text-sm bg-white dark:bg-[#1a1a1a] dark:text-white"
                >
                    <option>India</option>
                    <option>United Arab Emirates</option>
                </select>
                <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
            </div>

            {/* Full Name */}
            <input
                type="text"
                placeholder="Full Name"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded focus:ring-1 focus:ring-primary outline-none text-sm bg-white dark:bg-[#1a1a1a] dark:text-white"
            />

            {/* Address */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Address"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-white/10 rounded focus:ring-1 focus:ring-primary outline-none text-sm bg-white dark:bg-[#1a1a1a] dark:text-white"
                />
                <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            </div>

            {/* Apartment */}
            <input
                type="text"
                placeholder="Apartment, suite, etc. (optional)"
                value={formData.apartment}
                onChange={(e) => setFormData({...formData, apartment: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded focus:ring-1 focus:ring-primary outline-none text-sm bg-white dark:bg-[#1a1a1a] dark:text-white"
            />

            {/* City/State/PIN Row */}
            <div className="grid grid-cols-2 gap-3">
                <input
                    type="text"
                    placeholder="City"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded focus:ring-1 focus:ring-primary outline-none text-sm bg-white dark:bg-[#1a1a1a] dark:text-white"
                />
                <input
                    type="text"
                    placeholder="PIN code"
                    required
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded focus:ring-1 focus:ring-primary outline-none text-sm bg-white dark:bg-[#1a1a1a] dark:text-white"
                />
            </div>

            <div className="relative">
                <select
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full pl-4 pr-8 py-3 border border-gray-300 dark:border-white/10 rounded appearance-none focus:ring-1 focus:ring-primary outline-none text-sm bg-white dark:bg-[#1a1a1a] dark:text-white"
                >
                    <option>Kerala</option>
                    <option>Karnataka</option>
                    <option>Tamil Nadu</option>
                    <option>Maharashtra</option>
                    <option>Delhi</option>
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none" />
            </div>

            {/* Phone Row */}
            <div className="relative">
                <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded focus:ring-1 focus:ring-primary outline-none text-sm bg-white dark:bg-[#1a1a1a] dark:text-white"
                />
                <FaInfoCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm cursor-help" />
            </div>
        </div>
    );
}

