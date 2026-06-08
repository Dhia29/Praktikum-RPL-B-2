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
            alert('Berhasil masuk!');

            // Arahkan ke Loker
            navigate('/loker');

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">

                {/* Header (Versi UI milikmu) */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">LockER</h2>
                    <p className="text-gray-500 text-sm mt-2">Perjalanan karir dimulai dari sekarang!</p>
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
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">atau masuk dengan email</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* Form Login (Terkoneksi dengan State & Axios) */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                            placeholder="nama@email.com"
                        />
                    </div>

                    <div className="relative">
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <a href="#" className="text-xs text-blue-600 hover:underline font-medium">Lupa password?</a>
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                            placeholder="Masukkan password Anda"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            )}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full text-white font-semibold py-3 px-4 rounded-lg transition-colors mt-2 shadow-sm ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isLoading ? 'Memeriksa...' : 'Masuk'}
                    </button>
                </form>

                {/* Footer Links */}
                <div className="mt-8 text-center text-sm text-gray-600 space-y-4">
                    <p>
                        Belum memiliki akun?{' '}
                        <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                            Daftar di sini
                        </Link>
                    </p>

                    <div className="pt-4 border-t border-gray-100">
                        <a href="/admin/login" className="text-xs text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            Masuk sebagai Administrator
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
}