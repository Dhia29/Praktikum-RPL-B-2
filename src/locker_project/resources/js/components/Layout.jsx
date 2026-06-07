import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SupportModal from './SupportModal';
import NotificationsDropdown from './NotificationsDropdown';

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

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

    const handleSignOut = () => {
        alert("Proses Sign Out...");
        navigate('/');
    };

    // Fungsi refresh halaman secara manual khusus untuk logo
    const handleLogoClick = (e) => {
        e.preventDefault();
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">

            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 sm:px-8">

                    <div className="flex justify-between items-center h-20">
                        {/* 1. Logo (Akan me-refresh halaman saat diklik tapi sesi tetap aman) */}
                        <div>
                            <Link
                                to="/loker"
                                onClick={handleLogoClick}
                                className="text-3xl font-extrabold text-[#8100D1] tracking-tight hover:opacity-80 transition-opacity"
                            >
                                LockER
                            </Link>
                            <p className="text-gray-500 text-xs font-medium mt-1">Perjalanan Karir Dimulai dari Sekarang!</p>
                        </div>

                        {/* 3. Notifications, Support, Profile */}
                        <div className="flex items-center gap-4">
                            
                            <NotificationsDropdown />

                            <button
                                onClick={() => setIsSupportModalOpen(true)}
                                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-[#8100D1] hover:bg-purple-50 transition-colors focus:outline-none"
                                title="Customer Service"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/>
                                    <path d="M21 16v2a4 4 0 0 1-4 4h-5"/>
                                </svg>
                            </button>

                            <div className="relative flex items-center gap-4" ref={dropdownRef}>
                                <span className="text-gray-700 font-medium text-sm border-l border-gray-200 pl-4">Hi, {userName}</span>

                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-[#8100D1] font-bold border border-purple-200 hover:ring-2 hover:ring-purple-300 transition-all focus:outline-none"
                                >
                                    {userName !== '...' ? userName.charAt(0).toUpperCase() : '?'}
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 top-12 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50 animate-fade-in-down">
                                        <Link to="/profile" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#8100D1] transition-colors">
                                            Profil
                                    </Link>
                                    <Link to="/settings" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#8100D1] transition-colors">
                                        Pengaturan
                                    </Link>
                                    <Link to="/help" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#8100D1] transition-colors">
                                        Bantuan
                                    </Link>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button
                                        onClick={handleSignOut}
                                        className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                                    >
                                        Sign Out
                                    </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. Navigasi Loker */}
                    <nav className="flex gap-8 text-sm font-medium mt-2">
                        {['/loker', '/lamaran', '/pesan', '/komunitas'].map((path) => {
                            const label = path.replace('/', '');
                            const active = isActive(path);

                            return (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`pb-4 px-2 border-b-[3px] transition-all duration-200 capitalize ${active
                                        ? 'border-[#8100D1] text-[#8100D1]'
                                        : 'border-transparent text-gray-500 hover:text-[#8100D1] hover:border-purple-200'
                                        }`}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-8 py-8">
                <Outlet context={{ currentUser }} />
            </main>

            <SupportModal
                isOpen={isSupportModalOpen}
                onClose={() => setIsSupportModalOpen(false)}
            />
        </div>
    );
}