import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function CommunityReportsIndexAdmin() {
    const { t } = useTranslation();
    const { adminUser } = useOutletContext() || {};
    const [activeTab, setActiveTab] = useState('live_posts'); // 'live_posts' or 'reports'
    const [reports, setReports] = useState([]);
    const [posts, setPosts] = useState([]);
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

    const fetchLivePosts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/community/posts/all');
            setPosts(response.data.posts || []);
        } catch (error) {
            console.error("Failed to fetch live posts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'reports') {
            fetchReports();
        } else {
            fetchLivePosts();
        }
    }, [activeTab]);

    // WebSocket: Auto-refresh when new report arrives
    useEffect(() => {
        if (!adminUser?.id) return;

        const channel = window.Echo.private('admin.notifications');
        
        channel.listen('AdminDashboardUpdated', (e) => {
            if (e.type === 'new_report') {
                fetchReports();
                fetchLivePosts();
            }
        });

        return () => {};
    }, [adminUser]);

    const handleDeletePost = async (postId) => {
        if (!window.confirm(t('admin.community.confirm_delete_post'))) return;
        
        try {
            await axios.delete(`/api/admin/community/reports/${postId}/post`);
            alert(t('admin.community.alert_delete_success'));
            if (activeTab === 'reports') {
                fetchReports();
            } else {
                fetchLivePosts();
            }
        } catch (error) {
            alert(t('admin.community.alert_delete_fail'));
        }
    };

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
                    <h3 className="text-lg font-bold text-gray-800">{t('admin.community.title')}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t('admin.community.desc')}</p>
                </div>
                
                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('live_posts')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'live_posts' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {t('admin.community.tab_live')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('reports')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'reports' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {t('admin.community.tab_reports')}
                    </button>
                </div>
            </div>

            {activeTab === 'reports' && (
                <div className="px-6 py-4 border-b border-gray-100 flex justify-end">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#8100D1] focus:border-[#8100D1] block px-3 py-2 outline-none"
                    >
                        <option value="all">{t('admin.community.filter_all')}</option>
                        <option value="pending">Pending</option>
                        <option value="under_review">Under Review</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                            {activeTab === 'reports' ? (
                                <>
                                    <th className="p-4 border-b border-gray-100">{t('admin.community.reports_col_id')}</th>
                                    <th className="p-4 border-b border-gray-100">{t('admin.community.reports_col_reporter')}</th>
                                    <th className="p-4 border-b border-gray-100">{t('admin.community.reports_col_owner')}</th>
                                    <th className="p-4 border-b border-gray-100">{t('admin.community.reports_col_date')}</th>
                                    <th className="p-4 border-b border-gray-100">{t('admin.community.reports_col_status')}</th>
                                    <th className="p-4 border-b border-gray-100 text-right">{t('admin.community.reports_col_action')}</th>
                                </>
                            ) : (
                                <>
                                    <th className="p-4 border-b border-gray-100 w-[40%]">{t('admin.community.posts_col_content')}</th>
                                    <th className="p-4 border-b border-gray-100">{t('admin.community.posts_col_owner')}</th>
                                    <th className="p-4 border-b border-gray-100">{t('admin.community.posts_col_location')}</th>
                                    <th className="p-4 border-b border-gray-100 text-center">{t('admin.community.posts_col_reports')}</th>
                                    <th className="p-4 border-b border-gray-100">{t('admin.community.posts_col_time')}</th>
                                    <th className="p-4 border-b border-gray-100 text-right">{t('admin.community.posts_col_action')}</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">{t('admin.community.loading')}</td>
                            </tr>
                        ) : activeTab === 'reports' ? (
                            filteredReports.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">{t('admin.community.reports_empty')}</td>
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
                                        <td className="p-4 text-right flex items-center justify-end gap-2">
                                            <Link to={`/community/reports/${report.id}`} className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                                {t('admin.community.reports_detail')}
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )
                        ) : (
                            posts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">{t('admin.community.posts_empty')}</td>
                                </tr>
                            ) : (
                                posts.map(post => (
                                    <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <p className="text-gray-800 text-sm line-clamp-2 mb-1">{post.konten}</p>
                                            {post.media_url && (
                                                <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">{t('admin.community.posts_has_media', { type: post.media_type })}</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-800">{post.user_email || 'Deleted User'}</span>
                                                <span className="text-xs text-gray-500 uppercase">{post.user_role}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {post.community_id ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 truncate max-w-[120px]">
                                                    {post.community_name}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                                    Global
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {post.report_count > 0 ? (
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-xs">
                                                    {post.report_count}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-500 whitespace-nowrap text-xs">
                                            {formatDate(post.created_at)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => handleDeletePost(post.id)}
                                                className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                                            >
                                                {t('admin.community.posts_delete')}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
