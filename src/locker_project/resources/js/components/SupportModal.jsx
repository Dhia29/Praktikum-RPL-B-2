import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function SupportModal({ isOpen, onClose, currentUser }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('list'); // 'list', 'new', 'chat'
    
    const [newTicket, setNewTicket] = useState({ subject: '', category: '', message: '' });
    const [submitting, setSubmitting] = useState(false);

    // Chat states
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMsg, setSendingMsg] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchTickets();
            setActiveTab('list');
            setNewTicket({ subject: '', category: '', message: '' });
            setSelectedTicket(null);
        }
    }, [isOpen]);

    // WebSocket: Listen for admin replies in real-time
    useEffect(() => {
        if (!currentUser?.id || !isOpen) return;

        const channel = window.Echo.private(`App.Models.User.${currentUser.id}`);
        
        const handleTicketReply = (notification) => {
            const isTicketReply = notification.type === 'ticket_reply' || 
                                 (notification.type && notification.type.includes('TicketRepliedNotification'));
            
            if (isTicketReply) {
                // If we're viewing this ticket's chat, reload messages
                if (selectedTicket && String(notification.ticket_id) === String(selectedTicket.id)) {
                    axios.get(`/api/support/tickets/${selectedTicket.id}/messages`)
                        .then(res => {
                            setChatMessages(res.data.data);
                            scrollToBottom();
                        })
                        .catch(err => console.error('Failed to reload chat', err));
                }
                // Also refresh ticket list
                fetchTickets();
            }
        };

        channel.notification(handleTicketReply);

        return () => {
            // Don't leave the channel entirely, just stop this specific listener
        };
    }, [currentUser, isOpen, selectedTicket]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/support/my-tickets');
            setTickets(res.data.data);
        } catch (error) {
            console.error('Failed to fetch tickets', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newTicket.subject.trim() || !newTicket.category || !newTicket.message.trim()) return;
        
        setSubmitting(true);
        try {
            await axios.post('/api/support/tickets', newTicket);
            // Refresh ticket list
            await fetchTickets();
            setActiveTab('list');
            setNewTicket({ subject: '', category: '', message: '' });
        } catch (error) {
            console.error('Failed to create ticket', error);
            alert('Gagal mengirim pesan bantuan.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSelectTicket = async (ticket) => {
        setSelectedTicket(ticket);
        setActiveTab('chat');
        setChatLoading(true);
        try {
            const res = await axios.get(`/api/support/tickets/${ticket.id}/messages`);
            setChatMessages(res.data.data);
            setSelectedTicket(res.data.ticket);
        } catch (error) {
            console.error('Failed to load chat', error);
        } finally {
            setChatLoading(false);
            scrollToBottom();
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;

        const messageText = newMessage;
        setNewMessage('');
        setSendingMsg(true);

        // Optimistic UI update
        const tempMsg = { id: Date.now(), sender: 'user', message: messageText, created_at: new Date().toISOString() };
        setChatMessages(prev => [...prev, tempMsg]);
        scrollToBottom();

        try {
            await axios.post(`/api/support/tickets/${selectedTicket.id}/messages`, { message: messageText });
            // Reload to get AI reply
            const res = await axios.get(`/api/support/tickets/${selectedTicket.id}/messages`);
            setChatMessages(res.data.data);
            scrollToBottom();
        } catch (error) {
            console.error('Failed to send message', error);
        } finally {
            setSendingMsg(false);
        }
    };

    const handleHandover = async () => {
        if (!selectedTicket || selectedTicket.handled_by === 'admin') return;
        setSubmitting(true);
        try {
            await axios.post(`/api/support/tickets/${selectedTicket.id}/handover`);
            // Refresh
            const res = await axios.get(`/api/support/tickets/${selectedTicket.id}/messages`);
            setChatMessages(res.data.data);
            setSelectedTicket(res.data.ticket);
            scrollToBottom();
        } catch (error) {
            console.error('Failed to handover ticket', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseTicket = async () => {
        if (!selectedTicket || selectedTicket.status === 'closed') return;
        if (!window.confirm("Apakah Anda yakin masalah ini sudah selesai dan ingin menutup tiket?")) return;
        setSubmitting(true);
        try {
            await axios.post(`/api/support/tickets/${selectedTicket.id}/close`);
            setSelectedTicket({ ...selectedTicket, status: 'closed' });
            // Refresh tickets list in background
            fetchTickets();
        } catch (error) {
            console.error('Failed to close ticket', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTicket = async (ticketId, e) => {
        e.stopPropagation();
        if (!window.confirm("Apakah Anda yakin ingin menghapus riwayat tiket ini secara permanen?")) return;
        
        try {
            await axios.delete(`/api/support/tickets/${ticketId}`);
            fetchTickets();
            if (selectedTicket && selectedTicket.id === ticketId) {
                setSelectedTicket(null);
            }
        } catch (error) {
            console.error('Failed to delete ticket', error);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            if (chatEndRef.current) {
                chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up flex flex-col max-h-[85vh]">
                
                {/* Header Modal */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
                    <div className="flex items-center gap-3">
                        {activeTab === 'chat' && (
                            <button onClick={() => { setActiveTab('list'); setSelectedTicket(null); }} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition focus:outline-none" title="Kembali">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                            </button>
                        )}
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {activeTab === 'chat' ? 'Obrolan Bantuan' : 'Customer Service'}
                                </h2>
                                {activeTab === 'chat' && selectedTicket && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                        selectedTicket.status === 'open' ? 'bg-orange-100 text-orange-700' :
                                        selectedTicket.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                        selectedTicket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                        {selectedTicket.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {activeTab === 'chat' ? `Tiket #${selectedTicket?.id} - ${selectedTicket?.handled_by === 'ai' ? 'Dijawab oleh AI' : 'Ditangani Admin'}` : 'Kami siap membantu permasalahan Anda'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8100D1]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                {/* Tabs (Hidden in chat view) */}
                {activeTab !== 'chat' && (
                    <div className="flex border-b border-gray-100 px-5 pt-3">
                        <button 
                            onClick={() => setActiveTab('list')}
                            className={`pb-3 px-4 font-semibold text-sm transition-colors relative ${activeTab === 'list' ? 'text-[#8100D1]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Riwayat Tiket
                            {activeTab === 'list' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#8100D1] rounded-t-full"></span>}
                        </button>
                        <button 
                            onClick={() => setActiveTab('new')}
                            className={`pb-3 px-4 font-semibold text-sm transition-colors relative ${activeTab === 'new' ? 'text-[#8100D1]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Buat Tiket Baru
                            {activeTab === 'new' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#8100D1] rounded-t-full"></span>}
                        </button>
                    </div>
                )}

                {/* Content Area */}
                <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
                    {activeTab === 'list' && (
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8100D1]"></div>
                                </div>
                            ) : tickets.length === 0 ? (
                                <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    </div>
                                    <h3 className="font-bold text-gray-700">Belum Ada Riwayat</h3>
                                    <p className="text-sm text-gray-500 mt-1">Anda belum pernah mengirimkan tiket bantuan.</p>
                                    <button onClick={() => setActiveTab('new')} className="mt-4 text-[#8100D1] text-sm font-bold hover:underline">Buat Tiket Sekarang</button>
                                </div>
                            ) : (
                                tickets.map(ticket => (
                                    <div 
                                        key={ticket.id} 
                                        onClick={() => handleSelectTicket(ticket)}
                                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md cursor-pointer hover:border-[#8100D1]/30 group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2 flex-1 pr-3">
                                                <h4 className="font-bold text-gray-800 line-clamp-1 group-hover:text-[#8100D1] transition-colors">{ticket.subject}</h4>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap uppercase ${
                                                    ticket.status === 'open' ? 'bg-orange-100 text-orange-600' : 
                                                    ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                                                    ticket.status === 'resolved' ? 'bg-green-100 text-green-600' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {ticket.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={(e) => handleDeleteTicket(ticket.id, e)}
                                                className="p-1.5 -mr-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors focus:outline-none"
                                                title="Hapus Tiket"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] uppercase font-bold">{ticket.category}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                {ticket.handled_by === 'ai' ? (
                                                    <><svg className="w-3 h-3 text-[#8100D1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> AI Support</>
                                                ) : 'Admin'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.message}</p>
                                        <div className="text-xs text-gray-400 border-t border-gray-50 pt-2 flex items-center justify-between">
                                            <span>Dikirim: {new Date(ticket.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year:'numeric'})}</span>
                                            <span>ID: #{ticket.id}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'new' && (
                        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Subjek</label>
                                <input 
                                    type="text" 
                                    value={newTicket.subject}
                                    onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                                    placeholder="Contoh: Gagal mengunggah CV" 
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#8100D1] focus:ring-1 focus:ring-[#8100D1] transition-all text-sm"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Kategori Masalah</label>
                                <select 
                                    value={newTicket.category}
                                    onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#8100D1] focus:ring-1 focus:ring-[#8100D1] transition-all text-sm bg-white"
                                    required
                                >
                                    <option value="" disabled>Pilih Kategori...</option>
                                    <option value="Akun & Login">Akun & Login</option>
                                    <option value="Profil & Pengaturan">Profil & Pengaturan</option>
                                    <option value="Pencarian & Lamaran Kerja">Pencarian & Lamaran Kerja</option>
                                    <option value="Sistem Pesan (Chat)">Sistem Pesan (Chat)</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Pesan / Detail Masalah</label>
                                <textarea 
                                    value={newTicket.message}
                                    onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            if (newTicket.message.trim()) {
                                                handleCreateTicket(e);
                                            }
                                        }
                                    }}
                                    placeholder="Ceritakan detail masalah yang Anda alami..." 
                                    rows="4"
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-[#8100D1] focus:ring-1 focus:ring-[#8100D1] transition-all text-sm resize-none"
                                    required
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setActiveTab('list')} className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting || !newTicket.subject.trim() || !newTicket.category || !newTicket.message.trim()}
                                    className="px-6 py-2 text-sm font-bold text-white bg-[#8100D1] hover:bg-[#6a00ac] rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Mengirim...
                                        </>
                                    ) : 'Kirim Tiket'}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'chat' && selectedTicket && (
                        <div className="flex flex-col h-full bg-gray-50 -m-6">
                            {/* Chat Header was moved to Main Header */}

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                {chatLoading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8100D1]"></div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-xl border border-blue-100 text-center mx-10 mb-4 shadow-sm">
                                            Tiket dibuat. Anda sedang dilayani oleh <strong>{selectedTicket.handled_by === 'ai' ? 'AI Assistant' : 'Admin Support'}</strong>.
                                        </div>
                                        {chatMessages.map((msg, index) => {
                                            const isUser = msg.sender === 'user';
                                            return (
                                                <div key={msg.id || index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                                                        isUser 
                                                            ? 'bg-[#8100D1] text-white rounded-br-sm' 
                                                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                                                    }`}>
                                                        {!isUser && msg.sender === 'ai' && (
                                                            <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-[#8100D1]">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                                                AI Support
                                                            </div>
                                                        )}
                                                        {!isUser && msg.sender === 'admin' && (
                                                            <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-green-600">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                                                Admin LockER
                                                            </div>
                                                        )}
                                                        <div className="whitespace-pre-wrap leading-relaxed">{msg.message}</div>
                                                        <div className={`text-[10px] mt-1.5 text-right ${isUser ? 'text-purple-200' : 'text-gray-400'}`}>
                                                            {new Date(msg.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {sendingMsg && (
                                            <div className="flex justify-start">
                                                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={chatEndRef}></div>
                                    </>
                                )}
                            </div>

                            {/* Chat Input */}
                            {(selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved') ? (
                                <div className="bg-white p-4 border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                                    <form onSubmit={handleSendMessage} className="flex gap-2 mb-3">
                                        <textarea 
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    if (newMessage.trim() && !sendingMsg) {
                                                        handleSendMessage(e);
                                                    }
                                                }
                                            }}
                                            placeholder="Ketik balasan Anda..." 
                                            rows="1"
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-5 py-2.5 text-sm outline-none focus:bg-white focus:border-[#8100D1] focus:ring-1 focus:ring-[#8100D1] transition-all resize-none overflow-hidden"
                                            disabled={sendingMsg}
                                            style={{ minHeight: '44px', maxHeight: '120px' }}
                                            onInput={(e) => {
                                                e.target.style.height = 'auto';
                                                e.target.style.height = e.target.scrollHeight + 'px';
                                            }}
                                        />
                                        <button 
                                            type="submit" 
                                            disabled={!newMessage.trim() || sendingMsg}
                                            className="w-10 h-10 rounded-full bg-[#8100D1] hover:bg-[#6a00ac] text-white flex items-center justify-center transition-colors shadow-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#8100D1] focus:ring-offset-1 flex-shrink-0"
                                        >
                                            <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                                        </button>
                                    </form>
                                    
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
                                        {selectedTicket.handled_by === 'ai' ? (
                                            <button 
                                                onClick={handleHandover}
                                                disabled={submitting}
                                                className="text-xs font-semibold text-[#8100D1] hover:underline flex items-center gap-1.5"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                                                Minta Bantuan Admin
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-500 italic flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                                Sedang ditangani Admin
                                            </span>
                                        )}
                                        
                                        <button 
                                            onClick={handleCloseTicket}
                                            disabled={submitting}
                                            className="text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-100 flex items-center gap-1.5 ml-auto"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                                            Selesaikan & Tutup Tiket
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white p-4 border-t border-gray-100 text-center">
                                    <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 inline-block">
                                        Tiket ini telah {selectedTicket.status === 'resolved' ? 'diselesaikan' : 'ditutup'}. Anda tidak dapat membalas pesan lagi.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
