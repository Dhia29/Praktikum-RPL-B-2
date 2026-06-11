import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PageHeader({ title = "LockER", backUrl, onBack, zIndex = "z-[60]", maxWidth = "max-w-7xl" }) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (backUrl) {
            navigate(backUrl);
        } else {
            navigate(-1);
        }
    };

    return (
        <header className={`bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 ${zIndex} transition-colors duration-200`}>
            <div className={`${maxWidth} mx-auto px-6 h-16 flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleBack} 
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-[#8100D1] dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-full transition-all focus:outline-none"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-extrabold text-[#8100D1] tracking-tight">{title}</h1>
                </div>
            </div>
        </header>
    );
}
