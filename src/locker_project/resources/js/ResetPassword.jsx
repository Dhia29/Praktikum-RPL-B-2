import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from 'axios';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!token || !email) {
            setErrorMessage('Tautan tidak valid. Harap gunakan tautan yang dikirim ke email Anda.');
        }
    }, [token, email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setMessage('');

        if (password !== passwordConfirmation) {
            setErrorMessage('Konfirmasi password tidak cocok.');
            return;
        }

        setIsLoading(true);

        try {
            axios.defaults.withCredentials = true;
            const response = await axios.post('/api/reset-password', {
                email,
                token,
                password,
                password_confirmation: passwordConfirmation
            });
            setMessage(response.data.message);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || 'Terjadi kesalahan saat memproses permintaan Anda.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0F19] py-10 px-4 relative overflow-hidden transition-colors duration-500">
                {/* Background Decorative Glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[10%] -left-[10%] w-[500px] h-[500px] bg-red-400/20 dark:bg-red-900/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse"></div>
                </div>

                <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-gray-200/50 dark:border-white/5 w-full max-w-md text-center relative z-10 animate-fade-in-up">
                    <div className="text-red-500 dark:text-red-400 mb-4 flex justify-center">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Tautan Tidak Valid</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{errorMessage}</p>
                    <Link to="/forgot-password" className="text-[#8100D1] dark:text-[#c682ff] font-bold hover:underline transition">Minta Tautan Baru</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0F19] py-10 px-4 relative overflow-hidden transition-colors duration-500">
            {/* Background Decorative Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] -left-[10%] w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-[10%] -right-[10%] w-[400px] h-[400px] bg-indigo-400/20 dark:bg-indigo-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-gray-200/50 dark:border-white/5 w-full max-w-md relative z-10 animate-fade-in-up">

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Atur Ulang Password</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Masukkan password baru untuk akun <strong className="text-gray-800 dark:text-gray-200">{email}</strong></p>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center">
                        {errorMessage}
                    </div>
                )}

                {message ? (
                    <div className="text-center">
                        <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">
                            {message}
                        </div>
                        <p className="text-sm text-gray-500">Mengalihkan ke halaman login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Password Baru</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength="8"
                                className="w-full pl-4 pr-10 py-2.5 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/30 focus:border-[#8100D1] outline-none transition-all shadow-sm"
                                placeholder="Minimal 8 karakter"
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

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Konfirmasi Password Baru</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                required
                                minLength="8"
                                className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/30 focus:border-[#8100D1] outline-none transition-all shadow-sm"
                                placeholder="Ketik ulang password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !password || !passwordConfirmation}
                            className={`w-full text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_8px_20px_rgba(129,0,209,0.3)] hover:shadow-[0_8px_25px_rgba(129,0,209,0.5)] transform hover:-translate-y-0.5 mt-4 group relative overflow-hidden ${isLoading || !password || !passwordConfirmation ? 'bg-purple-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#8100D1] to-pink-500'}`}
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                            <span className="relative z-10">{isLoading ? 'Menyimpan...' : 'Simpan Password Baru'}</span>
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
