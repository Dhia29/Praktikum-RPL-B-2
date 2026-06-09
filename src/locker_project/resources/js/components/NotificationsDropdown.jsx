import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Internal component for swipeable list item
const SwipeableNotificationItem = ({ notif, onClick, onDelete, timeAgo }) => {
    const [translateX, setTranslateX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startXRef = useRef(null);

    const handleTouchStart = (e) => {
        startXRef.current = e.touches[0].clientX;
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!startXRef.current) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - startXRef.current;
        // Only allow swiping left (negative diff)
        if (diff < 0 && diff > -100) {
            setTranslateX(diff);
        } else if (diff <= -100) {
            setTranslateX(-100);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        if (translateX <= -50) {
            // Delete threshold reached
            setTranslateX(-100); // lock open
            onDelete(notif.id);
        } else {
            // Revert
            setTranslateX(0);
        }
        startXRef.current = null;
    };

    return (
        <div className="relative border-b border-gray-50 overflow-hidden group">
            {/* Background Delete Button */}
            <div className="absolute inset-y-0 right-0 w-[100px] bg-red-500 flex flex-col items-center justify-center text-white cursor-pointer"
                onClick={() => onDelete(notif.id)}>
                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="text-[10px] font-medium">Hapus</span>
            </div>

            {/* Foreground Content */}
            <div
                className={`relative p-4 pl-5 cursor-pointer transition-transform duration-200 bg-white
                    ${!notif.read_at ? 'hover:bg-[#fcf8ff]' : 'hover:bg-gray-50'} 
                    ${isDragging ? 'duration-0' : ''}`}
                style={{ transform: `translateX(${translateX}px)` }}
                onClick={(e) => {
                    // Prevent triggering click if user was just swiping
                    if (translateX === 0) onClick(notif);
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Unread Indicator Line */}
                {!notif.read_at && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8100D1]"></div>
                )}

                {/* Desktop hover delete button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hidden sm:block"
                    title="Hapus"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>

                <div className="flex items-center gap-2 pr-6">
                    <p className={`text-sm tracking-tight ${!notif.read_at ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium'}`}>
                        {notif.data?.title || (notif.data?.message ? 'Pesan Baru' : 'Notifikasi')}
                    </p>
                    {!notif.read_at && (
                        <span className="w-1.5 h-1.5 bg-[#8100D1] rounded-full"></span>
                    )}
                </div>
                <p className={`text-xs mt-1 line-clamp-2 pr-4 ${!notif.read_at ? 'text-gray-600' : 'text-gray-400'}`}>
                    {notif.data?.message || 'Anda memiliki notifikasi baru.'}
                </p>
                <p className={`text-[11px] mt-2.5 ${!notif.read_at ? 'text-[#8100D1] font-semibold' : 'text-gray-400 font-medium'}`}>
                    {timeAgo(notif.created_at)}
                </p>
            </div>
        </div>
    );
};
export default function NotificationsDropdown() {
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = () => {
        axios.get('/api/notifications')
            .then(res => {
                setNotifications(res.data.notifications || []);
                setUnreadCount(res.data.unread_count || 0);
            })
            .catch(err => console.error("Gagal memuat notifikasi", err));
    };

    const handleMarkAsRead = (id = null) => {
        axios.post('/api/notifications/mark-as-read', { id }).then(() => {
            fetchNotifications();
        });
    };

    const handleDelete = (id) => {
        // Optimistic UI update
        setNotifications(prev => prev.filter(n => n.id !== id));
        axios.delete(`/api/notifications/${id}`)
            .then(() => fetchNotifications())
            .catch(err => console.error("Gagal menghapus notifikasi", err));
    };

    const handleNotifClick = (notif) => {
        if (!notif.read_at) {
            handleMarkAsRead(notif.id);
        }

        setIsNotifOpen(false);

        const type = notif.type || '';

        // Admin routes
        if (type.includes('NewReportNotification')) {
            navigate('/admin/community');
        }
        // User routes
        else if (type.includes('PostRepliedNotification') || type.includes('PostLikedNotification')) {
            navigate('/komunitas');
        } else if (type.includes('TicketRepliedNotification')) {
            // Can open support modal, but we just trigger a read
        } else if (type.includes('MessageReceivedNotification')) {
            navigate('/pesan');
        } else if (notif.data && notif.data.action_url) {
            navigate(notif.data.action_url);
        }
    };

    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        if (seconds < 60) return "Baru saja";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} menit yang lalu`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} jam yang lalu`;
        const days = Math.floor(hours / 24);
        return `${days} hari yang lalu`;
    };

    return (
        <div className="relative" ref={notifRef}>
            <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-[#8100D1] hover:bg-purple-50 transition-colors focus:outline-none"
                title="Notifikasi"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isNotifOpen && (
                <div className="absolute right-0 top-12 mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-xl z-50 animate-fade-in-down overflow-hidden flex flex-col max-h-96">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-800 text-sm">Notifikasi</h3>
                    </div>
                    <div className="overflow-y-auto flex-1 p-0 overflow-x-hidden">
                        {notifications.length === 0 ? (
                            <div className="p-8 flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                </div>
                                <p className="text-gray-500 text-sm">Belum ada notifikasi baru.</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <SwipeableNotificationItem
                                    key={notif.id}
                                    notif={notif}
                                    onClick={handleNotifClick}
                                    onDelete={handleDelete}
                                    timeAgo={timeAgo}
                                />
                            ))
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center flex justify-between items-center">
                            <button onClick={() => setIsNotifOpen(false)} className="text-xs font-semibold text-gray-600 hover:text-black">
                                Tutup
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
