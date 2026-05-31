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

            const response = await axios.post('/register', payload);

            console.log('Sukses:', response.data);
            alert('Registrasi Berhasil! Anda akan diarahkan ke Dashboard.');

            navigate('/dashboard');

        } catch (error) {
            console.error('Error:', error);
            setErrorMessage(
                error.response?.data?.message || 'Terjadi kesalahan pada server. Silakan coba lagi.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    // --- FUNGSI BARU UNTUK GOOGLE SSO ---
    const handleGoogleSignUp = () => {
        window.location.href = '/auth/google/redirect';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-lg">

                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">LockER</h2>
                    <p className="text-gray-500 text-sm mt-2">Perjalanan karir dimulai dari sekarang!</p>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center">
                        {errorMessage}
                    </div>
                )}

                {/* Tombol Login Google (Sudah Terhubung) */}
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={handleGoogleSignUp} // <-- Dipanggil di sini
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

                <div className="relative flex items-center py-2 mb-6">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">atau daftar dengan email</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* Role Toggle */}
                <div className="flex p-1 mb-6 bg-gray-100 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setRole('seeker')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'seeker' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Pencari Kerja
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('company')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'company' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Perusahaan
                    </button>
                </div>

                {/* Form Element Utama */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {role === 'seeker' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                placeholder="Nama lengkap sesuai KTP"
                            />
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Sesuai Akta Pendirian Perusahaan"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bidang Industri</label>
                                    <select
                                        name="industri"
                                        value={formData.industri}
                                        onChange={handleChange}
                                        required={role === 'company'}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor NPWP</label>
                                    <input
                                        type="text"
                                        name="npwp"
                                        value={formData.npwp}
                                        onChange={handleChange}
                                        required={role === 'company'}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                        placeholder="15 Digit NPWP"
                                    />
                                </div>
                            </div>
                        </>
                    )}

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

                    <div className={role === 'seeker' ? "grid grid-cols-2 gap-4" : ""}>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength="8"
                                className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                placeholder="Minimal 8 karakter"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 focus:outline-none">
                                {showPassword ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>

                        {role === 'seeker' && (
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="passwordConfirm"
                                    value={formData.passwordConfirm}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Ulangi password"
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 focus:outline-none">
                                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full text-white font-semibold py-3 px-4 rounded-lg transition-colors mt-2 shadow-sm ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isLoading ? 'Memproses...' : (role === 'seeker' ? 'Daftar sebagai Pencari Kerja' : 'Daftarkan Perusahaan')}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-600">
                    Sudah memiliki akun? <Link to="/" className="text-blue-600 font-semibold hover:underline">Masuk di sini</Link>
                </div>

            </div>
        </div>
    );
}