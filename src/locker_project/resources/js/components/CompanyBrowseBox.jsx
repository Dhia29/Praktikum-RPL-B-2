import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AllCompaniesModal from './AllCompaniesModal';

export default function CompanyBrowseBox() {
    const navigate = useNavigate();
    const { t } = useTranslation();
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
                console.error('Failed to fetch companies:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCompanies();
    }, []);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-800">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">{t('loker.browse_companies')}</h3>
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
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition border border-transparent hover:border-gray-100 dark:hover:border-slate-700"
                        >
                            <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-md flex-shrink-0 flex items-center justify-center border border-gray-200 dark:border-slate-700 overflow-hidden">
                                {company.avatar_url ? (
                                    <img src={company.avatar_url} alt={company.name} className="w-full h-full object-contain bg-white dark:bg-transparent" />
                                ) : (
                                    <span className="text-[#8100D1] dark:text-[#c682ff] font-bold">{company.name?.charAt(0)}</span>
                                )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{company.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{company.industry}</p>
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
                            {t('loker.view_all')} ({companies.length})
                        </button>
                    )}
                </div>
            ) : (
                <p className="text-sm text-gray-500 italic">{t('loker.no_companies')}</p>
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
