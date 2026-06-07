import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function HeaderAdmin({ title }) {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(true);
    const dropdownRef = useRef(null);

    const toggleNotifications = () => {
        setIsNotificationOpen(!isNotificationOpen);
    };

    const markAllAsRead = () => {
        setHasUnread(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shadow-sm flex-shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-800">{title || 'Overview'}</h2>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="relative hidden md:block">
                    <input type="text" placeholder="Cari..." className="w-64 pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8100D1]" />
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                
                <div className="relative" ref={dropdownRef}>
                    <button onClick={toggleNotifications} className="relative text-gray-400 hover:text-gray-600 focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        {hasUnread && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>}
                    </button>
                    
                    {isNotificationOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">Notifikasi</h3>
                                <button onClick={markAllAsRead} className="text-xs text-[#8100D1] hover:underline focus:outline-none">Tandai semua dibaca</button>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                <div className="notification-item p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <p className="text-sm text-gray-800 font-medium">Perusahaan baru mendaftar</p>
                                    <p className="text-xs text-gray-500 mt-1">PT Teknologi Inovasi menunggu verifikasi.</p>
                                    <p className="text-xs text-gray-400 mt-2">2 menit yang lalu</p>
                                </div>
                                <div className="notification-item p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <p className="text-sm text-gray-800 font-medium">Tiket bantuan baru</p>
                                    <p className="text-xs text-gray-500 mt-1">Pengguna melaporkan masalah login.</p>
                                    <p className="text-xs text-gray-400 mt-2">1 jam yang lalu</p>
                                </div>
                            </div>
                            <div className="p-3 text-center border-t border-gray-100">
                                <Link to="#" className="text-sm text-gray-500 hover:text-[#8100D1] font-medium">Lihat Semua</Link>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
                    <div className="w-8 h-8 rounded-full bg-[#8100D1] text-white flex items-center justify-center font-bold text-sm">
                        A
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">Administrator</span>
                </div>
            </div>
        </header>
    );
}
