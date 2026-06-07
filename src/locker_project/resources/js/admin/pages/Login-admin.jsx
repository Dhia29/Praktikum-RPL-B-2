import React, { useState } from 'react';
import axios from 'axios';

export default function LoginAdmin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await axios.get('/sanctum/csrf-cookie');
            await axios.post('/api/admin/login', {
                email,
                password
            });
            window.location.href = '/admin/dashboard';
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] py-10 px-4">
            <div className="bg-white p-8 sm:p-10 rounded-[1.25rem] shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-gray-100 w-full max-w-[480px]">
                
                <div className="text-center mb-8">
                    <h2 className="text-[32px] font-bold text-[#1a1f36] tracking-tight mb-2">LockER</h2>
                    <p className="text-[#4f566b] text-base">Administrator Access Portal</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-[14px] font-semibold text-[#1a1f36] mb-2">Alamat Email</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus placeholder="nama@email.com"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-sm placeholder-gray-400" />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="password" className="block text-[14px] font-semibold text-[#1a1f36]">Password</label>
                            <a href="#" className="text-[13px] font-medium text-blue-600 hover:underline">Lupa password?</a>
                        </div>
                        <div className="relative">
                            <input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Masukkan password Anda"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-sm placeholder-gray-400 pr-10" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0a10.05 10.05 0 015.71-3.59m5.61.59c1.536.824 2.81 2.067 3.69 3.6A9.97 9.97 0 0112 19c-1.272 0-2.48-.242-3.59-.68l3.4-3.4" /></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full text-white font-semibold py-3.5 px-4 rounded-lg transition-colors mt-2 bg-[#1C5BFF] hover:bg-blue-700 disabled:opacity-50">
                        {loading ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>

                <div className="relative flex items-center py-6 mt-4">
                    <div className="flex-grow border-t border-gray-100"></div>
                </div>

                <div className="text-center">
                    <div className="inline-flex items-center justify-center gap-2 text-[14px] text-gray-500">
                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        Secure Administrator Portal
                    </div>
                    <div className="mt-4">
                        <a href="/" className="text-sm font-medium text-blue-600 hover:underline">Kembali ke Beranda Utama</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
