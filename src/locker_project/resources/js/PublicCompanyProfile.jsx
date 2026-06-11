import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import JobDetailsModal from './components/JobDetailsModal';
import { useTranslation } from 'react-i18next';

export default function PublicCompanyProfile({ userData }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('tentang');
    const [recentJobs, setRecentJobs] = useState([]);
    const [isJobsLoading, setIsJobsLoading] = useState(false);
    
    // Follow State
    const [isFollowing, setIsFollowing] = useState(userData.is_following || false);
    const [followerCount, setFollowerCount] = useState(userData.follower_count || 0);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    // Job Modal State
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    // Sinkronisasi data awal (jika berubah dari prop)
    useEffect(() => {
        setIsFollowing(userData.is_following || false);
        setFollowerCount(userData.follower_count || 0);
    }, [userData]);

    const fetchCompanyJobs = async () => {
        setIsJobsLoading(true);
        try {
            const response = await axios.get('/api/jobs');
            // Filter jobs yang perusahaannya sesuai dengan user_id ini
            const companyJobs = response.data.filter(job => job.company_user_id === userData.id);
            setRecentJobs(companyJobs);
        } catch (error) {
            console.error("Gagal mengambil lowongan perusahaan", error);
        } finally {
            setIsJobsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'lowongan') {
            fetchCompanyJobs();
        }
    }, [activeTab]);

    const handleToggleFollow = async () => {
        setIsFollowLoading(true);
        try {
            const response = await axios.post(`/api/companies/${userData.id}/follow`);
            setIsFollowing(response.data.is_following);
            setFollowerCount(response.data.follower_count);
        } catch (error) {
            console.error("Gagal follow/unfollow perusahaan", error);
            if (error.response?.status === 401) {
                alert(t('company.login_to_follow'));
            }
        } finally {
            setIsFollowLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-12 relative overflow-x-hidden">
            {/* --- HEADER NAV --- */}
            <div className="sticky top-0 z-[60] bg-white border-b border-gray-200 flex items-center gap-4 px-4 sm:px-6 h-16 w-full">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:text-[#8100D1] transition-colors rounded-full hover:bg-purple-50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <span className="text-xl font-black text-[#8100D1] tracking-tight">LockER</span>
            </div>

            <main className="max-w-[900px] mx-auto w-full pt-6 px-4 pb-20 flex flex-col gap-6">
                
                {/* Job Details Modal */}
                <JobDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => { setIsDetailsModalOpen(false); setSelectedJob(null); }}
                    job={selectedJob}
                    onSuccess={() => {}} // dummy success handler
                />

                {/* --- KARTU PROFIL UTAMA (LOCKER STYLE) --- */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative">
                    {/* Banner Image */}
                    <div className="h-[180px] sm:h-[220px] w-full bg-gradient-to-r from-purple-500 to-[#8100D1] relative">
                        {userData.banner_url && (
                            <img src={userData.banner_url} alt="Banner" className="w-full h-full object-cover opacity-90" />
                        )}
                        <div className="absolute inset-0 bg-black/10"></div>
                    </div>

                    {/* Konten Profil Inti */}
                    <div className="px-6 sm:px-8 pb-8 relative">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4">
                            {/* Avatar */}
                            <div className="relative z-10 -mt-[60px] sm:-mt-[70px] mb-4 sm:mb-0">
                                <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-2xl bg-white p-1.5 shadow-md border border-gray-100">
                                    <div className="w-full h-full bg-gray-50 flex justify-center items-center overflow-hidden rounded-xl border border-gray-100">
                                        {userData.avatar_url ? (
                                            <img src={userData.avatar_url} alt="Profile" className="w-full h-full object-contain bg-white" />
                                        ) : (
                                            <span className="text-5xl text-[#8100D1] font-black">{userData.name?.charAt(0)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons (Follow) */}
                            <div className="flex gap-2 self-end">
                                <button 
                                    onClick={handleToggleFollow}
                                    disabled={isFollowLoading}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold transition shadow-sm border ${
                                        isFollowing 
                                            ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200' 
                                            : 'bg-[#8100D1] text-white border-transparent hover:bg-purple-800'
                                    } ${isFollowLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isFollowLoading ? (
                                        <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : isFollowing ? (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                                    )}
                                    {isFollowing ? t('company.following') : t('company.follow')}
                                </button>
                            </div>
                        </div>

                        {/* Detail Teks */}
                        <div className="mt-2">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2 leading-tight">
                                {userData.name}
                                <span className="bg-green-100 text-green-700 p-1 rounded-full" title="Verified Company">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                </span>
                            </h1>
                            <p className="text-lg text-gray-600 mt-1.5 font-medium">
                                {userData.headline || t('company.industry')}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {userData.location || t('company.location_not_set')}
                                </div>
                                {userData.employee_count && (
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        {userData.employee_count}
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    <span className="font-semibold text-gray-700">{followerCount?.toLocaleString() || 0}</span> {t('company.followers')}
                                </div>
                            </div>
                        </div>

                        {/* Interactive Buttons */}
                        <div className="pb-6 flex flex-wrap gap-3 border-b border-gray-100 mt-6">
                            {userData.website_url && (
                                <a href={userData.website_url} target="_blank" rel="noopener noreferrer" className="bg-purple-50 text-[#8100D1] hover:bg-purple-100 border border-purple-100 px-6 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2">
                                    {t('company.visit_website')}
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            )}
                        </div>

                        {/* LockER Custom Tabs */}
                        <div className="pt-2">
                            <div className="flex gap-6 overflow-x-auto no-scrollbar">
                                {[
                                    { id: 'tentang', label: t('company.tab_about') },
                                    { id: 'lowongan', label: t('company.tab_jobs') }
                                ].map(tab => (
                                    <button 
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-3 text-sm font-bold whitespace-nowrap transition-all relative outline-none ${activeTab === tab.id ? 'text-[#8100D1]' : 'text-gray-500 hover:text-gray-800'}`}
                                    >
                                        {tab.label}
                                        {activeTab === tab.id && (
                                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#8100D1] rounded-t-md"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- TAB CONTENT AREA --- */}
                <div className="space-y-6">
                    {/* TAB TENTANG */}
                    {activeTab === 'tentang' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8 animate-fade-in-up">
                            <h2 className="text-xl font-extrabold text-gray-900 mb-5">{t('company.overview')}</h2>
                            {userData.description ? (
                                <div className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {userData.description}
                                </div>
                            ) : (
                                <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                                    <p className="text-gray-500 font-medium">{t('company.no_description')}</p>
                                </div>
                            )}
                            
                            {(userData.website_url || userData.employee_count || userData.npwp) && (
                                <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                    {userData.website_url && (
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 mb-1">{t('company.website')}</p>
                                            <a href={userData.website_url} target="_blank" rel="noopener noreferrer" className="text-[#8100D1] hover:underline text-sm break-all font-medium">{userData.website_url}</a>
                                        </div>
                                    )}
                                    {userData.employee_count && (
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 mb-1">{t('company.company_size')}</p>
                                            <p className="text-sm text-gray-600">{userData.employee_count}</p>
                                        </div>
                                    )}
                                    {userData.npwp && (
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 mb-1">{t('company.npwp')}</p>
                                            <p className="text-sm text-gray-600">{userData.npwp}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB LOWONGAN */}
                    {activeTab === 'lowongan' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8 animate-fade-in-up">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-extrabold text-gray-900">{t('company.open_jobs')}</h2>
                                <span className="bg-purple-100 text-[#8100D1] text-xs font-bold px-3 py-1 rounded-full">{recentJobs.length} {t('company.jobs_count')}</span>
                            </div>
                            
                            {isJobsLoading ? (
                                <div className="py-10 flex justify-center">
                                    <div className="w-8 h-8 border-4 border-gray-200 border-t-[#8100D1] rounded-full animate-spin"></div>
                                </div>
                            ) : recentJobs.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {recentJobs.map(job => (
                                        <div 
                                            key={job.id} 
                                            onClick={() => {
                                                setSelectedJob(job);
                                                setIsDetailsModalOpen(true);
                                            }} 
                                            className="border border-gray-200 rounded-2xl p-5 cursor-pointer hover:shadow-md hover:border-[#8100D1]/30 transition group bg-white"
                                        >
                                            <div className="flex gap-4">
                                                <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
                                                    {userData.avatar_url ? <img src={userData.avatar_url} alt="Logo" className="w-full h-full object-contain" /> : <div className="w-full h-full bg-gray-200 rounded-lg"></div>}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-900 group-hover:text-[#8100D1] transition line-clamp-1">{job.role}</h3>
                                                    <p className="text-[13px] text-gray-500 mt-1 flex items-center gap-1.5">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                        {job.location}
                                                    </p>
                                                    <div className="mt-3 flex gap-2">
                                                        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-md">{job.type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <h3 className="text-gray-900 font-bold mb-1">{t('company.no_jobs_title')}</h3>
                                    <p className="text-gray-500 text-sm">{t('company.no_jobs_desc')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
