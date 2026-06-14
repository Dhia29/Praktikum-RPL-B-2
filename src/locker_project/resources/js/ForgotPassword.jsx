import React, { useState } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setMessage('');
        setIsLoading(true);

        try {
            axios.defaults.withCredentials = true;
            const response = await axios.post('/api/forgot-password', { email });
            setMessage(response.data.message);
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || 'Terjadi kesalahan saat memproses permintaan Anda.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0F19] py-10 px-4 relative overflow-hidden transition-colors duration-500">
            {/* Background Decorative Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] -left-[10%] w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-[10%] -right-[10%] w-[400px] h-[400px] bg-indigo-400/20 dark:bg-indigo-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-gray-200/50 dark:border-white/5 w-full max-w-md relative z-10 animate-fade-in-up">

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lupa Password</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Masukkan email yang terdaftar untuk menerima tautan reset password.</p>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center">
                        {errorMessage}
                    </div>
                )}

                {message && (
                    <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm text-center">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Alamat Email</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/30 focus:border-[#8100D1] outline-none transition-all shadow-sm"
                            placeholder="nama@email.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !email}
                        className={`w-full text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_8px_20px_rgba(129,0,209,0.3)] hover:shadow-[0_8px_25px_rgba(129,0,209,0.5)] transform hover:-translate-y-0.5 mt-4 group relative overflow-hidden ${isLoading || !email ? 'bg-purple-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#8100D1] to-pink-500'}`}
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                        <span className="relative z-10">{isLoading ? 'Mengirim...' : 'Kirim Tautan Reset'}</span>
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                    <Link to="/" className="text-[#8100D1] dark:text-[#c682ff] font-bold hover:underline flex items-center justify-center gap-1 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        Kembali ke Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
