import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import SignUp from './SignUp';
import Login from './Login'; // Import file Login yang baru dibuat

function App() {
    return (
        <Router>
            <Routes>
                {/* Halaman utama langsung diarahkan ke form masuk */}
                <Route path="/" element={<Login />} />
                {/* Halaman pendaftaran */}
                <Route path="/register" element={<SignUp />} />
            </Routes>
        </Router>
    );
}

const rootElement = document.getElementById('app');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}