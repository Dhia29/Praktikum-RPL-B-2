import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function TicketsIndexAdmin() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/tickets');
            setTickets(response.data.tickets || []);
        } catch (error) {
            console.error("Failed to fetch tickets", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const filteredTickets = tickets.filter(ticket => {
        if (statusFilter === 'all') return true;
        return ticket.status === statusFilter;
    });

    const renderPriority = (priority) => {
        if (priority === 'low') return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wider">Low</span>;
        if (priority === 'medium') return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800 uppercase tracking-wider">Medium</span>;
        if (priority === 'high') return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 uppercase tracking-wider">High</span>;
        if (priority === 'critical') return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 uppercase tracking-wider">Critical</span>;
        return null;
    };

    const renderStatus = (status) => {
        const statusColors = {
            'open': 'bg-red-50 text-red-700 border-red-200',
            'pending_response': 'bg-orange-50 text-orange-700 border-orange-200',
            'in_progress': 'bg-blue-50 text-blue-700 border-blue-200',
            'waiting_for_user': 'bg-yellow-50 text-yellow-700 border-yellow-200',
            'resolved': 'bg-green-50 text-green-700 border-green-200',
            'closed': 'bg-gray-100 text-gray-700 border-gray-200',
        };
        const colorClass = statusColors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
        const statusLabel = status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
                {statusLabel}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-100 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Daftar Tiket Dukungan</h3>
                    <p className="text-sm text-gray-500 mt-1">Kelola tiket dukungan dan percakapan pelanggan.</p>
                </div>
                <div className="flex gap-2">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#8100D1] focus:border-[#8100D1] block px-3 py-2 outline-none"
                    >
                        <option value="all">Semua Status</option>
                        <option value="open">Open</option>
                        <option value="pending_response">Pending Response</option>
                        <option value="in_progress">In Progress</option>
                        <option value="waiting_for_user">Waiting for User</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                            <th className="p-4 border-b border-gray-100">Tiket ID & Subjek</th>
                            <th className="p-4 border-b border-gray-100">Pelapor</th>
                            <th className="p-4 border-b border-gray-100">Kategori & Prioritas</th>
                            <th className="p-4 border-b border-gray-100">Status</th>
                            <th className="p-4 border-b border-gray-100">Ditugaskan Kepada</th>
                            <th className="p-4 border-b border-gray-100 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">Memuat data tiket...</td>
                            </tr>
                        ) : filteredTickets.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">Belum ada tiket bantuan saat ini.</td>
                            </tr>
                        ) : (
                            filteredTickets.map(ticket => (
                                <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 text-sm mb-1 uppercase">#{ticket.id.substring(0, 8)}</span>
                                            <span className="text-gray-600 text-sm font-medium">{ticket.subject}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="block font-medium text-gray-800">{ticket.user?.email || 'Unknown'}</span>
                                        <span className="text-xs text-gray-500 uppercase">{ticket.user?.role || ''}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="block text-sm text-gray-800 mb-1">{ticket.category}</span>
                                        {renderPriority(ticket.priority)}
                                    </td>
                                    <td className="p-4">
                                        {renderStatus(ticket.status)}
                                    </td>
                                    <td className="p-4">
                                        {ticket.assigned_admin ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-[#8100D1] text-white flex items-center justify-center font-bold text-[10px]">
                                                    {ticket.assigned_admin.email.substring(0, 1).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{ticket.assigned_admin.email.split('@')[0]}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic text-sm">Belum ditugaskan</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link to={`/tickets/${ticket.id}`} className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                            Lihat Obrolan
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
