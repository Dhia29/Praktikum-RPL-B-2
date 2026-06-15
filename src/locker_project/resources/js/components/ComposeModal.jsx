import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import { useTranslation } from 'react-i18next';

export default function ComposeModal({ isOpen, onClose, selectedCommunity, onSuccess }) {
    const { t } = useTranslation();
    const [typedText, setTypedText] = useState('');
    const [attachedMedia, setAttachedMedia] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);

    const [currentUser, setCurrentUser] = useState({ name: 'Memuat...', avatar_url: null });

    // State untuk API Emoji & GIF
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifComingSoon, setShowGifComingSoon] = useState(false);

    const mediaInputRef = useRef(null);

    // Menarik data User asli saat modal terbuka
    useEffect(() => {
        if (isOpen) {
            axios.get('/me')
                .then(res => {
                    setCurrentUser({
                        name: res.data.name || 'Pencari Kerja',
                        avatar_url: res.data.profile?.avatar_url || null
                    });
                })
                .catch(err => console.error("Gagal memuat profil:", err));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAttachedMedia(file);
        setMediaPreview({
            url: URL.createObjectURL(file),
            type: file.type.startsWith('video/') ? 'video' : 'image'
        });
    };

    const handleEmojiClick = (emojiObject) => {
        setTypedText(prev => prev + emojiObject.emoji);
    };

    const resetAndClose = () => {
        setTypedText('');
        setAttachedMedia(null);
        setMediaPreview(null);
        setShowEmojiPicker(false);
        setShowGifComingSoon(false);
        onClose();
    };

    const handleCreatePost = async (e) => {
        if (e) e.preventDefault();
        if (!typedText.trim() && !attachedMedia) return;

        const formData = new FormData();
        formData.append('konten', typedText);
        if (attachedMedia) formData.append('media', attachedMedia);
        if (selectedCommunity) formData.append('community_id', selectedCommunity.id);

        try {
            await axios.post('/api/community/posts/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            resetAndClose();
            if (onSuccess) onSuccess();

        } catch (err) {
            window.alert('Gagal memposting. Periksa koneksi Anda.');
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end sm:justify-center items-center bg-black/50 backdrop-blur-sm sm:p-4 animate-fade-in">

            <input type="file" ref={mediaInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />

            {/* Overlay penutup */}
            <div className="absolute inset-0" onClick={resetAndClose}></div>
            <div className="relative bg-white dark:bg-slate-900 w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-visible flex flex-col animate-slide-up sm:animate-fade-in-up">

                {/* Header Modal */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-slate-800">
                    <button onClick={resetAndClose} className="text-gray-500 dark:text-gray-400 font-semibold hover:text-gray-800 dark:hover:text-gray-200 transition">{t('community.cancel')}</button>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">{t('community.new_thread')}</h3>
                    <button
                        onClick={handleCreatePost}
                        disabled={!typedText.trim() && !attachedMedia}
                        className={`font-bold px-4 py-1.5 rounded-full transition ${(!typedText.trim() && !attachedMedia) ? 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-slate-800 cursor-not-allowed' : 'text-white bg-black dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 shadow-md'}`}
                    >
                        {t('community.post')}
                    </button>
                </div>

                {/* Body Konten */}
                <div className="p-6 flex gap-4 max-h-[75vh] overflow-y-auto hide-scrollbar relative">

                    {/* Kolom Kiri: Profil & Garis Thread */}
                    <div className="flex flex-col items-center pt-1">
                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 flex-shrink-0 border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            {currentUser.avatar_url ? (
                                <img src={currentUser.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <span className="text-xl">{currentUser.name.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="w-0.5 bg-gray-200 dark:bg-slate-700 flex-1 my-2 rounded-full min-h-[100px]"></div>
                        <div className="w-4 h-4 rounded-full border-2 border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 opacity-50"></div>
                    </div>

                    {/* Kolom Kanan: Area Input */}
                    <div className="flex-1 pt-1 pb-4 flex flex-col min-h-[180px]">

                        {/* Info Penulis & Target */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-[16px] text-gray-900 dark:text-white leading-none">{currentUser.name}</span>
                            <span className="text-gray-400 dark:text-gray-500 text-sm">·</span>
                            <span className="text-sm font-semibold bg-gray-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md text-gray-600 dark:text-gray-300">
                                {selectedCommunity ? selectedCommunity.nama : 'Global'}
                            </span>
                        </div>

                        {/* Text Area Dinamis */}
                        <textarea
                            autoFocus
                            placeholder={t('community.compose_placeholder')}
                            value={typedText}
                            onChange={(e) => setTypedText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (typedText.trim() || attachedMedia) {
                                        handleCreatePost(e);
                                    }
                                }
                            }}
                            className="w-full text-[16px] outline-none resize-none flex-1 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-transparent leading-relaxed"
                        />

                        {/* Preview Media */}
                        {mediaPreview && (
                            <div className="relative rounded-2xl overflow-hidden mt-4 border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 inline-block max-w-full shadow-sm">
                                {mediaPreview.type === 'image' ? (
                                    <img src={mediaPreview.url} className="max-h-72 w-full object-cover" />
                                ) : (
                                    <video src={mediaPreview.url} controls className="max-h-72 w-full bg-black" />
                                )}
                                <button type="button" onClick={() => { setAttachedMedia(null); setMediaPreview(null); }} className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition backdrop-blur-md">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        )}

                        {/* Ruang bernapas */}
                        <div className="mt-8"></div>
                    </div>
                </div>

                {/* Toolbar Interaktif di Bagian Bawah Modal */}
                <div className="px-16 py-3 border-t border-gray-100 dark:border-slate-800 flex items-center gap-2 relative bg-gray-50/50 dark:bg-slate-900/50 rounded-b-2xl">

                    {/* Tombol Gallery/Media */}
                    <button type="button" onClick={() => mediaInputRef.current?.click()} className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition focus:outline-none" title="Tambah Media">
                        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </button>

                    {/* Tombol GIF (Placeholder) */}
                    <button type="button" onClick={() => setShowGifComingSoon(true)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition focus:outline-none" title="Tambah GIF">
                        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </button>

                    {/* Tombol API Emoji Picker */}
                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2 rounded-full transition focus:outline-none ${showEmojiPicker ? 'text-black dark:text-white bg-gray-200 dark:bg-slate-800' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-800'}`} title="Tambah Emoticon">
                        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>

                    {/* Pop-up Info GIF */}
                    {showGifComingSoon && (
                        <div className="absolute -top-12 left-12 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg animate-fade-in z-50">
                            Fitur GIF API sedang dalam pengembangan.
                            <button onClick={() => setShowGifComingSoon(false)} className="ml-2 text-gray-400 hover:text-white">x</button>
                        </div>
                    )}

                    {/* API Emoji Picker Component */}
                    {showEmojiPicker && (
                        <div className="absolute bottom-[60px] left-16 z-50 shadow-2xl rounded-2xl animate-fade-in-up border border-gray-100 dark:border-slate-800">
                            <EmojiPicker
                                onEmojiClick={handleEmojiClick}
                                autoFocusSearch={false}
                                width={320}
                                height={400}
                                theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                                searchPlaceholder="Cari emoji..."
                            />
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}