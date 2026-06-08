import React, { useState } from 'react';
import axios from 'axios';

export default function ReportModal({ isOpen, onClose, postId, onSuccess }) {
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const reportOptions = [
        { id: 'spam', label: 'Spam atau menyesatkan' },
        { id: 'harassment', label: 'Pelecehan atau perundungan (Bullying)' },
        { id: 'hate_speech', label: 'Ujaran kebencian' },
        { id: 'inappropriate', label: 'Konten tidak pantas atau seksual' },
        { id: 'violence', label: 'Kekerasan atau ancaman fisik' },
        { id: 'other', label: 'Alasan lainnya...' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let finalReason = selectedReason;
        if (selectedReason === 'other') {
            if (!customReason.trim()) {
                alert('Silakan tuliskan alasan Anda.');
                return;
            }
            finalReason = customReason;
        }

        if (!finalReason) {
            alert('Silakan pilih salah satu alasan.');
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.post(`/api/community/posts/${postId}/report`, { reason: finalReason });
            alert('Postingan berhasil dilaporkan. Terima kasih atas laporan Anda.');
            onSuccess(); // Close dropdown and modal, show success
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal melaporkan postingan.');
        } finally {
            setIsSubmitting(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex flex-col justify-center items-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            {/* Overlay */}
            <div className="absolute inset-0" onClick={onClose}></div>
            
            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up sm:animate-fade-in-up">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-lg">Laporkan Postingan</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                        Tolong beritahu kami mengapa Anda melaporkan postingan ini. Laporan Anda bersifat anonim, kecuali jika Anda melaporkan pelanggaran hak cipta.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {reportOptions.map(option => (
                            <label 
                                key={option.id} 
                                className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${selectedReason === option.id ? 'border-[#8100D1] bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                <input 
                                    type="radio" 
                                    name="report_reason" 
                                    value={option.id} 
                                    checked={selectedReason === option.id}
                                    onChange={(e) => setSelectedReason(e.target.value)}
                                    className="w-4 h-4 text-[#8100D1] border-gray-300 focus:ring-[#8100D1]"
                                />
                                <span className="ml-3 text-sm font-medium text-gray-900">{option.label}</span>
                            </label>
                        ))}

                        {selectedReason === 'other' && (
                            <div className="mt-3 animate-fade-in">
                                <textarea
                                    autoFocus
                                    placeholder="Tuliskan alasan spesifik Anda..."
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    className="w-full text-sm outline-none resize-none p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#8100D1] focus:border-[#8100D1]"
                                    rows="3"
                                />
                            </div>
                        )}

                        <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                type="submit" 
                                disabled={!selectedReason || isSubmitting}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center ${(!selectedReason || isSubmitting) ? 'bg-purple-300 cursor-not-allowed' : 'bg-[#8100D1] hover:bg-purple-700'}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memproses...
                                    </>
                                ) : 'Kirim Laporan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
