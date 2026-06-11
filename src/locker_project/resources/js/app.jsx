import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

import './assets/echo';
import './assets/i18n';

// Initialize Theme
const savedTheme = localStorage.getItem('app_theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

import SignUp from './SignUp';
import Login from './Login';
import VerifyEmail from './VerifyEmail';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import PendingApproval from './PendingApproval';
import Layout from './components/Layout';
import Loker from './Loker';
import Profile from './Profile';
import ProfilePerusahaan from './ProfilePerusahaan';
import PublicProfile from './PublicProfile';
import Lamaran from './Lamaran';
import Pesan from './Messages';
import Komunitas from './Community';
import Settings from './Settings';

function App() {
    return (
        <Router>
            <Routes>
                {/* Halaman Autentikasi */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<SignUp />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/pending-approval" element={<PendingApproval />} />

                {/* Halaman Utama dengan Navbar/Header Tab */}
                <Route element={<Layout />}>
                    <Route path="/loker" element={<Loker />} />
                    <Route path="/lamaran" element={<Lamaran />} />
                    <Route path="/pesan" element={<Pesan />} />
                    <Route path="/komunitas" element={<Komunitas />} />
                </Route>

                {/* HALAMAN PROFILE: Berdiri sendiri tanpa Header Tab Global */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile-perusahaan" element={<ProfilePerusahaan />} />
                <Route path="/profile/:id" element={<PublicProfile />} />
                <Route path="/settings" element={<Settings />} />

            </Routes>
        </Router>
    );
}

const rootElement = document.getElementById('app');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}