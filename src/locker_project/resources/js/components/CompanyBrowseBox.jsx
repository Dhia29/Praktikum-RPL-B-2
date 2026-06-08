import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AllCompaniesModal from './AllCompaniesModal';

export default function CompanyBrowseBox() {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('/api/companies');
                setCompanies(response.data);
            } catch (error) {
                console.error('Gagal mengambil data perusahaan:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCompanies();
    }, []);

    return (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Jelajahi Perusahaan</h3>
            {isLoading ? (
                <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-gray-200 border-t-[#8100D1] rounded-full animate-spin"></div>
                </div>
            ) : companies.length > 0 ? (
                <div className="flex flex-col gap-3">
                    {companies.slice(0, 5).map(company => (
                        <div 
                            key={company.id} 
                            onClick={() => navigate(`/profile/${company.user_id}`)}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition border border-transparent hover:border-gray-100"
                        >
                            <div className="w-10 h-10 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center border border-gray-200 overflow-hidden">
                                {company.avatar_url ? (
                                    <img src={company.avatar_url} alt={company.name} className="w-full h-full object-contain bg-white" />
                                ) : (
                                    <span className="text-[#8100D1] font-bold">{company.name?.charAt(0)}</span>
                                )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h4 className="text-sm font-semibold text-gray-900 truncate">{company.name}</h4>
                                <p className="text-xs text-gray-500 truncate">{company.industry}</p>
                            </div>
                            <div className="text-xs font-medium text-[#8100D1] opacity-0 group-hover:opacity-100 transition-opacity">
                                &rarr;
                            </div>
                        </div>
                    ))}
                    
                    {companies.length > 5 && (
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="w-full py-2 mt-2 text-sm font-semibold text-[#8100D1] hover:bg-purple-50 rounded-lg transition-colors border border-purple-100"
                        >
                            Lihat Semua ({companies.length})
                        </button>
                    )}
                </div>
            ) : (
                <p className="text-sm text-gray-500 italic">Belum ada perusahaan</p>
            )}

            {/* Modal untuk melihat semua perusahaan */}
            <AllCompaniesModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                companies={companies} 
            />
        </div>
    );
}
