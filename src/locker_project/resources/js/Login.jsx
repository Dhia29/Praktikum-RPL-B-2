import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

export default function Login() {
    const navigate = useNavigate();

    // State UI
    const [showPassword, setShowPassword] = useState(false);

    // State Data Form & Status
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [requiresVerification, setRequiresVerification] = useState(false);

    // Fungsi menangani ketikan user
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setRequiresVerification(false);
        setIsLoading(true);

        try {
            axios.defaults.withCredentials = true;

            const response = await axios.post('/login', formData);
            console.log('Login Sukses:', response.data);
            
            // Show success skeleton loading transition instead of alert
                        
            // Arahkan ke Loker setelah delay singkat agar animasi terlihat mulus
            setTimeout(() => {
                                navigate('/loker');
            }, 1200);

        } catch (error) {
            console.error('Login Error:', error);
            if (error.response?.data?.requires_verification) {
                setRequiresVerification(true);
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage(
                    error.response?.data?.message || 'Email atau password salah. Silakan coba lagi.'
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Fungsi khusus untuk SSO Google
    const handleGoogleLogin = () => {
        window.location.href = '/auth/google/redirect';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0F19] py-10 px-4 relative overflow-hidden transition-colors duration-500">
            {/* Background Decorative Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] -left-[10%] w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-[10%] -right-[10%] w-[400px] h-[400px] bg-indigo-400/20 dark:bg-indigo-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-gray-200/50 dark:border-white/5 w-full max-w-md relative z-10 animate-fade-in-up">

                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8100D1] to-pink-500 drop-shadow-sm">LockER</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Perjalanan karir dimulai dari sekarang!</p>
                </div>

                {/* Box Pesan Error (Ditambahkan agar UI komunikatif saat gagal login) */}
                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center">
                        {errorMessage}
                        {requiresVerification && (
                            <div className="mt-2">
                                <button
                                    onClick={() => navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`)}
                                    className="text-[#8100D1] hover:underline font-semibold"
                                >
                                    Verifikasi Sekarang
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Tombol Login Google */}
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-200 font-bold py-2.5 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm group"
                    >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Lanjutkan dengan Google
                    </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center py-2 mb-6">
                    <div className="flex-grow border-t border-gray-200 dark:border-slate-800"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-gray-500 text-sm font-medium">atau masuk dengan email</span>
                    <div className="flex-grow border-t border-gray-200 dark:border-slate-800"></div>
                </div>

                {/* Form Login (Terkoneksi dengan State & Axios) */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Alamat Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/30 focus:border-[#8100D1] outline-none transition-all shadow-sm"
                            placeholder="nama@email.com"
                        />
                    </div>

                    <div className="relative">
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Password</label>
                            <Link to="/forgot-password" className="text-xs text-[#8100D1] dark:text-[#c682ff] hover:underline font-bold transition">Lupa password?</Link>
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full pl-4 pr-10 py-2.5 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/30 focus:border-[#8100D1] outline-none transition-all shadow-sm"
                            placeholder="Masukkan password Anda"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                            )}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_8px_20px_rgba(129,0,209,0.3)] hover:shadow-[0_8px_25px_rgba(129,0,209,0.5)] transform hover:-translate-y-0.5 mt-4 group relative overflow-hidden ${isLoading ? 'bg-purple-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#8100D1] to-pink-500'}`}
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                        <span className="relative z-10">{isLoading ? 'Memeriksa...' : 'Masuk'}</span>
                    </button>
                </form>

                {/* Footer Links */}
                <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400 space-y-4">
                    <p>
                        Belum memiliki akun?{' '}
                        <Link to="/register" className="text-[#8100D1] dark:text-[#c682ff] font-bold hover:underline transition">
                            Daftar di sini
                        </Link>
                    </p>

                    <div className="pt-4 border-t border-gray-100 dark:border-slate-800/50">
                        <a href="/admin/login" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white flex items-center justify-center gap-1 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            Masuk sebagai Administrator
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
}