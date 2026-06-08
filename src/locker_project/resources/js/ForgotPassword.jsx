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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Lupa Password</h2>
                    <p className="text-gray-500 text-sm mt-2">Masukkan email yang terdaftar untuk menerima tautan reset password.</p>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8100D1] focus:border-[#8100D1] outline-none transition-all"
                            placeholder="nama@email.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !email}
                        className={`w-full text-white font-semibold py-3 px-4 rounded-lg transition-colors mt-2 shadow-sm ${isLoading || !email ? 'bg-[#cba8e9] cursor-not-allowed' : 'bg-[#8100D1] hover:bg-[#6b00ac]'}`}
                    >
                        {isLoading ? 'Mengirim...' : 'Kirim Tautan Reset'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-600">
                    <Link to="/" className="text-[#8100D1] font-semibold hover:underline flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        Kembali ke Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
