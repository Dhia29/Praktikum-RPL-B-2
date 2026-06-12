import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function HeaderAdmin({ title, adminUser }) {
    const { t } = useTranslation();
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef(null);

    useEffect(() => {
        if (adminUser?.id) {
            fetchNotifications();
        }
    }, [adminUser]);

    useEffect(() => {
        if (!adminUser?.id) return;

        const channel = window.Echo.private(`App.Models.User.${adminUser.id}`);

        channel.notification((notification) => {
            const newNotif = {
                id: notification.id || Date.now().toString(),
                type: notification.type,
                data: notification,
                created_at: new Date().toISOString(),
                read_at: null
            };
            setNotifications(prev => {
                if (prev.some(n => n.id === newNotif.id)) return prev;
                return [newNotif, ...prev];
            });
            setUnreadCount(prev => prev + 1);
        });

        return () => {};
    }, [adminUser]);

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
            .catch(() => {});
    };

    const handleMarkAllRead = () => {
        axios.post('/api/notifications/mark-as-read', {}).then(() => {
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            setUnreadCount(0);
        });
    };

    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        if (seconds < 60) return t('admin.header.time_just_now');
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return t('admin.header.time_minutes', { count: minutes });
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return t('admin.header.time_hours', { count: hours });
        const days = Math.floor(hours / 24);
        return t('admin.header.time_days', { count: days });
    };

    return (
        <header className="h-20 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 flex items-center justify-between px-6 z-10 sticky top-0 flex-shrink-0 transition-colors duration-500 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{title || t('admin.layout.overview')}</h2>
            </div>
            
            <div className="flex items-center gap-6">
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className="relative w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-[#8100D1] hover:bg-purple-50 transition-colors focus:outline-none"
                        title={t('admin.header.notif_title')}
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
                        <div className="absolute right-0 top-12 mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-96">
                            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-gray-800 text-sm">{t('admin.header.notif_title')}</h3>
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllRead} className="text-xs text-[#8100D1] font-medium hover:underline">{t('admin.header.mark_all')}</button>
                                )}
                            </div>
                            <div className="overflow-y-auto flex-1 p-0">
                                {notifications.length === 0 ? (
                                    <div className="p-8 flex flex-col items-center justify-center text-center">
                                        <p className="text-gray-500 text-sm">{t('admin.header.no_notif')}</p>
                                    </div>
                                ) : (
                                    notifications.slice(0, 15).map(notif => (
                                        <div 
                                            key={notif.id}
                                            className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${!notif.read_at ? 'bg-purple-50/30 hover:bg-purple-50/50' : 'hover:bg-gray-50'}`}
                                        >
                                            <p className={`text-sm text-gray-800 ${!notif.read_at ? 'font-semibold' : 'font-medium'}`}>
                                                {notif.data?.title || t('admin.header.notif_default_title')}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                {notif.data?.message || t('admin.header.notif_default_msg')}
                                            </p>
                                            <p className="text-[11px] text-gray-400 mt-2">
                                                {timeAgo(notif.created_at)}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 border-l border-gray-200 dark:border-slate-700 pl-4">
                    <span className="text-gray-700 dark:text-gray-200 font-medium text-sm hidden sm:block">
                        Hi, {adminUser?.name || 'Administrator'}
                    </span>
                    <button className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-[#8100D1] font-bold border border-purple-200 hover:ring-2 hover:ring-purple-300 transition-all focus:outline-none">
                        {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
                    </button>
                </div>
            </div>
        </header>
    );
}
