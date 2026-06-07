import React, { useState } from 'react';
import axios from 'axios';

const AppointmentModal = ({ isOpen, onClose, activeRoom, onAppointmentSent }) => {
    const [appointmentForm, setAppointmentForm] = useState({ title: '', date: '', time: '', description: '', link: '' });
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!appointmentForm.title || !appointmentForm.date || !appointmentForm.time) return;
        
        setSubmitting(true);
        const dateTime = `${appointmentForm.date} ${appointmentForm.time}:00`;
        
        // Kirim langsung ke server
        const formData = new FormData();
        formData.append('to_user_id', activeRoom.id);
        formData.append('konten', 'Mengirim undangan jadwal...');
        formData.append('appointment_date', dateTime);
        formData.append('appointment_title', appointmentForm.title);
        if (appointmentForm.description) formData.append('appointment_description', appointmentForm.description);
        if (appointmentForm.link) formData.append('appointment_link', appointmentForm.link);

        try {
            const res = await axios.post('/api/messages/send', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Reset state internal
            setAppointmentForm({ title: '', date: '', time: '', description: '', link: '' });
            
            // Beri tahu parent bahwa jadwal berhasil dikirim
            onAppointmentSent(res.data.data);
            onClose();
        } catch (error) {
            console.error("Gagal mengirim jadwal", error);
            alert("Gagal mengirim jadwal.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <h3 className="font-bold text-gray-800 text-lg">Schedule time</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh] bg-white">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Title</label>
                        <input type="text" value={appointmentForm.title} onChange={(e) => setAppointmentForm({...appointmentForm, title: e.target.value})} placeholder="Add title..." className="w-full border-b-2 border-gray-200 focus:border-[#8100D1] py-2 text-gray-800 outline-none transition-colors" />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                            <input 
                                type="date" 
                                value={appointmentForm.date} 
                                onChange={(e) => {
                                    setAppointmentForm({...appointmentForm, date: e.target.value});
                                    e.target.blur();
                                }} 
                                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-gray-700 outline-none focus:ring-2 focus:ring-[#8100D1] focus:border-transparent transition-all" 
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Time</label>
                            <input 
                                type="time" 
                                value={appointmentForm.time} 
                                onChange={(e) => {
                                    setAppointmentForm({...appointmentForm, time: e.target.value});
                                    e.target.blur();
                                }} 
                                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-gray-700 outline-none focus:ring-2 focus:ring-[#8100D1] focus:border-transparent transition-all" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                        <textarea value={appointmentForm.description} onChange={(e) => setAppointmentForm({...appointmentForm, description: e.target.value})} placeholder="Add description details..." rows="2" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-gray-700 outline-none focus:ring-2 focus:ring-[#8100D1] focus:border-transparent transition-all resize-none"></textarea>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Meeting Link (Optional)</label>
                        <input type="url" value={appointmentForm.link} onChange={(e) => setAppointmentForm({...appointmentForm, link: e.target.value})} placeholder="https://meet.google.com/..." className="w-full border border-gray-300 rounded-xl px-3 py-2 text-gray-700 outline-none focus:ring-2 focus:ring-[#8100D1] focus:border-transparent transition-all" />
                    </div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-2xl border-t border-gray-100">
                    <button onClick={onClose} disabled={submitting} className="text-gray-500 hover:bg-gray-200 px-6 py-2.5 rounded-full font-medium transition-colors disabled:opacity-50">
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={submitting || !appointmentForm.title || !appointmentForm.date || !appointmentForm.time}
                        className="bg-[#8100D1] hover:bg-[#6a00ac] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-full transition-colors shadow-sm w-full"
                    >
                        {submitting ? 'Sending...' : 'Send Schedule'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppointmentModal;
