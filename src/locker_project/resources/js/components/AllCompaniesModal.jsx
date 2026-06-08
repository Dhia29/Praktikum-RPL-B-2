import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AllCompaniesModal({ isOpen, onClose, companies }) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    // Filter list berdasarkan query pencarian di modal
    const filteredCompanies = companies.filter(company => 
        company.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        company.industry?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-fade-in-up">
                
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Jelajahi Perusahaan</h2>
                        <p className="text-sm text-gray-500 mt-1">Temukan {companies.length} perusahaan impian Anda</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full focus:outline-none"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Modal Search Bar */}
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari nama perusahaan atau industri..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8100D1]/50 focus:border-[#8100D1] transition-all text-sm"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Modal Body (Scrollable List) */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar">
                    {filteredCompanies.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredCompanies.map(company => (
                                <div 
                                    key={company.id} 
                                    onClick={() => {
                                        onClose();
                                        navigate(`/profile/${company.user_id}`);
                                    }}
                                    className="flex items-center gap-4 p-4 hover:bg-purple-50/50 rounded-xl cursor-pointer transition border border-gray-100 hover:border-purple-100 group"
                                >
                                    <div className="w-14 h-14 bg-white rounded-lg flex-shrink-0 flex items-center justify-center border border-gray-200 overflow-hidden shadow-sm">
                                        {company.avatar_url ? (
                                            <img src={company.avatar_url} alt={company.name} className="w-full h-full object-contain p-1" />
                                        ) : (
                                            <span className="text-[#8100D1] font-bold text-xl">{company.name?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="text-base font-bold text-gray-900 truncate group-hover:text-[#8100D1] transition-colors">{company.name}</h4>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{company.industry}</p>
                                        <div className="text-xs font-semibold text-gray-400 mt-2 flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                            {company.follower_count?.toLocaleString() || 0} Pengikut
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900">Pencarian Tidak Ditemukan</h3>
                            <p className="text-xs text-gray-500 mt-1">Coba gunakan kata kunci lain.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
