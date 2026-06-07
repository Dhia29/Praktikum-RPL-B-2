import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function SettingsAdmin() {
    const [activeTab, setActiveTab] = useState('umum');
    const [settings, setSettings] = useState({
        platform_name: 'LockER',
        support_email: 'support@locker.com',
        auto_approve_jobs: false,
        session_timeout: 120,
        force_2fa: false,
        notify_new_company: true,
        notify_new_ticket: true,
        language: 'id',
        timezone: 'Asia/Jakarta'
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Handle initial hash
        const hash = window.location.hash.replace('#', '');
        if (hash && ['umum', 'keamanan', 'notifikasi', 'lokalisasi'].includes(hash)) {
            setActiveTab(hash);
        }

        const fetchSettings = async () => {
            try {
                const response = await axios.get('/api/admin/settings');
                if (response.data) {
                    setSettings(prev => ({ ...prev, ...response.data }));
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        fetchSettings();
    }, []);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        window.history.replaceState(null, null, '#' + tab);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await axios.post('/api/admin/settings', settings);
            setMessage('Pengaturan berhasil disimpan!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Failed to save settings", error);
            alert('Gagal menyimpan pengaturan.');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
                <nav className="space-y-1">
                    <button onClick={() => handleTabChange('umum')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'umum' ? 'bg-white text-[#8100D1] shadow-sm font-semibold border border-gray-100' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Umum
                    </button>
                    <button onClick={() => handleTabChange('keamanan')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'keamanan' ? 'bg-white text-[#8100D1] shadow-sm font-semibold border border-gray-100' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        Keamanan
                    </button>
                    <button onClick={() => handleTabChange('notifikasi')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'notifikasi' ? 'bg-white text-[#8100D1] shadow-sm font-semibold border border-gray-100' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        Notifikasi
                    </button>
                    <button onClick={() => handleTabChange('lokalisasi')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${activeTab === 'lokalisasi' ? 'bg-white text-[#8100D1] shadow-sm font-semibold border border-gray-100' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                        Lokalisasi
                    </button>
                </nav>
            </div>

            {/* Settings Content Panels */}
            <div className="lg:col-span-3">
                {message && (
                    <div className="mb-6 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">
                        {message}
                    </div>
                )}

                {/* UMUM */}
                {activeTab === 'umum' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">Pengaturan Umum Platform</h3>
                            <p className="text-sm text-gray-500 mt-1">Kelola informasi dasar dan perilaku platform LockER.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-6">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700">Nama Platform</label>
                                    <p className="text-xs text-gray-500 mt-1">Nama yang akan ditampilkan di seluruh sistem.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <input type="text" name="platform_name" value={settings.platform_name} onChange={handleChange} required className="w-full max-w-md px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8100D1] focus:bg-white outline-none transition-all text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-6">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700">Email Dukungan</label>
                                    <p className="text-xs text-gray-500 mt-1">Email kontak untuk bantuan pengguna.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <input type="email" name="support_email" value={settings.support_email} onChange={handleChange} required className="w-full max-w-md px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8100D1] focus:bg-white outline-none transition-all text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-6">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700">Persetujuan Otomatis</label>
                                    <p className="text-xs text-gray-500 mt-1">Setujui lowongan secara otomatis tanpa moderasi manual.</p>
                                </div>
                                <div className="md:col-span-2 flex items-center">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="auto_approve_jobs" checked={settings.auto_approve_jobs} onChange={handleChange} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8100D1]"></div>
                                        <span className="ml-3 text-sm font-medium text-gray-500">
                                            {settings.auto_approve_jobs ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-[#8100D1] rounded-lg hover:bg-purple-800 transition-colors shadow-sm">
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* KEAMANAN */}
                {activeTab === 'keamanan' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">Pengaturan Keamanan</h3>
                            <p className="text-sm text-gray-500 mt-1">Kelola keamanan sesi dan kata sandi administrator.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-6">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700">Waktu Kedaluwarsa Sesi</label>
                                    <p className="text-xs text-gray-500 mt-1">Waktu dalam menit sebelum admin logout otomatis.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <input type="number" name="session_timeout" value={settings.session_timeout} onChange={handleChange} className="w-full max-w-md px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8100D1] focus:bg-white outline-none transition-all text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-6">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700">Otentikasi Dua Faktor</label>
                                    <p className="text-xs text-gray-500 mt-1">Wajibkan 2FA untuk semua akun administrator.</p>
                                </div>
                                <div className="md:col-span-2 flex items-center">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="force_2fa" checked={settings.force_2fa} onChange={handleChange} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8100D1]"></div>
                                        <span className="ml-3 text-sm font-medium text-gray-500">{settings.force_2fa ? 'Aktif' : 'Nonaktif'}</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-[#8100D1] rounded-lg hover:bg-purple-800 transition-colors shadow-sm">
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* NOTIFIKASI */}
                {activeTab === 'notifikasi' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">Pengaturan Notifikasi</h3>
                            <p className="text-sm text-gray-500 mt-1">Konfigurasi peringatan email dan push notifikasi sistem.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-6">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700">Notifikasi Pendaftar Baru</label>
                                    <p className="text-xs text-gray-500 mt-1">Kirim email setiap ada pendaftar perusahaan baru.</p>
                                </div>
                                <div className="md:col-span-2 flex items-center">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="notify_new_company" checked={settings.notify_new_company} onChange={handleChange} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8100D1]"></div>
                                        <span className="ml-3 text-sm font-medium text-gray-500">{settings.notify_new_company ? 'Aktif' : 'Nonaktif'}</span>
                                    </label>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-6">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700">Notifikasi Tiket Baru</label>
                                    <p className="text-xs text-gray-500 mt-1">Kirim email setiap ada tiket dukungan pelanggan baru.</p>
                                </div>
                                <div className="md:col-span-2 flex items-center">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" name="notify_new_ticket" checked={settings.notify_new_ticket} onChange={handleChange} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8100D1]"></div>
                                        <span className="ml-3 text-sm font-medium text-gray-500">{settings.notify_new_ticket ? 'Aktif' : 'Nonaktif'}</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-[#8100D1] rounded-lg hover:bg-purple-800 transition-colors shadow-sm">
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* LOKALISASI */}
                {activeTab === 'lokalisasi' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">Pengaturan Lokalisasi</h3>
                            <p className="text-sm text-gray-500 mt-1">Ubah bahasa sistem, format waktu, dan wilayah zona waktu.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-6">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700">Bahasa Utama</label>
                                    <p className="text-xs text-gray-500 mt-1">Bahasa antarmuka untuk dasbor administrator.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <select name="language" value={settings.language} onChange={handleChange} className="w-full max-w-md px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8100D1] focus:bg-white outline-none transition-all text-sm">
                                        <option value="id">Bahasa Indonesia (ID)</option>
                                        <option value="en">English (EN)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-100 pb-6">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700">Zona Waktu</label>
                                    <p className="text-xs text-gray-500 mt-1">Zona waktu default untuk waktu transaksi & log.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <select name="timezone" value={settings.timezone} onChange={handleChange} className="w-full max-w-md px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8100D1] focus:bg-white outline-none transition-all text-sm">
                                        <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                                        <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                                        <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-[#8100D1] rounded-lg hover:bg-purple-800 transition-colors shadow-sm">
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
