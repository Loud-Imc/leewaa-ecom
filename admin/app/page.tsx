'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('admin@leewaa.com');
    const [password, setPassword] = useState('Admin@123');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authAPI.login({ email, password });
            const { accessToken, user } = response.data;

            if (user.role === 'CUSTOMER') {
                setError('Access denied. Admin privileges required.');
                setLoading(false);
                return;
            }

            localStorage.setItem('adminToken', accessToken);
            localStorage.setItem('adminUser', JSON.stringify(user));
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Panel</h1>
                    <p className="text-gray-600">Login to manage your store</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="admin@leewaa.com"

                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition shadow-lg hover:shadow-xl disabled:bg-gray-400"
                    >
                        {loading ? 'Logging in...' : 'Login to Dashboard'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Default: admin@leewaa.com / Admin@123
                </p>
            </div>
        </div>
    );
}
