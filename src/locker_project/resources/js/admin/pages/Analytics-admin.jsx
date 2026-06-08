import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

export default function AnalyticsAdmin() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCompanies: 0,
        totalJobs: 0,
        totalApplications: 0,
        activeSessions: 0,
        jobSeekersPercentage: 0,
        companiesPercentage: 0,
        growthChart: {
            labels: [],
            data: []
        }
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

    const chartData = {
        labels: stats.growthChart?.labels || [],
        datasets: [
            {
                label: 'Pengguna Baru',
                data: stats.growthChart?.data || [],
                borderColor: '#8100D1',
                backgroundColor: 'rgba(129, 0, 209, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#8100D1',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#8100D1',
                pointRadius: 3,
                pointHoverRadius: 5
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { size: 13 },
                bodyFont: { size: 13 },
                padding: 10,
                cornerRadius: 8,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    stepSize: 1,
                    color: '#6b7280'
                }
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    color: '#6b7280',
                    maxTicksLimit: 10
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    const handleExport = () => {
        if (loading) return;

        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Bagian 1: Ringkasan
        csvContent += "Laporan Analytics Platform LockER\r\n\r\n";
        csvContent += "Metrik Utama,Jumlah\r\n";
        csvContent += `Total Pengguna,${stats.totalUsers}\r\n`;
        csvContent += `Total Perusahaan,${stats.totalCompanies}\r\n`;
        csvContent += `Total Lowongan,${stats.totalJobs}\r\n`;
        csvContent += `Total Lamaran Masuk,${stats.totalApplications}\r\n`;
        csvContent += `Persentase Pencari Kerja,${stats.jobSeekersPercentage}%\r\n`;
        csvContent += `Persentase Perusahaan,${stats.companiesPercentage}%\r\n\r\n`;
        
        // Bagian 2: Data Pertumbuhan
        csvContent += "Pertumbuhan Pengguna Baru (30 Hari Terakhir)\r\n";
        csvContent += "Tanggal,Pendaftar Baru\r\n";
        
        if (stats.growthChart && stats.growthChart.labels) {
            stats.growthChart.labels.forEach((label, index) => {
                const dataValue = stats.growthChart.data[index] || 0;
                csvContent += `${label},${dataValue}\r\n`;
            });
        }

        // Trigger Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Laporan_Analytics_LockER_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Tinjauan Platform</h3>
                    <p className="text-sm text-gray-500 mt-1">Metrik dan performa LockER dalam 30 hari terakhir.</p>
                </div>
                <button 
                    onClick={handleExport}
                    disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    {loading ? 'Memuat...' : 'Ekspor Laporan'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
                
                {/* Stat 4 - Baru ditambahkan */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v6h6v10H6z"/></svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-500 mb-2 relative z-10">Total Lamaran</p>
                    <div className="flex items-end gap-3 mb-1 relative z-10">
                        <h3 className="text-2xl font-bold text-[#8100D1]">{loading ? '...' : stats.totalApplications}</h3>
                    </div>
                </div>

                {/* Stat 5 */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <p className="text-sm font-semibold text-gray-500 mb-2">Sesi Aktif</p>
                    <div className="flex items-end gap-3 mb-1">
                        <h3 className="text-2xl font-bold text-gray-800">{loading ? '...' : stats.activeSessions}</h3>
                        <span className="text-sm text-green-500 font-medium">Real-time</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Grafik Pertumbuhan */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col min-h-[350px]">
                    <div className="mb-4">
                        <h3 className="font-bold text-gray-800">Grafik Pertumbuhan Pengguna Baru</h3>
                        <p className="text-xs text-gray-500">Pendaftaran akun selama 30 hari terakhir</p>
                    </div>
                    <div className="flex-1 w-full relative">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="animate-spin h-8 w-8 text-[#8100D1]" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : (
                            <Line data={chartData} options={chartOptions} />
                        )}
                    </div>
                </div>

                {/* Distribusi Pengguna */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col">
                    <h3 className="font-bold text-gray-800 mb-6">Distribusi Pengguna</h3>
                    
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <span className="text-sm text-gray-400">Memuat data...</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 flex items-center justify-center mb-6 max-h-[180px]">
                                <Doughnut 
                                    data={{
                                        labels: ['Pencari Kerja', 'Perusahaan'],
                                        datasets: [{
                                            data: [stats.jobSeekersPercentage, stats.companiesPercentage],
                                            backgroundColor: ['#8100D1', '#3b82f6'],
                                            borderWidth: 0,
                                            hoverOffset: 4
                                        }]
                                    }}
                                    options={{
                                        cutout: '75%',
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: {
                                                callbacks: {
                                                    label: (context) => ` ${context.label}: ${context.raw}%`
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>

                            <div className="space-y-4 mt-auto">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[#8100D1]"></div>
                                            <span className="text-gray-600 font-medium">Pencari Kerja</span>
                                        </div>
                                        <span className="font-bold text-gray-800">{stats.jobSeekersPercentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                                        <div className="bg-[#8100D1] h-1.5 rounded-full transition-all duration-1000" style={{width: `${stats.jobSeekersPercentage}%`}}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                            <span className="text-gray-600 font-medium">Perusahaan</span>
                                        </div>
                                        <span className="font-bold text-gray-800">{stats.companiesPercentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                                        <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000" style={{width: `${stats.companiesPercentage}%`}}></div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
