import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import '../assets/i18n';
import AppAdmin from './App-admin';

axios.defaults.withCredentials = true;
const rootElement = document.getElementById('admin-app');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<AppAdmin />);
}
