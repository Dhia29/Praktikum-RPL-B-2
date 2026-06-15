import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

export default function SignUp() {
    const navigate = useNavigate();

    const [role, setRole] = useState('seeker');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        industri: '',
        npwp: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (role === 'seeker' && formData.password !== formData.passwordConfirm) {
            setErrorMessage('Konfirmasi password tidak cocok!');
            return;
        }

        setIsLoading(true);

        try {
            axios.defaults.withCredentials = true;

            const config = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            };

            const payload = {
                nama_lengkap_atau_perusahaan: formData.name,
                email: formData.email,
                password: formData.password,
                role: role
            };

            if (role === 'company') {
                payload.npwp = formData.npwp;
                payload.industri = formData.industri;
            }

            const response = await axios.post('/register', payload, config);

            if (response.data.requires_verification || response.status === 201) {
                                setTimeout(() => {
                                        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
                }, 2000);
            }

        } catch (error) {
            console.error('Error:', error);
            if (error.response?.status === 422 && error.response.data.errors) {
                // Get the first error message from the validation errors
                const errors = error.response.data.errors;
                const firstError = Object.values(errors)[0][0];
                
                // Customize specific known error messages
                if (firstError.includes('has already been taken')) {
                    setErrorMessage('Alamat email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.');
                } else {
                    setErrorMessage(firstError);
                }
            } else {
                setErrorMessage(
                    error.response?.data?.message || 'Terjadi kesalahan pada server. Silakan coba lagi.'
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    // --- FUNGSI BARU UNTUK GOOGLE SSO ---
    const handleGoogleSignUp = () => {
        window.location.href = '/auth/google/redirect';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0F19] py-10 px-4 relative overflow-hidden transition-colors duration-500">
            {/* Background Decorative Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] -right-[10%] w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-[10%] -left-[10%] w-[400px] h-[400px] bg-indigo-400/20 dark:bg-indigo-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-gray-200/50 dark:border-white/5 w-full max-w-lg relative z-10 animate-fade-in-up">

                <div className="text-center mb-6">
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8100D1] to-pink-500 drop-shadow-sm">LockER</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Perjalanan karir dimulai dari sekarang!</p>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center">
                        {errorMessage}
                    </div>
                )}

                {/* Role Toggle */}
                <div className="flex p-1 mb-6 bg-gray-100 dark:bg-slate-800/50 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setRole('seeker')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'seeker' ? 'bg-white dark:bg-slate-700 text-[#8100D1] dark:text-[#c682ff] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Pencari Kerja
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('company')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'company' ? 'bg-white dark:bg-slate-700 text-[#8100D1] dark:text-[#c682ff] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Perusahaan
                    </button>
                </div>

                {role === 'seeker' && (
                    <>
                        {/* Tombol Login Google (Sudah Terhubung) */}
                        <div className="mb-6">
                            <button
                                type="button"
                                onClick={handleGoogleSignUp} // <-- Dipanggil di sini
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

                        <div className="relative flex items-center py-2 mb-6">
                            <div className="flex-grow border-t border-gray-200 dark:border-slate-800"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-gray-500 text-sm font-medium">atau daftar dengan email</span>
                            <div className="flex-grow border-t border-gray-200 dark:border-slate-800"></div>
                        </div>
                    </>
                )}

                {/* Form Element Utama */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {role === 'seeker' ? (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Nama Lengkap</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/30 focus:border-[#8100D1] outline-none transition-all shadow-sm"
                                placeholder="Nama lengkap sesuai KTP"
                            />
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Nama Perusahaan</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/30 focus:border-[#8100D1] outline-none transition-all shadow-sm"
                                    placeholder="Sesuai Akta Pendirian Perusahaan"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Bidang Industri</label>
                                    <select
                                        name="industri"
                                        value={formData.industri}
                                        onChange={handleChange}
                                        required={role === 'company'}
                                        className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/30 focus:border-[#8100D1] outline-none transition-all shadow-sm appearance-none"
                                    >
                                        <option value="">Kategori Industri</option>
                                        <option value="teknologi">Teknologi / IT</option>
                                        <option value="manufaktur">Manufaktur</option>
                                        <option value="keuangan">Keuangan & Perbankan</option>
                                        <option value="logistik">Logistik / Transportasi</option>
                                        <option value="pendidikan">Pendidikan</option>
                                        <option value="kesehatan">Kesehatan</option>
                                        <option value="ritel">Retail</option>
                                        <option value="pariwisata">Pariwisata & Perhotelan</option>
                                        <option value="konstruksi">Konstruksi & Properti</option>
                                        <option value="pertambangan">Energi / Pertambangan</option>
                                        <option value="fnb">Food & Beverages</option>
                                        <option value="media">Media & Hiburan</option>
                                        <option value="agrikultur">Agrikultur / Perkebunan</option>
                                        <option value="otomotif">Otomotif</option>
                                        <option value="lainnya">Lainnya</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Nomor NPWP</label>
                                    <input
                                        type="text"
                                        name="npwp"
                                        value={formData.npwp}
                                        onChange={handleChange}
                                        required={role === 'company'}
                                        className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/30 focus:border-[#8100D1] outline-none transition-all shadow-sm"
                                        placeholder="15 Digit NPWP"
                                    />
                                </div>
                            </div>
                        </>
                    )}

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

                    <div className={role === 'seeker' ? "grid grid-cols-2 gap-4" : ""}>
                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength="8"
                                className="w-full pl-4 pr-10 py-2.5 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/30 focus:border-[#8100D1] outline-none transition-all shadow-sm"
                                placeholder="Minimal 8 karakter"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 focus:outline-none">
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                                )}
                            </button>
                        </div>

                        {role === 'seeker' && (
                            <div className="relative">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Konfirmasi Password</label>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="passwordConfirm"
                                    value={formData.passwordConfirm}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/30 focus:border-[#8100D1] outline-none transition-all shadow-sm"
                                    placeholder="Ulangi password"
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 focus:outline-none">
                                    {showConfirmPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_8px_20px_rgba(129,0,209,0.3)] hover:shadow-[0_8px_25px_rgba(129,0,209,0.5)] transform hover:-translate-y-0.5 mt-4 group relative overflow-hidden ${isLoading ? 'bg-purple-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#8100D1] to-pink-500'}`}
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                        <span className="relative z-10">{isLoading ? 'Memproses...' : (role === 'seeker' ? 'Daftar sebagai Pencari Kerja' : 'Daftarkan Perusahaan')}</span>
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                    Sudah memiliki akun? <Link to="/" className="text-[#8100D1] dark:text-[#c682ff] font-bold hover:underline transition">Masuk di sini</Link>
                </div>

            </div>
        </div>
    );
}