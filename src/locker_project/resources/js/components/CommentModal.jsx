import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';

const CommentModal = ({ isOpen, onClose, post, onCommentSuccess }) => {
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [previewMedia, setPreviewMedia] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    useEffect(() => {
        if (isOpen && post) {
            fetchReplies();
            if (!currentUser) fetchCurrentUser();
            // Reset form
            setCommentText('');
            setSelectedMedia(null);
            setPreviewMedia(null);
            setShowEmojiPicker(false);
        }
    }, [isOpen, post]);

    const fetchCurrentUser = async () => {
        try {
            const res = await axios.get('/me');
            setCurrentUser({
                name: res.data.name,
                avatar_url: res.data.profile?.avatar_url
            });
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    };

    const fetchReplies = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/community/posts/${post.id}/replies`);
            setReplies(response.data.data);
        } catch (error) {
            console.error('Failed to load replies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 20 * 1024 * 1024) {
                window.alert('Maksimal ukuran file adalah 20MB');
                return;
            }
            setSelectedMedia(file);
            setPreviewMedia(URL.createObjectURL(file));
        }
    };

    const removeMedia = () => {
        setSelectedMedia(null);
        setPreviewMedia(null);
    };

    const handleEmojiClick = (emojiObject) => {
        setCommentText(prev => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim() && !selectedMedia) return;

        setSubmitting(true);
        const formData = new FormData();
        formData.append('konten', commentText);
        formData.append('reply_to', post.id);
        if (post.community_id) {
            formData.append('community_id', post.community_id);
        }
        if (selectedMedia) {
            formData.append('media', selectedMedia);
        }

        try {
            await axios.post('/api/community/posts/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Berhasil membalas
            setCommentText('');
            setSelectedMedia(null);
            setPreviewMedia(null);
            setShowEmojiPicker(false);
            await fetchReplies(); // Refresh list of replies
            
            // Scroll to bottom of replies
            setTimeout(() => {
                const scrollableDiv = document.getElementById('replies-scroll-container');
                if (scrollableDiv) {
                    scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
                }
            }, 100);

            if (onCommentSuccess) {
                onCommentSuccess(post.id);
            }
        } catch (error) {
            window.alert(error.response?.data?.message || 'Gagal mengirim komentar.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen || !post) return null;

    // Helper untuk memformat waktu secara relatif (real-time feel)
    const timeAgo = (dateStr) => {
        if (!dateStr) return '';
        const now = new Date();
        const past = new Date(dateStr);
        const diffInSeconds = Math.floor((now - past) / 1000);

        if (diffInSeconds < 60) return 'Baru saja';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} hari yang lalu`;
        
        return past.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <button 
                        onClick={onClose}
                        className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition focus:outline-none"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <h3 className="text-[15px] font-bold text-gray-800">Balasan</h3>
                    <div className="w-9"></div> {/* Spacer for centering */}
                </div>

                {/* Content Area (Scrollable) */}
                <div id="replies-scroll-container" className="flex-1 overflow-y-auto custom-scrollbar bg-white scroll-smooth">
                    <div className="p-4 flex gap-4 relative">
                        {/* Thread Line for original post */}
                        <div className="flex flex-col items-center">
                            {post.author?.avatar_url ? (
                                <img src={post.author.avatar_url} alt="User" className="w-12 h-12 rounded-full object-cover border border-gray-100 z-10 bg-white" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#8100D1] to-[#ff007f] flex items-center justify-center text-white font-bold text-lg z-10 border border-white">
                                    {(post.author?.name || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="w-0.5 bg-gray-200 flex-1 my-2"></div>
                        </div>

                        {/* Original Post Content */}
                        <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-[15px] text-gray-900">{post.author?.name || 'User'}</span>
                                <span className="text-[14px] text-gray-500">{timeAgo(post.created_at)}</span>
                            </div>
                            <p className="text-[15px] text-gray-800 mt-1 leading-relaxed whitespace-pre-wrap">
                                {post.konten}
                            </p>
                            {post.media_url && (
                                <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 max-h-64 flex items-center justify-center">
                                    {post.media_type === 'image' ? (
                                        <img src={post.media_url} alt="Media" className="max-w-full max-h-64 object-contain" />
                                    ) : (
                                        <video src={post.media_url} controls className="max-w-full max-h-64"></video>
                                    )}
                                </div>
                            )}
                            <div className="mt-4 text-[14px] text-gray-500">
                                Membalas <span className="text-[#8100D1]">@{(post.author?.name || 'User').replace(/\s+/g, '')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Replies List */}
                    <div className="border-t border-gray-100">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">
                                <svg className="animate-spin h-6 w-6 text-[#8100D1] mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Memuat balasan...
                            </div>
                        ) : replies.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                Belum ada balasan. Jadilah yang pertama!
                            </div>
                        ) : (
                            replies.map((reply) => (
                                <div key={reply.id} className="p-4 flex gap-4 border-b border-gray-100 hover:bg-gray-50/50 transition">
                                    {reply.user_avatar ? (
                                        <img src={reply.user_avatar} alt="User" className="w-10 h-10 rounded-full object-cover border border-gray-100 shrink-0" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8100D1] to-[#ff007f] flex items-center justify-center text-white font-bold shrink-0">
                                            {(reply.user_name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[14px] text-gray-900">{reply.user_name}</span>
                                            <span className="text-[13px] text-gray-500">{timeAgo(reply.created_at)}</span>
                                        </div>
                                        <p className="text-[14px] text-gray-800 mt-1 leading-relaxed whitespace-pre-wrap">
                                            {reply.konten}
                                        </p>
                                        {reply.media_url && (
                                            <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 max-h-48 flex items-center justify-center">
                                                {reply.media_type === 'image' ? (
                                                    <img src={reply.media_url} alt="Media" className="max-w-full max-h-48 object-contain" />
                                                ) : (
                                                    <video src={reply.media_url} controls className="max-w-full max-h-48"></video>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Reply Input Area */}
                <div className="p-4 border-t border-gray-100 bg-white">
                    <div className="flex gap-4">
                        {/* Avatar user yang sedang login */}
                        {currentUser?.avatar_url ? (
                            <img src={currentUser.avatar_url} alt="Me" className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-100" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8100D1] to-[#ff007f] flex items-center justify-center text-white font-bold shrink-0">
                                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'Me'}
                            </div>
                        )}
                        <div className="flex-1 relative">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (commentText.trim() || selectedMedia) {
                                            handleSubmit(e);
                                        }
                                    }
                                }}
                                placeholder="Kirim balasan Anda..."
                                className="w-full bg-transparent border-none focus:ring-0 text-[15px] resize-none placeholder-gray-400 p-0"
                                rows="2"
                            ></textarea>
                            
                            {/* Preview Media */}
                            {previewMedia && (
                                <div className="relative mt-2 mb-3 inline-block">
                                    {selectedMedia?.type.startsWith('video/') ? (
                                        <video src={previewMedia} className="max-h-48 rounded-xl" controls></video>
                                    ) : (
                                        <img src={previewMedia} alt="Preview" className="max-h-48 rounded-xl object-cover" />
                                    )}
                                    <button 
                                        onClick={removeMedia}
                                        className="absolute top-2 right-2 bg-gray-900/70 text-white p-1 rounded-full hover:bg-gray-900 transition"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                                <div className="flex items-center gap-1">
                                    <label className="p-2 text-[#8100D1] hover:bg-purple-50 rounded-full cursor-pointer transition">
                                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <input type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaChange} />
                                    </label>
                                    <button 
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="p-2 text-[#8100D1] hover:bg-purple-50 rounded-full cursor-pointer transition"
                                    >
                                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </button>
                                </div>
                                <button 
                                    onClick={handleSubmit}
                                    disabled={submitting || (!commentText.trim() && !selectedMedia)}
                                    className="bg-[#8100D1] hover:bg-[#6a00ab] disabled:opacity-50 disabled:hover:bg-[#8100D1] text-white px-5 py-1.5 rounded-full font-bold text-[14px] transition-colors"
                                >
                                    {submitting ? 'Mengirim...' : 'Balas'}
                                </button>
                            </div>
                            {/* Emoji Picker Popup */}
                            {showEmojiPicker && (
                                <div className="absolute z-50 bottom-full left-0 mb-2 shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
                                    <EmojiPicker 
                                        onEmojiClick={handleEmojiClick}
                                        searchPlaceholder="Cari emoji..."
                                        width={300}
                                        height={400}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentModal;
