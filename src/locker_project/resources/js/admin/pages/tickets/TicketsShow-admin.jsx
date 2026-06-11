import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function TicketsShowAdmin() {
    const { t } = useTranslation();
    const { id } = useParams();
    const { adminUser } = useOutletContext() || {};
    const [ticket, setTicket] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [assignedAdminId, setAssignedAdminId] = useState('');
    const [priority, setPriority] = useState('');
    const [status, setStatus] = useState('');
    
    const [newMessage, setNewMessage] = useState('');
    const [isInternalNote, setIsInternalNote] = useState(false);
    
    const chatContainerRef = useRef(null);

    const fetchTicket = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/admin/tickets/${id}`);
            const data = response.data.ticket;
            setTicket(data);
            setAdmins(response.data.admins || []);
            setAssignedAdminId(data.assigned_admin_id || '');
            setPriority(data.priority || 'low');
            setStatus(data.status || 'open');
        } catch (error) {
            console.error("Failed to fetch ticket", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [id]);

    // WebSocket: Auto-refresh ticket when events arrive
    useEffect(() => {
        if (!adminUser?.id) return;

        const channel = window.Echo.private('admin.notifications');
        
        channel.listen('AdminDashboardUpdated', (e) => {
            if (e.type === 'new_ticket' || e.type === 'ticket_handover' || e.type === 'ticket_reply') {
                if (e.data?.ticket_id === id) {
                    fetchTicket();
                }
            }
        });

        const userChannel = window.Echo.private(`App.Models.User.${adminUser.id}`);
        userChannel.notification((notification) => {
            fetchTicket();
        });

        return () => {};
    }, [adminUser, id]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [ticket?.messages]);

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/admin/tickets/${id}/assign`, { assigned_admin_id: assignedAdminId });
            fetchTicket();
        } catch (error) {
            console.error("Failed to assign admin", error);
            alert(t('admin.tickets.alert_assign_fail'));
        }
    };

    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/admin/tickets/${id}/status`, { status });
            fetchTicket();
        } catch (error) {
            console.error("Failed to update status", error);
            alert(t('admin.tickets.alert_status_fail'));
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        
        try {
            await axios.post(`/api/admin/tickets/${id}/reply`, {
                message: newMessage
            });
            setNewMessage('');
            fetchTicket();
        } catch (error) {
            console.error("Failed to send reply", error);
            alert(t('admin.tickets.alert_reply_fail'));
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[date.getMonth()];
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day} ${month} ${hours}:${minutes}`;
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">{t('admin.tickets.loading_detail')}</div>;
    }

    if (!ticket) {
        return <div className="p-8 text-center text-red-500">{t('admin.tickets.not_found')}</div>;
    }

    return (
        <>
            <div className="mb-6 flex justify-between items-center">
                <Link to="/tickets" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    {t('admin.tickets.back_to_list')}
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
                {/* Left Column: Metadata & Controls */}
                <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">{t('admin.tickets.ticket_info')}</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <span className="block text-xs font-medium text-gray-500 uppercase">{t('admin.tickets.reporter')}</span>
                                <span className="block text-sm text-gray-900 mt-1 font-medium">{ticket.user?.email || 'Unknown User'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-medium text-gray-500 uppercase">{t('admin.tickets.subject_category')}</span>
                                <span className="block text-sm font-bold text-gray-900 mt-1">{ticket.subject}</span>
                                <span className="block text-xs text-gray-500 mt-0.5">{ticket.category}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-medium text-gray-500 uppercase">{t('admin.tickets.date_created')}</span>
                                <span className="block text-sm text-gray-900 mt-1">{formatDate(ticket.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">{t('admin.tickets.ticket_management')}</h3>
                        
                        <form onSubmit={handleAssign} className="mb-4">
                            <div className="flex flex-col gap-2">
                                <label className="block text-xs font-medium text-gray-500 uppercase">{t('admin.tickets.assigned_to')}</label>
                                <div className="flex gap-2">
                                    <select 
                                        value={assignedAdminId}
                                        onChange={(e) => setAssignedAdminId(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#8100D1] focus:border-[#8100D1] block w-full p-2.5"
                                    >
                                        <option value="">{t('admin.tickets.unassigned')}</option>
                                        {admins.map(admin => (
                                            <option key={admin.id} value={admin.id}>
                                                {admin.email.split('@')[0]}
                                            </option>
                                        ))}
                                    </select>
                                    <button type="submit" className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                                        {t('admin.tickets.save')}
                                    </button>
                                </div>
                            </div>
                        </form>

                        <form onSubmit={handleStatusUpdate}>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-2">{t('admin.tickets.ticket_status')}</label>
                                    <select 
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#8100D1] focus:border-[#8100D1] block w-full p-2.5"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>

                                <button type="submit" className="w-full justify-center inline-flex items-center px-4 py-2 bg-[#8100D1] hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
                                    {t('admin.tickets.update_status')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: Chat Thread */}
                <div className="lg:col-span-2 flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-800">{t('admin.tickets.chat_room')} <span className="text-gray-400 text-sm font-normal">#{ticket.id.toString().substring(0, 8)}</span></h3>
                        {(ticket.status === 'resolved' || ticket.status === 'closed') && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                                {t('admin.tickets.ticket_closed')}
                            </span>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={chatContainerRef}>
                        {ticket.messages && ticket.messages.map(message => {
                            if (message.is_internal_note) {
                                return (
                                    <div key={message.id} className="flex justify-center">
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-lg w-full text-center relative mt-4">
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                {t('admin.tickets.internal_note')}
                                            </div>
                                            <p className="text-sm text-gray-800 mt-2">{message.message}</p>
                                            <p className="text-[10px] text-gray-500 mt-2">{message.sender?.email || 'Admin'} • {formatDate(message.created_at)}</p>
                                        </div>
                                    </div>
                                );
                            } else {
                                const isUser = message.sender === 'user';
                                return (
                                    <div key={message.id} className={`flex items-start gap-3 ${!isUser ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs ${!isUser ? 'bg-[#8100D1] text-white' : 'bg-gray-200 text-gray-500'}`}>
                                            {!isUser ? (message.sender === 'ai' ? 'AI' : 'A') : (ticket.user?.email?.substring(0, 1).toUpperCase() || 'U')}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className={`max-w-lg rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                                                !isUser 
                                                    ? 'bg-[#8100D1] text-white rounded-tr-sm' 
                                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                                            }`}>
                                                {!isUser && message.sender === 'ai' && (
                                                    <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-purple-200">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                                        AI Support
                                                    </div>
                                                )}
                                                {!isUser && message.sender === 'admin' && (
                                                    <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-green-300">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                                        Admin LockER
                                                    </div>
                                                )}
                                                <div className="whitespace-pre-wrap leading-relaxed">{message.message}</div>
                                            </div>
                                            <div className={`text-[10px] mt-1 ${!isUser ? 'text-right mr-1 text-gray-400' : 'text-left ml-1 text-gray-400'}`}>
                                                {formatDate(message.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>

                    {(ticket.status !== 'resolved' && ticket.status !== 'closed') ? (
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <form onSubmit={handleReply}>
                                <div className="flex flex-col gap-3">
                                    <textarea 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                if (newMessage.trim()) {
                                                    handleReply(e);
                                                }
                                            }
                                        }}
                                        rows="3" 
                                        required 
                                        className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#8100D1] focus:border-transparent outline-none resize-none" 
                                        placeholder={t('admin.tickets.reply_placeholder')}
                                    ></textarea>
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1"></div>
                                        <button type="submit" className="px-5 py-2 bg-[#8100D1] hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2">
                                            <span>{t('admin.tickets.send_message')}</span>
                                            <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="p-4 border-t border-gray-100 bg-gray-100 text-center text-sm text-gray-500">
                            {t('admin.tickets.ticket_closed_msg')}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
