import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import PageHeader from './components/PageHeader';

export default function Settings() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('notifikasi');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [userData, setUserData] = useState(null);

    // Settings state
    const [settings, setSettings] = useState({
        notify_application_status: true,
        notify_messages: true,
        notify_community: true,
        notify_connections: true,
        visibility_email: 'none',
        visibility_phone: 'none',
        visibility_location: 'public',
        visibility_education: 'public',
        visibility_experience: 'public',
        visibility_social_links: 'connections',
        theme: 'light',
        language: 'id',
    });

    // Password form
    const [passwordForm, setPasswordForm] = useState({
        current_password: '', new_password: '', new_password_confirmation: ''
    });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

    // Email form
    const [emailForm, setEmailForm] = useState({ password: '', new_email: '' });

    // Delete account
    const [deletePassword, setDeletePassword] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Blocked users
    const [blockedUsers, setBlockedUsers] = useState([]);

    // Language is now inside settings state. We keep i18n synchronization handled in useEffect or events.

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [meRes, settingsRes, blockedRes] = await Promise.all([
                    axios.get('/me'),
                    axios.get('/api/user/settings'),
                    axios.get('/api/account/blocked-users'),
                ]);
                const fetchedSettings = settingsRes.data || {};
                setUserData(meRes.data);
                const finalTheme = fetchedSettings.theme || 'light';
                const finalLanguage = fetchedSettings.language || 'id';

                setSettings(prev => ({
                    ...prev,
                    ...fetchedSettings,
                    theme: finalTheme,
                    language: finalLanguage,
                }));

                // Sync DB settings to browser DOM and LocalStorage
                document.documentElement.setAttribute('data-theme', finalTheme);
                if (finalTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                localStorage.setItem('app_theme', finalTheme);

                i18n.changeLanguage(finalLanguage);
                localStorage.setItem('app_language', finalLanguage);

                setBlockedUsers(blockedRes.data || []);
            } catch (err) {
                console.error('Failed to load settings', err);
                if (err.response?.status === 401) navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const showMsg = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    // Save notification / visibility / theme settings
    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            const payload = { ...settings };
            Object.keys(payload).forEach(key => {
                if (typeof payload[key] === 'boolean') {
                    payload[key] = payload[key] ? '1' : '0';
                }
            });

            await axios.post('/api/user/settings', payload);
            showMsg('Pengaturan berhasil disimpan!');
        } catch (err) {
            console.error("Save error:", err.response?.data);
            if (err.response?.data?.message) {
                showMsg('Gagal: ' + err.response.data.message, 'error');
            } else {
                showMsg('Gagal menyimpan pengaturan.', 'error');
            }
        } finally {
            setSaving(false);
        }
    };

    const saveSingleSetting = async (updates) => {
        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);

        try {
            const payload = { ...newSettings };
            Object.keys(payload).forEach(key => {
                if (typeof payload[key] === 'boolean') {
                    payload[key] = payload[key] ? '1' : '0';
                }
            });
            await axios.post('/api/user/settings', payload);
            showMsg(t('settings.common.success_msg', 'Pengaturan tersimpan otomatis.'));
        } catch (err) {
            console.error('Save failed', err);
            showMsg(t('settings.common.fail_msg', 'Gagal menyimpan otomatis'), 'error');
        }
    };

    // Toggle handler
    const toggleSetting = (key) => saveSingleSetting({ [key]: !settings[key] });

    // Visibility handler
    const setVisibility = (key, value) => saveSingleSetting({ [key]: value });

    // Theme handler
    const toggleTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('app_theme', theme);
        saveSingleSetting({ theme });
    };

    // Language handler
    const handleLanguageChange = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('app_language', lng);
        saveSingleSetting({ language: lng });
    };

    // Password change
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post('/api/account/change-password', passwordForm);
            showMsg('Password berhasil diubah!');
            setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
        } catch (err) {
            showMsg(err.response?.data?.message || 'Gagal mengubah password.', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Email change
    const handleChangeEmail = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post('/api/account/change-email', emailForm);
            showMsg('Email berhasil diubah!');
            setEmailForm({ password: '', new_email: '' });
        } catch (err) {
            showMsg(err.response?.data?.message || 'Gagal mengubah email.', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Delete account
    const handleDeleteAccount = async () => {
        setSaving(true);
        try {
            await axios.delete('/api/account', { data: { password: deletePassword } });
            navigate('/');
        } catch (err) {
            showMsg(err.response?.data?.message || 'Gagal menghapus akun.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        {
            id: 'notifikasi', label: t('user_settings.tabs.notifikasi', 'Notifikasi'), icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            )
        },
        {
            id: 'visibilitas', label: t('user_settings.tabs.visibilitas', 'Visibilitas'), icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            )
        },
        {
            id: 'keamanan', label: t('user_settings.tabs.keamanan', 'Keamanan'), icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            )
        },
        {
            id: 'tampilan', label: t('user_settings.tabs.tampilan', 'Bahasa & Tampilan'), icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
            )
        },
    ];

    // Toggle switch component
    const Toggle = ({ checked, onChange, label, desc }) => (
        <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-slate-800 last:border-0">
            <div className="flex-1 pr-4">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</p>
                {desc && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>}
            </div>
            <button onClick={onChange} className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-[#8100D1]' : 'bg-gray-200 dark:bg-slate-700'}`}>
                <span className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
            </button>
        </div>
    );

    const VisibilityRow = ({ label, desc, settingKey }) => (
        <div className="py-4 border-b border-gray-100 dark:border-slate-800 last:border-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{label}</p>
            {desc && <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{desc}</p>}
            <div className="flex gap-2">
                {[
                    { value: 'public', label: t('user_settings.visibility.options.public', 'Semua Orang'), icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg> },
                    { value: 'connections', label: t('user_settings.visibility.options.connections', 'Hanya Teman'), icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
                    { value: 'none', label: t('user_settings.visibility.options.none', 'Tidak Ada'), icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg> },
                ].map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => setVisibility(settingKey, opt.value)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${settings[settingKey] === opt.value
                            ? 'bg-[#8100D1] text-white border-[#8100D1] shadow-sm'
                            : 'bg-white/50 dark:bg-slate-800/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-[#8100D1]/40 dark:hover:border-[#a055db]/40 hover:text-[#8100D1] dark:hover:text-[#a055db]'
                            }`}
                    >
                        {opt.icon}
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-[#8100D1] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] font-sans relative overflow-hidden transition-colors duration-500">
            {/* Background Decorative Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse"></div>
                <div className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] bg-indigo-400/20 dark:bg-indigo-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
            {/* Header */}
            <PageHeader />

            <main className="max-w-[960px] mx-auto w-full px-4 sm:px-6 py-8 relative z-10">
                {/* Status Message */}
                {message.text && (
                    <div className={`mb-6 p-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in-up ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {message.type === 'error' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                        </svg>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl rounded-3xl border border-gray-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] p-4 space-y-1 sticky top-24 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-[#8100D1] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-[#8100D1]/10 to-transparent text-[#8100D1] dark:text-[#c682ff] font-semibold shadow-sm border border-purple-100/50 dark:border-purple-800/30'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 border border-transparent'
                                        }`}
                                >
                                    <span className="shrink-0">{tab.icon}</span>
                                    <span className="text-left">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Panel */}
                    <div className="lg:col-span-3">

                        {/* ===================== NOTIFIKASI ===================== */}
                        {activeTab === 'notifikasi' && (
                            <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-gray-200/50 dark:border-white/5 overflow-hidden animate-fade-in-up relative">
                                <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-[#8100D1]/5 to-transparent">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notifikasi</h3>
                                    <p className="text-sm text-gray-500 mt-1">Atur jenis notifikasi yang ingin Anda terima.</p>
                                </div>
                                <div className="px-6">
                                    <Toggle checked={settings.notify_application_status} onChange={() => toggleSetting('notify_application_status')} label="Status Lamaran" desc="Dapatkan notifikasi saat status lamaran Anda berubah." />
                                    <Toggle checked={settings.notify_messages} onChange={() => toggleSetting('notify_messages')} label="Pesan Baru" desc="Dapatkan notifikasi saat ada pesan masuk baru." />
                                    <Toggle checked={settings.notify_community} onChange={() => toggleSetting('notify_community')} label="Aktivitas Komunitas" desc="Dapatkan notifikasi balasan pada thread dan postingan Anda." />
                                    <Toggle checked={settings.notify_connections} onChange={() => toggleSetting('notify_connections')} label="Permintaan Koneksi" desc="Dapatkan notifikasi saat ada permintaan koneksi baru." />
                                </div>
                            </div>
                        )}

                        {/* ===================== VISIBILITAS ===================== */}
                        {activeTab === 'visibilitas' && (
                            <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-gray-200/50 dark:border-white/5 overflow-hidden animate-fade-in-up relative">
                                <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-[#8100D1]/5 to-transparent">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('user_settings.visibility.title')}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{t('user_settings.visibility.desc')}</p>
                                </div>
                                <div className="px-6">
                                    <VisibilityRow settingKey="visibility_email" label={t('user_settings.visibility.email')} desc={t('user_settings.visibility.email_desc')} />
                                    <VisibilityRow settingKey="visibility_phone" label={t('user_settings.visibility.phone')} desc={t('user_settings.visibility.phone_desc')} />
                                    <VisibilityRow settingKey="visibility_location" label={t('user_settings.visibility.location')} desc={t('user_settings.visibility.location_desc')} />
                                    <VisibilityRow settingKey="visibility_education" label={t('user_settings.visibility.education')} desc={t('user_settings.visibility.education_desc')} />
                                    <VisibilityRow settingKey="visibility_experience" label={t('user_settings.visibility.experience')} desc={t('user_settings.visibility.experience_desc')} />
                                    <VisibilityRow settingKey="visibility_social_links" label={t('user_settings.visibility.social_links')} desc={t('user_settings.visibility.social_links_desc')} />
                                </div>
                            </div>
                        )}

                        {/* ===================== PRIVASI & KEAMANAN ===================== */}
                        {activeTab === 'keamanan' && (
                            <div className="space-y-6 animate-fade-in-up">
                                {/* Ubah Password */}
                                <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-gray-200/50 dark:border-white/5 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-[#8100D1]/5 to-transparent">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('user_settings.security.password_title')}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{t('user_settings.security.password_desc')}</p>
                                    </div>
                                    <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('user_settings.security.current_password')}</label>
                                            <div className="relative">
                                                <input type={showPasswords.current ? 'text' : 'password'} value={passwordForm.current_password} onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} required className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/20 focus:border-[#8100D1] outline-none transition text-sm pr-10 shadow-sm" />
                                                <button type="button" onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showPasswords.current ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} /></svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('user_settings.security.new_password')}</label>
                                            <div className="relative">
                                                <input type={showPasswords.new ? 'text' : 'password'} value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} required minLength={8} className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/20 focus:border-[#8100D1] outline-none transition text-sm pr-10 shadow-sm" />
                                                <button type="button" onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showPasswords.new ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} /></svg>
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">{t('user_settings.security.min_chars')}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('user_settings.security.confirm_password')}</label>
                                            <div className="relative">
                                                <input type={showPasswords.confirm ? 'text' : 'password'} value={passwordForm.new_password_confirmation} onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })} required className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/20 focus:border-[#8100D1] outline-none transition text-sm pr-10 shadow-sm" />
                                                <button type="button" onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showPasswords.confirm ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} /></svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <button type="submit" disabled={saving} className="px-6 py-2.5 text-sm font-semibold text-white bg-[#8100D1] rounded-xl hover:bg-purple-800 transition shadow-sm disabled:opacity-50">
                                                {saving ? t('user_settings.security.saving') : t('user_settings.security.btn_change_password')}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Ubah Email */}
                                <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-gray-200/50 dark:border-white/5 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('user_settings.security.email_title')}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{t('user_settings.security.email_desc')}<span className="font-semibold text-gray-900 dark:text-gray-300">{userData?.user?.email}</span></p>
                                    </div>
                                    <form onSubmit={handleChangeEmail} className="p-6 space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('user_settings.security.new_email')}</label>
                                            <input type="email" value={emailForm.new_email} onChange={(e) => setEmailForm({ ...emailForm, new_email: e.target.value })} required className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/20 focus:border-[#8100D1] outline-none transition text-sm shadow-sm" placeholder="email_baru@example.com" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('user_settings.security.confirm_password_label')}</label>
                                            <input type="password" value={emailForm.password} onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })} required className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/20 focus:border-[#8100D1] outline-none transition text-sm shadow-sm" placeholder={t('user_settings.security.password_placeholder')} />
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <button type="submit" disabled={saving} className="px-6 py-2.5 text-sm font-semibold text-white bg-[#8100D1] rounded-xl hover:bg-purple-800 transition shadow-sm disabled:opacity-50">
                                                {saving ? t('user_settings.security.saving') : t('user_settings.security.btn_change_email')}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Data Blokir */}
                                <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-gray-200/50 dark:border-white/5 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('user_settings.security.blocked_title')}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{t('user_settings.security.blocked_desc')}</p>
                                    </div>
                                    <div className="p-6">
                                        {blockedUsers.length === 0 ? (
                                            <div className="text-center py-8 bg-white/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
                                                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-100 dark:border-slate-700">
                                                    <svg className="w-7 h-7 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{t('user_settings.security.no_blocked')}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('user_settings.security.no_blocked_desc')}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {blockedUsers.map(user => (
                                                    <div key={user.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-purple-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-[#8100D1] dark:text-[#a055db] font-bold border border-purple-200 dark:border-slate-700 shadow-sm">{user.name?.charAt(0)}</div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user.name}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                                            </div>
                                                        </div>
                                                        <button className="text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 py-1.5 rounded-lg transition">{t('user_settings.security.btn_unblock')}</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Hapus Akun */}
                                <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-red-200/50 dark:border-red-900/30 overflow-hidden relative">
                                    <div className="p-6 border-b border-red-100 dark:border-red-900/30">
                                        <h3 className="text-lg font-bold text-red-700 dark:text-red-500">{t('user_settings.security.delete_title')}</h3>
                                        <p className="text-sm text-red-600 mt-1">{t('user_settings.security.delete_desc')}</p>
                                    </div>
                                    <div className="p-6">
                                        {!showDeleteConfirm ? (
                                            <button onClick={() => setShowDeleteConfirm(true)} className="px-5 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                {t('user_settings.security.btn_delete')}
                                            </button>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-900/50">
                                                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">{t('user_settings.security.delete_warning')}</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('user_settings.security.delete_password_label')}</label>
                                                    <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900/50 focus:border-red-400 dark:focus:border-red-500 outline-none transition text-sm shadow-sm" placeholder={t('user_settings.security.password_placeholder')} />
                                                </div>
                                                <div className="flex gap-3">
                                                    <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }} className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition">{t('user_settings.security.btn_cancel')}</button>
                                                    <button onClick={handleDeleteAccount} disabled={!deletePassword || saving} className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 dark:bg-red-500 rounded-xl hover:bg-red-700 dark:hover:bg-red-600 transition shadow-sm disabled:opacity-50">
                                                        {saving ? t('user_settings.security.saving') : t('user_settings.security.btn_confirm_delete')}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ===================== BAHASA & TAMPILAN ===================== */}
                        {activeTab === 'tampilan' && (
                            <div className="space-y-6 animate-fade-in-up">
                                {/* Bahasa */}
                                <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-gray-200/50 dark:border-white/5 overflow-hidden relative">
                                    <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-[#8100D1]/5 to-transparent">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('user_settings.language_title', 'Bahasa')}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{t('user_settings.language_desc', 'Pilih bahasa tampilan aplikasi.')}</p>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {[
                                                { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩', desc: 'Bahasa Indonesia' },
                                                { code: 'en', label: 'English', flag: '🇺🇸', desc: 'English (US)' },
                                            ].map(lang => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => handleLanguageChange(lang.code)}
                                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${settings.language === lang.code
                                                        ? 'border-[#8100D1] bg-[#8100D1]/5 shadow-sm'
                                                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 bg-white/50 dark:bg-slate-800/50'
                                                        }`}
                                                >
                                                    <span className="text-3xl">{lang.flag}</span>
                                                    <div>
                                                        <p className={`text-sm font-bold ${settings.language === lang.code ? 'text-[#8100D1] dark:text-[#a055db]' : 'text-gray-800 dark:text-gray-200'}`}>{lang.label}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{lang.desc}</p>
                                                    </div>
                                                    {settings.language === lang.code && (
                                                        <svg className="w-5 h-5 text-[#8100D1] dark:text-[#a055db] ml-auto shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Dark Mode */}
                                <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-gray-200/50 dark:border-white/5 overflow-hidden relative">
                                    <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-[#8100D1]/5 to-transparent">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('user_settings.theme_title', 'Tampilan')}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{t('user_settings.theme_desc', 'Pilih tema tampilan yang Anda sukai.')}</p>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {/* Light Mode */}
                                            <button
                                                onClick={() => toggleTheme('light')}
                                                className={`flex flex-col items-center p-5 rounded-xl border-2 transition-all ${settings.theme === 'light'
                                                    ? 'border-[#8100D1] bg-[#8100D1]/5 shadow-sm'
                                                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 bg-white/50 dark:bg-slate-800/50'
                                                    }`}
                                            >
                                                {/* Light mode preview window */}
                                                <div className={`w-full aspect-[2/1] rounded-lg border flex flex-col overflow-hidden mb-4 ${settings.theme === 'light' ? 'border-purple-200' : 'border-gray-200'}`}>
                                                    <div className="bg-gray-100 border-b border-gray-200 h-4 flex items-center px-1.5 gap-1 shrink-0">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                                    </div>
                                                    <div className="flex-1 bg-white p-2">
                                                        <div className="w-3/4 h-1.5 bg-gray-200 rounded mb-1.5"></div>
                                                        <div className="w-full h-1 bg-gray-100 rounded mb-1"></div>
                                                        <div className="w-5/6 h-1 bg-gray-100 rounded"></div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <svg className={`w-5 h-5 ${settings.theme === 'light' ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                    <span className={`text-sm font-bold ${settings.theme === 'light' ? 'text-[#8100D1] dark:text-[#a055db]' : 'text-gray-700 dark:text-gray-300'}`}>Light</span>
                                                </div>
                                            </button>

                                            {/* Dark Mode */}
                                            <button
                                                onClick={() => { toggleTheme('dark'); document.documentElement.classList.add('dark'); }}
                                                className={`flex flex-col items-center p-5 rounded-xl border-2 transition-all ${settings.theme === 'dark'
                                                    ? 'border-[#8100D1] bg-[#8100D1]/5 shadow-sm'
                                                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 bg-white/50 dark:bg-slate-800/50'
                                                    }`}
                                            >
                                                {/* Dark mode preview window */}
                                                <div className={`w-full aspect-[2/1] rounded-lg border flex flex-col overflow-hidden mb-4 ${settings.theme === 'dark' ? 'border-purple-200' : 'border-gray-200'}`}>
                                                    <div className="bg-slate-800 border-b border-slate-700 h-4 flex items-center px-1.5 gap-1 shrink-0">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                                    </div>
                                                    <div className="flex-1 bg-slate-900 p-2">
                                                        <div className="w-3/4 h-1.5 bg-slate-700 rounded mb-1.5"></div>
                                                        <div className="w-full h-1 bg-slate-800 rounded mb-1"></div>
                                                        <div className="w-5/6 h-1 bg-slate-800 rounded"></div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <svg className={`w-5 h-5 ${settings.theme === 'dark' ? 'text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                                    <span className={`text-sm font-bold ${settings.theme === 'dark' ? 'text-[#8100D1] dark:text-[#a055db]' : 'text-gray-700 dark:text-gray-300'}`}>Dark</span>
                                                </div>
                                            </button>
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{t('user_settings.dark_mode_note', 'Mode gelap diterapkan menggunakan Tailwind dark variant.')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
