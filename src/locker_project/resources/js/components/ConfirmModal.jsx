import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, isDestructive = true }) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-0">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 sm:p-8 shadow-2xl transform transition-all overflow-hidden border border-gray-100 dark:border-slate-800">
                {/* Visual Icon Header */}
                <div className="flex justify-center mb-5">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDestructive ? 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400' : 'bg-purple-50 text-[#8100D1] dark:bg-purple-500/10 dark:text-purple-400'}`}>
                        {isDestructive ? (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        ) : (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>
                </div>

                {/* Text Content */}
                <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {title || 'Apakah Anda yakin?'}
                    </h3>
                    <p className="text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 w-full">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-3 text-[14px] font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95"
                    >
                        {cancelText || 'Batal'}
                    </button>
                    <button 
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 py-3 text-[14px] font-bold text-white rounded-xl transition-all active:scale-95 shadow-sm hover:shadow-lg ${isDestructive ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-[#8100D1] hover:bg-purple-800 shadow-purple-500/20'}`}
                    >
                        {confirmText || 'Ya, Hapus'}
                    </button>
                </div>
            </div>
        </div>
    );
}
