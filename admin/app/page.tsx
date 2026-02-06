'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authAPI } from '@/lib/api';

export default function AdminLoginPage() {
    // Strictly bind pre-filled credentials only to localhost/dev environment
    const isDev = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    const [email, setEmail] = useState(isDev ? 'admin@leewaa.com' : '');
    const [password, setPassword] = useState(isDev ? 'Admin@123' : '');
    const [showPassword, setShowPassword] = useState(false);
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
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 relative overflow-hidden">
            {/* dynamic background blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
            <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[100px] animate-bounce"></div>

            {/* main card with glassmorphism */}
            <div className="max-w-md w-full bg-white/10 backdrop-blur-2xl rounded-[40px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-10 relative z-10 border border-white/20">
                <div className="flex flex-col items-center mb-10">
                    <div className="mb-8 relative w-56 h-20 drop-shadow-2xl">
                        <Image
                            src="/images/Leewa_logo_web.png"
                            alt="Leewaa Logo"
                            fill
                            className="object-contain brightness-0 invert"
                            priority
                        />
                    </div>
                    <div className="h-0.5 w-12 bg-primary/50 mb-6 rounded-full"></div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Portal Access</h1>
                    <p className="text-blue-100/60 font-medium mt-1">Authorized Personnel Only</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-5 py-4 rounded-2xl mb-8 flex items-center gap-3 animate-shake backdrop-blur-md">
                        <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center text-lg">⚠️</div>
                        <span className="font-semibold text-sm">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <label className="block text-xs font-black text-blue-100/50 uppercase tracking-[0.2em] ml-2">
                            Identification
                        </label>
                        <div className="relative group">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-all scale-110">
                                🛡️
                            </span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-14 pr-4 py-5 bg-white/5 border border-white/10 rounded-3xl focus:ring-4 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all font-bold text-white placeholder:text-white/20"
                                placeholder="E-mail"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-xs font-black text-blue-100/50 uppercase tracking-[0.2em] ml-2">
                            Security Key
                        </label>
                        <div className="relative group">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/60 group-focus-within:text-primary transition-all scale-110">
                                🔐
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-14 pr-14 py-5 bg-white/5 border border-white/10 rounded-3xl focus:ring-4 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all font-bold text-white placeholder:text-white/20"
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-2 transition-all hover:scale-110"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-white py-5 rounded-3xl font-black text-lg shadow-[0_15px_30px_-5px_rgba(var(--primary-rgb),0.5)] hover:shadow-[0_20px_40px_-5px_rgba(var(--primary-rgb),0.6)] active:scale-[0.97] transition-all disabled:bg-white/10 disabled:text-white/20 disabled:shadow-none mt-6 uppercase tracking-widest"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Authenticating...</span>
                            </div>
                        ) : 'Establish Session'}
                    </button>
                </form>

                {isDev && (
                    <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Developer Mode Active</p>
                        </div>
                        <div className="text-center px-5 py-3 bg-white/5 rounded-2xl border border-white/10 text-xs font-bold text-blue-200/50 backdrop-blur-sm">
                            admin@leewaa.com / Admin@123
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
