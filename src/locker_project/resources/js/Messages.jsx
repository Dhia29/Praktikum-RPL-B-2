import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import AppointmentModal from './components/AppointmentModal';
import { useLocation, useOutletContext } from 'react-router-dom';

const getFileIcon = (fileName) => {
    if (!fileName) return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') {
        return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h4m-4 4h4" /></svg>;
    } else if (ext === 'doc' || ext === 'docx') {
        return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m-6-8h.01" /></svg>;
    } else if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') {
        return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" /></svg>;
    } else if (ext === 'zip' || ext === 'rar' || ext === 'tar' || ext === 'gz') {
        return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
    } else {
        return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
    }
}

export default function Messages() {
    const [rooms, setRooms] = useState([]);
    const [activeRoom, setActiveRoom] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [typedMessage, setTypedMessage] = useState('');
    const [isRoomsLoading, setIsRoomsLoading] = useState(true);
    const [isChatLoading, setIsChatLoading] = useState(false);
    
    const location = useLocation();
    const { currentUser } = useOutletContext() || {};

    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // WebSockets Presence & Typing
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingStatus, setTypingStatus] = useState({});

    const [selectedMedia, setSelectedMedia] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const chatEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [openRoomMenuId, setOpenRoomMenuId] = useState(null);
    const [deleteMenuId, setDeleteMenuId] = useState(null);

    const fetchRooms = () => {
        axios.get('/api/messages/rooms')
            .then(res => { 
                const loadedRooms = res.data.data || [];
                setRooms(loadedRooms); 
                setIsRoomsLoading(false); 

                // Check URL parameter to auto-open chat
                const searchParams = new URLSearchParams(location.search);
                const targetUserId = searchParams.get('user');
                if (targetUserId) {
                    const targetRoom = loadedRooms.find(r => r.id === targetUserId);
                    if (targetRoom && !activeRoom) {
                        setActiveRoom(targetRoom);
                    } else if (!targetRoom) {
                        // Jika target room tidak ada di list, coba fetch data user
                        axios.get(`/api/messages/search-users?q=${targetUserId}`)
                            .then(searchRes => {
                                const userMatch = searchRes.data.data?.find(u => u.id === targetUserId);
                                if (userMatch) {
                                    const newRoom = { id: userMatch.id, name: userMatch.name, avatar_url: userMatch.avatar_url, role: userMatch.role, last_message: 'Mulai obrolan baru...', time: new Date().toISOString(), is_read: true };
                                    setRooms(prev => [newRoom, ...prev]);
                                    setActiveRoom(newRoom);
                                    setChatHistory([]);
                                }
                            })
                            .catch(e => console.error(e));
                    }
                }
            })
            .catch(err => { console.error(err); setIsRoomsLoading(false); });
    };

    useEffect(() => {
        fetchRooms();
    }, [location.search]);

    useEffect(() => {
        if (!currentUser?.id) return;

        const channel = window.Echo.private(`chat.${currentUser.id}`);
        
        channel.listen('MessageSent', (e) => {
            const incomingMessage = e.message;
            
            // Perbarui history jika pesan untuk active room (baik pengirim/penerima)
            setActiveRoom((currentActiveRoom) => {
                if (currentActiveRoom && (incomingMessage.from_user_id === currentActiveRoom.id || incomingMessage.to_user_id === currentActiveRoom.id)) {
                    setChatHistory(prev => {
                        // Cek apakah pesan sudah ada
                        if (prev.find(m => m.id === incomingMessage.id)) return prev;
                        return [...prev, incomingMessage];
                    });
                    scrollToBottom();
                }
                return currentActiveRoom;
            });

            // Refresh daftar kontak untuk memperbarui last_message dan time
            fetchRooms();
        });

        channel.listen('MessageDeleted', (e) => {
            const deletedId = e.id;
            setChatHistory(prev => prev.filter(msg => msg.id !== deletedId));
            fetchRooms();
        });

        channel.listen('MessageUpdated', (e) => {
            const updatedMessage = e.message;
            setChatHistory(prev => prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg));
            fetchRooms();
        });

        // Online & Typing Tracker via Presence Channel
        const presenceChannel = window.Echo.join('chat.presence');
        presenceChannel.here((users) => {
            setOnlineUsers(users.map(u => u.id));
        }).joining((user) => {
            setOnlineUsers(prev => [...prev, user.id]);
        }).leaving((user) => {
            setOnlineUsers(prev => prev.filter(id => id !== user.id));
        }).listenForWhisper('typing', (e) => {
            if (e.toUserId === currentUser.id) {
                setTypingStatus(prev => ({ ...prev, [e.userId]: e.typing }));
                if (e.typing) {
                    clearTimeout(window[`typingTimer_${e.userId}`]);
                    window[`typingTimer_${e.userId}`] = setTimeout(() => {
                        setTypingStatus(prev => ({ ...prev, [e.userId]: false }));
                    }, 3000);
                }
            }
        });

        return () => {
            window.Echo.leave(`chat.${currentUser.id}`);
            window.Echo.leave('chat.presence');
        };
    }, [currentUser]);

    const handleTypeMessage = (e) => {
        setTypedMessage(e.target.value);
        if (activeRoom && currentUser) {
            window.Echo.join('chat.presence').whisper('typing', {
                userId: currentUser.id,
                toUserId: activeRoom.id,
                typing: e.target.value.length > 0
            });
        }
    };

    const handleChatAction = async (contactId, action) => {
        if (action === 'delete_history' && !confirm('Yakin ingin menghapus riwayat pesan pada obrolan ini?')) return;

        try {
            await axios.post(`/api/messages/settings/${contactId}`, { action });
            fetchRooms();
            if (action === 'delete_history' && activeRoom?.id === contactId) {
                setChatHistory([]);
            }
            if (action === 'block' && activeRoom?.id === contactId) {
                setActiveRoom(prev => ({...prev, is_blocked: true}));
            }
            if (action === 'unblock' && activeRoom?.id === contactId) {
                setActiveRoom(prev => ({...prev, is_blocked: false}));
            }
            setOpenRoomMenuId(null);
        } catch (error) {
            console.error("Gagal memperbarui pengaturan chat", error);
            alert("Gagal memproses aksi.");
        }
    };

    const handleDeleteMessage = async (id, type) => {
        setDeleteMenuId(null);
        try {
            await axios.delete(`/api/messages/${id}?type=${type}`);
            setChatHistory(prev => prev.filter(msg => msg.id !== id));
            fetchRooms();
        } catch (error) {
            console.error("Gagal menghapus pesan", error);
            alert("Gagal menghapus pesan.");
        }
    };

    const handleRespondAppointment = async (id, status) => {
        try {
            await axios.post(`/api/messages/${id}/respond-appointment`, { status });
            setChatHistory(prev => prev.map(msg => msg.id === id ? { ...msg, appointment_status: status } : msg));
            fetchRooms();
        } catch (error) {
            console.error("Gagal merespons jadwal", error);
            alert(error.response?.data?.message || "Gagal merespons jadwal.");
        }
    };

    useEffect(() => {
        if (!activeRoom) return;
        setIsChatLoading(true);
        axios.get(`/api/messages/history/${activeRoom.id}`)
            .then(res => {
                setChatHistory(res.data.data || []);
                setIsChatLoading(false);
                scrollToBottom();
            })
            .catch(err => { console.error(err); setIsChatLoading(false); });
    }, [activeRoom]);

    const scrollToBottom = () => {
        setTimeout(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 50);
    };

    useEffect(() => {
        if (searchQuery.trim() === '') { setSearchResults([]); return; }
        setIsSearching(true);
        const delayDebounceFn = setTimeout(() => {
            axios.get(`/api/messages/search-users?q=${searchQuery}`)
                .then(res => { setSearchResults(res.data.data || []); setIsSearching(false); })
                .catch(err => { console.error("Gagal mencari", err); setIsSearching(false); });
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSelectNewContact = (user) => {
        const existingRoom = rooms.find(r => r.id === user.id);
        if (existingRoom) {
            setActiveRoom(existingRoom);
        } else {
            const newRoom = { id: user.id, name: user.name, avatar_url: user.avatar_url, role: user.role, last_message: 'Mulai obrolan baru...', time: new Date().toISOString(), is_read: true };
            setRooms([newRoom, ...rooms]); setActiveRoom(newRoom); setChatHistory([]);
        }
        setIsComposeOpen(false); setSearchQuery(''); setSearchResults([]);
    };

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 100 * 1024 * 1024) {
            alert("Ukuran file maksimal 100MB");
            return;
        }

        setSelectedMedia(file);

        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            const url = URL.createObjectURL(file);
            setMediaPreview({ url, type: file.type.startsWith('image/') ? 'image' : 'video' });
        } else {
            setMediaPreview({ url: null, type: 'file', name: file.name });
        }
    };

    const cancelMedia = () => {
        setSelectedMedia(null);
        setMediaPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!typedMessage.trim() && !selectedMedia) || !activeRoom) return;

        const formData = new FormData();
        formData.append('to_user_id', activeRoom.id);
        formData.append('konten', typedMessage.trim());
        if (selectedMedia) {
            formData.append('media', selectedMedia);
        }

        const currentMessage = typedMessage;

        try {
            setTypedMessage('');
            if (activeRoom && currentUser) {
                window.Echo.join('chat.presence').whisper('typing', {
                    userId: currentUser.id,
                    toUserId: activeRoom.id,
                    typing: false
                });
            }
            cancelMedia();
            setShowEmojiPicker(false);

            const res = await axios.post('/api/messages/send', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setChatHistory(prev => {
                if (prev.some(m => m.id === res.data.data.id)) return prev;
                return [...prev, res.data.data];
            });

            setRooms(prevRooms =>
                prevRooms.map(room =>
                    room.id === activeRoom.id
                        ? { ...room, last_message: currentMessage || '[Media Dikirim]', time: new Date().toISOString() }
                        : room
                )
            );
            scrollToBottom();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Gagal mengirim pesan.';
            alert(errorMessage);
            setTypedMessage(currentMessage);
        }
    };

    return (
        <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[75vh] flex">
            <input type="file" ref={fileInputRef} onChange={handleMediaChange} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.zip,.rar" />
            
            <AppointmentModal 
                isOpen={isAppointmentModalOpen}
                onClose={() => setIsAppointmentModalOpen(false)}
                activeRoom={activeRoom}
                onAppointmentSent={(newMessage) => {
                    setChatHistory(prev => {
                        if (prev.some(m => m.id === newMessage.id)) return prev;
                        return [...prev, newMessage];
                    });
                    setRooms(prevRooms => prevRooms.map(room => 
                        room.id === activeRoom.id ? { ...room, last_message: '[Jadwal Dikirim]', time: new Date().toISOString() } : room
                    ));
                    setTimeout(() => {
                        const container = document.getElementById('chat-scroll-container');
                        if (container) container.scrollTop = container.scrollHeight;
                    }, 100);
                }}
            />

            {isComposeOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] animate-fade-in-up">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-bold text-gray-900">Pesan Baru</h3>
                            <button onClick={() => { setIsComposeOpen(false); setSearchQuery(''); }} className="text-gray-400 hover:text-gray-700 transition">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-4 border-b border-gray-100">
                            <div className="relative">
                                <svg className="w-5 h-5 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <input type="text" autoFocus placeholder="Ketik nama atau email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#8100D1] focus:bg-white outline-none transition" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {isSearching ? (
                                <div className="text-center py-8 text-sm text-gray-400 animate-pulse">Mencari...</div>
                            ) : searchResults.length > 0 ? (
                                <div className="space-y-1">
                                    <p className="px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Hasil Pencarian</p>
                                    {searchResults.map((user) => (
                                        <div key={user.id} onClick={() => handleSelectNewContact(user)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 cursor-pointer transition">
                                            <div className="w-12 h-12 rounded-full bg-purple-100 text-[#8100D1] flex items-center justify-center font-bold flex-shrink-0 overflow-hidden">
                                                {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" /> : user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-gray-900 truncate">{user.name}</h4>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">{user.description || (user.role === 'seeker' ? 'Pencari Kerja' : 'Perusahaan')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : searchQuery.length > 0 ? (
                                <div className="text-center py-8 text-sm text-gray-400">Pengguna tidak ditemukan.</div>
                            ) : (
                                <div className="text-center py-10 flex flex-col items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    <p className="text-sm text-gray-400">Cari kolega atau perusahaan untuk memulai obrolan.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* SIDEBAR INBOX */}
            <div className="w-full md:w-80 border-r border-gray-200 flex flex-col bg-white">
                <div className="p-5 border-b border-gray-100 flex flex-col gap-3 bg-gray-50/50">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Pesan Masuk</h2>
                        {currentUser?.role !== 'seeker' && (
                            <button onClick={() => setIsComposeOpen(true)} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-full hover:bg-purple-50 hover:text-[#8100D1] hover:border-purple-200 transition-all shadow-sm focus:outline-none" title="Tulis pesan baru">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                        )}
                    </div>
                    
                    {/* Toggle Arsip */}
                    <div className="flex bg-gray-200 rounded-lg p-1">
                        <button onClick={() => setShowArchived(false)} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${!showArchived ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Utama</button>
                        <button onClick={() => setShowArchived(true)} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${showArchived ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Arsip</button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                    {isRoomsLoading ? (
                        <div className="text-center p-6 text-gray-400 text-sm animate-pulse">Memuat obrolan...</div>
                    ) : rooms.filter(r => showArchived ? r.is_archived : !r.is_archived).length > 0 ? (
                        rooms.filter(r => showArchived ? r.is_archived : !r.is_archived)
                        .sort((a, b) => {
                            if (a.is_pinned && !b.is_pinned) return -1;
                            if (!a.is_pinned && b.is_pinned) return 1;
                            return new Date(b.time) - new Date(a.time);
                        })
                        .map(room => (
                            <div key={room.id} className={`group relative flex items-center gap-4 p-5 cursor-pointer transition-colors text-left ${activeRoom?.id === room.id ? 'bg-purple-50/60 border-l-4 border-[#8100D1]' : 'hover:bg-gray-50'}`} onClick={() => setActiveRoom(room)}>
                                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center font-bold text-[#8100D1] overflow-hidden flex-shrink-0 border border-purple-200 shadow-sm relative">
                                    {room.avatar_url ? <img src={room.avatar_url} className="w-full h-full object-cover" alt="" /> : room.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0 pr-6 relative">
                                    <h4 className="text-sm font-bold text-gray-900 truncate pr-8">
                                        {room.name}
                                    </h4>
                                    {room.is_pinned && (
                                        <div className="absolute right-0 top-0 bg-gradient-to-br from-purple-100 to-purple-200 text-[#8100D1] p-1 rounded-full border border-purple-300 shadow-sm" title="Disematkan">
                                            <svg className="w-3.5 h-3.5 transform rotate-45" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500 truncate mt-1">{room.last_message || 'Tidak ada pesan'}</p>
                                </div>
                                
                                {/* Kebab Menu */}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); setOpenRoomMenuId(openRoomMenuId === room.id ? null : room.id); }} className="p-1.5 text-gray-400 hover:text-gray-700 bg-white shadow-sm rounded-full border border-gray-100 focus:outline-none">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                    </button>
                                    {openRoomMenuId === room.id && (
                                        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-1 z-50">
                                            <button onClick={(e) => { e.stopPropagation(); handleChatAction(room.id, room.is_pinned ? 'unpin' : 'pin'); }} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-gray-700 flex items-center gap-2">
                                                {room.is_pinned ? 'Lepas Sematan' : 'Sematkan'}
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleChatAction(room.id, room.is_archived ? 'unarchive' : 'archive'); }} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-gray-700 flex items-center gap-2">
                                                {room.is_archived ? 'Batal Arsip' : 'Arsipkan'}
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleChatAction(room.id, room.is_blocked ? 'unblock' : 'block'); }} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-red-600 flex items-center gap-2">
                                                {room.is_blocked ? 'Buka Blokir' : 'Blokir'}
                                            </button>
                                            <div className="h-px bg-gray-100 my-1"></div>
                                            <button onClick={(e) => { e.stopPropagation(); handleChatAction(room.id, 'delete_history'); }} className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium">
                                                Hapus Obrolan
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-8 flex flex-col items-center">
                            <p className="text-gray-500 text-sm mb-4">{showArchived ? 'Belum ada obrolan yang diarsipkan.' : 'Belum ada obrolan.'}</p>
                            {!showArchived && currentUser?.role !== 'seeker' && <button onClick={() => setIsComposeOpen(true)} className="px-4 py-2 bg-purple-100 text-[#8100D1] text-xs font-bold rounded-full hover:bg-purple-200 transition">Mulai Percakapan Baru</button>}
                        </div>
                    )}
                </div>
            </div>

            {/* AREA OBROLAN */}
            <div className="flex-1 flex flex-col bg-gray-50/50 relative">
                {activeRoom ? (
                    <>
                        <div className="bg-white p-5 border-b border-gray-200 flex items-center gap-4 shadow-sm z-10">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-[#8100D1] overflow-hidden border border-purple-200">
                                {activeRoom.avatar_url ? <img src={activeRoom.avatar_url} className="w-full h-full object-cover" alt="" /> : activeRoom.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    {activeRoom.name}
                                    {onlineUsers.includes(activeRoom.id) && (
                                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block shadow-sm" title="Online"></span>
                                    )}
                                </h3>
                                <p className="text-xs text-[#8100D1] font-medium capitalize mt-0.5">
                                    {typingStatus[activeRoom.id] ? (
                                        <span className="flex items-center gap-1 text-purple-600 animate-pulse">Sedang mengetik<span className="flex gap-0.5"><span className="w-1 h-1 bg-purple-600 rounded-full"></span><span className="w-1 h-1 bg-purple-600 rounded-full animation-delay-200"></span><span className="w-1 h-1 bg-purple-600 rounded-full animation-delay-400"></span></span></span>
                                    ) : (
                                        activeRoom.role
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {isChatLoading ? (
                                <div className="text-center text-gray-400 text-sm py-10 animate-pulse">Memuat riwayat chat...</div>
                            ) : chatHistory.length === 0 ? (
                                <div className="text-center text-gray-400 text-sm py-10">Kirim pesan pertama Anda ke {activeRoom.name}.</div>
                            ) : (
                                chatHistory.map(chat => {
                                    const isMe = chat.from_user_id !== activeRoom.id;
                                    return (
                                        <div key={chat.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-4 items-center`}>
                                            {/* Tombol Hapus (Untuk Pengirim) */}
                                            {isMe && (
                                                <div className="relative mr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => setDeleteMenuId(deleteMenuId === chat.id ? null : chat.id)}
                                                        className="p-2 rounded-full bg-white shadow-md border border-gray-100 text-gray-400 hover:text-red-500 hover:scale-110 flex-shrink-0"
                                                        title="Hapus Pesan"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                    {deleteMenuId === chat.id && (
                                                        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-1 z-50">
                                                            <button onClick={() => handleDeleteMessage(chat.id, 'for_me')} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-gray-700">Hapus untuk Saya</button>
                                                            <button onClick={() => handleDeleteMessage(chat.id, 'for_everyone')} className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-red-600 font-medium">Hapus untuk Semua Orang</button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm shadow-sm leading-relaxed ${isMe ? 'bg-[#8100D1] text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'}`}>

                                                {/* --- RENDER MEDIA DI DALAM CHAT --- */}
                                                {chat.media_url && (
                                                    <div className={`mb-2 ${chat.konten ? 'pb-2 border-b border-opacity-20 ' + (isMe ? 'border-white' : 'border-gray-200') : ''}`}>
                                                        {chat.media_type === 'image' && <img src={chat.media_url} alt="Media" className="rounded-lg max-h-60 object-contain" />}
                                                        {chat.media_type === 'video' && <video src={chat.media_url} controls className="rounded-lg max-h-60" />}
                                                        {chat.media_type === 'file' && (
                                                            <a href={chat.media_url} target="_blank" rel="noreferrer" className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${isMe ? 'bg-purple-700/50 border-purple-500 hover:bg-purple-700/80' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                                                                <div className={`p-2 rounded-lg ${isMe ? 'bg-white/20 text-white' : 'bg-white text-[#8100D1] shadow-sm'}`}>
                                                                    {getFileIcon(chat.media_name || chat.media_url)}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className={`text-sm font-bold truncate ${isMe ? 'text-white' : 'text-gray-900'}`}>
                                                                        {chat.media_name || 'Lampiran File'}
                                                                    </div>
                                                                    <div className={`text-xs mt-0.5 ${isMe ? 'text-purple-200' : 'text-gray-500'}`}>
                                                                        Klik untuk mengunduh
                                                                    </div>
                                                                </div>
                                                            </a>
                                                        )}
                                                    </div>
                                                )}

                                                {/* --- RENDER APPOINTMENT --- */}
                                                {chat.appointment_date && (
                                                    <div className={`mb-2 p-4 rounded-xl border flex flex-col gap-3 ${isMe ? 'bg-purple-700/50 border-purple-500' : 'bg-blue-50 border-blue-200'}`}>
                                                        <div className="flex items-start gap-3">
                                                            <div className={`p-2 rounded-lg ${isMe ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'}`}>
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className={`text-sm font-bold ${isMe ? 'text-white' : 'text-gray-900'}`}>{chat.appointment_title || 'Undangan Jadwal / Pertemuan'}</div>
                                                                <div className={`text-xs mt-0.5 font-medium flex flex-wrap items-center gap-1 ${isMe ? 'text-purple-200' : 'text-gray-600'}`}>
                                                                    <span>{new Date(chat.appointment_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                                    <span>•</span>
                                                                    <span>Pukul: {new Date(chat.appointment_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')}</span>
                                                                </div>
                                                                
                                                                {chat.appointment_description && (
                                                                    <div className={`text-sm mt-3 p-3 rounded-lg leading-relaxed shadow-inner ${isMe ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                                                        {chat.appointment_description}
                                                                    </div>
                                                                )}
                                                                
                                                                {chat.appointment_link && (
                                                                    <a href={chat.appointment_link} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1.5 mt-3 text-xs font-bold transition-all px-3 py-1.5 rounded-full ${isMe ? 'bg-purple-800/40 text-purple-100 hover:bg-purple-800 hover:text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800'}`}>
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                                                        Buka Tautan (Link)
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Interactive Status Area */}
                                                        {(!chat.appointment_status || chat.appointment_status === 'pending') && (
                                                            <div className="mt-3 flex gap-2">
                                                                {!isMe ? (
                                                                    <>
                                                                        <button onClick={() => handleRespondAppointment(chat.id, 'accepted')} className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-md transform hover:scale-[1.02]">Terima</button>
                                                                        <button onClick={() => handleRespondAppointment(chat.id, 'declined')} className="flex-1 bg-[#F43F5E] hover:bg-[#E11D48] text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-md transform hover:scale-[1.02]">Tolak</button>
                                                                    </>
                                                                ) : (
                                                                    <div className="w-full text-center text-xs font-medium text-purple-200 bg-black/10 py-2 rounded-lg border border-purple-500/30 shadow-inner">Menunggu Konfirmasi</div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {chat.appointment_status === 'accepted' && (
                                                            <div className={`mt-2 w-full text-center text-xs font-bold py-2 rounded-lg shadow-inner ${isMe ? 'bg-green-500/20 text-green-200 border border-green-500/30' : 'bg-green-100 text-green-700 border border-green-200'}`}>Jadwal Disetujui</div>
                                                        )}
                                                        {chat.appointment_status === 'declined' && (
                                                            <div className={`mt-2 w-full text-center text-xs font-bold py-2 rounded-lg shadow-inner ${isMe ? 'bg-red-500/20 text-red-200 border border-red-500/30' : 'bg-red-100 text-red-700 border border-red-200'}`}>Jadwal Ditolak</div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Teks Pesan */}
                                                {chat.konten && <p>{chat.konten}</p>}
                                            </div>

                                            {/* Tombol Hapus (Untuk Penerima) */}
                                            {!isMe && (
                                                <div className="relative ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => setDeleteMenuId(deleteMenuId === chat.id ? null : chat.id)}
                                                        className="p-2 rounded-full bg-white shadow-md border border-gray-100 text-gray-400 hover:text-red-500 hover:scale-110 flex-shrink-0"
                                                        title="Hapus Pesan"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                    {deleteMenuId === chat.id && (
                                                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-36 bg-white border border-gray-100 shadow-xl rounded-xl py-1 z-50">
                                                            <button onClick={() => handleDeleteMessage(chat.id, 'for_me')} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-gray-700">Hapus untuk Saya</button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* --- PREVIEW CONTAINER --- */}
                        <div className="absolute bottom-[80px] left-0 right-0 px-6 flex flex-col gap-2 z-20 pointer-events-none">
                            {/* --- PREVIEW MEDIA SEBELUM DIKIRIM --- */}
                            {mediaPreview && (
                                <div className="bg-white border border-gray-200 shadow-lg rounded-xl p-3 flex items-center justify-between animate-fade-in-up pointer-events-auto">
                                    <div className="flex items-center gap-3">
                                        {mediaPreview.type === 'image' && <img src={mediaPreview.url} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />}
                                        {mediaPreview.type === 'video' && <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center"><svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg></div>}
                                        {mediaPreview.type === 'file' && <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center"><svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></div>}
                                        <div className="text-sm font-bold text-gray-700 truncate max-w-[200px]">{mediaPreview.name || 'Media siap dikirim'}</div>
                                    </div>
                                    <button type="button" onClick={cancelMedia} className="text-gray-400 hover:text-red-500 p-1">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            )}

                        </div>

                        {/* KOTAK INPUT (DENGAN TOMBOL ATTACHMENT & CALENDAR) */}
                        {activeRoom.is_blocked ? (
                            <div className="bg-white p-6 border-t border-gray-200 flex flex-col items-center justify-center text-center gap-2 relative z-10">
                                <p className="text-red-500 text-sm font-bold">Anda telah memblokir pengguna ini.</p>
                                <button onClick={() => handleChatAction(activeRoom.id, 'unblock')} className="text-xs text-[#8100D1] hover:underline font-bold">Buka Blokir</button>
                            </div>
                        ) : activeRoom.is_blocked_by_contact ? (
                            <div className="bg-white p-6 border-t border-gray-200 flex items-center justify-center text-center relative z-10">
                                <p className="text-gray-500 text-sm font-bold bg-gray-100 py-2 px-4 rounded-full">Anda tidak dapat mengirim pesan ke pengguna ini.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSendMessage} className="bg-white p-4 border-t border-gray-200 flex gap-3 items-center relative z-10">
                                {/* Tombol Attachment (Paperclip) */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2.5 text-gray-400 hover:text-[#8100D1] hover:bg-purple-50 rounded-full transition-colors focus:outline-none flex-shrink-0"
                                    title="Lampirkan File/Media"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                </button>

                                {/* Tombol Kalender (Appointment) */}
                                <button
                                    type="button"
                                    onClick={() => setIsAppointmentModalOpen(true)}
                                    className="p-2.5 text-gray-400 hover:text-[#8100D1] hover:bg-purple-50 rounded-full transition-colors focus:outline-none flex-shrink-0"
                                    title="Kirim Jadwal/Pertemuan"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </button>

                                {/* Tombol Emoji */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className={`p-2.5 rounded-full transition-colors focus:outline-none flex-shrink-0 ${showEmojiPicker ? 'text-[#8100D1] bg-purple-50' : 'text-gray-400 hover:text-[#8100D1] hover:bg-purple-50'}`}
                                        title="Pilih Emoticon"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </button>
                                    
                                    {showEmojiPicker && (
                                        <div className="absolute bottom-[50px] left-0 z-50 shadow-2xl rounded-2xl animate-fade-in-up">
                                            <EmojiPicker 
                                                onEmojiClick={(emojiObject) => setTypedMessage(prev => prev + emojiObject.emoji)}
                                                autoFocusSearch={false}
                                            />
                                        </div>
                                    )}
                                </div>

                                <textarea
                                    placeholder="Ketik pesan..."
                                    value={typedMessage}
                                    onChange={handleTypeMessage}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            if (typedMessage.trim() || attachments.length > 0) {
                                                handleSendMessage(e);
                                            }
                                        }
                                    }}
                                    rows="1"
                                    className="flex-1 border border-gray-300 rounded-xl px-5 py-3 text-sm focus:ring-2 focus:ring-[#8100D1] outline-none transition-all resize-none overflow-hidden"
                                    style={{ minHeight: '46px', maxHeight: '120px' }}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                />

                                <button type="submit" className="bg-[#8100D1] hover:bg-purple-800 text-white p-3 rounded-xl shadow-md transition-colors flex items-center justify-center focus:outline-none flex-shrink-0">
                                    <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9-7-9-7v14z" /></svg>
                                </button>
                            </form>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                        <div className="w-24 h-24 bg-purple-50 text-[#8100D1] rounded-full flex items-center justify-center mb-5 shadow-inner">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Ruang Obrolan LockER</h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto mt-2 leading-relaxed">Pilih salah satu kontak di sisi kiri, atau ketuk ikon pena di atas untuk mencari pengguna baru dan memulai obrolan.</p>
                    </div>
                )}
            </div>
        </div>
    );
}