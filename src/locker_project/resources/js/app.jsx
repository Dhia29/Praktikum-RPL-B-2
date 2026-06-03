import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';

axios.defaults.withCredentials = true;

import SignUp from './SignUp';
import Login from './Login';
import Layout from './components/Layout';
import Loker from './Loker';
import Profile from './Profile';
import PublicProfile from './PublicProfile';

function App() {
    return (
        <Router>
            <Routes>
                {/* Halaman Autentikasi */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<SignUp />} />

                {/* Halaman Utama dengan Navbar/Header Tab */}
                <Route element={<Layout />}>
                    <Route path="/loker" element={<Loker />} />
                </Route>

                {/* HALAMAN PROFILE: Berdiri sendiri tanpa Header Tab Global */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:id" element={<PublicProfile />} />

            </Routes>
        </Router>
    );
}

const rootElement = document.getElementById('app');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}