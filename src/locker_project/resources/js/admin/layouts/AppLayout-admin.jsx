import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SidebarAdmin from '../components/Sidebar-admin';
import HeaderAdmin from '../components/Header-admin';

export default function AppLayoutAdmin() {
    const [adminUser, setAdminUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/admin/me')
            .then(res => setAdminUser(res.data))
            .catch(() => navigate('/login'));
    }, []);

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900">
            <SidebarAdmin />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <HeaderAdmin adminUser={adminUser} />
                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet context={{ adminUser }} />
                    </div>
                </div>
            </main>
        </div>
    );
}
