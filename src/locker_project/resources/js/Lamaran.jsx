import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Lamaran() {
    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Semua');

    useEffect(() => {
        axios.get('/api/applications/me')
            .then(response => {
                setApplications(response.data.data || []);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Gagal memuat data lamaran:", error);
                setIsLoading(false);
            });
    }, []);

    const filteredApplications = applications.filter(app => {
        if (activeTab === 'Semua') return true;
        if (activeTab === 'Antrian' && (app.status === 'Menunggu Review' || app.status === 'Terkirim')) return true;
        if (activeTab === 'Diproses' && (app.status === 'Diproses' || app.status === 'Tes Teknis')) return true;
        if (activeTab === 'Interview' && (app.status === 'Wawancara' || app.status === 'Interview')) return true;
        if (activeTab === 'Draft' && (app.status === 'Draft')) return true;
        return false;
    });

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Diterima': return 'bg-green-100 text-green-700 border-green-200';
            case 'Ditolak': return 'bg-red-100 text-red-700 border-red-200';
            case 'Wawancara':
            case 'Tes Teknis': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    // CATATAN PENTING: Karena Layout.jsx sudah memuat Header dan Navigasi, 
    // komponen ini HANYA mengembalikan kotak konten utama (Card).
    return (
        // LANGSUNG DIV KOTAK PUTIH, JANGAN ADA TAG <Layout>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[65vh] flex flex-col">

            {/* Header Internal Card */}
            <div className="px-6 py-5 border-b border-gray-100 bg-white">
                <h2 className="text-xl font-bold text-gray-900">Riwayat Lamaran</h2>
            </div>

            <div className="p-6 md:p-8 flex-1 flex flex-col">
                <div className="flex rounded-xl border border-gray-200 p-1 mb-8 overflow-x-auto hide-scrollbar">
                    {['Semua', 'Antrian', 'Diproses', 'Interview', 'Draft'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 min-w-[100px] text-sm font-bold py-3 text-center rounded-lg transition-all ${
                                activeTab === tab
                                    ? 'bg-[#9510d8] text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* AREA KONTEN */}
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#8100D1] rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Memuat riwayat lamaran...</p>
                    </div>
                ) : filteredApplications.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredApplications.map((app) => (
                            <div key={app.id} className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group flex flex-col sm:flex-row gap-5 items-start sm:items-center cursor-pointer">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center border border-gray-200 overflow-hidden">
                                    {app.company_logo ? (
                                        <img src={app.company_logo} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-gray-400">{app.company_name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#8100D1] transition-colors line-clamp-1">{app.job_title}</h3>
                                    <p className="text-sm font-medium text-gray-700 mt-1">{app.company_name}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{app.job_location || 'Lokasi tidak ditentukan'}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Dilamar: {formatDate(app.submitted_at)}</span>
                                    </div>
                                </div>
                                <div className="mt-2 sm:mt-0 self-start sm:self-center">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(app.status)}`}>{app.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // EMPTY STATE
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                        <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-[#8100D1]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Belum Ada Lamaran</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8 text-sm leading-relaxed">
                            Anda belum melamar pekerjaan apa pun di kategori ini. Mulai jelajahi lowongan yang sesuai dengan keahlian Anda sekarang!
                        </p>
                        <button onClick={() => navigate('/loker')} className="px-8 py-3 bg-[#9510d8] text-white font-bold rounded-xl hover:bg-purple-800 transition shadow-sm">
                            Cari Lowongan Kerja
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}