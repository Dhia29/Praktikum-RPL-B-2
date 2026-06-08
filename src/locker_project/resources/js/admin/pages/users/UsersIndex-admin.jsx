import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function UsersIndexAdmin() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/users');
            setUsers(response.data.users || []);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleStatus = async (userId) => {
        try {
            await axios.post(`/api/admin/users/${userId}/toggle-status`);
            fetchUsers();
        } catch (error) {
            console.error("Failed to toggle status", error);
            alert("Gagal mengubah status akun");
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus pengguna ini secara permanen?')) return;
        try {
            await axios.delete(`/api/admin/users/${userId}`);
            fetchUsers();
        } catch (error) {
            console.error("Failed to delete user", error);
            alert("Gagal menghapus pengguna");
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-gray-100 gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Daftar Pengguna (Pencari Kerja)</h3>
                    <p className="text-sm text-gray-500 mt-1">Kelola akses dan status akun pencari kerja.</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                            <th className="p-4 border-b border-gray-100">Informasi Akun</th>
                            <th className="p-4 border-b border-gray-100">Peran</th>
                            <th className="p-4 border-b border-gray-100">Status & Verifikasi</th>
                            <th className="p-4 border-b border-gray-100 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-500">Memuat data pengguna...</td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-500">Tidak ada pengguna yang ditemukan.</td>
                            </tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold flex-shrink-0">
                                                {user.email ? user.email.substring(0, 1).toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">
                                                    {user.seeker_name || 'N/A'}
                                                </p>
                                                <p className="text-gray-500 text-xs">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                                            Pencari Kerja
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1.5 items-start">
                                            {user.status === 'Aktif' || user.status === 'active' ? (
                                                <span className="flex items-center gap-1 text-green-600 font-medium text-xs">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Aktif
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-600 font-medium text-xs">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Nonaktif
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">

                                            <button onClick={() => handleToggleStatus(user.id)} title={user.status === 'active' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'} className={`p-1.5 ${user.status === 'active' ? 'text-orange-500 hover:bg-orange-50 hover:border-orange-200' : 'text-green-600 hover:bg-green-50 hover:border-green-200'} rounded-lg transition-colors border border-transparent`}>
                                                {user.status === 'active' ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                )}
                                            </button>

                                            <button onClick={() => handleDelete(user.id)} title="Hapus Akun Permanen" className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200">
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
                <span>Menampilkan {users.length} pengguna</span>
                <div className="flex gap-1">
                    <button className="px-3 py-1 bg-white border border-gray-200 rounded text-gray-400 cursor-not-allowed">Sebelumnya</button>
                    <button className="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-700">Selanjutnya</button>
                </div>
            </div>
        </div>
    );
}
