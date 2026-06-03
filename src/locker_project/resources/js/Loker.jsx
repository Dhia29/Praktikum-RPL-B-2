import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Loker() {
    // STATE UNTUK DATA
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // STATE UNTUK FILTER & PENCARIAN
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [sortOrder, setSortOrder] = useState('terbaru');

    // MENGAMBIL DATA
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axios.get('/api/jobs');
                setJobs(response.data);
                setFilteredJobs(response.data);
            } catch (error) {
                console.error('Gagal mengambil data loker:', error);
                setJobs([]);
                setFilteredJobs([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, []);

    // LOGIKA FILTER & SORTIR
    useEffect(() => {
        let result = [...jobs];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(job =>
                job.role?.toLowerCase().includes(query) ||
                job.company?.toLowerCase().includes(query)
            );
        }

        if (filterType) {
            result = result.filter(job => job.type === filterType);
        }

        switch (sortOrder) {
            case 'terbaru':
                result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'terlama':
                result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'a-z':
                result.sort((a, b) => (a.role || '').localeCompare(b.role || ''));
                break;
            case 'z-a':
                result.sort((a, b) => (b.role || '').localeCompare(a.role || ''));
                break;
            default:
                break;
        }

        setFilteredJobs(result);
    }, [searchQuery, filterType, sortOrder, jobs]);

    return (
        // KONTAINER UTAMA: items-start sangat penting agar sisi kanan tidak memanjang mengikuti sisi kiri
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start w-full">

            {/* KONTAINER KIRI (Data Loker): Lebar 70%, akan memanjang ke bawah sesuai jumlah data */}
            <div className="w-full md:w-[65%] lg:w-[70%] flex flex-col gap-4">

                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <span className="text-gray-400 font-medium animate-pulse">Memuat data loker...</span>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 text-center shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Belum Ada Lowongan</h3>
                        <p className="text-gray-500 text-sm max-w-sm mt-2">
                            Saat ini belum ada peluang karir yang tersedia atau sesuai dengan kriteria pencarian Anda. Silakan cek kembali nanti.
                        </p>
                    </div>
                ) : (
                    filteredJobs.map((job) => (
                        <div key={job.id} className="bg-white rounded-xl p-6 flex flex-col sm:flex-row gap-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400 font-bold text-2xl border border-gray-200">
                                {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">{job.role}</h3>
                                    <span className="bg-purple-50 text-[#8100D1] text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ml-2">
                                        {job.type}
                                    </span>
                                </div>
                                <h4 className="text-sm text-[#8100D1] font-medium mb-3">
                                    {job.company} <span className="text-gray-400 mx-1">•</span> <span className="text-gray-500 font-normal">{job.location}</span>
                                </h4>
                                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                                    {job.description}
                                </p>
                                <button className="text-sm font-semibold text-[#8100D1] hover:text-purple-900 transition-colors">
                                    Lihat Detail &rarr;
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* KONTAINER KANAN (Pencarian & Filter): Lebar 30%, STICKY akan membuatnya diam saat halaman di-scroll */}
            <div className="w-full md:w-[35%] lg:w-[30%] flex flex-col gap-5 sticky top-28">

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm">Pencarian</h3>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Posisi / perusahaan..."
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8100D1] focus:bg-white transition-all text-sm"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm">Filter & Urutkan</h3>
                    <div className="flex flex-col gap-4">

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Kategori Pekerjaan</label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full bg-gray-50 text-gray-700 border border-gray-200 text-sm font-medium py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8100D1] transition cursor-pointer appearance-none"
                            >
                                <option value="">Semua Kategori</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Internship">Internship</option>
                                <option value="Contract">Contract</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Urutkan Berdasarkan</label>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="w-full bg-gray-50 text-gray-700 border border-gray-200 text-sm font-medium py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8100D1] transition cursor-pointer appearance-none"
                            >
                                <option value="terbaru">Paling Baru Ditambahkan</option>
                                <option value="terlama">Paling Lama Ditambahkan</option>
                                <option value="a-z">Nama Posisi (A - Z)</option>
                                <option value="z-a">Nama Posisi (Z - A)</option>
                            </select>
                        </div>

                    </div>
                </div>

            </div>

        </div>
    );
}