import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function JobsIndexAdmin() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Semua Status');

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/jobs');
            setJobs(response.data.jobs || []);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleVerify = async (jobId) => {
        try {
            await axios.post(`/api/admin/jobs/${jobId}/verify`);
            fetchJobs();
        } catch (error) {
            console.error("Failed to verify job", error);
            alert("Gagal menyetujui lowongan");
        }
    };

    const handleDelete = async (jobId) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus lowongan ini?')) return;
        try {
            await axios.delete(`/api/admin/jobs/${jobId}`);
            fetchJobs();
        } catch (error) {
            console.error("Failed to delete job", error);
            alert("Gagal menghapus lowongan");
        }
    };

    const filteredJobs = jobs.filter(job => {
        if (filter === 'Semua Status') return true;
        if (filter === 'Menunggu Persetujuan') return job.status === 'pending';
        if (filter === 'Dipublikasikan') return job.status === 'published';
        return true;
    });

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-100 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Daftar Lowongan Pekerjaan</h3>
                    <p className="text-sm text-gray-500 mt-1">Tinjau, setujui, atau hapus lowongan pekerjaan yang dipublikasikan oleh perusahaan.</p>
                </div>
                <div className="flex gap-2">
                    <select 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#8100D1] focus:border-[#8100D1] block px-3 py-2 outline-none"
                    >
                        <option>Semua Status</option>
                        <option>Menunggu Persetujuan</option>
                        <option>Dipublikasikan</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                            <th className="p-4 border-b border-gray-100 w-1/3">Detail Pekerjaan</th>
                            <th className="p-4 border-b border-gray-100">Perusahaan</th>
                            <th className="p-4 border-b border-gray-100">Lokasi & Tipe</th>
                            <th className="p-4 border-b border-gray-100">Status</th>
                            <th className="p-4 border-b border-gray-100 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-500">Memuat data lowongan...</td>
                            </tr>
                        ) : filteredJobs.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-500">Tidak ada lowongan pekerjaan saat ini.</td>
                            </tr>
                        ) : (
                            filteredJobs.map(job => (
                                <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 text-base mb-1">{job.role}</span>
                                            <span className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{job.description}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-gray-800">
                                        {job.company_name}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="flex items-center gap-1.5 text-gray-600 text-xs">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                {job.location}
                                            </span>
                                            <span className="inline-flex max-w-max px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                                                {job.type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {job.status === 'published' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Dipublikasikan
                                            </span>
                                        ) : job.status === 'pending' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Menunggu
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {job.status === 'pending' && (
                                                <button onClick={() => handleVerify(job.id)} title="Setujui Lowongan" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-200">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(job.id)} title="Hapus Lowongan" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50">
                <span>Menampilkan {filteredJobs.length} lowongan</span>
                <div className="flex gap-1">
                    <button className="px-3 py-1 bg-white border border-gray-200 rounded text-gray-400 cursor-not-allowed">Sebelumnya</button>
                    <button className="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-700">Selanjutnya</button>
                </div>
            </div>
        </div>
    );
}
