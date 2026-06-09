import React, { useState } from 'react';
import axios from 'axios';
import { useOutletContext, useNavigate } from 'react-router-dom';

export default function JobDetailsModal({ isOpen, onClose, job, onSuccess }) {
    if (!isOpen || !job) return null;

    const { currentUser } = useOutletContext() || {};
    const navigate = useNavigate();
    const isSeeker = currentUser?.role === 'seeker';
    
    const [step, setStep] = useState(1);
    const [isApplying, setIsApplying] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);

    // Form states
    const [nik, setNik] = useState('');
    const [tanggalLahir, setTanggalLahir] = useState('');
    const [ijazahFile, setIjazahFile] = useState(null);

    // Using has_applied from the backend response
    const hasApplied = job.has_applied;

    const handleNextStep = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (!isSeeker) {
            alert('Hanya pencari kerja yang dapat melamar pekerjaan ini.');
            return;
        }
        setStep(2);

        // Fetch profile data
        setIsLoadingProfile(true);
        try {
            const res = await axios.get(`/api/profile/${currentUser.id}`);
            setProfileData(res.data);
        } catch (err) {
            console.error('Failed to load profile data', err);
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();

        if (!nik || !tanggalLahir || !ijazahFile) {
            alert('Harap lengkapi semua data formulir!');
            return;
        }

        setIsApplying(true);
        try {
            const formData = new FormData();
            formData.append('nik', nik);
            formData.append('tanggal_lahir', tanggalLahir);
            formData.append('ijazah', ijazahFile);

            const response = await axios.post(`/api/jobs/${job.id}/apply`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert(response.data.message || 'Berhasil melamar pekerjaan!');
            
            // Reset state
            setStep(1);
            setNik('');
            setTanggalLahir('');
            setIjazahFile(null);

            if (onSuccess) onSuccess(); // Refresh jobs to update has_applied status
            onClose();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Gagal melamar pekerjaan.';
            alert(errorMsg);
        } finally {
            setIsApplying(false);
        }
    };

    // Format deadline
    const formatDeadline = (dateString) => {
        if (!dateString) return 'Tidak ada batas waktu';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Helper to extract logo from URL or use placeholder
    const getLogo = () => {
        if (job.logo_url) return <img src={`/storage/${job.logo_url}`} alt={`${job.company} logo`} className="w-full h-full object-cover" />;
        return <span className="text-3xl text-gray-400 font-bold">{job.company ? job.company.charAt(0).toUpperCase() : 'C'}</span>;
    };

    const handleCloseModal = () => {
        setStep(1);
        setNik('');
        setTanggalLahir('');
        setIjazahFile(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl relative my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header (Banner + Action) */}
                <div className="bg-gradient-to-r from-purple-50 to-white px-8 py-6 border-b border-gray-100 flex items-start justify-between">
                    <div className="flex gap-6 items-center">
                        <div className="w-24 h-24 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {getLogo()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.role}</h2>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className="font-semibold text-gray-800">{job.company}</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-gray-600 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                    {job.location}
                                </span>
                            </div>
                            <div className="mt-3 flex gap-2">
                                <span className="bg-purple-100 text-[#8100D1] text-xs font-bold px-3 py-1 rounded-full">{job.type}</span>
                                {job.deadline && (
                                    <span className="bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">
                                        Berakhir: {formatDeadline(job.deadline)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={handleCloseModal}
                        className="p-2 bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-full transition-colors border border-gray-100"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {step === 1 ? (
                    <>
                        {/* Content Body */}
                        <div className="p-8 max-h-[50vh] overflow-y-auto">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#8100D1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                Deskripsi & Persyaratan
                            </h3>
                            <div className="prose prose-sm prose-purple max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">
                                {job.description || 'Tidak ada deskripsi spesifik untuk lowongan ini.'}
                            </div>
                        </div>

                        {/* Footer / Actions */}
                        <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                                {hasApplied ? 'Anda sudah melamar pekerjaan ini.' : 'Pastikan profil Anda sudah diperbarui sebelum melamar.'}
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleCloseModal}
                                    className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 bg-white border border-gray-300 rounded-lg transition-colors"
                                >
                                    Tutup
                                </button>
                                
                                <button 
                                    onClick={handleNextStep}
                                    disabled={hasApplied}
                                    className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 shadow-sm
                                        ${hasApplied 
                                            ? 'bg-gray-300 text-white cursor-not-allowed' 
                                            : 'bg-[#8100D1] hover:bg-purple-800 text-white'}`}
                                >
                                    {hasApplied ? (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            Sudah Dilamar
                                        </>
                                    ) : (
                                        'Lamar Pekerjaan'
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <form onSubmit={handleApply}>
                            {/* Content Body - Form */}
                            <div className="p-8 max-h-[60vh] overflow-y-auto">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#8100D1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                    Review & Lengkapi Data Lamaran
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">Data dari profil Anda akan disertakan dalam lamaran. Silakan lengkapi informasi rahasia tambahan di bawah ini.</p>

                                {/* Profile Data Preview */}
                                <div className="mb-8 bg-purple-50/50 rounded-xl border border-purple-100 p-5">
                                    <h4 className="text-sm font-bold text-gray-800 mb-4 border-b border-purple-100 pb-2">Data Profil (Tersinkronisasi)</h4>
                                    {isLoadingProfile ? (
                                        <div className="flex items-center justify-center py-4">
                                            <div className="w-5 h-5 border-2 border-[#8100D1]/30 border-t-[#8100D1] rounded-full animate-spin"></div>
                                            <span className="ml-2 text-sm text-gray-500">Memuat data profil...</span>
                                        </div>
                                    ) : profileData ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <span className="block text-xs font-medium text-gray-500 mb-0.5">Nama Lengkap</span>
                                                    <span className="block text-sm font-semibold text-gray-900">{profileData.name || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs font-medium text-gray-500 mb-0.5">Headline</span>
                                                    <span className="block text-sm font-semibold text-gray-900">{profileData.headline || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs font-medium text-gray-500 mb-0.5">Lokasi Saat Ini</span>
                                                    <span className="block text-sm font-semibold text-gray-900">{profileData.location || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs font-medium text-gray-500 mb-0.5">Pendidikan Terakhir</span>
                                                    <span className="block text-sm font-semibold text-gray-900">{profileData.education || '-'}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 pt-4 border-t border-purple-100">
                                                <span className="block text-xs font-medium text-gray-500 mb-2">Curriculum Vitae (CV)</span>
                                                {profileData.cv_url ? (
                                                    <a href={profileData.cv_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-[#8100D1] hover:bg-gray-50 hover:border-purple-200 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                                        Lihat CV Terlampir
                                                    </a>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-sm text-red-500 bg-red-50 px-2 py-1 rounded">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                                        Anda belum mengunggah CV. Harap perbarui profil.
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-red-500">Gagal memuat profil. Silakan coba lagi.</p>
                                    )}
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">NIK (Nomor Induk Kependudukan)</label>
                                        <input 
                                            type="text" 
                                            required
                                            maxLength="16"
                                            value={nik}
                                            onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#8100D1] focus:border-[#8100D1] transition-colors"
                                            placeholder="Masukkan 16 digit NIK"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Lahir</label>
                                        <input 
                                            type="date" 
                                            required
                                            value={tanggalLahir}
                                            onChange={(e) => setTanggalLahir(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#8100D1] focus:border-[#8100D1] transition-colors text-gray-700"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Ijazah (PDF/JPG/PNG)</label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#8100D1] transition-colors bg-gray-50">
                                            <div className="space-y-1 text-center">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <div className="flex text-sm text-gray-600 justify-center">
                                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#8100D1] hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#8100D1] px-1">
                                                        <span>Upload a file</span>
                                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png" required onChange={(e) => setIjazahFile(e.target.files[0])} />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PDF, PNG, JPG up to 5MB</p>
                                                {ijazahFile && (
                                                    <p className="text-sm font-semibold text-green-600 mt-2">Terpilih: {ijazahFile.name}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer / Actions */}
                            <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <button 
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    &larr; Kembali
                                </button>
                                <div className="flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 bg-white border border-gray-300 rounded-lg transition-colors"
                                    >
                                        Batal
                                    </button>
                                    
                                    <button 
                                        type="submit"
                                        disabled={isApplying}
                                        className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 shadow-sm
                                            ${isApplying 
                                                ? 'bg-[#8100D1]/80 text-white cursor-wait' 
                                                : 'bg-[#8100D1] hover:bg-purple-800 text-white'}`}
                                    >
                                        {isApplying ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            'Kirim Lamaran'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
