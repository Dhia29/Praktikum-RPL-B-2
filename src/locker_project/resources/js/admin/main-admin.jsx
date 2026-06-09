import React from 'react';
import { createRoot } from 'react-dom/client';
import AppAdmin from './App-admin';

const rootElement = document.getElementById('admin-app');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<AppAdmin />);
}
