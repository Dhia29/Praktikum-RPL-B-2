import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function CommunityReportsShowAdmin() {
    const { id } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');

    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/admin/community/reports/${id}`);
            const data = response.data.report;
            setReport(data);
            setStatus(data.status || 'pending');
        } catch (error) {
            console.error("Failed to fetch report", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [id]);

    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/admin/community/reports/${id}/status`, { status });
            fetchReport();
        } catch (error) {
            console.error("Failed to update report status", error);
            alert("Gagal memperbarui status laporan");
        }
    };

    const handleDeletePost = async (e) => {
        e.preventDefault();
        if (!window.confirm('Apakah Anda yakin ingin menghapus postingan ini secara permanen? Aksi ini tidak dapat dibatalkan.')) return;
        
        try {
            await axios.delete(`/api/admin/community/reports/${id}/post`);
            fetchReport();
        } catch (error) {
            console.error("Failed to delete post", error);
            alert("Gagal menghapus postingan");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day} ${month} ${year} ${hours}:${minutes}`;
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Memuat detail laporan...</div>;
    }

    if (!report) {
        return <div className="p-8 text-center text-red-500">Laporan tidak ditemukan.</div>;
    }

    const renderStatusBadge = (currentStatus) => {
        if (currentStatus === 'pending') {
            return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">Pending</span>;
        } else if (currentStatus === 'under_review') {
            return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Under Review</span>;
        } else if (currentStatus === 'resolved') {
            return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">Resolved</span>;
        } else {
            return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">Rejected</span>;
        }
    };

    return (
        <>
            <div className="mb-6 flex justify-between items-center">
                <Link to="/community/reports" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Kembali ke Laporan
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Report Actions & Details */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">Informasi Laporan</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <span className="block text-xs font-medium text-gray-500 uppercase">Pelapor</span>
                                <span className="block text-sm text-gray-900 mt-1">{report.reporter_email} ({report.reporter_role})</span>
                            </div>
                            <div>
                                <span className="block text-xs font-medium text-gray-500 uppercase">Alasan Laporan</span>
                                <span className="block text-sm font-bold text-red-600 mt-1">{report.reason}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-medium text-gray-500 uppercase">Tanggal Dilaporkan</span>
                                <span className="block text-sm text-gray-900 mt-1">{formatDate(report.created_at)}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-medium text-gray-500 uppercase mb-2">Status Saat Ini</span>
                                {renderStatusBadge(report.status)}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">Aksi Laporan</h3>
                        
                        <form onSubmit={handleStatusUpdate} className="mb-4">
                            <div className="flex flex-col gap-2">
                                <select 
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#8100D1] focus:border-[#8100D1] block w-full p-2.5"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="under_review">Under Review</option>
                                    <option value="resolved">Resolved (Post OK / Handled)</option>
                                    <option value="rejected">Rejected (False Alarm)</option>
                                </select>
                                <button type="submit" className="w-full justify-center inline-flex items-center px-4 py-2 bg-[#8100D1] hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
                                    Perbarui Status
                                </button>
                            </div>
                        </form>

                        <div className="border-t border-gray-100 pt-4 mt-4">
                            <form onSubmit={handleDeletePost}>
                                <button type="submit" className="w-full justify-center inline-flex items-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors border border-red-200">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    Hapus Postingan
                                </button>
                                <p className="text-xs text-gray-400 mt-2 text-center">Menghapus postingan otomatis mengubah status laporan menjadi Resolved.</p>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Reported Content Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">Konten yang Dilaporkan</h3>
                        
                        {(report.post_content || report.post_media) ? (
                            <>
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                                        {report.post_owner_email ? report.post_owner_email.substring(0, 1).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <span className="block font-bold text-gray-900">{report.post_owner_email || 'User Terhapus'}</span>
                                        <span className="block text-xs text-gray-500">{(report.post_owner_role || '').toUpperCase()}</span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                                    {report.post_content ? (
                                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{report.post_content}</p>
                                    ) : (
                                        <p className="text-gray-400 italic">Hanya media (tanpa teks)</p>
                                    )}

                                    {report.post_media && (
                                        <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 bg-white flex justify-center">
                                            <img 
                                                src={report.post_media} 
                                                alt="Reported Media" 
                                                className="max-w-full h-auto object-contain max-h-96" 
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400?text=Media+Not+Found'; }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </div>
                                <h3 className="text-gray-900 font-medium text-lg">Postingan Tidak Tersedia</h3>
                                <p className="text-gray-500 text-sm mt-1">Postingan ini mungkin telah dihapus oleh pengguna atau admin lain.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
