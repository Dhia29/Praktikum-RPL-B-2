import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function CommunityReportsIndexAdmin() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/community/reports');
            setReports(response.data.reports || []);
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const filteredReports = reports.filter(report => {
        if (statusFilter === 'all') return true;
        return report.status === statusFilter;
    });

    const renderStatus = (status) => {
        if (status === 'pending') {
            return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">Pending</span>;
        } else if (status === 'under_review') {
            return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Under Review</span>;
        } else if (status === 'resolved') {
            return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">Resolved</span>;
        } else {
            return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">Rejected</span>;
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

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-100 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Laporan Komunitas</h3>
                    <p className="text-sm text-gray-500 mt-1">Kelola laporan konten komunitas yang melanggar aturan.</p>
                </div>
                <div className="flex gap-2">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#8100D1] focus:border-[#8100D1] block px-3 py-2 outline-none"
                    >
                        <option value="all">Semua Status</option>
                        <option value="pending">Pending</option>
                        <option value="under_review">Under Review</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                            <th className="p-4 border-b border-gray-100">ID Laporan / Alasan</th>
                            <th className="p-4 border-b border-gray-100">Pelapor</th>
                            <th className="p-4 border-b border-gray-100">Pemilik Postingan</th>
                            <th className="p-4 border-b border-gray-100">Tanggal</th>
                            <th className="p-4 border-b border-gray-100">Status</th>
                            <th className="p-4 border-b border-gray-100 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">Memuat data laporan...</td>
                            </tr>
                        ) : filteredReports.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">Belum ada laporan komunitas saat ini.</td>
                            </tr>
                        ) : (
                            filteredReports.map(report => (
                                <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 text-sm mb-1">{report.id.toString().substring(0, 8)}...</span>
                                            <span className="text-red-600 text-xs font-semibold">{report.reason}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="block font-medium text-gray-800">{report.reporter_email}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="block font-medium text-gray-800">{report.post_owner_email || 'Deleted User'}</span>
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {formatDate(report.created_at)}
                                    </td>
                                    <td className="p-4">
                                        {renderStatus(report.status)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link to={`/community/reports/${report.id}`} className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                            Lihat Detail
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
