import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useOutletContext } from 'react-router-dom';

export default function LamaranPerusahaan() {
    const navigate = useNavigate();
    const { currentUser } = useOutletContext() || {};
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterJob, setFilterJob] = useState('Semua Lowongan');
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        if (!currentUser?.id) return;

        const channel = window.Echo.private(`App.Models.User.${currentUser.id}`);
        
        channel.notification((notification) => {
            if (notification.type && notification.type.includes('NewApplicationNotification')) {
                fetchApplications(true); // Silent update on background push
            }
        });

        return () => {
            // Kita biarkan channel ini, karena bisa jadi komponen lain masih membutuhkannya.
            // Atau cukup hapus event listen-nya saja agar tidak tertumpuk
        };
    }, [currentUser]);

    const fetchApplications = (silent = false) => {
        if (!silent) setIsLoading(true);
        return axios.get('/api/applications/company')
            .then(response => {
                setApplications(response.data.data || []);
                if (!silent) setIsLoading(false);
            })
            .catch(error => {
                console.error("Gagal memuat data pelamar:", error);
                if (!silent) setIsLoading(false);
            });
    };

    const handleUpdateStatus = async (appId, newStatus) => {
        setUpdatingStatusId(appId);
        try {
            await axios.put(`/api/applications/${appId}/status`, { status: newStatus });
            // Refresh list silently so UI doesn't jump
            await fetchApplications(true);
        } catch (error) {
            window.alert(error.response?.data?.message || 'Gagal mengubah status');
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const uniqueJobs = ['Semua Lowongan', ...new Set(applications.map(app => app.job_title))];

    const filteredApplications = applications.filter(app => {
        if (filterJob !== 'Semua Lowongan' && app.job_title !== filterJob) return false;
        return true;
    });

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Diterima': return 'bg-green-100 text-green-700 border-green-200';
            case 'Ditolak': return 'bg-red-100 text-red-700 border-red-200';
            case 'Wawancara':
            case 'Interview':
            case 'Tes Teknis': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    return (
        <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-gray-200/50 dark:border-white/5 overflow-hidden min-h-[65vh] flex flex-col relative animate-fade-in-up transition-colors duration-500">
            {/* Background Decorative Glow (Optional, since this is wrapped in Layout) */}
            <div className="absolute inset-0 pointer-events-none rounded-3xl border border-transparent hover:border-purple-500/10 transition-colors duration-500 z-50"></div>
            {/* Header Internal Card */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 bg-white/40 dark:bg-[#0B0F19]/40 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-extrabold bg-gradient-to-r from-[#8100D1] to-[#e84196] bg-clip-text text-transparent">Daftar Pelamar Masuk</h2>
                <div className="flex items-center gap-3">
                    <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Filter:</label>
                    <div className="relative">
                        <select 
                            value={filterJob}
                            onChange={(e) => setFilterJob(e.target.value)}
                            className="appearance-none text-sm font-semibold border border-purple-100 dark:border-purple-900/50 bg-white/60 dark:bg-[#0B0F19]/60 backdrop-blur-md text-gray-700 dark:text-gray-200 rounded-xl pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-[#8100D1]/50 focus:border-[#8100D1] transition-all shadow-sm hover:shadow hover:border-purple-300 dark:hover:border-purple-500 cursor-pointer"
                        >
                            {uniqueJobs.map(job => (
                                <option key={job} value={job} className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-medium">{job}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-8 flex-1 flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#8100D1] rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Memuat data pelamar...</p>
                    </div>
                ) : filteredApplications.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredApplications.map((app) => (
                            <div key={app.id} className="bg-white/60 dark:bg-[#0B0F19]/60 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-sm border border-purple-100/60 dark:border-white/5 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all duration-300 group flex flex-col sm:flex-row gap-5 items-start sm:items-center cursor-pointer hover:shadow-[0_8px_30px_rgba(129,0,209,0.08)]">
                                <div 
                                    onClick={() => navigate(`/profile/${app.seeker_user_id}`)} 
                                    className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex-shrink-0 flex items-center justify-center border border-purple-100 dark:border-purple-800/30 overflow-hidden cursor-pointer hover:ring-4 hover:ring-purple-100 dark:hover:ring-purple-900/40 hover:scale-105 transition-all duration-300 shadow-sm"
                                >
                                    {app.seeker_avatar ? (
                                        <img src={app.seeker_avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-[#8100D1] dark:text-[#c682ff]">{app.seeker_name?.charAt(0) || 'U'}</span>
                                    )}
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-1.5">
                                        <h3 
                                            onClick={() => navigate(`/profile/${app.seeker_user_id}`)}
                                            className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 cursor-pointer hover:text-[#8100D1] dark:hover:text-[#c682ff] transition-colors"
                                        >
                                            {app.seeker_name}
                                        </h3>
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap shadow-sm ${getStatusStyle(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-[#8100D1]/80 dark:text-[#a055db]">Posisi: <span className="text-gray-700 dark:text-gray-300 font-medium">{app.job_title}</span></p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs text-gray-600 dark:text-gray-400 bg-gradient-to-br from-purple-50/50 to-white dark:from-slate-800/50 dark:to-slate-900/50 p-4 rounded-xl border border-purple-100/50 dark:border-slate-700/50 shadow-inner">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-gray-100 dark:border-slate-700"><svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                                            <span className="font-semibold w-20 text-gray-700 dark:text-gray-300">Melamar:</span>
                                            <span>{formatDate(app.submitted_at)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-gray-100 dark:border-slate-700"><svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg></div>
                                            <span className="font-semibold w-20 text-gray-700 dark:text-gray-300">NIK:</span>
                                            <span>{app.nik || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-md bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-gray-100 dark:border-slate-700"><svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" /></svg></div>
                                            <span className="font-semibold w-20 text-gray-700 dark:text-gray-300">Tgl Lahir:</span>
                                            <span>{formatDate(app.tanggal_lahir)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-5 flex flex-wrap gap-2.5 items-center">
                                        {app.cv_snapshot_url && (
                                            <a href={app.cv_snapshot_url} target="_blank" rel="noopener noreferrer" className="text-xs px-4 py-2 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold transition-all duration-300 border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow hover:text-[#8100D1] dark:hover:text-[#c682ff] flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                Lihat CV
                                            </a>
                                        )}
                                        {app.ijazah_url && (
                                            <a href={`/storage/${app.ijazah_url}`} target="_blank" rel="noopener noreferrer" className="text-xs px-4 py-2 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold transition-all duration-300 border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow hover:text-[#8100D1] dark:hover:text-[#c682ff] flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                                Lihat Ijazah
                                            </a>
                                        )}
                                        
                                        <div className="flex-1"></div>
                                        
                                        {/* Status Update Actions */}
                                        <div className="flex gap-2.5 mt-2 sm:mt-0 flex-wrap justify-end">
                                            {/* Tombol Kirim Pesan */}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); navigate(`/pesan?user=${app.seeker_user_id}`); }}
                                                className="text-xs px-4 py-2 bg-purple-50 dark:bg-purple-900/30 hover:bg-[#8100D1] hover:text-white dark:hover:bg-[#a055db] text-[#8100D1] dark:text-[#c682ff] border border-purple-200 dark:border-purple-800 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 shadow-sm"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                                Kirim Pesan
                                            </button>

                                            {updatingStatusId === app.id ? (
                                                <span className="text-xs px-4 py-2 bg-gray-50 text-gray-500 dark:text-gray-400 flex items-center gap-2 rounded-xl font-semibold border border-gray-200"><div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> Memproses...</span>
                                            ) : (
                                                <>
                                                    {app.status === 'Pending' && (
                                                        <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(app.id, 'Review'); }} className="text-xs px-4 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl font-bold transition-all duration-300 shadow-sm">
                                                            Review
                                                        </button>
                                                    )}
                                                    {(app.status === 'Pending' || app.status === 'Review') && (
                                                        <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(app.id, 'Interview'); }} className="text-xs px-4 py-2 bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-500 hover:text-white text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 rounded-xl font-bold transition-all duration-300 shadow-sm">
                                                            Panggil Interview
                                                        </button>
                                                    )}
                                                    {(app.status === 'Pending' || app.status === 'Review' || app.status === 'Interview') && (
                                                        <>
                                                            <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(app.id, 'Diterima'); }} className="text-xs px-4 py-2 bg-green-50 dark:bg-green-900/30 hover:bg-green-600 hover:text-white text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-xl font-bold transition-all duration-300 shadow-sm">
                                                                Terima
                                                            </button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(app.id, 'Ditolak'); }} className="text-xs px-4 py-2 bg-red-50 dark:bg-red-900/30 hover:bg-red-600 hover:text-white text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl font-bold transition-all duration-300 shadow-sm">
                                                                Tolak
                                                            </button>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // EMPTY STATE
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                        <div className="w-28 h-28 bg-gradient-to-tr from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/20 rounded-full flex items-center justify-center mb-6 shadow-sm border border-purple-200/50 dark:border-purple-800/30 relative">
                            <div className="absolute inset-2 bg-white/50 dark:bg-[#0B0F19]/50 rounded-full blur-md"></div>
                            <svg className="w-12 h-12 text-[#8100D1] dark:text-[#c682ff] relative z-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Belum Ada Pelamar</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 text-sm leading-relaxed">
                            Lowongan Anda belum menerima lamaran apapun pada filter yang dipilih. Harap periksa kembali nanti.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
