import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarAdmin from '../components/Sidebar-admin';
import HeaderAdmin from '../components/Header-admin';

export default function AppLayoutAdmin() {
    return (
        <div className="flex h-screen bg-gray-50 text-gray-900">
            <SidebarAdmin />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <HeaderAdmin />
                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
