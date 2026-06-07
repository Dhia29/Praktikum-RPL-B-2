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
                alert('Lowongan berhasil diperbarui!');
            } else {
                // Create
                await axios.post('/api/jobs', formData);
                alert('Lowongan berhasil dibuat!');
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan lowongan.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0">
                    <h2 className="text-xl font-bold text-gray-800">
                        {initialData ? 'Edit Lowongan Kerja' : 'Buat Lowongan Baru'}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form id="jobForm" onSubmit={handleSubmit} className="space-y-5">
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Lowongan / Posisi</label>
                            <input
                                type="text"
                                name="judul"
                                value={formData.judul}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8100D1] focus:border-[#8100D1] outline-none transition-all"
                                placeholder="Contoh: Software Engineer, UI/UX Designer"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori (Tipe Pekerjaan)</label>
                                <select
                                    name="kategori"
                                    value={formData.kategori}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8100D1] focus:border-[#8100D1] outline-none transition-all bg-white"
                                >
                                    <option value="" disabled>Pilih kategori</option>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Internship">Internship</option>
                                    <option value="Contract">Contract</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Lokasi</label>
                                <input
                                    type="text"
                                    name="lokasi"
                                    value={formData.lokasi}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8100D1] focus:border-[#8100D1] outline-none transition-all"
                                    placeholder="Contoh: Jakarta Pusat, Remote"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Batas Waktu Pendaftaran</label>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8100D1] focus:border-[#8100D1] outline-none transition-all"
                                />
                            </div>
                            
                            {initialData && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8100D1] focus:border-[#8100D1] outline-none transition-all bg-white"
                                    >
                                        <option value="Aktif">Aktif</option>
                                        <option value="Ditutup">Ditutup</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi & Persyaratan Pekerjaan</label>
                            <textarea
                                name="deskripsi"
                                value={formData.deskripsi}
                                onChange={handleChange}
                                required
                                rows="6"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8100D1] focus:border-[#8100D1] outline-none transition-all resize-none"
                                placeholder="Jelaskan peran, tanggung jawab, dan kualifikasi yang dibutuhkan..."
                            ></textarea>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                    <button 
                        type="button" 
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button 
                        type="submit" 
                        form="jobForm"
                        disabled={isLoading}
                        className="px-5 py-2 text-sm font-medium text-white bg-[#8100D1] hover:bg-purple-800 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                    >
                        {isLoading && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        )}
                        {initialData ? 'Simpan Perubahan' : 'Terbitkan Lowongan'}
                    </button>
                </div>
            </div>
        </div>
    );
}
