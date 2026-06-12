import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import Cropper from 'react-easy-crop';
import ProfilePerusahaan from './ProfilePerusahaan';
import { useTranslation } from 'react-i18next';
import PageHeader from './components/PageHeader';

// --- FUNGSI UTILITY: MEMOTONG GAMBAR (CANVAS) ---
const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image(); image.src = imageSrc;
    await new Promise(resolve => image.onload = resolve);
    const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
    canvas.width = pixelCrop.width; canvas.height = pixelCrop.height;
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    return new Promise((resolve) => { canvas.toBlob((file) => { file.name = 'cropped.jpg'; resolve(file); }, 'image/jpeg'); });
};

export default function Profile() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // --- STATE DATA PROFIL ---
    const [userData, setUserData] = useState({
        name: '', email: '', headline: '', location: '', current_position: '', education: '', avatar_url: null, banner_url: null,
        wa_number: '', insta_username: '', facebook_url: '', github_username: ''
    });

    const [certifications, setCertifications] = useState([]);
    const [isCertModalOpen, setIsCertModalOpen] = useState(false);
    const [certForm, setCertForm] = useState({ id: '', name: '', organization: '', issue_date: '', file_url: '', description: '' });
    const [cvUrl, setCvUrl] = useState(null);
    const cvInputRef = useRef(null);
    const certInputRef = useRef(null);
    const [isUploadingCv, setIsUploadingCv] = useState(false);
    const [isUploadingCert, setIsUploadingCert] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    // --- STATE UPLOAD & CROP GAMBAR ---
    const fileInputRef = useRef(null);
    const [uploadTarget, setUploadTarget] = useState(''); const [isUploading, setIsUploading] = useState(false);
    const [showOptionsModal, setShowOptionsModal] = useState(false); const [showCropModal, setShowCropModal] = useState(false);
    const [imageSrc, setImageSrc] = useState(null); const [crop, setCrop] = useState({ x: 0, y: 0 }); const [zoom, setZoom] = useState(1); const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    // --- STATE EDIT INTRO ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', headline: '', location: '', current_position: '', education: '' });

    // --- STATE INFORMASI KONTAK ---
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [activePlatform, setActivePlatform] = useState(null); // 'whatsapp', 'instagram', 'facebook', 'github', atau null
    const [platformInputValue, setPlatformInputValue] = useState('');
    const [showActionPrompt, setShowActionPrompt] = useState(false);

    // --- STATE KONEKSI / MUTUALS ---
    const [connections, setConnections] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [activeTab, setActiveTab] = useState('mutuals'); // 'mutuals' atau 'explore'
    const [isConnLoading, setIsConnLoading] = useState(false);
    const [searchConnQuery, setSearchConnQuery] = useState('');

    const filteredConnections = connections.filter(conn =>
        (conn.name || '').toLowerCase().includes(searchConnQuery.toLowerCase())
    );

    const filteredSuggestions = suggestions.filter(user =>
        (user.name || '').toLowerCase().includes(searchConnQuery.toLowerCase())
    );

    // --- STATE EXPERIENCES & EDUCATIONS ---
    const [experiences, setExperiences] = useState([]);
    const [educations, setEducations] = useState([]);

    const [isExpModalOpen, setIsExpModalOpen] = useState(false);
    const [expForm, setExpForm] = useState({ id: '', title: '', company_name: '', location: '', start_date: '', end_date: '', description: '' });

    const [isEduModalOpen, setIsEduModalOpen] = useState(false);
    const [eduForm, setEduForm] = useState({ id: '', school: '', degree: '', field_of_study: '', start_date: '', end_date: '', description: '' });

    // Fetch data real dari backend
    useEffect(() => {
        axios.get('/me')
            .then(response => {
                if (response.data.user?.role === 'company') {
                    navigate('/profile-perusahaan', { replace: true });
                    return;
                }
                const profile = response.data.profile || {};
                setUserData({
                    name: response.data.name || '',
                    email: response.data.user?.email || '',
                    user_id: response.data.user?.id || '',
                    headline: profile.headline || '',
                    location: profile.location || '',
                    current_position: profile.current_position || '',
                    education: profile.education || '',
                    avatar_url: profile.avatar_url || null,
                    banner_url: profile.banner_url || null,
                    wa_number: profile.wa_number || '',
                    insta_username: profile.insta_username || '',
                    facebook_url: profile.facebook_url || '',
                    github_username: profile.github_username || '',
                });
                if (profile.experiences && Array.isArray(profile.experiences)) {
                    setExperiences(profile.experiences.map(exp => ({ ...exp, id: exp.id || crypto.randomUUID() })));
                }
                if (profile.educations && Array.isArray(profile.educations)) {
                    setEducations(profile.educations.map(edu => ({ ...edu, id: edu.id || crypto.randomUUID() })));
                }
                if (profile.certifications && Array.isArray(profile.certifications)) {
                    setCertifications(profile.certifications.map(cert => ({ ...cert, id: cert.id || crypto.randomUUID() })));
                }
                if (profile.cv_url) setCvUrl(profile.cv_url);
                setIsLoading(false);
                fetchConnections();
            })
            .catch(error => { console.error("Gagal memuat data:", error); setIsLoading(false); });
    }, []);

    // Fetch Connections
    const fetchConnections = async () => {
        setIsConnLoading(true);
        try {
            const [connRes, suggRes] = await Promise.all([
                axios.get('/api/connections'),
                axios.get('/api/connections/suggestions')
            ]);
            setConnections(connRes.data.mutuals || []);
            setPendingRequests(connRes.data.requests || []);
            setSuggestions(suggRes.data || []);
        } catch (error) {
            console.error("Gagal memuat koneksi:", error);
        } finally {
            setIsConnLoading(false);
        }
    };

    const handleConnect = async (userId) => {
        try {
            await axios.post('/api/connections/request', { receiver_id: userId });
            alert("Permintaan terkirim!");
            fetchConnections();
        } catch (error) {
            alert(error.response?.data?.message || "Gagal mengirim permintaan");
        }
    };

    const handleRespond = async (connId, action) => {
        try {
            await axios.post('/api/connections/respond', { connection_id: connId, action });
            fetchConnections();
        } catch (error) {
            alert("Gagal merespon permintaan");
        }
    };

    // --- FUNGSI ALUR GAMBAR ---
    const handleCameraClick = (type) => { setUploadTarget(type.toLowerCase()); setShowOptionsModal(true); };
    const handleChoosePhoto = () => { setShowOptionsModal(false); fileInputRef.current.click(); };
    const handleFileChange = async (event) => { const file = event.target.files[0]; if (!file) return; event.target.value = null; const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => { setImageSrc(reader.result); setShowCropModal(true); }; };
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => { setCroppedAreaPixels(croppedAreaPixels); }, []);
    const handleSaveCroppedImage = async () => { try { setIsUploading(true); setShowCropModal(false); const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels); const formData = new FormData(); formData.append('image', croppedBlob); formData.append('type', uploadTarget); const response = await axios.post('/api/profile/upload-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); if (uploadTarget === 'avatar') { setUserData(prev => ({ ...prev, avatar_url: response.data.url })); } else { setUserData(prev => ({ ...prev, banner_url: response.data.url })); } } catch (error) { alert('Gagal mengunggah gambar.'); } finally { setIsUploading(false); setImageSrc(null); } };

    // --- FUNGSI ALUR INTRO ---
    const openEditModal = () => { setFormData({ name: userData.name, headline: userData.headline, location: userData.location, current_position: userData.current_position, education: userData.education }); setIsEditModalOpen(true); };
    const handleSaveIntro = async (e) => { e.preventDefault(); try { await axios.post('/api/profile/intro', formData); setUserData(prev => ({ ...prev, ...formData })); setIsEditModalOpen(false); } catch (error) { alert('Gagal menyimpan intro.'); } };

    // --- FUNGSI ALUR KONTAK ---
    const openContactModal = () => { setIsContactModalOpen(true); setActivePlatform(null); setShowActionPrompt(false); };

    const handlePlatformCardClick = (platform, currentValue) => {
        setActivePlatform(platform);
        if (currentValue) {
            setShowActionPrompt(true);
        } else {
            setPlatformInputValue('');
            setShowActionPrompt(false);
        }
    };

    const handleSaveIndividualContact = async (e) => {
        e.preventDefault();

        let payload = {
            wa_number: userData.wa_number,
            insta_username: userData.insta_username,
            facebook_url: userData.facebook_url,
            github_username: userData.github_username
        };

        let cleanedValue = platformInputValue.trim();

        if (activePlatform === 'whatsapp') {
            cleanedValue = cleanedValue.replace(/[^0-9]/g, '');
            if (cleanedValue.startsWith('08')) cleanedValue = '628' + cleanedValue.substring(2);
            payload.wa_number = cleanedValue;
        } else if (activePlatform === 'instagram') {
            payload.insta_username = cleanedValue.replace('@', '');
        } else if (activePlatform === 'facebook') {
            if (cleanedValue && !cleanedValue.startsWith('http')) cleanedValue = `https://facebook.com/${cleanedValue}`;
            payload.facebook_url = cleanedValue;
        } else if (activePlatform === 'github') {
            payload.github_username = cleanedValue.replace('@', '');
        }

        try {
            setIsUploading(true);
            const response = await axios.post('/api/profile/contact', payload);
            setUserData(prev => ({ ...prev, ...response.data.data }));
            setActivePlatform(null);
        } catch (error) {
            alert('Gagal memperbarui kontak. Periksa kembali kecocokan format input.');
        } finally {
            setIsUploading(false);
        }
    };

    // --- UTILITY AUTO-DIRECT URL (ANTI GAGAL KONEKSI APP) ---
    const getWaUrl = (num) => num ? `https://wa.me/${num.replace(/[^0-9]/g, '')}` : null;
    const getGmailUrl = (email) => email ? `mailto:${email}` : null;
    const getInstaUrl = (user) => user ? `https://instagram.com/${user.trim().replace('@', '')}` : null;
    const getFbUrl = (url) => {
        if (!url) return null;
        let clean = url.trim();
        if (clean.startsWith('http')) return clean;
        return `https://facebook.com/${clean}`;
    };
    const getGithubUrl = (user) => user ? `https://github.com/${user.trim().replace('@', '')}` : null;

    const triggerDeepLink = () => {
        let url = '#';
        if (activePlatform === 'whatsapp') url = getWaUrl(userData.wa_number);
        else if (activePlatform === 'instagram') url = getInstaUrl(userData.insta_username);
        else if (activePlatform === 'facebook') url = getFbUrl(userData.facebook_url);
        else if (activePlatform === 'github') url = getGithubUrl(userData.github_username);

        window.open(url, '_blank', 'noopener,noreferrer');
        setShowActionPrompt(false);
        setActivePlatform(null);
    };

    const handleShareProfile = () => {
        if (!userData || !userData.user_id) {
            alert('Data profil belum lengkap untuk dibagikan.');
            return;
        }
        const profileUrl = `${window.location.origin}/profile/${userData.user_id}`;

        if (navigator.share) {
            navigator.share({
                title: `Profil ${userData.name} di LockER`,
                url: profileUrl,
            }).catch(err => {
                if (err.name !== 'AbortError') {
                    console.error('Error sharing', err);
                }
            });
        } else {
            navigator.clipboard.writeText(profileUrl).then(() => {
                alert(t('profile.link_copied'));
            }).catch(err => {
                console.error('Gagal menyalin tautan:', err);
                alert('Gagal menyalin tautan profil.');
            });
        }
    };

    // --- HANDLER EXPERIENCES & EDUCATIONS ---
    const handleSaveExperience = async (e) => {
        e.preventDefault();
        const newExp = { ...expForm, id: expForm.id || crypto.randomUUID() };
        let updatedExps = [...experiences];
        if (expForm.id) {
            updatedExps = updatedExps.map(ex => ex.id === expForm.id ? newExp : ex);
        } else {
            updatedExps = [newExp, ...updatedExps];
        }

        try {
            await axios.put('/api/profile/experiences', { experiences: updatedExps });
            setExperiences(updatedExps);
            setIsExpModalOpen(false);
        } catch (error) {
            alert('Gagal menyimpan pengalaman');
        }
    };

    const handleDeleteExperience = async (id) => {
        if (!confirm('Hapus pengalaman ini?')) return;
        const updatedExps = experiences.filter(ex => ex.id !== id);
        try {
            await axios.put('/api/profile/experiences', { experiences: updatedExps });
            setExperiences(updatedExps);
            setIsExpModalOpen(false);
        } catch (error) {
            alert('Gagal menghapus pengalaman');
        }
    };

    const handleSaveEducation = async (e) => {
        e.preventDefault();
        const newEdu = { ...eduForm, id: eduForm.id || crypto.randomUUID() };
        let updatedEdus = [...educations];
        if (eduForm.id) {
            updatedEdus = updatedEdus.map(ed => ed.id === eduForm.id ? newEdu : ed);
        } else {
            updatedEdus = [newEdu, ...updatedEdus];
        }

        try {
            await axios.put('/api/profile/educations', { educations: updatedEdus });
            setEducations(updatedEdus);
            setIsEduModalOpen(false);
        } catch (error) {
            alert('Gagal menyimpan pendidikan');
        }
    };

    const handleDeleteEducation = async (id) => {
        if (!confirm('Hapus pendidikan ini?')) return;
        const updatedEdus = educations.filter(ed => ed.id !== id);
        try {
            await axios.put('/api/profile/educations', { educations: updatedEdus });
            setEducations(updatedEdus);
            setIsEduModalOpen(false);
        } catch (error) {
            alert(t('profile.edu_delete_failed'));
        }
    };

    // --- HANDLER CV ---
    const handleCVUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { alert(t('profile.cv_size_limit')); return; }
        if (file.type !== 'application/pdf') { alert(t('profile.cv_format_invalid')); return; }

        const formData = new FormData();
        formData.append('cv', file);

        setIsUploadingCv(true);
        try {
            const res = await axios.post('/api/profile/cv', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setCvUrl(res.data.url);
        } catch (error) {
            alert(t('profile.cv_upload_failed'));
        } finally {
            setIsUploadingCv(false);
            if (cvInputRef.current) cvInputRef.current.value = '';
        }
    };

    const handleDeleteCV = async () => {
        if (!confirm(t('profile.confirm_delete_cv'))) return;
        try {
            await axios.delete('/api/profile/cv');
            setCvUrl(null);
        } catch (error) {
            alert(t('profile.cv_delete_failed'));
        }
    };

    // --- HANDLER CERTIFICATIONS ---
    const handleUploadCertFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { alert(t('profile.cert_size_limit')); return; }

        const formData = new FormData();
        formData.append('file', file);

        setIsUploadingCert(true);
        try {
            const res = await axios.post('/api/profile/certifications/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setCertForm({ ...certForm, file_url: res.data.url });
        } catch (error) {
            alert(t('profile.cert_upload_failed'));
        } finally {
            setIsUploadingCert(false);
        }
    };

    const handleSaveCertification = async (e) => {
        e.preventDefault();
        const newCert = { ...certForm, id: certForm.id || crypto.randomUUID() };
        let updatedCerts = [...certifications];
        if (certForm.id) {
            updatedCerts = updatedCerts.map(c => c.id === certForm.id ? newCert : c);
        } else {
            updatedCerts = [newCert, ...updatedCerts];
        }

        try {
            await axios.put('/api/profile/certifications', { certifications: updatedCerts });
            setCertifications(updatedCerts);
            setIsCertModalOpen(false);
        } catch (error) {
            alert(t('profile.cert_save_failed'));
        }
    };

    const handleDeleteCertification = async (id) => {
        if (!confirm(t('profile.confirm_delete_cert'))) return;
        const updatedCerts = certifications.filter(c => c.id !== id);
        try {
            await axios.put('/api/profile/certifications', { certifications: updatedCerts });
            setCertifications(updatedCerts);
            setIsCertModalOpen(false);
        } catch (error) {
            alert(t('profile.cert_delete_failed'));
        }
    };

    const openAddCert = () => { setCertForm({ id: '', name: '', organization: '', issue_date: '', file_url: '', description: '' }); setIsCertModalOpen(true); };
    const openEditCert = (cert) => { setCertForm(cert); setIsCertModalOpen(true); };

    const openAddExp = () => { setExpForm({ id: '', title: '', company_name: '', location: '', start_date: '', end_date: '', description: '' }); setIsExpModalOpen(true); };
    const openEditExp = (exp) => { setExpForm(exp); setIsExpModalOpen(true); };

    const openAddEdu = () => { setEduForm({ id: '', school: '', degree: '', field_of_study: '', start_date: '', end_date: '', description: '' }); setIsEduModalOpen(true); };
    const openEditEdu = (edu) => { setEduForm(edu); setIsEduModalOpen(true); };

    if (isLoading) { return (<div className="min-h-screen bg-gray-50 flex justify-center items-center"> <span className="text-gray-400 font-medium animate-pulse">{t('profile.loading')}</span> </div>); }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] font-sans pb-12 relative overflow-x-hidden transition-colors duration-500">
            {/* Background Decorative Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] -right-[10%] w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse"></div>
                <div className="absolute top-[60%] -left-[10%] w-[400px] h-[400px] bg-indigo-400/20 dark:bg-indigo-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Hidden components */}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg, image/png, image/jpg" className="hidden" />

            {/* Modal Edit Intro */}
            {isEditModalOpen && (<div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"><div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col"><div className="flex justify-between items-center p-5 border-b border-gray-200"><h3 className="text-xl font-bold text-gray-900">{t('profile.edit_profile')}</h3><button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button></div><div className="overflow-y-auto p-5"><form id="edit-intro-form" onSubmit={handleSaveIntro} className="flex flex-col gap-4"><div><label className="block text-sm font-semibold text-gray-700 mb-1">{t('profile.full_name')} *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#8100D1] outline-none" required /></div><div><label className="block text-sm font-semibold text-gray-700 mb-1">{t('profile.headline')} *</label><input type="text" placeholder={t('profile.headline_placeholder')} value={formData.headline} onChange={(e) => setFormData({ ...formData, headline: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#8100D1] outline-none" required /></div><div><label className="block text-sm font-semibold text-gray-700 mb-1">{t('profile.location')} *</label><input type="text" placeholder={t('profile.location_placeholder')} value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#8100D1] outline-none" required /></div><div><label className="block text-sm font-semibold text-gray-700 mb-1">{t('profile.current_position')}</label><input type="text" value={formData.current_position} onChange={(e) => setFormData({ ...formData, current_position: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#8100D1] outline-none" /></div><div><label className="block text-sm font-semibold text-gray-700 mb-1">{t('profile.institution')}</label><input type="text" value={formData.education} onChange={(e) => setFormData({ ...formData, education: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#8100D1] outline-none" /></div></form></div><div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50"><button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2 text-gray-600 font-semibold rounded-full hover:bg-gray-200">{t('profile.cancel')}</button><button type="submit" form="edit-intro-form" className="px-5 py-2 bg-[#8100D1] text-white font-semibold rounded-full hover:bg-purple-800">{t('profile.save')}</button></div></div></div>)}

            {/* Modal Experience */}
            {isExpModalOpen && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6 border-b p-5">
                            <h3 className="text-xl font-bold text-gray-900">{expForm.id ? t('profile.edit_exp') : t('profile.add_exp')}</h3>
                            <button onClick={() => { setIsExpModalOpen(false); setExpForm({ title: '', company_name: '', location: '', start_date: '', end_date: '', description: '' }); }} className="text-gray-400 hover:text-gray-600 transition bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="overflow-y-auto p-5">
                            <form id="exp-form" onSubmit={handleSaveExperience} className="flex flex-col gap-4">
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1">{t('profile.job_title')} *</label><input type="text" value={expForm.title} onChange={(e) => setExpForm({ ...expForm, title: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#8100D1] outline-none" required /></div>
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1">{t('profile.company_name')} *</label><input type="text" value={expForm.company_name} onChange={(e) => setExpForm({ ...expForm, company_name: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#8100D1] outline-none" required /></div>
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1">{t('profile.location')}</label><input type="text" value={expForm.location} onChange={(e) => setExpForm({ ...expForm, location: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#8100D1] outline-none" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-semibold text-gray-700 mb-1">{t('profile.start_date')}</label><input type="text" placeholder={t('profile.date_placeholder')} value={expForm.start_date} onChange={(e) => setExpForm({ ...expForm, start_date: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#8100D1] outline-none" required /></div>
                                    <div><label className="block text-sm font-semibold text-gray-700 mb-1">{t('profile.end_date')}</label><input type="text" placeholder={t('profile.date_placeholder')} value={expForm.end_date} onChange={(e) => setExpForm({ ...expForm, end_date: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#8100D1] outline-none" /></div>
                                </div>
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1">{t('profile.description')}</label><textarea value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} rows="4" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#8100D1] outline-none"></textarea></div>
                            </form>
                        </div>
                        <div className="p-5 border-t border-gray-100 flex justify-between gap-3 bg-gray-50">
                            {expForm.id ? (
                                <button type="button" onClick={() => handleDeleteExperience(expForm.id)} className="px-5 py-2 text-red-600 font-semibold rounded-full hover:bg-red-50">{t('profile.delete')}</button>
                            ) : <div></div>}
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsExpModalOpen(false)} className="px-5 py-2 text-gray-600 font-semibold rounded-full hover:bg-gray-200">{t('profile.cancel')}</button>
                                <button type="submit" form="exp-form" className="px-5 py-2 bg-[#8100D1] text-white font-semibold rounded-full hover:bg-purple-800">{t('profile.save')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Education */}
            {isEduModalOpen && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6 border-b p-5">
                            <h3 className="text-xl font-bold text-gray-900">{eduForm.id ? t('profile.edit_edu') : t('profile.add_edu')}</h3>
                            <button onClick={() => { setIsEduModalOpen(false); setEduForm({ school: '', degree: '', field_of_study: '', start_date: '', end_date: '', description: '' }); }} className="text-gray-400 hover:text-gray-600 transition bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="overflow-y-auto p-5">
                            <form id="edu-form" onSubmit={handleSaveEducation} className="flex flex-col gap-4">
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1">{t('profile.institution')} *</label><input type="text" value={eduForm.school} onChange={(e) => setEduForm({ ...eduForm, school: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#8100D1] outline-none" required /></div>
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1">{t('profile.degree')}</label><input type="text" placeholder={t('profile.degree_placeholder')} value={eduForm.degree} onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#8100D1] outline-none" /></div>
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1">{t('profile.field_of_study')}</label><input type="text" placeholder={t('profile.field_placeholder')} value={eduForm.field_of_study} onChange={(e) => setEduForm({ ...eduForm, field_of_study: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#8100D1] outline-none" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-semibold text-gray-700 mb-1">{t('profile.start_year')}</label><input type="text" placeholder="2020" value={eduForm.start_date} onChange={(e) => setEduForm({ ...eduForm, start_date: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#8100D1] outline-none" required /></div>
                                    <div><label className="block text-sm font-semibold text-gray-700 mb-1">{t('profile.end_year')}</label><input type="text" placeholder="2024" value={eduForm.end_date} onChange={(e) => setEduForm({ ...eduForm, end_date: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#8100D1] outline-none" /></div>
                                </div>
                                <div><label className="block text-sm font-semibold text-gray-700 mb-1">{t('profile.description')}</label><textarea value={eduForm.description} onChange={(e) => setEduForm({ ...eduForm, description: e.target.value })} rows="4" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#8100D1] outline-none"></textarea></div>
                            </form>
                        </div>
                        <div className="p-5 border-t border-gray-100 flex justify-between gap-3 bg-gray-50">
                            {eduForm.id ? (
                                <button type="button" onClick={() => handleDeleteEducation(eduForm.id)} className="px-5 py-2 text-red-600 font-semibold rounded-full hover:bg-red-50">{t('profile.delete')}</button>
                            ) : <div></div>}
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsEduModalOpen(false)} className="px-5 py-2 text-gray-600 font-semibold rounded-full hover:bg-gray-200">{t('profile.cancel')}</button>
                                <button type="submit" form="edu-form" className="px-5 py-2 bg-[#8100D1] text-white font-semibold rounded-full hover:bg-purple-800">{t('profile.save')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Modal Image Options (Pilih Foto) */}
            {showOptionsModal && (<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"><div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up"><div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50"><h3 className="font-bold text-gray-800">{t('profile.edit_photo_target', { target: uploadTarget })}</h3><button onClick={() => setShowOptionsModal(false)} className="text-gray-500 hover:text-gray-800"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button></div><div className="flex flex-col"><button onClick={handleChoosePhoto} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition border-b border-gray-100 text-gray-800 font-medium"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>{t('profile.choose_new_photo')}</button><button className="p-4 hover:bg-red-50 text-red-600 font-medium flex items-center gap-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>{t('profile.delete_photo')}</button></div></div></div>)}

            {/* Modal Crop */}
            {showCropModal && (<div className="fixed inset-0 z-[110] bg-black flex flex-col"><div className="flex justify-between items-center p-4 bg-black/80 text-white z-10"><button onClick={() => setShowCropModal(false)} className="px-4 py-2 text-sm font-semibold rounded-full hover:bg-white/10">{t('profile.cancel')}</button><h3 className="font-semibold text-sm">{t('profile.crop')}</h3><button onClick={handleSaveCroppedImage} className="px-4 py-2 text-sm font-bold text-[#c682ff] rounded-full hover:bg-white/10">{t('profile.select')}</button></div><div className="relative flex-1 bg-black"><Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={uploadTarget === 'avatar' ? 1 : 4 / 1} cropShape={uploadTarget === 'avatar' ? 'round' : 'rect'} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} showGrid={false} /></div><div className="p-6 bg-black/80 flex items-center gap-4 z-10 pb-10"><input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="w-full h-1 rounded-lg accent-[#8100D1]" /></div></div>)}

            {/* Overlay Loading */}
            {isUploading && (<div className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm"><div className="w-12 h-12 border-4 border-gray-200 border-t-[#8100D1] rounded-full animate-spin mb-4"></div><span className="text-[#8100D1] font-bold text-lg">{t('profile.saving')}...</span></div>)}

            {/* --- MODAL POP-UP INFORMASI KONTAK --- */}
            {isContactModalOpen && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col relative">

                        <div className="flex justify-between items-center p-5 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">
                                {activePlatform && !showActionPrompt ? `${t('profile.connect')} ${activePlatform.toUpperCase()}` : userData.name}
                            </h3>
                            <button onClick={() => { setIsContactModalOpen(false); setActivePlatform(null); }} className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 md:p-8 flex-1">

                            {activePlatform && !showActionPrompt ? (
                                // --- FORM INDIVIDUAL PLATFORM ---
                                <form onSubmit={handleSaveIndividualContact} className="space-y-5 py-2">
                                    <div className="bg-purple-50 text-[#8100D1] p-3 rounded-lg text-xs font-medium">
                                        💡 {t('profile.contact_hint')}
                                    </div>

                                    {activePlatform === 'whatsapp' && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('profile.whatsapp_number')}</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-3.5 text-gray-400 font-medium text-sm">+</span>
                                                <input type="text" placeholder={t('profile.whatsapp_placeholder')} value={platformInputValue} onChange={(e) => setPlatformInputValue(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 pl-7 text-sm focus:ring-2 focus:ring-[#8100D1] outline-none" required />
                                            </div>
                                        </div>
                                    )}
                                    {activePlatform === 'instagram' && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('profile.instagram_username')}</label>
                                            <input type="text" placeholder={t('profile.instagram_placeholder')} value={platformInputValue} onChange={(e) => setPlatformInputValue(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#8100D1] outline-none" required />
                                        </div>
                                    )}
                                    {activePlatform === 'facebook' && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('profile.facebook_url')}</label>
                                            <input type="text" placeholder={t('profile.facebook_placeholder')} value={platformInputValue} onChange={(e) => setPlatformInputValue(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#8100D1] outline-none" required />
                                        </div>
                                    )}
                                    {activePlatform === 'github' && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t('profile.github_username')}</label>
                                            <input type="text" placeholder={t('profile.github_placeholder')} value={platformInputValue} onChange={(e) => setPlatformInputValue(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#8100D1] outline-none" required />
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                        <button type="button" onClick={() => setActivePlatform(null)} className="px-5 py-2 text-sm text-gray-600 font-semibold rounded-full hover:bg-gray-100">{t('profile.cancel')}</button>
                                        <button type="submit" className="px-5 py-2 text-sm bg-[#8100D1] text-white font-semibold rounded-full hover:bg-purple-800">{t('profile.save_link')}</button>
                                    </div>
                                </form>
                            ) : activePlatform && showActionPrompt ? (
                                // --- PROMPT AKSI (BUKA ATAU UBAH) ---
                                <div className="text-center py-6 space-y-5">
                                    <p className="text-gray-700 text-sm font-medium">
                                        {t('profile.link_configured', { platform: activePlatform.toUpperCase() })}
                                    </p>
                                    <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                                        <button onClick={triggerDeepLink} className="px-6 py-3 bg-[#8100D1] text-white font-bold text-sm rounded-xl hover:bg-purple-800 flex items-center justify-center gap-2 transition shadow-sm">
                                            {t('profile.open_link')}
                                        </button>
                                        <button onClick={() => {
                                            setPlatformInputValue(activePlatform === 'whatsapp' ? userData.wa_number : activePlatform === 'instagram' ? userData.insta_username : activePlatform === 'facebook' ? userData.facebook_url : userData.github_username);
                                            setShowActionPrompt(false);
                                        }} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 transition">
                                            {t('profile.edit_link')}
                                        </button>
                                    </div>
                                    <button type="button" onClick={() => setActivePlatform(null)} className="text-xs text-gray-400 underline block mx-auto pt-4">{t('profile.back')}</button>
                                </div>
                            ) : (
                                // --- MODE LIHAT KONTAK (DAFTAR TAUTAN) ---
                                <div className="space-y-8">
                                    <h4 className="text-lg font-bold text-gray-900 border-l-4 border-[#8100D1] pl-3">{t('profile.direct_links')}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">

                                        {/* WHATSAPP */}
                                        <div onClick={() => handlePlatformCardClick('whatsapp', userData.wa_number)} className={`flex items-center gap-4 group cursor-pointer ${!userData.wa_number ? 'opacity-50 hover:opacity-100' : ''}`}>
                                            <div className={`p-3 rounded-lg transition ${userData.wa_number ? 'bg-green-50 text-green-600 group-hover:bg-green-100' : 'bg-gray-100 text-gray-400 group-hover:text-green-500'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3.2 480l117.7-30.9c32.7 17.7 68.9 27.1 106.1 27.1h.1c122.4 0 222-99.6 222-222 0-59.3-23.1-115.1-65.1-157.1zM223.9 448h-.1c-33.1 0-65.7-8.9-93.9-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-82.7 184.6-184.5 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-11.3-5.7-22.1-10.4-31.5-18.7-14.8-13.2-24.8-29.4-27.7-34.4-2.8-5.1-.3-7.8 2.5-10.5 2.5-2.5 5.5-6.5 8.2-9.7 2.8-3.2 3.7-5.5 5.6-9.2 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" /></svg></div>
                                            <div className="flex-1">
                                                <p className={`text-sm font-semibold transition ${userData.wa_number ? 'text-gray-900 group-hover:text-green-700' : 'text-gray-500'}`}>WhatsApp Chat</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{userData.wa_number ? `+${userData.wa_number}` : t('profile.not_set')}</p>
                                            </div>
                                        </div>

                                        {/* GMAIL (Khusus Email, Langsung Buka Karena Diambil Dari Akun) */}
                                        <a href={getGmailUrl(userData.email)} className={`flex items-center gap-4 group cursor-pointer ${!userData.email ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <div className="p-3 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.573l8.073-6.08c1.618-1.214 3.927-.059 3.927 1.964z" /></svg></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-gray-900 group-hover:text-red-700 transition">{t('profile.send_email')}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{userData.email || t('profile.not_set')}</p>
                                            </div>
                                        </a>

                                        {/* INSTAGRAM */}
                                        <div onClick={() => handlePlatformCardClick('instagram', userData.insta_username)} className={`flex items-center gap-4 group cursor-pointer ${!userData.insta_username ? 'opacity-50 hover:opacity-100' : ''}`}>
                                            <div className={`p-3 rounded-lg transition ${userData.insta_username ? 'bg-purple-50 text-purple-600 group-hover:bg-purple-100' : 'bg-gray-100 text-gray-400 group-hover:text-purple-500'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.919-.058-1.265-.069-1.646-.069-4.849 0-3.204.013-3.583.069-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.668-.072-4.948-.197-4.347-2.633-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4.162 4.162 0 110-8.324A4.162 4.162 0 0112 16zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg></div>
                                            <div className="flex-1">
                                                <p className={`text-sm font-semibold transition ${userData.insta_username ? 'text-gray-900 group-hover:text-purple-700' : 'text-gray-500'}`}>Instagram</p>
                                                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[180px]">{userData.insta_username ? `@${userData.insta_username}` : t('profile.not_set')}</p>
                                            </div>
                                        </div>

                                        {/* FACEBOOK */}
                                        <div onClick={() => handlePlatformCardClick('facebook', userData.facebook_url)} className={`flex items-center gap-4 group cursor-pointer ${!userData.facebook_url ? 'opacity-50 hover:opacity-100' : ''}`}>
                                            <div className={`p-3 rounded-lg transition ${userData.facebook_url ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' : 'bg-gray-100 text-gray-400 group-hover:text-blue-500'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.128 22 16.991 22 12z" /></svg></div>
                                            <div className="flex-1">
                                                <p className={`text-sm font-semibold transition ${userData.facebook_url ? 'text-gray-900 group-hover:text-blue-700' : 'text-gray-500'}`}>Facebook</p>
                                                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[180px]">{userData.facebook_url ? t('profile.connected') : t('profile.not_set')}</p>
                                            </div>
                                        </div>

                                        {/* GITHUB */}
                                        <div onClick={() => handlePlatformCardClick('github', userData.github_username)} className={`flex items-center gap-4 group cursor-pointer ${!userData.github_username ? 'opacity-50 hover:opacity-100' : ''}`}>
                                            <div className={`p-3 rounded-lg transition ${userData.github_username ? 'bg-gray-100 text-gray-800 group-hover:bg-gray-200' : 'bg-gray-100 text-gray-400 group-hover:text-gray-800'}`}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg></div>
                                            <div className="flex-1">
                                                <p className={`text-sm font-semibold transition ${userData.github_username ? 'text-gray-900 group-hover:text-gray-800' : 'text-gray-500'}`}>GitHub Open Source</p>
                                                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[180px]">{userData.github_username ? `@${userData.github_username}` : t('profile.not_set')}</p>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}


            {/* HEADER NAVIGASI */}
            <PageHeader backUrl="/loker" maxWidth="max-w-7xl" zIndex="z-50" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
                {/* BIO CARD */}
                <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-gray-200/50 dark:border-white/5 overflow-hidden relative animate-fade-in-up group">
                    <div className="absolute inset-0 pointer-events-none rounded-3xl border border-transparent group-hover:border-purple-500/10 transition-colors duration-500 z-50"></div>
                    <div className="relative h-40 sm:h-56 bg-gray-200 group">
                        {userData.banner_url ? (<img src={userData.banner_url} alt="Banner" className="w-full h-full object-cover" />) : (<div className="w-full h-full bg-gradient-to-r from-[#9a30db] via-[#8100D1] to-[#4b0082]"></div>)}
                        <button onClick={() => handleCameraClick('Banner')} className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-sm backdrop-blur-sm transition-all focus:outline-none" disabled={isUploading}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
                    </div>

                    <div className="px-6 sm:px-8 pb-8 relative">
                        <div className="relative inline-block -mt-16 sm:-mt-24 mb-4">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full p-1.5 shadow-md relative group">
                                <div className="w-full h-full bg-purple-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
                                    {userData.avatar_url ? (<img src={userData.avatar_url} alt="Profile" className="w-full h-full object-cover" />) : (<span className="text-5xl sm:text-7xl font-extrabold text-[#8100D1]">{userData.name ? userData.name.charAt(0).toUpperCase() : '?'}</span>)}
                                </div>
                                <button onClick={() => handleCameraClick('Avatar')} className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 p-2 rounded-full shadow-sm transition-all focus:outline-none" disabled={isUploading}><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                            </div>
                        </div>

                        <div className="absolute top-4 right-6 flex gap-2">
                            <button onClick={handleShareProfile} title={t('profile.share')} className="p-2 text-gray-500 hover:text-[#8100D1] hover:bg-purple-50 rounded-full transition-colors focus:outline-none">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            </button>
                            <button onClick={openEditModal} title={t('profile.edit')} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"><svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mt-2">
                            <div className="flex-1">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">{userData.name}</h1>
                                <p className="text-base sm:text-lg text-gray-800 dark:text-gray-200 mt-1.5 font-medium">{userData.headline || t('profile.add_headline')}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1.5">
                                    {userData.location || t('profile.location_not_set')}
                                    <span className="mx-1">•</span>
                                    <button onClick={openContactModal} className="text-[#8100D1] font-semibold hover:underline focus:outline-none">{t('profile.contact_info')}</button>
                                </p>
                            </div>

                            <div className="md:w-72 flex flex-col gap-3">
                                <div className="flex items-start gap-3 group"><div className="w-8 h-8 bg-gray-100 dark:bg-slate-800 rounded flex-shrink-0 flex items-center justify-center text-gray-600 dark:text-gray-300"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></div><p className="text-sm font-semibold text-gray-800 dark:text-gray-200 transition leading-tight group-hover:text-[#8100D1]">{userData.current_position || t('profile.add_position')}</p></div>
                                <div className="flex items-start gap-3 group"><div className="w-8 h-8 bg-gray-100 dark:bg-slate-800 rounded flex-shrink-0 flex items-center justify-center text-gray-600 dark:text-gray-300"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v6" /></svg></div><p className="text-sm font-semibold text-gray-800 dark:text-gray-200 transition leading-tight group-hover:text-[#8100D1]">{userData.education || t('profile.add_institution')}</p></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KONEKSI & MUTUALS */}
                <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-gray-200/50 dark:border-white/5 overflow-hidden mb-6 relative animate-fade-in-up group" style={{ animationDelay: '0.1s' }}>
                    <div className="absolute inset-0 pointer-events-none rounded-3xl border border-transparent group-hover:border-purple-500/10 transition-colors duration-500 z-50"></div>
                        <div className="flex border-b border-gray-200 dark:border-slate-800">
                            <button onClick={() => setActiveTab('mutuals')} className={`flex-1 py-4 font-bold text-sm transition-colors ${activeTab === 'mutuals' ? 'text-[#8100D1] border-b-2 border-[#8100D1]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                                {t('profile.my_connections')} ({connections.length + pendingRequests.length})
                            </button>
                            <button onClick={() => setActiveTab('explore')} className={`flex-1 py-4 font-bold text-sm transition-colors ${activeTab === 'explore' ? 'text-[#8100D1] border-b-2 border-[#8100D1]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                                {t('profile.explore')}
                            </button>
                        </div>

                        <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex items-center gap-3">
                            <div className="relative flex-1">
                                <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <input
                                    type="text"
                                    placeholder={t('profile.search_placeholder')}
                                    value={searchConnQuery}
                                    onChange={(e) => setSearchConnQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8100D1] text-sm dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="p-6">
                            {isConnLoading ? (
                                <div className="flex justify-center py-8"><span className="animate-pulse text-gray-400 font-medium">{t('profile.loading_connections')}</span></div>
                            ) : activeTab === 'mutuals' ? (
                                <div className="space-y-6">
                                    {pendingRequests.length > 0 && !searchConnQuery && (
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-4 border-l-4 border-[#8100D1] pl-2">{t('profile.pending_requests')}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {pendingRequests.map(req => (
                                                    <div key={req.connection_id} className="flex items-center gap-4 p-4 border border-gray-100 dark:border-slate-800 rounded-lg bg-gray-50 dark:bg-slate-800">
                                                        <div onClick={() => navigate('/profile/' + req.user_id)} className="w-12 h-12 rounded-full overflow-hidden bg-purple-100 flex-shrink-0 flex items-center justify-center cursor-pointer hover:opacity-80 transition">
                                                            {req.avatar_url ? <img src={req.avatar_url} className="w-full h-full object-cover" /> : <span className="font-bold text-[#8100D1] text-lg">{req.name.charAt(0)}</span>}
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <h5 onClick={() => navigate('/profile/' + req.user_id)} className="font-bold text-gray-900 dark:text-white text-sm truncate cursor-pointer hover:text-[#8100D1] transition">{req.name}</h5>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{req.headline || t('profile.job_seeker')}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleRespond(req.connection_id, 'accept')} className="p-2 bg-[#8100D1] text-white rounded-full hover:bg-purple-800 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></button>
                                                            <button onClick={() => handleRespond(req.connection_id, 'reject')} className="p-2 bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-300 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        {pendingRequests.length > 0 && !searchConnQuery && <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-4 border-l-4 border-[#8100D1] pl-2 mt-6">{t('profile.active_connections')}</h4>}
                                        {filteredConnections.length > 0 ? (
                                            <div className="flex overflow-x-auto gap-4 pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                                {filteredConnections.map(conn => (
                                                    <div key={conn.connection_id} className="snap-start flex-shrink-0 w-48 sm:w-56 flex flex-col border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition bg-white dark:bg-slate-900 relative">
                                                        <div
                                                            onClick={() => navigate('/profile/' + conn.user_id)}
                                                            className="h-20 w-full bg-gradient-to-r from-purple-200 to-purple-400 cursor-pointer relative"
                                                            style={conn.banner_url ? { backgroundImage: `url(${conn.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                                        >
                                                        </div>

                                                        <div className="px-4 pb-4 flex flex-col items-center flex-1 relative">
                                                            <div
                                                                onClick={() => navigate('/profile/' + conn.user_id)}
                                                                className="w-16 h-16 rounded-full overflow-hidden bg-white dark:bg-slate-900 p-1 -mt-8 mb-2 shadow-sm cursor-pointer z-10"
                                                            >
                                                                <div className="w-full h-full rounded-full overflow-hidden bg-purple-100 flex items-center justify-center">
                                                                    {conn.avatar_url ? <img src={conn.avatar_url} className="w-full h-full object-cover" /> : <span className="font-bold text-[#8100D1] text-2xl">{conn.name.charAt(0)}</span>}
                                                                </div>
                                                            </div>

                                                            <h5
                                                                onClick={() => navigate('/profile/' + conn.user_id)}
                                                                className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 cursor-pointer hover:text-[#8100D1] transition text-center w-full"
                                                            >
                                                                {conn.name}
                                                            </h5>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 min-h-[32px] text-center w-full">{conn.headline || t('profile.job_seeker')}</p>

                                                            <button className="mt-4 w-full py-1.5 bg-white dark:bg-slate-800 border border-[#8100D1] text-[#8100D1] dark:text-[#a055db] text-xs font-bold rounded-full hover:bg-purple-50 dark:hover:bg-slate-700 transition shadow-sm">
                                                                {t('profile.send_message')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{t('profile.no_connections')}</p>
                                                {!searchConnQuery && <button onClick={() => setActiveTab('explore')} className="px-5 py-2 bg-purple-50 dark:bg-purple-900/20 text-[#8100D1] text-sm font-bold rounded-full hover:bg-purple-100 transition">{t('profile.start_explore')}</button>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {filteredSuggestions.length > 0 ? (
                                        <div className="flex overflow-x-auto gap-4 pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                            {filteredSuggestions.map(user => (
                                                <div key={user.user_id} className="snap-start flex-shrink-0 w-48 sm:w-56 flex flex-col border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition bg-white dark:bg-slate-900 relative">
                                                    <div
                                                        onClick={() => navigate('/profile/' + user.user_id)}
                                                        className="h-20 w-full bg-gradient-to-r from-gray-300 to-gray-400 cursor-pointer relative"
                                                        style={user.banner_url ? { backgroundImage: `url(${user.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                                                    >
                                                        {user.is_mutual == 1 && <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 text-[10px] font-bold text-green-600 rounded-full shadow-sm">2nd</div>}
                                                    </div>

                                                    <div className="px-4 pb-4 flex flex-col items-center flex-1 relative">
                                                        <div
                                                            onClick={() => navigate('/profile/' + user.user_id)}
                                                            className="w-16 h-16 rounded-full overflow-hidden bg-white dark:bg-slate-900 p-1 -mt-8 mb-2 shadow-sm cursor-pointer z-10"
                                                        >
                                                            <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                                                {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <span className="font-bold text-gray-400 text-2xl">{user.name.charAt(0)}</span>}
                                                            </div>
                                                        </div>

                                                        <h5
                                                            onClick={() => navigate('/profile/' + user.user_id)}
                                                            className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 cursor-pointer hover:text-[#8100D1] transition text-center w-full"
                                                        >
                                                            {user.name}
                                                        </h5>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 min-h-[32px] text-center w-full">{user.headline || t('profile.job_seeker')}</p>

                                                        <button onClick={() => handleConnect(user.user_id)} className="mt-4 w-full py-1.5 bg-white dark:bg-slate-800 border border-[#8100D1] text-[#8100D1] dark:text-[#a055db] text-xs font-bold rounded-full hover:bg-purple-50 dark:hover:bg-slate-700 transition shadow-sm">
                                                            + {t('profile.connect_btn')}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">{t('profile.no_suggestions')}</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    
                {/* PENGALAMAN CARD */}
                {/* PENGALAMAN CARD */}
                <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-gray-200/50 dark:border-white/5 overflow-hidden mb-6 relative animate-fade-in-up group" style={{ animationDelay: '0.2s' }}>
                    <div className="absolute inset-0 pointer-events-none rounded-3xl border border-transparent group-hover:border-purple-500/10 transition-colors duration-500 z-50"></div>
                    <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('profile.experience')}</h2>
                        <button onClick={openAddExp} className="p-2 text-gray-500 dark:text-gray-400 hover:text-[#8100D1] hover:bg-purple-50 dark:hover:bg-slate-800 rounded-full transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg></button>
                    </div>
                    <div className="p-6">
                        {experiences.filter(exp => exp && (exp.title || exp.posisi)).length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('profile.no_exp')}</p>
                        ) : (
                            <div className="space-y-6">
                                {experiences.filter(exp => exp && (exp.title || exp.posisi)).map((exp, index, arr) => (
                                    <div key={exp.id || index} className={`flex gap-4 ${index !== arr.length - 1 ? 'border-b border-gray-100 dark:border-slate-800 pb-6' : ''}`}>
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center rounded-lg">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white">{exp.title}</h3>
                                                    <p className="text-sm text-gray-800 dark:text-gray-300">{exp.company_name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{exp.start_date} - {exp.end_date || t('profile.present')} • {exp.location}</p>
                                                </div>
                                                <button onClick={() => openEditExp(exp)} className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                            </div>
                                            {exp.description && <p className="text-sm text-gray-700 dark:text-gray-400 mt-3 whitespace-pre-line">{exp.description}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* PENDIDIKAN CARD */}
                {/* PENDIDIKAN CARD */}
                <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-gray-200/50 dark:border-white/5 overflow-hidden mb-6 relative animate-fade-in-up group" style={{ animationDelay: '0.3s' }}>
                    <div className="absolute inset-0 pointer-events-none rounded-3xl border border-transparent group-hover:border-purple-500/10 transition-colors duration-500 z-50"></div>
                    <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('profile.education')}</h2>
                        <button onClick={openAddEdu} className="p-2 text-gray-500 dark:text-gray-400 hover:text-[#8100D1] hover:bg-purple-50 dark:hover:bg-slate-800 rounded-full transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg></button>
                    </div>
                    <div className="p-6">
                        {educations.filter(edu => edu && (edu.school || edu.institusi)).length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{t('profile.no_edu')}</p>
                        ) : (
                            <div className="space-y-6">
                                {educations.filter(edu => edu && (edu.school || edu.institusi)).map((edu, index, arr) => (
                                    <div key={edu.id || index} className={`flex gap-4 ${index !== arr.length - 1 ? 'border-b border-gray-100 dark:border-slate-800 pb-6' : ''}`}>
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center rounded-lg">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path d="M12 14v6" /></svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white">{edu.school || edu.institusi}</h3>
                                                    <p className="text-sm text-gray-800 dark:text-gray-300">{edu.degree}{edu.field_of_study ? `, ${edu.field_of_study}` : ''}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{edu.start_date} - {edu.end_date || t('profile.present')}</p>
                                                </div>
                                                <button onClick={() => openEditEdu(edu)} className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                            </div>
                                            {edu.description && <p className="text-sm text-gray-700 dark:text-gray-400 mt-3 whitespace-pre-line">{edu.description}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* SERTIFIKASI & KEAHLIAN CARD */}
                    {/* SERTIFIKASI & KEAHLIAN CARD */}
                    <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-gray-200/50 dark:border-white/5 overflow-hidden h-full relative animate-fade-in-up group" style={{ animationDelay: '0.4s' }}>
                        <div className="absolute inset-0 pointer-events-none rounded-3xl border border-transparent group-hover:border-purple-500/10 transition-colors duration-500 z-50"></div>
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('profile.certifications')}</h2>
                            <button onClick={openAddCert} className="p-2 text-gray-500 dark:text-gray-400 hover:text-[#8100D1] hover:bg-purple-50 dark:hover:bg-slate-800 rounded-full transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg></button>
                        </div>
                        <div className="p-6">
                            {certifications.filter(cert => cert && (cert.name)).length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('profile.no_certs')}</p>
                            ) : (
                                <div className="space-y-6">
                                    {certifications.filter(cert => cert && (cert.name)).map((cert, index, arr) => (
                                        <div key={cert.id || index} className={`flex gap-4 ${index !== arr.length - 1 ? 'border-b border-gray-100 dark:border-slate-800 pb-6' : ''}`}>
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center rounded-lg">
                                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 dark:text-white">{cert.name}</h3>
                                                        <p className="text-sm text-gray-800 dark:text-gray-300">{cert.organization}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('profile.issued_date')}: {cert.issue_date || '-'}</p>
                                                    </div>
                                                    <button onClick={() => openEditCert(cert)} className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                                </div>
                                                {cert.description && <p className="text-sm text-gray-700 dark:text-gray-400 mt-3 whitespace-pre-line">{cert.description}</p>}
                                                {cert.file_url && (
                                                    <a href={cert.file_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-[#8100D1] font-semibold hover:bg-purple-50 dark:hover:bg-slate-800 transition">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                        {t('profile.view_credential')}
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
                    {/* CV / RESUME CARD */}
                    <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-gray-200/50 dark:border-white/5 overflow-hidden h-full relative animate-fade-in-up group" style={{ animationDelay: '0.5s' }}>
                        <div className="absolute inset-0 pointer-events-none rounded-3xl border border-transparent group-hover:border-purple-500/10 transition-colors duration-500 z-50"></div>
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('profile.resume')}</h2>
                            {!cvUrl && (
                                <button onClick={() => cvInputRef.current?.click()} className="p-2 text-gray-500 dark:text-gray-400 hover:text-[#8100D1] hover:bg-purple-50 dark:hover:bg-slate-800 rounded-full transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg></button>
                            )}
                        </div>
                        <div className="p-6">
                            {cvUrl ? (
                                <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between bg-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11v6m-3-3h6" /></svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{t('profile.my_resume')}</p>
                                            <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#8100D1] font-semibold hover:underline">{t('profile.view_doc')}</a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => cvInputRef.current?.click()} className="text-sm font-semibold text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 bg-white shadow-sm hover:bg-gray-50 transition">{t('profile.update')}</button>
                                        <button onClick={handleDeleteCV} className="text-sm font-semibold text-red-600 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 bg-red-50 hover:bg-red-100 transition">{t('profile.delete')}</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4 text-[#8100D1]">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1">{t('profile.upload_cv')}</h3>
                                    <p className="text-sm text-gray-500 mb-4">PDF, {t('profile.max_size', { size: '5MB' })}</p>
                                    <button onClick={() => cvInputRef.current?.click()} disabled={isUploadingCv} className="px-5 py-2 bg-white border border-[#8100D1] text-[#8100D1] font-bold text-sm rounded-full hover:bg-purple-50 transition shadow-sm">
                                        {isUploadingCv ? t('profile.uploading') : t('profile.select_file')}
                                    </button>
                                </div>
                            )}
                            <input type="file" ref={cvInputRef} onChange={handleCVUpload} accept=".pdf" className="hidden" />
                        </div>
                    </div>
                </div>

                {/* MODAL SERTIFIKASI */}
                    {isCertModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                                    <h3 className="font-bold text-gray-800 text-lg">{certForm.id ? t('profile.edit_cert') : t('profile.add_cert')}</h3>
                                    <button onClick={() => setIsCertModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                </div>
                                <div className="p-6 overflow-y-auto custom-scrollbar">
                                    <form id="certForm" onSubmit={handleSaveCertification} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('profile.cert_name')} *</label>
                                            <input type="text" value={certForm.name} onChange={e => setCertForm({ ...certForm, name: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8100D1] outline-none text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Organisasi Penerbit *</label>
                                            <input type="text" value={certForm.organization} onChange={e => setCertForm({ ...certForm, organization: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8100D1] outline-none text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal Diterbitkan</label>
                                            <input type="text" placeholder="Bulan Tahun (cth: Jan 2024)" value={certForm.issue_date} onChange={e => setCertForm({ ...certForm, issue_date: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8100D1] outline-none text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">File Sertifikat (Opsional, PDF/Gambar)</label>
                                            <input type="file" ref={certInputRef} onChange={handleUploadCertFile} accept=".pdf,image/*" className="hidden" />
                                            <div className="flex items-center gap-3">
                                                <button type="button" onClick={() => certInputRef.current?.click()} disabled={isUploadingCert} className="px-4 py-2 border border-[#8100D1] text-[#8100D1] font-semibold text-sm rounded-lg hover:bg-purple-50 transition">
                                                    {isUploadingCert ? 'Mengunggah...' : 'Pilih File'}
                                                </button>
                                                {certForm.file_url && <a href={certForm.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 font-semibold hover:underline">Lihat File Tersimpan</a>}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Keterangan / ID Kredensial</label>
                                            <textarea value={certForm.description} onChange={e => setCertForm({ ...certForm, description: e.target.value })} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8100D1] outline-none text-sm"></textarea>
                                        </div>
                                    </form>
                                </div>
                                <div className="p-6 border-t border-gray-100 flex justify-between bg-gray-50">
                                    {certForm.id ? (
                                        <button type="button" onClick={() => handleDeleteCertification(certForm.id)} className="px-5 py-2 text-red-600 font-semibold rounded-full hover:bg-red-50 text-sm">Hapus</button>
                                    ) : <div></div>}
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setIsCertModalOpen(false)} className="px-5 py-2 text-gray-600 font-semibold rounded-full hover:bg-gray-100 text-sm">Batal</button>
                                        <button type="submit" form="certForm" className="px-5 py-2 bg-[#8100D1] text-white font-bold rounded-full hover:bg-purple-800 text-sm shadow-sm transition">Simpan</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
    );
}