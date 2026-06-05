import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

    const handleNotifClick = (notif) => {
        if (!notif.read_at) {
            handleMarkAsRead(notif.id);
        }
        if (notif.data && notif.data.action_url) {
            navigate(notif.data.action_url);
        }
        setIsNotifOpen(false);
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
                        {unreadCount > 0 && (
                            <button onClick={() => handleMarkAsRead()} className="text-xs text-[#8100D1] font-medium hover:underline">Tandai semua dibaca</button>
                        )}
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
                        {notifications.length === 0 ? (
                            <div className="text-center py-6 text-sm text-gray-500">Belum ada notifikasi</div>
                        ) : (
                            notifications.map(notif => (
                                <div 
                                    key={notif.id} 
                                    onClick={() => handleNotifClick(notif)}
                                    className={`p-3 text-sm cursor-pointer rounded-lg mb-1 transition-colors ${!notif.read_at ? 'bg-purple-50 hover:bg-purple-100' : 'hover:bg-gray-50'}`}
                                >
                                    <p className={`text-gray-800 ${!notif.read_at ? 'font-semibold' : ''}`}>{notif.data?.message || 'Notifikasi baru'}</p>
                                    <span className="text-xs text-gray-400 mt-1 block">{new Date(notif.created_at).toLocaleDateString()}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
