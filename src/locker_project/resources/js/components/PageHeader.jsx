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
        <div className={`sticky top-0 ${zIndex} flex flex-col`}>
            {/* Elegant Top Gradient Line */}
            <div className="h-1 w-full bg-gradient-to-r from-indigo-400 via-[#8100D1] to-pink-500 relative z-50"></div>
            
            <header className="bg-white/60 dark:bg-[#0B0F19]/60 backdrop-blur-2xl border-b border-gray-200/50 dark:border-white/5 transition-all duration-300 shadow-sm dark:shadow-none">
                <div className={`${maxWidth} mx-auto px-6 sm:px-8 h-20 flex items-center justify-between`}>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleBack} 
                            className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-[#8100D1] dark:hover:text-[#c682ff] hover:bg-white dark:hover:bg-slate-800/80 rounded-full transition-all shadow-sm border border-transparent hover:border-gray-200/50 dark:hover:border-white/10 focus:outline-none flex items-center justify-center group"
                        >
                            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8100D1] to-indigo-600 dark:from-[#c682ff] dark:to-indigo-400 tracking-tight drop-shadow-sm cursor-default">
                            {title}
                        </h1>
                    </div>
                </div>
            </header>
        </div>
    );
}
