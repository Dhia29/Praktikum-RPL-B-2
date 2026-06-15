import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import SupportModal from './SupportModal';
import LogoutConfirmModal from './LogoutConfirmModal';
import NotificationsDropdown from './NotificationsDropdown';

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const dropdownRef = useRef(null);

    // State ini akan diisi secara dinamis dari database
    const [userName, setUserName] = useState('...');
    const [currentUser, setCurrentUser] = useState(null);

    const isActive = (path) => location.pathname.includes(path);

    useEffect(() => {
        axios.defaults.withCredentials = true;

        axios.get('/me')
            .then(response => {
                setUserName(response.data.name);
                setCurrentUser(response.data.user);

                if (response.data.user.role === 'company' && response.data.user.status !== 'Aktif') {
                    navigate('/pending-approval');
                }
            })
            .catch(error => {
                console.error("Sesi tidak valid", error);
                navigate('/'); // Jika belum login atau sesi habis, tendang kembali ke halaman login
            });
    }, [navigate]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        try {
            await axios.post('/api/logout');
        } catch (err) {
            console.error('Logout error:', err);
        }
        navigate('/');
    };

    // Fungsi refresh halaman secara manual khusus untuk logo
    const handleLogoClick = (e) => {
        e.preventDefault();
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] font-sans flex flex-col transition-colors duration-500 relative">

            {/* --- WOW FACTOR: Animated Background Glows --- */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse"></div>
                <div className="absolute top-[40%] -left-[10%] w-[400px] h-[400px] bg-indigo-400/20 dark:bg-indigo-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Elegant Top Gradient Line */}
            <div className="h-1 w-full bg-gradient-to-r from-indigo-400 via-[#8100D1] to-pink-500 relative z-50"></div>

            <header className="bg-white/60 dark:bg-[#0B0F19]/60 backdrop-blur-2xl border-b border-gray-200/50 dark:border-white/5 sticky top-0 z-50 transition-all duration-300 shadow-sm dark:shadow-none">
                <div className="max-w-7xl mx-auto px-6 sm:px-8">

                    <div className="flex justify-between items-center h-20">
                        {/* 1. Logo (Akan me-refresh halaman saat diklik tapi sesi tetap aman) */}
                        <div>
                            <Link
                                to="/loker"
                                onClick={handleLogoClick}
                                className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8100D1] to-indigo-600 dark:from-[#c682ff] dark:to-indigo-400 tracking-tight hover:opacity-80 transition-opacity"
                            >
                                LockER
                            </Link>
                            <p className="text-gray-500 dark:text-slate-400 text-xs font-medium mt-1">{t('layout.tagline')}</p>
                        </div>

                        {/* 3. Notifications, Support, Profile */}
                        <div className="flex items-center gap-4">

                            <NotificationsDropdown currentUser={currentUser} />

                            <button
                                onClick={() => setIsSupportModalOpen(true)}
                                className="relative w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-[#8100D1] dark:hover:text-[#c682ff] hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-full transition-all focus:outline-none"
                                title="Customer Service"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z" />
                                    <path d="M21 16v2a4 4 0 0 1-4 4h-5" />
                                </svg>
                            </button>

                            <div className="relative flex items-center gap-4" ref={dropdownRef}>
                                <span className="text-gray-700 dark:text-slate-300 font-medium text-sm border-l border-gray-200 dark:border-slate-700 pl-4 transition-colors">Hi, {userName}</span>

                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-[#8100D1] dark:text-[#c682ff] font-bold border border-purple-200 dark:border-purple-800/50 hover:ring-2 hover:ring-purple-300 dark:hover:ring-purple-700 transition-all focus:outline-none shadow-sm"
                                >
                                    {userName !== '...' ? userName.charAt(0).toUpperCase() : '?'}
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 top-12 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] py-2 z-50 animate-fade-in-down">
                                        <Link to={currentUser?.role === 'company' ? '/profile-perusahaan' : '/profile'} className="block px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-[#8100D1] dark:hover:text-[#c682ff] transition-colors">
                                            {t('nav.profile', 'Profil')}
                                        </Link>
                                        <Link to="/settings" className="block px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-[#8100D1] dark:hover:text-[#c682ff] transition-colors">
                                            {t('nav.settings', 'Pengaturan')}
                                        </Link>
                                        <Link to="/help" className="block px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-[#8100D1] dark:hover:text-[#c682ff] transition-colors">
                                            {t('nav.help', 'Bantuan')}
                                        </Link>
                                        <div className="border-t border-gray-100 dark:border-slate-700 my-1"></div>
                                        <button
                                            onClick={() => setIsLogoutModalOpen(true)}
                                            className="block w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                                        >
                                            {t('nav.logout', 'Sign Out')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. Navigasi Loker */}
                    <nav className="flex gap-8 text-sm font-medium mt-2">
                        {['/loker', '/lamaran', '/pesan', '/komunitas'].map((path) => {
                            const rawLabel = path.replace('/', '');
                            const label = t(`nav.${rawLabel}`, { defaultValue: rawLabel });
                            const active = isActive(path);

                            return (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`pb-4 px-2 border-b-[3px] transition-all duration-200 capitalize ${active
                                        ? 'border-[#8100D1] dark:border-[#c682ff] text-[#8100D1] dark:text-[#c682ff]'
                                        : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-[#8100D1] dark:hover:text-[#c682ff] hover:border-purple-200 dark:hover:border-purple-800'
                                        }`}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-8 py-8 relative">
                <Outlet context={{ currentUser }} />
            </main>

            <SupportModal
                isOpen={isSupportModalOpen}
                onClose={() => setIsSupportModalOpen(false)}
                currentUser={currentUser}
            />

            <LogoutConfirmModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleSignOut}
            />
        </div>
    );
}