import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import LamaranPerusahaan from './LamaranPerusahaan';
import { useTranslation } from 'react-i18next';

export default function Lamaran() {
    const navigate = useNavigate();
    const { currentUser } = useOutletContext() || {};
    const { t, i18n } = useTranslation();

    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Semua');
    const [showRejected, setShowRejected] = useState(false);

    const fetchApplications = () => {
        axios.get('/api/applications/me')
            .then(response => {
                setApplications(response.data.data || []);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Gagal memuat data lamaran:", error);
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        if (!currentUser?.id) return;

        const channel = window.Echo.private(`App.Models.User.${currentUser.id}`);
        
        channel.listen('ApplicationStatusUpdated', (e) => {
            // Update application status in the local state
            setApplications(prev => prev.map(app => 
                app.id === e.application_id ? { ...app, status: e.status } : app
            ));
        });

        return () => {
            window.Echo.leave(`App.Models.User.${currentUser.id}`);
        };
    }, [currentUser]);

    const filteredApplications = applications.filter(app => {
        if (activeTab === 'Semua') return app.status !== 'Draft' && app.status !== 'Ditolak';
        if (activeTab === 'Antrian' && (app.status === 'Menunggu Review' || app.status === 'Terkirim' || app.status === 'Pending' || app.status === 'Review')) return true;
        if (activeTab === 'Diproses' && (app.status === 'Diproses' || app.status === 'Tes Teknis')) return true;
        if (activeTab === 'Interview' && (app.status === 'Wawancara' || app.status === 'Interview')) return true;
        if (activeTab === 'Arsip' && (app.status === 'Draft' || app.status === 'Diterima' || app.status === 'Ditolak')) return true;
        return false;
    });

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const locale = i18n.language === 'en' ? 'en-US' : 'id-ID';
        return new Date(dateString).toLocaleDateString(locale, options);
    };

    const getSeamlessStatusStyle = (status) => {
        switch (status) {
            case 'Diterima': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
            case 'Ditolak': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]';
            case 'Wawancara':
            case 'Tes Teknis': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]';
            default: return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
        }
    };

    const getSeamlessDotStyle = (status) => {
        switch (status) {
            case 'Diterima': return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]';
            case 'Ditolak': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]';
            case 'Wawancara':
            case 'Tes Teknis': return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]';
            default: return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]';
        }
    };

    // CATATAN PENTING: Karena Layout.jsx sudah memuat Header dan Navigasi, 
    // komponen ini HANYA mengembalikan kotak konten utama (Card).

    if (currentUser?.role === 'company') {
        return <LamaranPerusahaan />;
    }

    return (
        // LANGSUNG DIV KOTAK PUTIH, JANGAN ADA TAG <Layout>
        <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-gray-200/50 dark:border-white/5 overflow-hidden min-h-[65vh] flex flex-col relative animate-fade-in-up transition-colors duration-500">
            {/* Background Decorative Glow (Optional, since this is wrapped in Layout) */}
            <div className="absolute inset-0 pointer-events-none rounded-3xl border border-transparent hover:border-purple-500/10 transition-colors duration-500 z-50"></div>

            {/* Header Internal Card */}
            <div className="px-6 sm:px-8 py-6 border-b border-gray-100/50 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
                <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8100D1] to-indigo-600 dark:from-[#c682ff] dark:to-indigo-400 tracking-tight">{t('applications.history_title')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 font-medium">Lacak perjalanan karir dan status lamaran kerja Anda saat ini.</p>
            </div>

            <div className="p-6 md:p-8 flex-1 flex flex-col bg-gray-50/30 dark:bg-transparent">
                <div className="flex rounded-2xl border border-gray-200/80 dark:border-white/10 p-1.5 mb-8 overflow-x-auto hide-scrollbar bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.01)] relative z-10">
                    {[
                        { key: 'Semua', label: t('applications.tab_all') },
                        { key: 'Antrian', label: t('applications.tab_queue') },
                        { key: 'Diproses', label: t('applications.tab_processing') },
                        { key: 'Interview', label: t('applications.tab_interview') },
                        { key: 'Arsip', label: t('applications.tab_archive') },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 min-w-[120px] text-sm font-bold py-3 px-4 text-center rounded-xl transition-all duration-300 ${
                                activeTab === tab.key
                                    ? 'bg-gradient-to-r from-[#8100D1] to-indigo-600 text-white shadow-md shadow-purple-500/20 dark:shadow-purple-900/40 scale-[1.02]'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-white/5'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* AREA KONTEN */}
                {isLoading ? (
                    <div className="grid grid-cols-1 gap-4">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="relative bg-white/20 dark:bg-black/20 backdrop-blur-3xl rounded-3xl p-6 sm:p-8 border border-gray-100/50 dark:border-white/5 flex flex-col sm:flex-row gap-6 items-start sm:items-center overflow-hidden animate-pulse">
                                {/* Skeleton Logo */}
                                <div className="w-20 h-20 bg-gray-200/50 dark:bg-slate-800/50 rounded-[1.5rem] flex-shrink-0"></div>
                                {/* Skeleton Content */}
                                <div className="flex-1 w-full space-y-4">
                                    <div className="h-6 bg-gray-200/50 dark:bg-slate-800/50 rounded-md w-3/4 max-w-[250px]"></div>
                                    <div className="h-4 bg-gray-200/50 dark:bg-slate-800/50 rounded-md w-1/2 max-w-[150px]"></div>
                                    <div className="flex gap-3 mt-4">
                                        <div className="h-8 bg-gray-200/50 dark:bg-slate-800/50 rounded-full w-24"></div>
                                        <div className="h-8 bg-gray-200/50 dark:bg-slate-800/50 rounded-full w-32"></div>
                                    </div>
                                </div>
                                {/* Skeleton Badge */}
                                <div className="mt-4 sm:mt-0 w-28 h-10 bg-gray-200/50 dark:bg-slate-800/50 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredApplications.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredApplications.filter(app => app.status !== 'Ditolak').map((app) => (
                            <div key={app.id} className="relative group cursor-pointer mb-2">
                                {/* Seamless Aurora Hover Effect */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/0 via-[#8100D1]/0 to-indigo-500/0 group-hover:from-purple-500/20 group-hover:via-[#8100D1]/20 group-hover:to-indigo-500/20 dark:group-hover:from-purple-500/30 dark:group-hover:via-[#8100D1]/30 dark:group-hover:to-indigo-500/30 rounded-[2.5rem] blur-xl transition-all duration-700 opacity-0 group-hover:opacity-100"></div>
                                
                                {/* Actual Content Box - Seamless */}
                                <div className="relative bg-white/20 dark:bg-black/20 backdrop-blur-3xl rounded-3xl p-6 sm:p-8 border border-white/50 dark:border-white/10 group-hover:border-white/80 dark:group-hover:border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-500 flex flex-col sm:flex-row gap-6 items-start sm:items-center overflow-hidden">
                                    {/* Decorative inner reflection */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-white/5 dark:to-transparent opacity-50 pointer-events-none"></div>

                                    {/* Seamless Logo Container */}
                                    <div className="w-20 h-20 bg-white/80 dark:bg-white/5 rounded-[1.5rem] flex-shrink-0 flex items-center justify-center shadow-lg dark:shadow-none border border-white/60 dark:border-white/10 overflow-hidden relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out p-3">
                                        {app.company_logo ? (
                                            <img src={app.company_logo} alt="Logo" className="w-full h-full object-contain drop-shadow-sm" />
                                        ) : (
                                            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-400">{app.company_name.charAt(0)}</span>
                                        )}
                                    </div>

                                    {/* Content & Typography */}
                                    <div className="flex-1 relative z-10">
                                        <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 group-hover:from-[#8100D1] group-hover:to-indigo-500 dark:group-hover:from-[#c682ff] dark:group-hover:to-indigo-400 transition-all duration-500 line-clamp-1 tracking-tight">{app.job_title}</h3>
                                        <p className="text-sm font-bold tracking-wide text-gray-500 dark:text-gray-400 mt-1">{app.company_name}</p>
                                        
                                        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-2 bg-white/50 dark:bg-black/30 px-3.5 py-1.5 rounded-full border border-white/60 dark:border-white/5 backdrop-blur-md shadow-sm">
                                                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                {app.job_location || t('applications.no_location')}
                                            </span>
                                            <span className="flex items-center gap-2 bg-white/50 dark:bg-black/30 px-3.5 py-1.5 rounded-full border border-white/60 dark:border-white/5 backdrop-blur-md shadow-sm">
                                                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {t('applications.applied_on')} {formatDate(app.submitted_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Floating Status Badge */}
                                    <div className="mt-4 sm:mt-0 relative z-10 self-start sm:self-center">
                                        <div className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full backdrop-blur-xl border ${getSeamlessStatusStyle(app.status)}`}>
                                            <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${getSeamlessDotStyle(app.status)}`}></span>
                                            <span className="text-xs font-extrabold uppercase tracking-widest">{app.status}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredApplications.some(app => app.status === 'Ditolak') && (
                            <div className="mt-8 border-t border-gray-100 dark:border-white/5 pt-8">
                                <button 
                                    onClick={() => setShowRejected(!showRejected)}
                                    className="flex items-center justify-between w-full p-4 sm:p-5 bg-white/50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/5 rounded-2xl transition-all duration-300 border border-gray-200/50 dark:border-white/5 focus:outline-none group shadow-sm hover:shadow-md"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-all duration-300">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </div>
                                        <span className="font-extrabold text-gray-800 dark:text-gray-200 text-sm sm:text-base group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors tracking-tight">{t('applications.rejected_archive')} ({filteredApplications.filter(app => app.status === 'Ditolak').length})</span>
                                    </div>
                                    <svg className={`w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-transform duration-300 ${showRejected ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>

                                {showRejected && (
                                    <div className="grid grid-cols-1 gap-3 mt-3">
                                        {filteredApplications.filter(app => app.status === 'Ditolak').map(app => (
                                            <div key={app.id} className="bg-white/20 dark:bg-slate-900/20 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-gray-200/50 dark:border-slate-800/50 opacity-60 hover:opacity-100 transition-all flex justify-between items-center group cursor-pointer hover:shadow-lg hover:-translate-y-0.5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-200/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl flex-shrink-0 flex items-center justify-center border border-gray-300/50 dark:border-slate-700/50 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                                                        {app.company_logo ? (
                                                            <img src={app.company_logo} alt="Logo" className="w-full h-full object-contain p-1" />
                                                        ) : (
                                                            <span className="text-sm font-extrabold text-gray-500">{app.company_name.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-bold text-gray-600 dark:text-gray-400 line-through group-hover:line-clamp-none line-clamp-1 group-hover:no-underline transition-all tracking-tight">{app.job_title}</h3>
                                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 mt-0.5">{app.company_name}</p>
                                                    </div>
                                                </div>
                                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border ${getSeamlessStatusStyle(app.status)}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${getSeamlessDotStyle(app.status)}`}></span>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">{app.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    // EMPTY STATE
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                        <div className="w-24 h-24 bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-[#8100D1] dark:text-[#a055db]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('applications.empty_title')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 text-sm leading-relaxed">
                            {t('applications.empty_desc')}
                        </p>
                        <button onClick={() => navigate('/loker')} className="px-8 py-3 bg-[#9510d8] dark:bg-[#8100D1] text-white font-bold rounded-xl hover:bg-purple-800 dark:hover:bg-purple-700 transition shadow-[0_4px_15px_rgba(129,0,209,0.2)] hover:shadow-[0_4px_20px_rgba(129,0,209,0.4)]">
                            {t('applications.search_jobs')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}