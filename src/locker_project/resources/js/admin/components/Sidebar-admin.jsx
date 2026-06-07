import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function SidebarAdmin() {
    const location = useLocation();
    
    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin/logout');
            window.location.href = '/admin/login';
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10 h-full">
            <div className="h-16 flex items-center px-6 border-b border-gray-100 flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Lock<span className="text-[#8100D1]">ER</span> <span className="text-[10px] font-semibold text-gray-400 ml-1 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-md relative -top-1">Admin</span></h1>
            </div>
            
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">Menu Utama</p>
                
                <Link to="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive('/dashboard') ? 'bg-purple-50 text-[#8100D1]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                    <svg className={`w-5 h-5 ${isActive('/dashboard') ? 'text-[#8100D1]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    Dashboard
                </Link>
                
                <Link to="/users" className={`flex items-center px-4 py-3 mt-2 rounded-xl transition-colors font-medium text-sm ${isActive('/users') ? 'bg-purple-50 text-[#8100D1]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    Manajemen Pengguna
                </Link>
                
                <Link to="/tickets" className={`flex items-center px-4 py-3 mt-2 rounded-xl transition-colors font-medium text-sm ${isActive('/tickets') ? 'bg-purple-50 text-[#8100D1]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" /></svg>
                    Layanan Pelanggan
                </Link>
                
                <Link to="/jobs" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive('/jobs') ? 'bg-purple-50 text-[#8100D1]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                    <svg className={`w-5 h-5 ${isActive('/jobs') ? 'text-[#8100D1]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Moderasi Lowongan
                </Link>

                <Link to="/community/reports" className={`flex items-center px-4 py-3 mt-2 rounded-xl transition-colors font-medium text-sm ${isActive('/community/reports') ? 'bg-purple-50 text-[#8100D1]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    Laporan Komunitas
                </Link>

                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">Sistem</p>

                <Link to="/analytics" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive('/analytics') ? 'bg-purple-50 text-[#8100D1]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                    <svg className={`w-5 h-5 ${isActive('/analytics') ? 'text-[#8100D1]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    Analytics Platform
                </Link>

                <Link to="/settings" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive('/settings') ? 'bg-purple-50 text-[#8100D1]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                    <svg className={`w-5 h-5 ${isActive('/settings') ? 'text-[#8100D1]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Pengaturan
                </Link>
            </nav>

            <div className="p-4 border-t border-gray-100 flex-shrink-0">
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Keluar Sistem
                </button>
            </div>
        </aside>
    );
}
