'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/lib/store';
import { ordersAPI, usersAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'referrals'>('profile');
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
    });
    const [updateLoading, setUpdateLoading] = useState(false);
    const [rewardBalance, setRewardBalance] = useState(0);
    const [realUser, setRealUser] = useState<any>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login?redirect=/dashboard');
            return;
        }

        if (activeTab === 'orders') {
            setLoading(true);
            ordersAPI.getUserOrders().then((res) => {
                setOrders(res.data.data);
                setLoading(false);
            }).catch(() => setLoading(false));
        } else {
            loadProfile();
        }
    }, [isAuthenticated, activeTab, router]);

    const loadProfile = async () => {
        setProfileLoading(true);
        try {
            const res = await usersAPI.getProfile();
            setRealUser(res.data);
            setRewardBalance(res.data.rewardBalance || 0);
            setFormData({
                firstName: res.data.firstName,
                lastName: res.data.lastName,
                phone: res.data.phone || '',
            });
        } catch (error) {
            console.error(error);
        } finally {
            setProfileLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            await usersAPI.updateProfile(formData);
            alert('Profile updated successfully!');
            setEditMode(false);
            loadProfile();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setUpdateLoading(false);
        }
    };

    if (!isAuthenticated) return null;

    // Use either the real user from API or fallback to redux user
    const displayUser = realUser || user;

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-black text-gray-900 mb-8 print:hidden">My Account</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2 print:hidden">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full text-left px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'profile' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        👤 Profile Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`w-full text-left px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        📦 Order History
                    </button>
                    <button
                        onClick={() => setActiveTab('referrals')}
                        className={`w-full text-left px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'referrals' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        🎁 Refer & Earn
                    </button>
                    <div className="pt-8 px-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Account Actions</p>
                        <button
                            onClick={() => {
                                localStorage.removeItem('accessToken');
                                localStorage.removeItem('refreshToken');
                                window.location.href = '/login';
                            }}
                            className="text-red-500 font-bold hover:underline"
                        >
                            Log Out
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 p-8 border border-gray-50">
                        {activeTab === 'profile' && (
                            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Profile Details</h2>
                                    {!editMode && (
                                        <button
                                            onClick={() => setEditMode(true)}
                                            className="text-primary font-bold hover:underline"
                                        >
                                            Edit Profile
                                        </button>
                                    )}
                                </div>

                                {profileLoading && !realUser ? (
                                    <div className="animate-pulse space-y-4">
                                        <div className="h-10 bg-gray-100 rounded-xl w-3/4"></div>
                                        <div className="h-10 bg-gray-100 rounded-xl w-1/2"></div>
                                    </div>
                                ) : editMode ? (
                                    <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">First Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.firstName}
                                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none transition"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">Last Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.lastName}
                                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none transition"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none transition"
                                                placeholder="e.g. 9876543210"
                                            />
                                        </div>
                                        <div className="flex gap-4 pt-4">
                                            <button
                                                type="submit"
                                                disabled={updateLoading}
                                                className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-700 transition"
                                            >
                                                {updateLoading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditMode(false)}
                                                className="bg-gray-100 text-gray-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Full Name</p>
                                            <p className="text-xl font-bold text-gray-900">{displayUser?.firstName} {displayUser?.lastName}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Email Address</p>
                                            <p className="text-xl font-bold text-gray-900">{displayUser?.email}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Phone Number</p>
                                            <p className="text-xl font-bold text-gray-900">{displayUser?.phone || 'Not provided'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Account Role</p>
                                            <p className="text-xl font-bold text-primary">{displayUser?.role}</p>
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'orders' && (
                            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Orders</h2>
                                {loading ? (
                                    <div className="py-20 text-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto"></div>
                                    </div>
                                ) : orders.length > 0 ? (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div key={order.id} className="group border border-gray-100 rounded-2xl p-6 hover:border-primary/30 hover:bg-primary/[0.01] transition-all">
                                                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-400">Order #{order.orderNumber}</p>
                                                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                                    </div>
                                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-600' :
                                                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                                                            'bg-primary-50 text-primary'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                                    <div>
                                                        <p className="text-sm text-gray-600">{order.items?.length || 0} Items</p>
                                                        <p className="text-xl font-black text-gray-900">{formatPrice(order.total)}</p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0 flex gap-2">
                                                        <button
                                                            onClick={() => window.print()}
                                                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-200 transition print:hidden"
                                                        >
                                                            🖨️ Print
                                                        </button>
                                                        <Link
                                                            href={`/orders/${order.id}`}
                                                            className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-gray-200"
                                                        >
                                                            View Details
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                        <p className="text-gray-500 mb-6 font-medium">You haven't placed any orders yet.</p>
                                        <Link href="/products" className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/10">Shop Now</Link>
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'referrals' && (
                            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <header className="bg-gradient-to-br from-primary to-primary-700 p-8 rounded-[2rem] text-white mb-10 overflow-hidden relative">
                                    <div className="relative z-10">
                                        <h2 className="text-3xl font-black mb-2">Invite Friends & Earn</h2>
                                        <p className="text-primary-50 opacity-90 max-w-sm">Spread the word about pure water and get exclusive rewards for every friend who buys.</p>
                                    </div>
                                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                                </header>

                                <div className="space-y-8">
                                    <div>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Your Invitation Code</p>
                                        <div className="flex gap-4">
                                            <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-200 p-4 rounded-2xl text-center font-black text-3xl text-gray-800 tracking-widest uppercase shadow-inner">
                                                {displayUser?.referralCode || 'LEEWAA-REF'}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(displayUser?.referralCode || 'LEEWAA-REF');
                                                    alert('Copied to clipboard!');
                                                }}
                                                className="bg-primary p-4 rounded-2xl text-white hover:rotate-6 transition-all shadow-xl shadow-primary/20"
                                            >
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-green-50 p-6 rounded-3xl border border-green-100 text-center">
                                            <p className="text-sm font-bold text-green-600 mb-1">Available Rewards</p>
                                            <p className="text-4xl font-black text-green-800">{formatPrice(rewardBalance)}</p>
                                        </div>
                                        <div className="bg-primary-50 p-6 rounded-3xl border border-primary-100 text-center">
                                            <p className="text-sm font-bold text-primary-600 mb-1">Account Status</p>
                                            <p className="text-xl font-black text-primary-800">Verified Referrer</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                        <h4 className="font-bold text-gray-800 mb-2">How it works?</h4>
                                        <ol className="list-decimal list-inside text-sm text-gray-500 space-y-2">
                                            <li>Share your unique referral code with friends.</li>
                                            <li>Your friend gets a discount on their first purchase using your code.</li>
                                            <li>You earn rewards when their order is successfully delivered!</li>
                                        </ol>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>

            {/* Global Print Styles */}
            <style jsx global>{`
                @media print {
                    header, footer, nav, aside, .print-hidden, .print\\:hidden, button, h1 {
                        display: none !important;
                    }
                    .container {
                        width: 100% !important;
                        max-width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    main {
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .shadow-xl, .shadow-lg, .shadow-md {
                        box-shadow: none !important;
                        border: 1px solid #eee !important;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                    }
                }
            `}</style>
        </div>
    );
}
