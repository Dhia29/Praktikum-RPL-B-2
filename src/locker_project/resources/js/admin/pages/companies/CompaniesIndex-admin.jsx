import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function CompaniesIndexAdmin() {
    const { t, i18n } = useTranslation();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectingCompanyId, setRejectingCompanyId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/companies');
            setCompanies(response.data.companies || []);
        } catch (error) {
            console.error("Failed to fetch companies", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleVerify = async (userId) => {
        if (!window.confirm(t('admin.companies.confirm_verify'))) return;
        try {
            await axios.post(`/api/admin/users/${userId}/verify-company`);
            fetchCompanies();
        } catch (error) {
            console.error("Failed to verify company", error);
            alert(t('admin.companies.alert_verify_fail'));
        }
    };

    const openRejectModal = (userId) => {
        setRejectingCompanyId(userId);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert(t('admin.companies.reject_reason_required'));
            return;
        }

        try {
            await axios.post(`/api/admin/users/${rejectingCompanyId}/reject-company`, {
                alasan_penolakan: rejectReason
            });
            setIsRejectModalOpen(false);
            setRejectingCompanyId(null);
            fetchCompanies();
        } catch (error) {
            console.error("Failed to reject company", error);
            alert(t('admin.companies.alert_reject_fail'));
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            await axios.post(`/api/admin/users/${userId}/toggle-status`);
            fetchCompanies();
        } catch (error) {
            console.error("Failed to toggle status", error);
            alert(t('admin.companies.alert_toggle_fail'));
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm(t('admin.companies.confirm_delete'))) return;
        try {
            await axios.delete(`/api/admin/users/${userId}`);
            fetchCompanies();
        } catch (error) {
            console.error("Failed to delete company", error);
            alert(t('admin.companies.alert_delete_fail'));
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex justify-center items-center h-full min-h-[400px]">
                <div className="w-10 h-10 border-4 border-[#8100D1] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('admin.companies.title')}</h2>
                    <p className="text-sm text-gray-500 mt-1">{t('admin.companies.desc')}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('admin.companies.col_company')}</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('admin.companies.col_contact')}</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('admin.companies.col_status')}</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('admin.companies.col_registered')}</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">{t('admin.companies.col_action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {companies.length > 0 ? (
                                companies.map(company => (
                                    <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-purple-100 text-[#8100D1] flex items-center justify-center font-bold mr-4 shrink-0">
                                                    {company.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">{company.name}</div>
                                                    <div className="text-xs text-gray-500">{company.profile?.industry || t('admin.companies.industry_not_set')}</div>
                                                    {company.profile?.npwp && (
                                                        <div className="text-[10px] text-gray-400 mt-0.5">NPWP: {company.profile.npwp}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm text-gray-900">{company.email}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${company.status === 'Aktif' ? 'bg-green-100 text-green-800' : 
                                                  company.status === 'Nonaktif' ? 'bg-gray-100 text-gray-800' :
                                                  company.status === 'Ditolak' ? 'bg-red-100 text-red-800' :
                                                  'bg-yellow-100 text-yellow-800'}`}>
                                                {company.status}
                                            </span>
                                            {company.status === 'Menunggu Persetujuan' && (
                                                <div className="flex gap-2 mt-2">
                                                    <button onClick={() => handleVerify(company.id)} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors">
                                                        {t('admin.companies.accept')}
                                                    </button>
                                                    <button onClick={() => openRejectModal(company.id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors">
                                                        {t('admin.companies.reject')}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap">
                                            {new Date(company.created_at).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="py-4 px-6 text-sm font-medium text-right whitespace-nowrap">
                                            <button 
                                                onClick={() => handleToggleStatus(company.id)}
                                                className={`mr-3 hover:underline ${company.status === 'Nonaktif' ? 'text-green-600' : 'text-orange-600'}`}
                                            >
                                                {company.status === 'Nonaktif' ? t('admin.companies.activate') : t('admin.companies.deactivate')}
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(company.id)}
                                                className="text-red-600 hover:text-red-900 hover:underline"
                                            >
                                                {t('admin.companies.delete')}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-8 px-6 text-center text-gray-500">
                                        {t('admin.companies.empty')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tolak Perusahaan */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-100 animate-fade-in">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('admin.companies.reject_modal_title')}</h3>
                        <p className="text-sm text-gray-500 mb-4">{t('admin.companies.reject_modal_desc')}</p>
                        
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                            rows="4"
                            placeholder={t('admin.companies.reject_placeholder')}
                        ></textarea>

                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setIsRejectModalOpen(false)}
                                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                {t('admin.companies.cancel')}
                            </button>
                            <button 
                                onClick={handleReject}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                            >
                                {t('admin.companies.reject_company')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
