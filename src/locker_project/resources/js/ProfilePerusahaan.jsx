import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cropper from 'react-easy-crop';

// --- FUNGSI UTILITY: MEMOTONG GAMBAR (CANVAS) ---
const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image(); image.src = imageSrc;
    await new Promise(resolve => image.onload = resolve);
    const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
    canvas.width = pixelCrop.width; canvas.height = pixelCrop.height;
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    return new Promise((resolve) => { canvas.toBlob((file) => { file.name = 'cropped.jpg'; resolve(file); }, 'image/jpeg'); });
};

export default function ProfilePerusahaan() {
    const navigate = useNavigate();

    // --- STATE DATA PROFIL ---
    const [userData, setUserData] = useState({
        name: '', email: '', headline: '', location: '', description: '', npwp: '', avatar_url: null, banner_url: null,
        employee_count: '', website_url: '', follower_count: 0
    });

    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tentang');
    const [recentJobs, setRecentJobs] = useState([]);
    const [isJobsLoading, setIsJobsLoading] = useState(false);

    // --- STATE UPLOAD & CROP GAMBAR ---
    const fileInputRef = useRef(null);
    const [uploadTarget, setUploadTarget] = useState(''); 
    const [isUploading, setIsUploading] = useState(false);
    const [showOptionsModal, setShowOptionsModal] = useState(false); 
    const [showCropModal, setShowCropModal] = useState(false);
    const [imageSrc, setImageSrc] = useState(null); 
    const [crop, setCrop] = useState({ x: 0, y: 0 }); 
    const [zoom, setZoom] = useState(1); 
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    // --- STATE EDIT INTRO ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', headline: '', location: '', current_position: '', employee_count: '', website_url: '' });

    // Fetch data real dari backend
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get('/me');
            if (response.data.user?.role === 'seeker') {
                navigate('/profile', { replace: true });
                return;
            }
            const profile = response.data.profile || {};
            setUserData({
                name: response.data.name || '',
                email: response.data.user?.email || '',
                user_id: response.data.user?.id || '',
                headline: profile.headline || '',
                location: profile.location || '',
                description: profile.description || '',
                npwp: profile.npwp || '',
                avatar_url: profile.avatar_url || null,
                banner_url: profile.banner_url || null,
                employee_count: profile.employee_count || '',
                website_url: profile.website_url || '',
                follower_count: profile.follower_count || 0
            });
            setIsLoading(false);
        } catch (error) {
            console.error("Gagal memuat data:", error);
            setIsLoading(false);
        }
    };

    const fetchCompanyJobs = async () => {
        setIsJobsLoading(true);
        try {
            const response = await axios.get('/api/jobs/me');
            setRecentJobs(response.data.data || []);
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

    // --- FUNGSI ALUR GAMBAR ---
    const handleCameraClick = (type) => { setUploadTarget(type.toLowerCase()); setShowOptionsModal(true); };
    const handleChoosePhoto = () => { setShowOptionsModal(false); fileInputRef.current.click(); };
    const handleFileChange = async (event) => { const file = event.target.files[0]; if (!file) return; event.target.value = null; const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => { setImageSrc(reader.result); setShowCropModal(true); }; };
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => { setCroppedAreaPixels(croppedAreaPixels); }, []);
    const handleSaveCroppedImage = async () => { 
        try { 
            setIsUploading(true); setShowCropModal(false); 
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels); 
            const formData = new FormData(); 
            formData.append('image', croppedBlob); 
            formData.append('type', uploadTarget); 
            const response = await axios.post('/api/profile/upload-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); 
            if (uploadTarget === 'avatar') { setUserData(prev => ({ ...prev, avatar_url: response.data.url })); } else { setUserData(prev => ({ ...prev, banner_url: response.data.url })); } 
        } catch (error) { 
            alert('Gagal mengunggah gambar.'); 
        } finally { 
            setIsUploading(false); setImageSrc(null); 
        } 
    };

    // --- FUNGSI ALUR INTRO ---
    const openEditModal = () => { 
        setFormData({ 
            name: userData.name, 
            headline: userData.headline, 
            location: userData.location, 
            current_position: userData.description,
            employee_count: userData.employee_count,
            website_url: userData.website_url
        }); 
        setIsEditModalOpen(true); 
    };

    const handleSaveIntro = async (e) => { 
        e.preventDefault(); 
        try { 
            await axios.post('/api/profile/intro', formData); 
            setUserData(prev => ({ 
                ...prev, 
                name: formData.name, 
                headline: formData.headline, 
                location: formData.location, 
                description: formData.current_position,
                employee_count: formData.employee_count,
                website_url: formData.website_url
            })); 
            setIsEditModalOpen(false); 
        } catch (error) { 
            alert('Gagal menyimpan profil perusahaan.'); 
        } 
    };

    if (isLoading) { return (<div className="min-h-screen bg-gray-50 flex justify-center items-center"> <span className="text-[#8100D1] font-medium animate-pulse">Memuat profil perusahaan...</span> </div>); }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-12 relative overflow-x-hidden">

            {/* Hidden components */}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg, image/png, image/jpg" className="hidden" />

            {/* Modal Edit Intro */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">Edit Profil Perusahaan</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="overflow-y-auto p-6">
                            <form id="edit-intro-form" onSubmit={handleSaveIntro} className="flex flex-col gap-5">
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Perusahaan *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#8100D1]/20 focus:border-[#8100D1] outline-none transition" required /></div>
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Bidang Industri *</label><input type="text" placeholder="Cth: Teknologi Informasi" value={formData.headline} onChange={(e) => setFormData({ ...formData, headline: e.target.value })} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#8100D1]/20 focus:border-[#8100D1] outline-none transition" required /></div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Lokasi Pusat</label><input type="text" placeholder="Cth: Jakarta Selatan" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#8100D1]/20 focus:border-[#8100D1] outline-none transition" /></div>
                                    <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Jumlah Karyawan</label><select value={formData.employee_count} onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#8100D1]/20 focus:border-[#8100D1] outline-none transition bg-white">
                                        <option value="">Pilih Skala</option><option value="1-10">1-10 Karyawan</option><option value="11-50">11-50 Karyawan</option><option value="51-200">51-200 Karyawan</option><option value="201-500">201-500 Karyawan</option><option value="501-1000">501-1.000 Karyawan</option><option value="1000+">1.000+ Karyawan</option>
                                    </select></div>
                                </div>
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Tautan Website (opsional)</label><input type="url" placeholder="Cth: https://www.perusahaan.com" value={formData.website_url} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#8100D1]/20 focus:border-[#8100D1] outline-none transition" /></div>
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Tentang Perusahaan</label><textarea value={formData.current_position} onChange={(e) => setFormData({ ...formData, current_position: e.target.value })} rows="4" className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#8100D1]/20 focus:border-[#8100D1] outline-none transition resize-none"></textarea></div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition">Batal</button>
                            <button type="submit" form="edit-intro-form" className="px-6 py-2.5 bg-[#8100D1] text-white font-semibold rounded-xl hover:bg-purple-800 shadow-sm transition">Simpan Perubahan</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Image Options (Pilih Foto) */}
            {showOptionsModal && (<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"><div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up"><div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50"><h3 className="font-bold text-gray-800">Edit {uploadTarget}</h3><button onClick={() => setShowOptionsModal(false)} className="text-gray-500 hover:text-gray-800 bg-gray-100 rounded-full p-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button></div><div className="flex flex-col"><button onClick={handleChoosePhoto} className="flex items-center gap-3 p-4 hover:bg-purple-50 transition border-b border-gray-100 text-gray-800 font-medium"><svg className="w-5 h-5 text-[#8100D1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Unggah Foto Baru</button><button className="p-4 hover:bg-red-50 text-red-600 font-medium flex items-center gap-3 transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>Hapus Foto</button></div></div></div>)}

            {/* Modal Crop */}
            {showCropModal && (<div className="fixed inset-0 z-[110] bg-black flex flex-col"><div className="flex justify-between items-center p-4 bg-black/80 text-white z-10"><button onClick={() => setShowCropModal(false)} className="px-4 py-2 text-sm font-semibold rounded-full hover:bg-white/10">Batal</button><h3 className="font-semibold text-sm">Sesuaikan Gambar</h3><button onClick={handleSaveCroppedImage} className="px-4 py-2 text-sm font-bold text-white bg-[#8100D1] rounded-full hover:bg-purple-600 transition">Terapkan</button></div><div className="relative flex-1 bg-black"><Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={uploadTarget === 'avatar' ? 1 : 4 / 1} cropShape={uploadTarget === 'avatar' ? 'rect' : 'rect'} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} showGrid={false} /></div><div className="p-6 bg-black/80 flex items-center gap-4 z-10 pb-10"><input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="w-full h-1 rounded-lg accent-[#8100D1]" /></div></div>)}

            {/* Overlay Loading */}
            {isUploading && (<div className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm"><div className="w-12 h-12 border-4 border-gray-200 border-t-[#8100D1] rounded-full animate-spin mb-4"></div><span className="text-[#8100D1] font-bold text-lg">Memproses...</span></div>)}

            {/* --- HEADER NAV --- */}
            <div className="sticky top-0 z-[60] bg-white border-b border-gray-200 flex items-center gap-4 px-4 sm:px-6 h-16 w-full">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:text-[#8100D1] transition-colors rounded-full hover:bg-purple-50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <span className="text-xl font-black text-[#8100D1] tracking-tight">LockER</span>
            </div>

            <main className="max-w-[900px] mx-auto w-full pt-6 px-4 pb-20 flex flex-col gap-6">
                
                {/* --- KARTU PROFIL UTAMA (LOCKER STYLE) --- */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative">
                    {/* Banner Image */}
                    <div className="h-[180px] sm:h-[220px] w-full bg-gradient-to-r from-purple-500 to-[#8100D1] relative cursor-pointer group" onClick={() => handleCameraClick('banner')}>
                        {userData.banner_url && (
                            <img src={userData.banner_url} alt="Banner" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                        )}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors"></div>
                        <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-full p-2 text-gray-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                    </div>

                    {/* Konten Profil Inti */}
                    <div className="px-6 sm:px-8 pb-8 relative">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4">
                            {/* Avatar */}
                            <div className="relative group cursor-pointer z-10 -mt-[60px] sm:-mt-[70px] mb-4 sm:mb-0" onClick={() => handleCameraClick('avatar')}>
                                <div className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-2xl bg-white p-1.5 shadow-md border border-gray-100">
                                    <div className="w-full h-full bg-gray-50 flex justify-center items-center overflow-hidden rounded-xl border border-gray-100">
                                        {userData.avatar_url ? (
                                            <img src={userData.avatar_url} alt="Profile" className="w-full h-full object-contain bg-white" />
                                        ) : (
                                            <span className="text-5xl text-[#8100D1] font-black">{userData.name.charAt(0)}</span>
                                        )}
                                    </div>
                                </div>
                                {/* Ikon Edit Avatar */}
                                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg border border-gray-100 text-gray-500 group-hover:text-[#8100D1] transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                            </div>

                            {/* Action Buttons (Edit) */}
                            <div className="flex gap-2 self-end">
                                <button onClick={openEditModal} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition shadow-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    Edit Profil
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
                                {userData.headline || 'Bidang Industri'}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {userData.location || 'Lokasi belum diatur'}
                                </div>
                                {userData.employee_count && (
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        {userData.employee_count}
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    <span className="font-semibold text-gray-700">{userData.follower_count.toLocaleString()}</span> Pengikut
                                </div>
                            </div>
                        </div>

                        {/* Interactive Buttons */}
                        <div className="px-6 sm:px-8 pb-6 flex flex-wrap gap-3 border-b border-gray-100">
                            {userData.website_url && (
                                <a href={userData.website_url} target="_blank" rel="noopener noreferrer" className="bg-purple-50 text-[#8100D1] hover:bg-purple-100 border border-purple-100 px-6 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2">
                                    Kunjungi Website
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            )}
                        </div>

                        {/* LockER Custom Tabs */}
                        <div className="px-6 sm:px-8 pt-2">
                            <div className="flex gap-6 overflow-x-auto no-scrollbar">
                                {[
                                    { id: 'tentang', label: 'Tentang Perusahaan' },
                                    { id: 'lowongan', label: 'Lowongan Kerja' }
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
                            <h2 className="text-xl font-extrabold text-gray-900 mb-5">Gambaran Umum</h2>
                            {userData.description ? (
                                <div className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {userData.description}
                                </div>
                            ) : (
                                <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                                    <p className="text-gray-500 font-medium">Belum ada deskripsi profil perusahaan.</p>
                                    <button onClick={openEditModal} className="mt-3 text-[#8100D1] font-semibold text-sm hover:underline">Tambahkan Deskripsi</button>
                                </div>
                            )}
                            
                            {(userData.website_url || userData.employee_count || userData.npwp) && (
                                <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                    {userData.website_url && (
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 mb-1">Situs Web</p>
                                            <a href={userData.website_url} target="_blank" rel="noopener noreferrer" className="text-[#8100D1] hover:underline text-sm break-all font-medium">{userData.website_url}</a>
                                        </div>
                                    )}
                                    {userData.employee_count && (
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 mb-1">Ukuran Perusahaan</p>
                                            <p className="text-sm text-gray-600">{userData.employee_count}</p>
                                        </div>
                                    )}
                                    {userData.npwp && (
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 mb-1">Nomor Induk Berusaha / NPWP</p>
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
                                <h2 className="text-xl font-extrabold text-gray-900">Lowongan yang Dibuka</h2>
                                <span className="bg-purple-100 text-[#8100D1] text-xs font-bold px-3 py-1 rounded-full">{recentJobs.length} Lowongan</span>
                            </div>
                            
                            {isJobsLoading ? (
                                <div className="py-10 flex justify-center">
                                    <div className="w-8 h-8 border-4 border-gray-200 border-t-[#8100D1] rounded-full animate-spin"></div>
                                </div>
                            ) : recentJobs.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {recentJobs.map(job => (
                                        <div key={job.id} onClick={() => navigate(`/loker/${job.id}`)} className="border border-gray-200 rounded-2xl p-5 cursor-pointer hover:shadow-md hover:border-[#8100D1]/30 transition group bg-white">
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
                                    <h3 className="text-gray-900 font-bold mb-1">Belum Ada Lowongan</h3>
                                    <p className="text-gray-500 text-sm">Perusahaan ini belum memiliki lowongan pekerjaan yang aktif saat ini.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}