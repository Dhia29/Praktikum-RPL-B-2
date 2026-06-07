import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AnalyticsAdmin() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCompanies: 0,
        totalJobs: 0,
        activeSessions: 0,
        conversionRate: "0%"
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await axios.get('/api/admin/analytics/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch analytics stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    return (
        <>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Tinjauan Platform</h3>
                    <p className="text-sm text-gray-500 mt-1">Metrik dan performa LockER dalam 30 hari terakhir.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Ekspor Laporan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Stat 1 */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <p className="text-sm font-semibold text-gray-500 mb-2">Total Pengguna</p>
                    <div className="flex items-end gap-3 mb-1">
                        <h3 className="text-2xl font-bold text-gray-800">{loading ? '...' : stats.totalUsers}</h3>
                    </div>
                </div>

                {/* Stat 2 */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <p className="text-sm font-semibold text-gray-500 mb-2">Total Perusahaan</p>
                    <div className="flex items-end gap-3 mb-1">
                        <h3 className="text-2xl font-bold text-gray-800">{loading ? '...' : stats.totalCompanies}</h3>
                    </div>
                </div>

                {/* Stat 3 */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <p className="text-sm font-semibold text-gray-500 mb-2">Total Lowongan</p>
                    <div className="flex items-end gap-3 mb-1">
                        <h3 className="text-2xl font-bold text-gray-800">{loading ? '...' : stats.totalJobs}</h3>
                    </div>
                </div>

                {/* Stat 4 */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <p className="text-sm font-semibold text-gray-500 mb-2">Sesi Aktif</p>
                    <div className="flex items-end gap-3 mb-1">
                        <h3 className="text-2xl font-bold text-gray-800">{loading ? '...' : stats.activeSessions}</h3>
                        <span className="text-sm text-green-500 font-medium">Real-time</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center justify-center min-h-[300px]">
                    <div className="text-center">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                        <p className="text-gray-500 font-medium">Grafik Pertumbuhan Pengguna</p>
                        <p className="text-xs text-gray-400 mt-1">(Integrasi Chart.js diperlukan)</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-bold text-gray-800 mb-6">Distribusi Pengguna</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 font-medium">Pencari Kerja</span>
                                <span className="font-bold text-gray-800">85%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-[#8100D1] h-2 rounded-full" style={{width: "85%"}}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 font-medium">Perusahaan</span>
                                <span className="font-bold text-gray-800">15%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{width: "15%"}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
