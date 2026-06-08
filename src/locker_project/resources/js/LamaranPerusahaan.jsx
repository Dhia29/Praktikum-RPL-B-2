import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LamaranPerusahaan() {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterJob, setFilterJob] = useState('Semua Lowongan');
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = () => {
        setIsLoading(true);
        axios.get('/api/applications/company')
            .then(response => {
                setApplications(response.data.data || []);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Gagal memuat data pelamar:", error);
                setIsLoading(false);
            });
    };

    const handleUpdateStatus = async (appId, newStatus) => {
        setUpdatingStatusId(appId);
        try {
            await axios.put(`/api/applications/${appId}/status`, { status: newStatus });
            // Refresh list
            fetchApplications();
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal mengubah status');
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[65vh] flex flex-col">
            {/* Header Internal Card */}
            <div className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900">Daftar Pelamar Masuk</h2>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-500">Filter:</label>
                    <select 
                        value={filterJob}
                        onChange={(e) => setFilterJob(e.target.value)}
                        className="text-sm border-gray-300 rounded-lg focus:ring-[#8100D1] focus:border-[#8100D1]"
                    >
                        {uniqueJobs.map(job => (
                            <option key={job} value={job}>{job}</option>
                        ))}
                    </select>
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
                            <div key={app.id} className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-200 hover:border-purple-300 transition-all group flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                                <div 
                                    onClick={() => navigate(`/profile/${app.seeker_user_id}`)} 
                                    className="w-16 h-16 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center border border-gray-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-200 hover:border-purple-300 transition-all"
                                >
                                    {app.seeker_avatar ? (
                                        <img src={app.seeker_avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-gray-400">{app.seeker_name?.charAt(0) || 'U'}</span>
                                    )}
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-1">
                                        <h3 
                                            onClick={() => navigate(`/profile/${app.seeker_user_id}`)}
                                            className="text-lg font-bold text-gray-900 line-clamp-1 cursor-pointer hover:text-[#8100D1] transition-colors"
                                        >
                                            {app.seeker_name}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${getStatusStyle(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">Posisi: {app.job_title}</p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div className="flex gap-2">
                                            <span className="font-semibold w-24">Melamar Tgl:</span>
                                            <span>{formatDate(app.submitted_at)}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-semibold w-24">NIK:</span>
                                            <span>{app.nik || '-'}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-semibold w-24">Tgl Lahir:</span>
                                            <span>{formatDate(app.tanggal_lahir)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 flex flex-wrap gap-2 items-center">
                                        {app.cv_snapshot_url && (
                                            <a href={app.cv_snapshot_url} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors border border-gray-200 flex items-center gap-1">
                                                Lihat CV
                                            </a>
                                        )}
                                        {app.ijazah_url && (
                                            <a href={`/storage/${app.ijazah_url}`} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors border border-gray-200 flex items-center gap-1">
                                                Lihat Ijazah
                                            </a>
                                        )}
                                        
                                        <div className="flex-1"></div>
                                        
                                        {/* Status Update Actions */}
                                        <div className="flex gap-2 mt-2 sm:mt-0 flex-wrap justify-end">
                                            {/* Tombol Kirim Pesan */}
                                            <button 
                                                onClick={() => navigate(`/pesan?user=${app.seeker_user_id}`)}
                                                className="text-xs px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#8100D1] border border-purple-200 rounded-lg font-semibold transition-colors flex items-center gap-1.5"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                                Kirim Pesan
                                            </button>

                                            {updatingStatusId === app.id ? (
                                                <span className="text-xs text-gray-500 flex items-center gap-1"><div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> Memproses...</span>
                                            ) : (
                                                <>
                                                    {app.status === 'Pending' && (
                                                        <button onClick={() => handleUpdateStatus(app.id, 'Review')} className="text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-semibold transition-colors">
                                                            Review
                                                        </button>
                                                    )}
                                                    {(app.status === 'Pending' || app.status === 'Review') && (
                                                        <button onClick={() => handleUpdateStatus(app.id, 'Interview')} className="text-xs px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-lg font-semibold transition-colors">
                                                            Panggil Interview
                                                        </button>
                                                    )}
                                                    {(app.status === 'Pending' || app.status === 'Review' || app.status === 'Interview') && (
                                                        <>
                                                            <button onClick={() => handleUpdateStatus(app.id, 'Diterima')} className="text-xs px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg font-semibold transition-colors">
                                                                Terima
                                                            </button>
                                                            <button onClick={() => handleUpdateStatus(app.id, 'Ditolak')} className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-semibold transition-colors">
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
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                        <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-[#8100D1]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Belum Ada Pelamar</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8 text-sm leading-relaxed">
                            Lowongan Anda belum menerima lamaran apapun pada filter yang dipilih. Harap periksa kembali nanti.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
