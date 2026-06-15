import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function TicketsIndexAdmin() {
    const { t } = useTranslation();
    const { adminUser } = useOutletContext() || {};
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

    // WebSocket: Auto-refresh when new ticket or handover
    useEffect(() => {
        if (!adminUser?.id) return;

        const channel = window.Echo.private('admin.notifications');
        
        channel.listen('AdminDashboardUpdated', (e) => {
            if (e.type === 'new_ticket' || e.type === 'ticket_handover') {
                fetchTickets();
            }
        });

        return () => {};
    }, [adminUser]);

    const filteredTickets = tickets.filter(ticket => {
        if (statusFilter === 'all') return true;
        return ticket.status === statusFilter;
    });

    const renderHandledBy = (handledBy) => {
        if (handledBy === 'ai') return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-[#8100D1] uppercase tracking-wider">AI Support</span>;
        if (handledBy === 'admin') return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 uppercase tracking-wider">Admin</span>;
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-800 uppercase tracking-wider">{handledBy}</span>;
    };

    const renderStatus = (status) => {
        const statusColors = {
            'open': 'bg-orange-50 text-orange-700 border-orange-200',
            'in_progress': 'bg-blue-50 text-blue-700 border-blue-200',
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
                    <h3 className="text-lg font-bold text-gray-800">{t('admin.tickets.title')}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t('admin.tickets.desc')}</p>
                </div>
                <div className="flex gap-2">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#8100D1] focus:border-[#8100D1] block px-3 py-2 outline-none"
                    >
                        <option value="all">{t('admin.tickets.filter_all')}</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                            <th className="p-4 border-b border-gray-100">{t('admin.tickets.col_id_subject')}</th>
                            <th className="p-4 border-b border-gray-100">{t('admin.tickets.col_reporter')}</th>
                            <th className="p-4 border-b border-gray-100">{t('admin.tickets.col_category')}</th>
                            <th className="p-4 border-b border-gray-100">{t('admin.tickets.col_status')}</th>
                            <th className="p-4 border-b border-gray-100">{t('admin.tickets.col_assigned')}</th>
                            <th className="p-4 border-b border-gray-100 text-right">{t('admin.tickets.col_action')}</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">{t('admin.tickets.loading')}</td>
                            </tr>
                        ) : filteredTickets.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">{t('admin.tickets.empty')}</td>
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
                                        {renderHandledBy(ticket.handled_by)}
                                    </td>
                                    <td className="p-4">
                                        {renderStatus(ticket.status)}
                                    </td>
                                    <td className="p-4">
                                        {ticket.admin ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-[#8100D1] text-white flex items-center justify-center font-bold text-[10px]">
                                                    {ticket.admin.email.substring(0, 1).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{ticket.admin.email.split('@')[0]}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic text-sm">{t('admin.tickets.no_admin')}</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link to={`/tickets/${ticket.id}`} className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                            {t('admin.tickets.view_chat')}
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
