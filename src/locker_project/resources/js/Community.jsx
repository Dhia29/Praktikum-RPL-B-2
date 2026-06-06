import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ComposeModal from './components/ComposeModal';
import CommentModal from './components/CommentModal';

export default function Community() {
    const [posts, setPosts] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState(null);

    // UI Toggle states
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(false); // State untuk mengunci feed jika bukan member

    // State Pencarian Komunitas
    const [groupSearchText, setGroupSearchText] = useState('');

    // States untuk grup baru
    const [newCommunityName, setNewCommunityName] = useState('');
    const [newCommunityDesc, setNewCommunityDesc] = useState('');
    const [newCommunityAvatar, setNewCommunityAvatar] = useState(null); // File upload avatar grup
    const [avatarPreview, setAvatarPreview] = useState(null);

    const [isSavedTab, setIsSavedTab] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [selectedPostToComment, setSelectedPostToComment] = useState(null);

    const toggleLike = async (e, postId) => {
        e.stopPropagation();
        // Optimistic UI update
        setPosts(posts.map(p => {
            if (p.id === postId) {
                return { 
                    ...p, 
                    has_liked: !p.has_liked, 
                    likes_count: p.has_liked ? p.likes_count - 1 : p.likes_count + 1 
                };
            }
            return p;
        }));
        try {
            await axios.post(`/api/community/posts/${postId}/like`);
        } catch (err) {
            // Revert on error
            loadFeedAndGroups();
        }
    };

    const toggleSave = async (e, postId) => {
        e.stopPropagation();
        setPosts(posts.map(p => {
            if (p.id === postId) {
                return { 
                    ...p, 
                    has_saved: !p.has_saved 
                };
            }
            return p;
        }));
        try {
            await axios.post(`/api/community/posts/${postId}/save`);
        } catch (err) {
            loadFeedAndGroups();
        }
    };

    const loadFeedAndGroups = () => {
        setIsLoading(true);
        setIsLocked(false);
        let feedUrl = '/api/community/posts';
        if (isSavedTab) {
            feedUrl = '/api/community/posts?saved=true';
        } else if (selectedCommunity) {
            feedUrl = `/api/community/posts?community_id=${selectedCommunity.id}`;
        }

        axios.all([
            // Tangkap error 403 (Akses Ditolak) jika belum jadi member
            axios.get(feedUrl).catch(err => {
                if (err.response && err.response.status === 403) {
                    return { data: { data: [], is_locked: true } };
                }
                throw err;
            }),
            axios.get('/api/community/list')
        ])
            .then(axios.spread((resPosts, resGroups) => {
                if (resPosts.data.is_locked) {
                    setPosts([]);
                    setIsLocked(true);
                } else {
                    setPosts(resPosts.data.data || []);
                }

                const freshCommunities = resGroups.data.data || [];
                setCommunities(freshCommunities);

                // Perbarui data selectedCommunity (untuk update status is_member secara real-time)
                if (selectedCommunity) {
                    const updatedSelected = freshCommunities.find(c => c.id === selectedCommunity.id);
                    if (updatedSelected) setSelectedCommunity(updatedSelected);
                }

                setIsLoading(false);
            }))
            .catch(err => { console.error(err); setIsLoading(false); });
    };

    useEffect(() => { loadFeedAndGroups(); }, [selectedCommunity?.id, isSavedTab]);

    // --- FITUR GABUNG & KELUAR KOMUNITAS ---
    const handleJoinCommunity = async () => {
        if (!selectedCommunity) return;
        try {
            await axios.post('/api/community/join', { community_id: selectedCommunity.id });
            setSelectedCommunity({ ...selectedCommunity, is_member: true });
            loadFeedAndGroups();
        } catch (err) { alert('Gagal bergabung dengan komunitas.'); }
    };

    const handleLeaveCommunity = async () => {
        if (!selectedCommunity) return;
        if (!window.confirm(`Yakin ingin keluar dari ${selectedCommunity.nama}?`)) return;

        try {
            await axios.post('/api/community/leave', { community_id: selectedCommunity.id });
            setSelectedCommunity({ ...selectedCommunity, is_member: false });
            loadFeedAndGroups();
        } catch (err) { alert('Gagal keluar dari komunitas.'); }
    };
    // ----------------------------------------

    const handleRepost = async (e, postId) => {
        e.stopPropagation();
        
        // Optimistic UI update
        setPosts(posts.map(p => {
            if (p.id === postId) {
                return { 
                    ...p, 
                    has_reposted: !p.has_reposted, 
                    reposts_count: p.has_reposted ? p.reposts_count - 1 : p.reposts_count + 1 
                };
            }
            return p;
        }));

        try {
            await axios.post('/api/community/repost', { post_id: postId });
            // reload in background to sync any other states if necessary, but optional.
        } catch (err) { 
            loadFeedAndGroups(); // revert on failure
        }
    };

    const handleDeletePost = async (e, postId) => {
        e.stopPropagation();
        if (!confirm('Apakah Anda yakin ingin menghapus postingan ini?')) return;
        
        try {
            await axios.delete(`/api/community/posts/${postId}`);
            setPosts(posts.filter(p => p.id !== postId));
        } catch (err) {
            alert('Gagal menghapus postingan.');
        }
    };

    const handleReportPost = async (e, postId) => {
        e.stopPropagation();
        setOpenDropdownId(null);
        const reason = prompt('Masukkan alasan pelaporan (misal: Spam, Mengganggu, dll):');
        if (!reason) return;
        
        try {
            await axios.post(`/api/community/posts/${postId}/report`, { reason });
            alert('Postingan berhasil dilaporkan. Terima kasih atas laporan Anda.');
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal melaporkan postingan.');
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setNewCommunityAvatar(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleCreateNewGroup = async (e) => {
        e.preventDefault();
        if (!newCommunityName.trim()) return;

        const formData = new FormData();
        formData.append('nama', newCommunityName);
        if (newCommunityDesc) formData.append('deskripsi', newCommunityDesc);
        if (newCommunityAvatar) formData.append('avatar', newCommunityAvatar);

        try {
            await axios.post('/api/community/create', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setNewCommunityName(''); setNewCommunityDesc(''); setNewCommunityAvatar(null); setAvatarPreview(null);
            setIsCreateGroupOpen(false);
            loadFeedAndGroups();
        } catch (err) { alert('Gagal membuat komunitas.'); }
    };

    const filteredCommunities = communities.filter(g =>
        g.nama.toLowerCase().includes(groupSearchText.toLowerCase())
    );

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[80vh] relative font-sans">

            <ComposeModal
                isOpen={isComposeModalOpen}
                onClose={() => setIsComposeModalOpen(false)}
                selectedCommunity={selectedCommunity}
                onSuccess={loadFeedAndGroups}
            />

            {/* KOLOM KIRI: MENU SCOPE FEED & PENCARIAN KOMUNITAS */}
            <div className="w-full lg:w-[280px] bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-2 flex-shrink-0">
                <button
                    onClick={() => { setSelectedCommunity(null); setIsSavedTab(false); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold text-[15px] transition-colors ${!selectedCommunity && !isSavedTab ? 'bg-purple-50 text-[#8100D1]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    Beranda Global
                </button>

                <button
                    onClick={() => { setSelectedCommunity(null); setIsSavedTab(true); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold text-[15px] transition-colors ${isSavedTab ? 'bg-purple-50 text-[#8100D1]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    Tersimpan
                </button>

                <div className="border-t border-gray-100 my-2"></div>

                <div className="flex justify-between items-center px-2 mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Komunitas</span>
                    <button onClick={() => setIsCreateGroupOpen(true)} className="text-xs font-bold text-[#8100D1] hover:text-purple-800 transition">
                        + Buat
                    </button>
                </div>

                <div className="px-1 mb-3">
                    <div className="relative flex items-center">
                        <svg className="w-4 h-4 absolute left-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            type="text" placeholder="Cari komunitas..." value={groupSearchText} onChange={(e) => setGroupSearchText(e.target.value)}
                            className="w-full bg-gray-50/50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-xs font-medium focus:ring-2 focus:ring-[#8100D1]/20 focus:border-[#8100D1] outline-none transition-all placeholder-gray-400 text-gray-700"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 hide-scrollbar">
                    {filteredCommunities.length > 0 ? (
                        filteredCommunities.map(g => (
                            <button
                                key={g.id} onClick={() => setSelectedCommunity(g)}
                                className={`w-full flex items-center justify-between p-3 rounded-xl text-[14px] font-semibold transition-colors ${selectedCommunity?.id === g.id ? 'bg-purple-50 text-[#8100D1]' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center gap-3 truncate">
                                    <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200 overflow-hidden">
                                        {g.avatar_url ? <img src={g.avatar_url} className="w-full h-full object-cover" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                                    </div>
                                    <span className="truncate">{g.nama}</span>
                                </div>
                                {/* Tanda kecil jika belum join */}
                                {!g.is_member && <div className="w-2 h-2 rounded-full bg-gray-300"></div>}
                            </button>
                        ))
                    ) : (
                        <p className="text-xs text-center text-gray-400 mt-4">Komunitas tidak ditemukan.</p>
                    )}
                </div>
            </div>

            {/* KOLOM TENGAH: FEED POSTINGAN */}
            <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden relative shadow-sm">

                {/* Header Feed Minimalis + Tombol Gabung/Keluar */}
                <div className="px-6 py-4 border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
                    <div className="flex items-center gap-3 min-w-0">
                        {selectedCommunity && selectedCommunity.avatar_url && (
                            <img src={selectedCommunity.avatar_url} className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                        )}
                        <div className="flex flex-col min-w-0">
                            <h3 className="text-[17px] font-extrabold text-gray-900 tracking-tight truncate">
                                {isSavedTab ? 'Tersimpan' : (selectedCommunity ? selectedCommunity.nama : 'Beranda')}
                            </h3>
                            {selectedCommunity?.deskripsi && (
                                <p className="text-xs text-gray-500 mt-0.5 font-medium truncate">{selectedCommunity.deskripsi}</p>
                            )}
                        </div>
                    </div>

                    {/* TOMBOL GABUNG / KELUAR */}
                    {selectedCommunity && (
                        <div className="flex-shrink-0 ml-4">
                            {selectedCommunity.is_member ? (
                                <button onClick={handleLeaveCommunity} className="px-4 py-1.5 text-xs font-bold text-gray-500 border border-gray-200 rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition">
                                    Keluar
                                </button>
                            ) : (
                                <button onClick={handleJoinCommunity} className="px-5 py-1.5 text-xs font-bold bg-black text-white rounded-full hover:bg-gray-800 transition">
                                    Gabung
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-0 space-y-0 relative">

                    {/* STATE TERKUNCI (JIKA BUKAN MEMBER) */}
                    {isLocked ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/50 p-6 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400 border border-gray-200 shadow-sm">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 1.5a5.5 5.5 0 00-5.5 5.5v2.5h-1A2.5 2.5 0 003 12v7.5A2.5 2.5 0 005.5 22h13a2.5 2.5 0 002.5-2.5V12a2.5 2.5 0 00-2.5-2.5h-1V7a5.5 5.5 0 00-5.5-5.5zM8.5 7a3.5 3.5 0 117 0v2.5h-7V7zm-3 5a.5.5 0 01.5-.5h13a.5.5 0 01.5.5v7.5a.5.5 0 01-.5.5h-13a.5.5 0 01-.5-.5V12z" clipRule="evenodd" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Komunitas Privat</h3>
                            <p className="text-sm text-gray-500 max-w-sm mb-6">Anda harus menjadi member untuk melihat dan membuat utas di dalam komunitas ini.</p>
                            <button onClick={handleJoinCommunity} className="px-6 py-2.5 bg-[#8100D1] text-white font-bold text-sm rounded-full hover:bg-purple-800 transition shadow-md">
                                Gabung Sekarang
                            </button>
                        </div>
                    ) : isLoading ? (
                        <div className="text-center py-20 text-gray-400 text-sm flex flex-col items-center">
                            <div className="w-8 h-8 border-4 border-gray-100 border-t-[#8100D1] rounded-full animate-spin mb-4"></div>
                            Menyelaraskan linimasa...
                        </div>
                    ) : posts.length > 0 ? (
                        posts.map(post => (
                            <div key={post.id} className="px-6 pt-5 pb-4 flex flex-col text-left group hover:bg-gray-50/50 transition-colors">
                                {/* (Repost Indicator Removed) */}

                                <div className="flex gap-4 items-start">
                                    <div className="w-11 h-11 rounded-full bg-gray-100 font-bold text-[#8100D1] flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm cursor-pointer hover:opacity-80 transition">
                                        {post.repost_of ? (post.original_post?.author.avatar_url && <img src={post.original_post.author.avatar_url} className="w-full h-full object-cover" />) : (post.author.avatar_url && <img src={post.author.avatar_url} className="w-full h-full object-cover" />)}
                                        {(!post.repost_of && !post.author.avatar_url) && post.author.name.charAt(0).toUpperCase()}
                                        {(post.repost_of && !post.original_post?.author.avatar_url) && post.original_post?.author.name.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="flex-1 min-w-0 pb-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <h4 className="text-[15px] font-bold text-gray-900 hover:underline cursor-pointer truncate">
                                                    {post.repost_of ? post.original_post?.author.name : post.author.name}
                                                </h4>
                                                <span className="text-[14px] text-gray-400 font-normal">·</span>
                                                <span className="text-[14px] text-gray-500 font-normal hover:underline cursor-pointer whitespace-nowrap">
                                                    {new Date(post.repost_of ? post.original_post?.created_at : post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                            
                                            {/* Opsi Titik Tiga (Analytics & Delete) */}
                                            <div className="relative">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === post.id ? null : post.id); }} 
                                                    className="p-1.5 text-gray-400 hover:text-[#8100D1] hover:bg-purple-50 rounded-full transition focus:outline-none"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                                </button>
                                                
                                                {openDropdownId === post.id && (
                                                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-1 overflow-hidden">
                                                        {/* Analytics / Views */}
                                                        <div className="px-4 py-3 text-sm font-medium flex flex-col gap-2.5 border-b border-gray-50 bg-gray-50/50">
                                                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Analytics Postingan</div>
                                                            <div className="flex justify-between items-center text-gray-700">
                                                                <div className="flex items-center gap-2">
                                                                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                                                    Tayangan
                                                                </div>
                                                                <span className="font-bold">{post.views_count}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-gray-700">
                                                                <div className="flex items-center gap-2">
                                                                    <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                                                    Suka
                                                                </div>
                                                                <span className="font-bold">{post.likes_count}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-gray-700">
                                                                <div className="flex items-center gap-2">
                                                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                                    Komentar
                                                                </div>
                                                                <span className="font-bold">{post.replies_count}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-gray-700">
                                                                <div className="flex items-center gap-2">
                                                                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                                                    Disimpan
                                                                </div>
                                                                <span className="font-bold">{post.saves_count || 0}</span>
                                                            </div>
                                                        </div>

                                                        {/* Hapus Postingan (Jika milik sendiri) */}
                                                        {post.is_me ? (
                                                            <button 
                                                                onClick={(e) => { setOpenDropdownId(null); handleDeletePost(e, post.id); }}
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 font-semibold hover:bg-red-50 transition flex items-center gap-3"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                Hapus
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={(e) => handleReportPost(e, post.id)}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 font-semibold hover:bg-gray-100 transition flex items-center gap-3"
                                                            >
                                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                                                                Laporkan Postingan
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-[15px] text-gray-800 mt-0.5 leading-relaxed whitespace-pre-wrap font-normal">
                                            {post.repost_of ? post.original_post?.konten : post.konten}
                                        </p>

                                        {((post.media_url || post.original_post?.media_url)) && (
                                            <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 max-h-96 flex items-center justify-center">
                                                {(post.media_type === 'image' || post.original_post?.media_type === 'image') ? (
                                                    <img src={post.repost_of ? post.original_post.media_url : post.media_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <video src={post.repost_of ? post.original_post.media_url : post.media_url} controls className="w-full h-full bg-black" />
                                                )}
                                            </div>
                                        )}

                                        {!post.repost_of && (
                                            <div className="flex items-center justify-between mt-3 max-w-[425px]">
                                                {/* Comment */}
                                                <button 
                                                    onClick={(e) => { 
                                                        e.preventDefault(); 
                                                        e.stopPropagation(); 
                                                        setSelectedPostToComment(post); 
                                                        setIsCommentModalOpen(true); 
                                                    }}
                                                    className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-blue-500 transition focus:outline-none group/btn" 
                                                    title="Komentar"
                                                >
                                                    <div className="p-2 -ml-2 rounded-full group-hover/btn:bg-blue-50 transition">
                                                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                    </div>
                                                    <span className="min-w-[32px] text-left block">{post.replies_count > 0 ? post.replies_count : ''}</span>
                                                </button>

                                                {/* Like */}
                                                <button onClick={(e) => toggleLike(e, post.id)} className={`flex items-center gap-1.5 text-[13px] font-semibold transition focus:outline-none group/btn ${post.has_liked ? 'text-pink-600' : 'text-gray-500 hover:text-pink-600'}`} title="Suka">
                                                    <div className={`p-2 -ml-2 rounded-full transition ${post.has_liked ? 'bg-pink-50' : 'group-hover/btn:bg-pink-50'}`}>
                                                        <svg className="w-[18px] h-[18px]" fill={post.has_liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                                    </div>
                                                    <span className="min-w-[32px] text-left block">{post.likes_count > 0 ? post.likes_count : ''}</span>
                                                </button>

                                                {/* Save & Share */}
                                                <div className="flex items-center gap-1 ml-auto">
                                                    <button onClick={(e) => toggleSave(e, post.id)} className={`flex items-center gap-1.5 text-[13px] font-semibold transition focus:outline-none group/btn ${post.has_saved ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`} title="Simpan">
                                                        <div className={`p-2 rounded-full transition ${post.has_saved ? 'bg-blue-50' : 'group-hover/btn:bg-blue-50'}`}>
                                                            <svg className="w-[18px] h-[18px]" fill={post.has_saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                                        </div>
                                                    </button>
                                                    <button className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-[#8100D1] transition focus:outline-none group/btn" title="Bagikan">
                                                        <div className="p-2 rounded-full group-hover/btn:bg-purple-50 transition">
                                                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-32 flex flex-col items-center">
                            <p className="text-gray-500 font-bold text-lg">Belum ada aktivitas.</p>
                            <p className="text-sm text-gray-400 mt-1">Jadilah yang pertama memulai percakapan di ruang ini!</p>
                        </div>
                    )}
                </div>

                {/* FAB TWEET BARU (Hanya muncul jika di Global atau jika sudah jadi member) */}
                {(!selectedCommunity || selectedCommunity.is_member) && (
                    <button
                        onClick={() => setIsComposeModalOpen(true)}
                        className="group absolute bottom-6 right-6 flex items-center bg-[#8100D1] hover:bg-purple-800 text-white h-[56px] rounded-full shadow-[0_8px_20px_rgba(129,0,209,0.3)] hover:shadow-[0_8px_25px_rgba(129,0,209,0.5)] transition-all duration-300 z-20 focus:outline-none overflow-hidden"
                    >
                        <div className="flex items-center justify-center w-[56px] h-[56px] flex-shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                        </div>
                        <span className="whitespace-nowrap font-bold text-[15px] overflow-hidden max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:pr-6 transition-all duration-300 ease-in-out">
                            Tulis Utas Baru
                        </span>
                    </button>
                )}
            </div>

            {/* MODAL BUAT KOMUNITAS INTERNAL (Dengan Upload Avatar) */}
            {isCreateGroupOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                            <h3 className="font-bold text-gray-900 text-lg">Buat Komunitas</h3>
                            <button onClick={() => { setIsCreateGroupOpen(false); setAvatarPreview(null); setNewCommunityAvatar(null); }} className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <form onSubmit={handleCreateNewGroup} className="p-5 space-y-4 bg-gray-50/30">

                            {/* Upload Foto Profil Komunitas */}
                            <div className="flex flex-col items-center justify-center mb-2">
                                <label className="relative cursor-pointer group">
                                    <div className="w-20 h-20 rounded-xl bg-purple-50 border-2 border-dashed border-purple-200 flex items-center justify-center overflow-hidden transition group-hover:border-[#8100D1]">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} className="w-full h-full object-cover" />
                                        ) : (
                                            <svg className="w-6 h-6 text-purple-400 group-hover:text-[#8100D1] transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        )}
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                </label>
                                <span className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">Foto Komunitas</span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-900 mb-1.5">Nama Kelompok *</label>
                                <input type="text" placeholder="Cth: UI/UX Solo Raya" value={newCommunityName} onChange={(e) => setNewCommunityName(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-[14px] focus:ring-2 focus:ring-[#8100D1]/20 focus:border-[#8100D1] outline-none transition shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-900 mb-1.5">Deskripsi Ringkas</label>
                                <textarea placeholder="Tempat berkumpul desainer..." value={newCommunityDesc} onChange={(e) => setNewCommunityDesc(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-[14px] h-20 resize-none focus:ring-2 focus:ring-[#8100D1]/20 focus:border-[#8100D1] outline-none transition shadow-sm" />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => { setIsCreateGroupOpen(false); setAvatarPreview(null); setNewCommunityAvatar(null); }} className="px-5 py-2.5 text-[14px] font-bold text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition shadow-sm">Batal</button>
                                <button type="submit" className="px-5 py-2.5 text-[14px] font-bold bg-[#8100D1] text-white rounded-full hover:bg-purple-800 transition shadow-sm">Bentuk Grup</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Comment Modal */}
            <CommentModal 
                isOpen={isCommentModalOpen}
                onClose={() => { setIsCommentModalOpen(false); setSelectedPostToComment(null); }}
                post={selectedPostToComment}
                onCommentSuccess={(postId) => {
                    // Update replies_count di feed
                    setPosts(posts.map(p => {
                        if (p.id === postId) {
                            return { ...p, replies_count: p.replies_count + 1 };
                        }
                        return p;
                    }));
                }}
            />
        </div>
    );
}