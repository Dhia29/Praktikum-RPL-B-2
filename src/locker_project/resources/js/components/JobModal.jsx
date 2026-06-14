import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function JobModal({ isOpen, onClose, onSuccess, initialData = null }) {
    const [formData, setFormData] = useState({
        judul: '',
        kategori: '',
        lokasi: '',
        deskripsi: '',
        deadline: '',
        status: 'Aktif'
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                judul: initialData.role || '',
                kategori: initialData.type || '',
                lokasi: initialData.location || '',
                deskripsi: initialData.description || '',
                deadline: initialData.deadline ? initialData.deadline.substring(0, 10) : '',
                status: initialData.status || 'Aktif'
            });
        } else {
            setFormData({
                judul: '',
                kategori: '',
                lokasi: '',
                deskripsi: '',
                deadline: '',
                status: 'Aktif'
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (initialData) {
                // Update
                await axios.put(`/api/jobs/${initialData.id}`, formData);
                window.alert('Lowongan berhasil diperbarui!');
            } else {
                // Create
                await axios.post('/api/jobs', formData);
                window.alert('Lowongan berhasil dibuat!');
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            window.alert(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan lowongan.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-md p-4">
            <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl rounded-3xl w-full max-w-2xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] dark:shadow-[0_0_30px_rgba(255,255,255,0.03)] border border-white/40 dark:border-white/5 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300">
                <div className="px-6 py-5 border-b border-gray-200/50 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
                    <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8100D1] to-purple-600 dark:from-[#c682ff] dark:to-purple-400">
                        {initialData ? 'Edit Lowongan Kerja' : 'Buat Lowongan Baru'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-[#8100D1] dark:hover:text-[#c682ff] p-2 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-full transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form id="jobForm" onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Judul Lowongan / Posisi</label>
                            <input
                                type="text"
                                name="judul"
                                value={formData.judul}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/30 focus:border-[#8100D1] outline-none transition-all shadow-sm"
                                placeholder="Contoh: Software Engineer, UI/UX Designer"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Kategori (Tipe Pekerjaan)</label>
                                <select
                                    name="kategori"
                                    value={formData.kategori}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/30 focus:border-[#8100D1] outline-none transition-all shadow-sm appearance-none"
                                >
                                    <option value="" disabled>Pilih kategori</option>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Internship">Internship</option>
                                    <option value="Contract">Contract</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Lokasi</label>
                                <input
                                    type="text"
                                    name="lokasi"
                                    value={formData.lokasi}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/30 focus:border-[#8100D1] outline-none transition-all shadow-sm"
                                    placeholder="Contoh: Jakarta Pusat, Remote"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Batas Waktu Pendaftaran</label>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/30 focus:border-[#8100D1] outline-none transition-all shadow-sm"
                                />
                            </div>

                            {initialData && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/30 focus:border-[#8100D1] outline-none transition-all shadow-sm appearance-none"
                                    >
                                        <option value="Aktif">Aktif</option>
                                        <option value="Ditutup">Ditutup</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Deskripsi & Persyaratan Pekerjaan</label>
                            <textarea
                                name="deskripsi"
                                value={formData.deskripsi}
                                onChange={handleChange}
                                required
                                rows="6"
                                className="w-full px-4 py-3 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/30 focus:border-[#8100D1] outline-none transition-all shadow-sm resize-none"
                                placeholder="Jelaskan peran, tanggung jawab, dan kualifikasi yang dibutuhkan..."
                            ></textarea>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-5 border-t border-gray-200/50 dark:border-white/5 flex justify-end gap-3 bg-gray-50/50 dark:bg-slate-800/30 rounded-b-3xl">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 bg-white/80 dark:bg-slate-800/80 border border-gray-200/50 dark:border-slate-600 rounded-xl transition-all shadow-sm"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="jobForm"
                        disabled={isLoading}
                        className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-[0_4px_15px_rgba(129,0,209,0.2)] hover:shadow-[0_4px_20px_rgba(129,0,209,0.4)]
                            ${isLoading
                                ? 'bg-[#8100D1]/80 text-white cursor-wait shadow-none'
                                : 'bg-gradient-to-r from-[#8100D1] to-purple-600 hover:to-purple-700 text-white transform hover:-translate-y-0.5'}`}
                    >
                        {isLoading && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        )}
                        {initialData ? 'Simpan Perubahan' : 'Terbitkan Lowongan'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
