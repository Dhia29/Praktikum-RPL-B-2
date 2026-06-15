import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';

axios.defaults.withCredentials = true;

import '../assets/echo';

import AppLayoutAdmin from './layouts/AppLayout-admin';
import LoginAdmin from './pages/Login-admin';
import DashboardAdmin from './pages/Dashboard-admin';
import AnalyticsAdmin from './pages/Analytics-admin';
import SettingsAdmin from './pages/Settings-admin';
import UsersIndexAdmin from './pages/users/UsersIndex-admin';
import CompaniesIndexAdmin from './pages/companies/CompaniesIndex-admin';
import JobsIndexAdmin from './pages/jobs/JobsIndex-admin';
import TicketsIndexAdmin from './pages/tickets/TicketsIndex-admin';
import TicketsShowAdmin from './pages/tickets/TicketsShow-admin';
import CommunityReportsIndexAdmin from './pages/community/CommunityReportsIndex-admin';
import CommunityReportsShowAdmin from './pages/community/CommunityReportsShow-admin';
import GlobalModal from '../components/GlobalModal';

export default function AppAdmin() {
    return (
        <Router basename="/admin">
            <GlobalModal />
            <Routes>
                <Route path="/login" element={<LoginAdmin />} />

                <Route element={<AppLayoutAdmin />}>
                    <Route path="/dashboard" element={<DashboardAdmin />} />
                    <Route path="/analytics" element={<AnalyticsAdmin />} />
                    <Route path="/settings" element={<SettingsAdmin />} />
                    <Route path="/users" element={<UsersIndexAdmin />} />
                    <Route path="/companies" element={<CompaniesIndexAdmin />} />
                    <Route path="/jobs" element={<JobsIndexAdmin />} />
                    <Route path="/tickets" element={<TicketsIndexAdmin />} />
                    <Route path="/tickets/:id" element={<TicketsShowAdmin />} />
                    <Route path="/community/reports" element={<CommunityReportsIndexAdmin />} />
                    <Route path="/community/reports/:id" element={<CommunityReportsShowAdmin />} />
                </Route>
            </Routes>
        </Router>
    );
}
