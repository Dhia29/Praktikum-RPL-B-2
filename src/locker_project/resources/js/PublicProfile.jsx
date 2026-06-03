import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function PublicProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`/api/profile/${id}`);
                setUserData(response.data);
            } catch (error) {
                console.error("Error fetching public profile:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    // --- UTILITY URL HELPERS ---
    const getWaUrl = (num) => num ? `https://wa.me/${num.replace(/[^0-9]/g, '')}` : null;
    const getInstaUrl = (user) => user ? `https://instagram.com/${user.trim().replace('@', '')}` : null;
    const getFbUrl = (url) => {
        if (!url) return null;
        let clean = url.trim();
        if (clean.startsWith('http')) return clean;
        return `https://facebook.com/${clean}`;
    };
    const getGithubUrl = (user) => user ? `https://github.com/${user.trim().replace('@', '')}` : null;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8100D1]"></div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Profil Tidak Ditemukan</h2>
                <button onClick={() => navigate(-1)} className="px-6 py-2 bg-[#8100D1] text-white rounded-lg hover:bg-purple-800 transition">
                    Kembali
                </button>
            </div>
        );
    }

    const hasContactInfo = userData.wa_number || userData.insta_username || userData.facebook_url || userData.github_username;

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-12 relative overflow-x-hidden">

            {/* --- MODAL POP-UP INFORMASI KONTAK (Read Only) --- */}
            {isContactModalOpen && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col relative">
                        <div className="flex justify-between items-center p-5 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">{userData.name}</h3>
                            <button onClick={() => setIsContactModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="overflow-y-auto p-6 md:p-8 flex-1">
                            <div className="space-y-4">
                                {/* WHATSAPP */}
                                <a href={getWaUrl(userData.wa_number)} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-4 group cursor-pointer ${!userData.wa_number ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className={`p-3 rounded-lg transition ${userData.wa_number ? 'bg-green-50 text-green-600 group-hover:bg-green-100' : 'bg-gray-100 text-gray-400'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.115.548 4.187 1.591 6.008l-1.57 5.733 5.86-1.538a11.953 11.953 0 006.15 1.696h.004c6.645 0 12.03-5.385 12.03-12.03S18.676 0 12.031 0z" /></svg></div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-semibold transition ${userData.wa_number ? 'text-gray-900 group-hover:text-green-700' : 'text-gray-500'}`}>WhatsApp</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{userData.wa_number ? `+${userData.wa_number}` : 'Belum diatur'}</p>
                                    </div>
                                </a>

                                {/* INSTAGRAM */}
                                <a href={getInstaUrl(userData.insta_username)} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-4 group cursor-pointer ${!userData.insta_username ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className={`p-3 rounded-lg transition ${userData.insta_username ? 'bg-purple-50 text-purple-600 group-hover:bg-purple-100' : 'bg-gray-100 text-gray-400'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.919-.058-1.265-.069-1.646-.069-4.849 0-3.204.013-3.583.069-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.668-.072-4.948-.197-4.347-2.633-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4.162 4.162 0 110-8.324A4.162 4.162 0 0112 16zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg></div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-semibold transition ${userData.insta_username ? 'text-gray-900 group-hover:text-purple-700' : 'text-gray-500'}`}>Instagram</p>
                                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[180px]">{userData.insta_username ? `@${userData.insta_username}` : 'Belum diatur'}</p>
                                    </div>
                                </a>

                                {/* FACEBOOK */}
                                <a href={getFbUrl(userData.facebook_url)} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-4 group cursor-pointer ${!userData.facebook_url ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className={`p-3 rounded-lg transition ${userData.facebook_url ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' : 'bg-gray-100 text-gray-400'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.128 22 16.991 22 12z" /></svg></div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-semibold transition ${userData.facebook_url ? 'text-gray-900 group-hover:text-blue-700' : 'text-gray-500'}`}>Facebook</p>
                                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[180px]">{userData.facebook_url ? 'Sudah Terhubung' : 'Belum diatur'}</p>
                                    </div>
                                </a>

                                {/* GITHUB */}
                                <a href={getGithubUrl(userData.github_username)} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-4 group cursor-pointer ${!userData.github_username ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className={`p-3 rounded-lg transition ${userData.github_username ? 'bg-gray-100 text-gray-800 group-hover:bg-gray-200' : 'bg-gray-100 text-gray-400'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg></div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-semibold transition ${userData.github_username ? 'text-gray-900 group-hover:text-gray-800' : 'text-gray-500'}`}>GitHub Open Source</p>
                                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[180px]">{userData.github_username ? `@${userData.github_username}` : 'Belum diatur'}</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* HEADER NAVIGASI */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:text-[#8100D1] hover:bg-purple-50 rounded-full transition-all focus:outline-none"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
                        <h1 className="text-2xl font-extrabold text-[#8100D1] tracking-tight">LockER</h1>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
                {/* BIO CARD */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
                    <div className="relative h-40 sm:h-56 bg-gray-200">
                        {userData.banner_url ? (<img src={userData.banner_url} alt="Banner" className="w-full h-full object-cover" />) : (<div className="w-full h-full bg-gradient-to-r from-[#9a30db] via-[#8100D1] to-[#4b0082]"></div>)}
                    </div>

                    <div className="px-6 sm:px-8 pb-8 relative">
                        <div className="relative inline-block -mt-16 sm:-mt-24 mb-4">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full p-1.5 shadow-md relative">
                                <div className="w-full h-full bg-purple-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
                                    {userData.avatar_url ? (<img src={userData.avatar_url} alt="Profile" className="w-full h-full object-cover" />) : (<span className="text-5xl sm:text-7xl font-extrabold text-[#8100D1]">{userData.name ? userData.name.charAt(0).toUpperCase() : '?'}</span>)}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mt-2">
                            <div className="flex-1">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{userData.name}</h1>
                                <p className="text-base sm:text-lg text-gray-800 mt-1.5 font-medium">{userData.headline || 'Belum ada headline'}</p>
                                <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
                                    {userData.location || 'Lokasi belum diatur'}
                                    {hasContactInfo && (
                                        <>
                                            <span className="mx-1">•</span>
                                            <button onClick={() => setIsContactModalOpen(true)} className="text-[#8100D1] font-semibold hover:underline focus:outline-none">Informasi kontak</button>
                                        </>
                                    )}
                                </p>
                            </div>

                            <div className="md:w-72 flex flex-col gap-3">
                                <div className="flex items-start gap-3 group"><div className="w-8 h-8 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></div><p className="text-sm font-semibold text-gray-800 transition leading-tight group-hover:text-[#8100D1]">{userData.current_position || 'Belum ada jabatan'}</p></div>
                                <div className="flex items-start gap-3 group"><div className="w-8 h-8 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v6" /></svg></div><p className="text-sm font-semibold text-gray-800 transition leading-tight group-hover:text-[#8100D1]">{userData.education || 'Belum ada instansi'}</p></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PENGALAMAN CARD */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Pengalaman</h2>
                    </div>
                    <div className="p-6">
                        {(!userData.experiences || userData.experiences.filter(exp => exp && exp.title).length === 0) ? (
                            <p className="text-gray-500 text-sm">Belum ada pengalaman yang ditambahkan.</p>
                        ) : (
                            <div className="space-y-6">
                                {userData.experiences.filter(exp => exp && exp.title).map((exp, index, arr) => (
                                    <div key={exp.id || index} className={`flex gap-4 ${index !== arr.length - 1 ? 'border-b border-gray-100 pb-6' : ''}`}>
                                        <div className="w-12 h-12 bg-gray-100 flex-shrink-0 flex items-center justify-center rounded-lg">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div className="flex-1">
                                            <div>
                                                <h3 className="font-bold text-gray-900">{exp.title}</h3>
                                                <p className="text-sm text-gray-800">{exp.company_name}</p>
                                                <p className="text-xs text-gray-500 mt-1">{exp.start_date} - {exp.end_date || 'Saat ini'} • {exp.location}</p>
                                            </div>
                                            {exp.description && <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">{exp.description}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* PENDIDIKAN CARD */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Pendidikan</h2>
                    </div>
                    <div className="p-6">
                        {(!userData.educations || userData.educations.filter(edu => edu && (edu.school || edu.institusi)).length === 0) ? (
                            <p className="text-gray-500 text-sm">Belum ada pendidikan yang ditambahkan.</p>
                        ) : (
                            <div className="space-y-6">
                                {userData.educations.filter(edu => edu && (edu.school || edu.institusi)).map((edu, index, arr) => (
                                    <div key={edu.id || index} className={`flex gap-4 ${index !== arr.length - 1 ? 'border-b border-gray-100 pb-6' : ''}`}>
                                        <div className="w-12 h-12 bg-gray-100 flex-shrink-0 flex items-center justify-center rounded-lg">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path d="M12 14v6" /></svg>
                                        </div>
                                        <div className="flex-1">
                                            <div>
                                                <h3 className="font-bold text-gray-900">{edu.school || edu.institusi}</h3>
                                                <p className="text-sm text-gray-800">{edu.degree || edu.gelar}{edu.field_of_study ? `, ${edu.field_of_study}` : ''}</p>
                                                <p className="text-xs text-gray-500 mt-1">{edu.start_date || edu.tahun_mulai} - {edu.end_date || edu.tahun_selesai || 'Saat ini'}</p>
                                            </div>
                                            {edu.description && <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">{edu.description}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* SERTIFIKASI & CV GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* SERTIFIKASI & KEAHLIAN CARD */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Sertifikasi & Keahlian</h2>
                        </div>
                        <div className="p-6">
                            {(!userData.certifications || userData.certifications.filter(cert => cert && cert.name).length === 0) ? (
                                <p className="text-gray-500 text-sm">Belum ada sertifikasi.</p>
                            ) : (
                                <div className="space-y-6">
                                    {userData.certifications.filter(cert => cert && cert.name).map((cert, index, arr) => (
                                        <div key={cert.id || index} className={`flex gap-4 ${index !== arr.length - 1 ? 'border-b border-gray-100 pb-6' : ''}`}>
                                            <div className="w-12 h-12 bg-gray-100 flex-shrink-0 flex items-center justify-center rounded-lg">
                                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                            </div>
                                            <div className="flex-1">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{cert.name}</h3>
                                                    <p className="text-sm text-gray-800">{cert.organization}</p>
                                                    <p className="text-xs text-gray-500 mt-1">Diterbitkan: {cert.issue_date || '-'}</p>
                                                </div>
                                                {cert.description && <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">{cert.description}</p>}
                                                {cert.file_url && (
                                                    <a href={cert.file_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-[#8100D1] font-semibold hover:bg-purple-50 transition">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                        Lihat Kredensial
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CV / RESUME CARD */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">CV / Resume</h2>
                        </div>
                        <div className="p-6">
                            {userData.cv_url ? (
                                <div className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11v6m-3-3h6" /></svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">Resume/CV</p>
                                            <p className="text-xs text-gray-500">Tersedia untuk diunduh</p>
                                        </div>
                                    </div>
                                    <a href={userData.cv_url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#8100D1] hover:text-purple-800 border border-[#8100D1] rounded-lg px-4 py-2 bg-white shadow-sm hover:bg-purple-50 transition w-full sm:w-auto text-center">
                                        Buka CV
                                    </a>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">Belum ada CV yang diunggah.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
