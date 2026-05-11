'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RootState } from '@/lib/store';
import { clearCart } from '@/lib/store/cartSlice';
import { addressesAPI, ordersAPI } from '@/lib/api';
import { formatPrice, calculateDiscountedPrice, getImageUrl } from '@/lib/utils';
import { FaChevronDown, FaSearch, FaInfoCircle, FaLock, FaRegCreditCard } from 'react-icons/fa';
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
        <div className="min-h-screen bg-white">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
                {/* Left Column: Form */}
                <div className="p-4 sm:p-8 lg:p-16 xl:p-24 bg-white">
                    <div className="max-w-xl ml-auto w-full space-y-10">
                        {/* Guest Alert */}
                        {!isAuthenticated && (
                            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
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

                        {/* Delivery Section */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">Delivery Address</h2>
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
                                                    className="mt-1 flex-shrink-0 text-primary focus:ring-primary"
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
                            )}
                        </section>

                        {/* Shipping Method */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900">Shipping method</h2>
                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex justify-between items-center shadow-sm ring-1 ring-emerald-500/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-sm font-semibold text-emerald-900 tracking-tight">Free and fast shipping</span>
                                </div>
                                <span className="text-xs font-black text-emerald-600 tracking-widest uppercase bg-emerald-100 px-2.5 py-1 rounded-full">FREE</span>
                            </div>
                        </section>

                        {/* Payment Section */}
                        <section className="space-y-4">
                            <div className="space-y-1">
                                <h2 className="text-xl font-semibold text-gray-900">Payment</h2>
                                <p className="text-sm text-gray-500">All transactions are secure and encrypted.</p>
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
                                            <span className="text-sm font-medium text-gray-900">Online Payment</span>
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
                                        <div className="p-6 bg-gray-50 border-t border-primary/10 text-center space-y-3 animate-in slide-in-from-top-1 duration-200">
                                            <div className="flex justify-center">
                                                <div className="p-3 bg-white rounded-full shadow-sm">
                                                    <FaLock className="text-primary text-xl" />
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-600 max-w-xs mx-auto leading-relaxed">
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
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900">Cash on Delivery</span>
                                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">COD</span>
                                        </div>
                                    </label>
                                    
                                    {paymentMethod === 'COD' && (
                                        <div className="p-6 bg-gray-50 border-t border-primary/10 text-center animate-in slide-in-from-top-1 duration-200">
                                            <p className="text-xs text-gray-600">
                                                Pay with cash upon delivery. Please keep the exact amount ready.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>




                    </div>
                </div>

                {/* Right Column: Order Summary */}
                <div className="bg-gray-50 p-4 sm:p-8 lg:p-16 xl:p-24 border-l border-gray-200">
                    <div className="max-w-md mr-auto w-full space-y-8 lg:sticky lg:top-16">
                        {/* Product List */}
                        <div className="space-y-4">
                            {cartItems.map((item) => {
                                const price = calculateDiscountedPrice(item.price, item.discount);
                                return (
                                    <div key={item.productId} className="flex items-center gap-4">
                                        <div className="relative w-16 h-16 bg-white border border-gray-200 rounded-lg overflow-hidden flex-shrink-0 p-1">
                                            <Image
                                                src={getImageUrl(item.image)}
                                                alt={item.name}
                                                fill
                                                className="object-contain"
                                            />
                                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                                            <p className="text-xs text-gray-500">Water Purifier</p>
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatPrice(price * item.quantity)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Discount Code */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <input
                                type="text"
                                placeholder="Discount code"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                className="flex-grow px-4 py-3 bg-white border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm"
                            />
                             <button
                                onClick={handleApplyCoupon}
                                disabled={couponLoading || !couponCode || !!appliedCoupon}
                                className={`px-6 py-3 rounded font-semibold text-sm transition-all ${
                                    !couponCode || !!appliedCoupon 
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                    : 'bg-primary text-white hover:bg-primary-600 shadow-md active:scale-95'
                                }`}
                            >
                                {couponLoading ? '...' : 'Apply'}
                            </button>
                        </div>
                        {couponError && <p className="text-red-500 text-xs">{couponError}</p>}

                        {/* Totals */}
                        <div className="space-y-3 pt-6">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-medium text-gray-900">{formatPrice(cartTotal)}</span>
                            </div>
                            {appliedCoupon && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount ({appliedCoupon.code})</span>
                                    <span>-{formatPrice(appliedCoupon.discount)}</span>
                                </div>
                            )}
                            {referralDiscount > 0 && (
                                <div className="flex justify-between text-sm text-indigo-600">
                                    <span>Referral Benefit</span>
                                    <span>-{formatPrice(referralDiscount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600 font-medium tracking-tight">FREE</span>
                            </div>
                            
                            <div className="flex justify-between items-center pt-4 text-xl">
                                <span className="font-bold text-gray-900 uppercase text-lg tracking-tight">Total</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">INR</span>
                                    <span className="text-2xl font-bold text-gray-900">
                                        {formatPrice(cartTotal - (appliedCoupon?.discount || 0) - referralDiscount)}
                                    </span>
                                </div>
                            </div>

                            {/* Moved Pay Now Button */}
                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading || orderSuccess}
                                className={`w-full mt-8 py-5 rounded text-lg font-bold text-white transition-all shadow-xl ${
                                    loading || orderSuccess 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-primary hover:bg-primary-600 active:scale-[0.98]'
                                }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    `Pay now`
                                )}
                            </button>
                            <p className="text-[10px] text-center text-gray-400 mt-4 font-medium uppercase tracking-widest">
                                Secure Checkout Powered by Razorpay
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AddressForm({ formData, setFormData, loading }: any) {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Country Selector */}
            <div className="relative">
                <label className="absolute left-4 top-1.5 text-[10px] text-gray-500 font-medium">Country/Region</label>
                <select 
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full pl-4 pr-10 pt-5 pb-2 border border-gray-300 rounded appearance-none focus:ring-1 focus:ring-primary outline-none text-sm bg-white"
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
                className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm"
            />

            {/* Address */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Address"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm"
                />
                <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            </div>

            {/* Apartment */}
            <input
                type="text"
                placeholder="Apartment, suite, etc. (optional)"
                value={formData.apartment}
                onChange={(e) => setFormData({...formData, apartment: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm"
            />

            {/* City/State/PIN Row */}
            <div className="grid grid-cols-2 gap-3">
                <input
                    type="text"
                    placeholder="City"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm"
                />
                <input
                    type="text"
                    placeholder="PIN code"
                    required
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm"
                />
            </div>

            <div className="relative">
                <select
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full pl-4 pr-8 py-3 border border-gray-300 rounded appearance-none focus:ring-1 focus:ring-primary outline-none text-sm bg-white"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm"
                />
                <FaInfoCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm cursor-help" />
            </div>
        </div>
    );
}

