import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function DashboardAdmin() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingCompanies: 0,
        pendingJobs: 0
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('/api/admin/dashboard');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchStats();
    }, []);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Stat Card 1 */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 mb-1">Total Pengguna</p>
                            <h3 className="text-3xl font-bold text-gray-800">{loading ? '...' : stats.totalUsers}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                    </div>
                    <div className="text-sm">
                        <span className="text-green-500 font-medium">+12%</span> <span className="text-gray-400">dari bulan lalu</span>
                    </div>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 mb-1">Menunggu Verifikasi</p>
                            <h3 className="text-3xl font-bold text-gray-800">{loading ? '...' : stats.pendingCompanies}</h3>
                        </div>
                        <div className="p-3 bg-orange-50 text-orange-500 rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                    </div>
                    <div className="text-sm">
                        <Link to="/users" className="text-[#8100D1] font-medium hover:underline flex items-center gap-1">Tinjau Perusahaan <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></Link>
                    </div>
                </div>

                {/* Stat Card 3 */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 mb-1">Lowongan Tertunda</p>
                            <h3 className="text-3xl font-bold text-gray-800">{loading ? '...' : stats.pendingJobs}</h3>
                        </div>
                        <div className="p-3 bg-purple-50 text-[#8100D1] rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                    </div>
                    <div className="text-sm">
                        <Link to="/jobs" className="text-[#8100D1] font-medium hover:underline flex items-center gap-1">Tinjau Lowongan <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Aktivitas Terbaru</h3>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <p className="text-gray-500 font-medium">Belum ada aktivitas baru</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#8100D1] to-purple-800 rounded-xl shadow-md p-6 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-2">Status Sistem Validasi</h3>
                        <p className="text-purple-100 text-sm mb-6 leading-relaxed">
                            Platform LockER beroperasi secara normal. Pastikan Anda memeriksa tab verifikasi perusahaan dan moderasi lowongan secara berkala.
                        </p>
                        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-white text-[#8100D1] font-semibold rounded-lg text-sm hover:bg-gray-50 transition-colors shadow-sm">
                            Lihat Laporan Sistem
                        </button>
                    </div>
                    {/* Decorative Circle */}
                    <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                </div>
            </div>

            {/* System Report Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 backdrop-blur-sm transition-opacity">
                    <div className="relative p-4 w-full max-w-2xl max-h-full">
                        <div className="relative bg-white rounded-xl shadow-lg">
                            <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100 rounded-t">
                                <h3 className="text-xl font-bold text-gray-800">
                                    Laporan Status Sistem
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                    </svg>
                                    <span className="sr-only">Tutup modal</span>
                                </button>
                            </div>
                            <div className="p-4 md:p-5 space-y-4">
                                <div className="p-4 bg-green-50 rounded-lg border border-green-100 flex items-start gap-4">
                                    <svg className="w-6 h-6 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <div>
                                        <h4 className="font-semibold text-green-800">Sistem Berjalan Normal</h4>
                                        <p className="text-sm text-green-700 mt-1">Semua layanan utama dan database dapat diakses tanpa kendala. Latensi rata-rata berada di bawah 50ms.</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 font-medium">Uptime Bulan Ini</p>
                                        <p className="text-xl font-bold text-gray-800">99.98%</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 font-medium">Waktu Respon Rata-rata</p>
                                        <p className="text-xl font-bold text-gray-800">42ms</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 font-medium">Beban Server</p>
                                        <p className="text-xl font-bold text-gray-800">24%</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 font-medium">Pemeriksaan Terakhir</p>
                                        <p className="text-xl font-bold text-gray-800">Baru Saja</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center p-4 md:p-5 border-t border-gray-100 rounded-b">
                                <button onClick={() => setIsModalOpen(false)} type="button" className="text-white bg-[#8100D1] hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors">Tutup Laporan</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
