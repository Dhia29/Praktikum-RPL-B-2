
import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
                <h1 className="text-3xl font-bold mb-4 text-blue-600 dark:text-blue-400">Hello, React in Laravel!</h1>
                <p className="text-lg">If you see this, React is successfully integrated with Vite and Tailwind.</p>
            </div>
        </div>
    );
}

const rootElement = document.getElementById('app');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}
