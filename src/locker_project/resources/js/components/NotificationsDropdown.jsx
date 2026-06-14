import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

// Internal component for swipeable list item
const SwipeableNotificationItem = ({ notif, onClick, onDelete, timeAgo, t }) => {
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
        <div className="relative border-b border-gray-100/50 dark:border-slate-800/50 overflow-hidden group">
            {/* Background Delete Button */}
            <div className={`absolute inset-y-0 right-0 w-[100px] flex flex-col items-center justify-center text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/20 cursor-pointer transition-opacity duration-300 ${translateX < 0 ? 'opacity-100' : 'opacity-0'}`}
                onClick={() => onDelete(notif.id)}>
                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="text-[10px] font-bold tracking-wide">{t('notifications.delete')}</span>
            </div>

            {/* Foreground Content */}
            <div
                className={`relative p-4 pl-5 cursor-pointer transition-all duration-300 bg-white dark:bg-[#0f1523]
                    ${!notif.read_at ? 'hover:bg-purple-50 dark:hover:bg-[#1a1f35]' : 'hover:bg-gray-50 dark:hover:bg-[#161d2b]'} 
                    ${isDragging ? 'duration-0 shadow-[-5px_0_15px_rgba(0,0,0,0.1)] dark:shadow-[-5px_0_15px_rgba(0,0,0,0.3)]' : ''}`}
                style={{ transform: `translateX(${translateX}px)` }}
                onClick={(e) => {
                    if (translateX === 0) onClick(notif);
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Unread Indicator Line */}
                {!notif.read_at && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 group-hover:w-1.5 bg-gradient-to-b from-[#8100D1] to-purple-500 shadow-[0_0_8px_rgba(129,0,209,0.5)] group-hover:shadow-[0_0_12px_rgba(129,0,209,0.8)] transition-all duration-300"></div>
                )}
                {/* Read Indicator Line (Hover only) */}
                {notif.read_at && (
                    <div className="absolute left-0 top-0 bottom-0 w-0 group-hover:w-1 bg-gray-200 dark:bg-slate-700 transition-all duration-300"></div>
                )}

                {/* Desktop hover delete button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
                    className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-full opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 hidden sm:block"
                    title={t('notifications.delete')}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>

                <div className="flex items-center gap-2 pr-6">
                    <p className={`text-sm tracking-tight ${!notif.read_at ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-600 dark:text-gray-400 font-medium'}`}>
                        {notif.data?.title || (notif.data?.message ? t('notifications.new_message') : t('notifications.title'))}
                    </p>
                    {!notif.read_at && (
                        <span className="w-1.5 h-1.5 bg-[#8100D1] dark:bg-[#c682ff] shadow-[0_0_5px_rgba(129,0,209,0.8)] rounded-full"></span>
                    )}
                </div>
                <p className={`text-xs mt-1 line-clamp-2 pr-4 ${!notif.read_at ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                    {notif.data?.message || t('notifications.default_message')}
                </p>
                <p className={`text-[11px] mt-2.5 ${!notif.read_at ? 'text-[#8100D1] dark:text-[#c682ff] font-semibold' : 'text-gray-400 dark:text-gray-500 font-medium'}`}>
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
    const { t } = useTranslation();

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
            .catch(err => console.error("Failed to load notifications", err));
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
            .catch(err => console.error("Failed to delete notification", err));
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
        if (seconds < 60) return t('notifications.just_now');
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return t('notifications.minutes_ago', { count: minutes });
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return t('notifications.hours_ago', { count: hours });
        const days = Math.floor(hours / 24);
        return t('notifications.days_ago', { count: days });
    };

    return (
        <div className="relative" ref={notifRef}>
            <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-[#8100D1] dark:hover:text-[#c682ff] hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-full transition-all focus:outline-none"
                title={t('notifications.title')}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-br from-red-500 to-pink-600 border border-white dark:border-slate-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isNotifOpen && (
                <div className="absolute right-0 top-12 mt-2 w-80 bg-white/90 dark:bg-[#0B0F19]/90 border border-gray-200/50 dark:border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_0_20px_rgba(255,255,255,0.05)] z-50 animate-fade-in-down overflow-hidden flex flex-col max-h-[28rem] backdrop-blur-2xl">
                    <div className="px-5 py-3.5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02] backdrop-blur-md">
                        <h3 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8100D1] to-indigo-600 dark:from-[#c682ff] dark:to-indigo-400 text-sm">{t('notifications.title')}</h3>
                    </div>
                    <div className="overflow-y-auto flex-1 p-0 overflow-x-hidden divide-y divide-gray-50/50 dark:divide-slate-800/50">
                        {notifications.length === 0 ? (
                            <div className="p-10 flex flex-col items-center justify-center text-center">
                                <div className="w-14 h-14 rounded-full bg-gray-50 dark:bg-slate-800/50 flex items-center justify-center mb-4 border border-gray-100 dark:border-slate-700/50">
                                    <svg className="w-7 h-7 text-gray-300 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('notifications.empty')}</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <SwipeableNotificationItem
                                    key={notif.id}
                                    notif={notif}
                                    onClick={handleNotifClick}
                                    onDelete={handleDelete}
                                    timeAgo={timeAgo}
                                    t={t}
                                />
                            ))
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <div className="p-3 bg-gray-50/50 dark:bg-white/[0.01] border-t border-gray-100 dark:border-white/5 text-center flex justify-between items-center backdrop-blur-md">
                            <button onClick={() => setIsNotifOpen(false)} className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors w-full text-center">
                                {t('notifications.close')}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
