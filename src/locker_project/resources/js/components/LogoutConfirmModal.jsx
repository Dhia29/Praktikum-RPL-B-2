import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    const { t } = useTranslation();

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#0B0F19] backdrop-blur-2xl rounded-3xl w-full max-w-sm shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-gray-200/50 dark:border-white/5 relative overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('logout_confirm.title', 'Konfirmasi Keluar')}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        {t('logout_confirm.message', 'Apakah Anda yakin ingin keluar dari sesi ini?')}
                    </p>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            {t('logout_confirm.cancel', 'Batal')}
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 shadow-[0_4px_15px_rgba(239,68,68,0.2)] hover:shadow-[0_4px_20px_rgba(239,68,68,0.4)] transition-all transform hover:-translate-y-0.5"
                        >
                            {t('logout_confirm.confirm', 'Ya, Keluar')}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
