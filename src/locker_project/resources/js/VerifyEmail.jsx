import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function VerifyEmail() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [email, setEmail] = useState('');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const emailParam = queryParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        } else {
            // Jika tidak ada parameter email, kembali ke login
            navigate('/');
        }
    }, [location, navigate]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timerId = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [resendCooldown]);

    const handleCodeChange = (index, value) => {
        if (!/^[0-9]?$/.test(value)) return;
        
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto focus next input
        if (value && index < 5) {
            document.getElementById(`code-input-${index + 1}`).focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            document.getElementById(`code-input-${index - 1}`).focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const otpString = code.join('');
        if (otpString.length < 6) {
            setError('Masukkan 6 digit kode OTP secara lengkap.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('/api/verify-email', {
                email: email,
                code: otpString
            });

            setSuccess('Verifikasi berhasil! Mengalihkan...');
            setTimeout(() => {
                navigate('/loker');
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memverifikasi kode.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const response = await axios.post('/api/resend-verification', { email: email });
            setSuccess(response.data.message || 'Kode verifikasi baru telah dikirim.');
            setResendCooldown(60); // 60 seconds cooldown
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengirim ulang kode.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10 px-4">
            <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
                
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-purple-100 text-[#8100D1] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Verifikasi Email Anda</h2>
                    <p className="text-gray-500 text-sm mt-2">
                        Kami telah mengirimkan 6 digit kode unik ke <br/>
                        <span className="font-semibold text-gray-800">{email}</span>
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm text-center font-medium animate-fade-in">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-3 bg-green-50 text-green-600 border border-green-100 rounded-lg text-sm text-center font-medium animate-fade-in">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center gap-2 sm:gap-3">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                id={`code-input-${index}`}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleCodeChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 text-center text-xl font-bold text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8100D1] focus:border-[#8100D1] outline-none transition-all"
                                placeholder="-"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || code.join('').length < 6}
                        className={`w-full text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${isLoading || code.join('').length < 6 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#8100D1] hover:bg-purple-800 shadow-sm'}`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : 'Verifikasi Akun'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600 mb-2">Belum menerima email?</p>
                    <button
                        onClick={handleResend}
                        disabled={isLoading || resendCooldown > 0}
                        className={`text-sm font-semibold transition-colors ${resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#8100D1] hover:text-purple-900 underline'}`}
                    >
                        {resendCooldown > 0 ? `Kirim ulang dalam ${resendCooldown} detik` : 'Kirim Ulang Kode OTP'}
                    </button>
                </div>

            </div>
        </div>
    );
}
