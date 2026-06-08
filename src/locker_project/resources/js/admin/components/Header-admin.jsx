import React from 'react';
import NotificationsDropdown from '../../components/NotificationsDropdown';

export default function HeaderAdmin({ title }) {
    return (
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 sticky top-0 flex-shrink-0">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-800">{title || 'Overview'}</h2>
            </div>
            
            <div className="flex items-center gap-6">
                {/* Notification Dropdown Component */}
                <NotificationsDropdown />

                <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
                    <span className="text-gray-700 font-medium text-sm hidden sm:block">Hi, Administrator</span>
                    <button className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-[#8100D1] font-bold border border-purple-200 hover:ring-2 hover:ring-purple-300 transition-all focus:outline-none">
                        A
                    </button>
                </div>
            </div>
        </header>
    );
}
