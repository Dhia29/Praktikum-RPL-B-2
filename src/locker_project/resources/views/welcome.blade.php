<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>LockER | Perjalanan Karir Dimulai dari Sekarang!</title>
        <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet">
    </head>
    <body class="antialiased bg-gray-100 dark:bg-gray-900">
        <div id="app">
            <!-- Initial SSR Loading State to prevent white screen -->
            <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #f9fafb; font-family: 'Plus Jakarta Sans', sans-serif; transition: background-color 0.5s;">
                <div style="text-align: center;">
                    <div style="position: relative; width: 6rem; height: 6rem; margin: 0 auto 1.5rem auto;">
                        <div class="spinner-bg" style="position: absolute; inset: 0; border-radius: 50%; border: 4px solid #f3f4f6;"></div>
                        <div style="position: absolute; inset: 0; border-radius: 50%; border: 4px solid #8100D1; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
                    </div>
                    <h2 style="font-size: 1.875rem; font-weight: 800; color: #8100D1; margin-bottom: 0.5rem; background: linear-gradient(to right, #8100D1, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">LockER</h2>
                    <p class="loading-text" style="color: #6b7280; font-weight: 500; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;">Mempersiapkan Ruang Kerja Anda...</p>
                </div>
            </div>
            <style>
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes pulse { 50% { opacity: .5; } }
                @media (prefers-color-scheme: dark) {
                    body { background-color: #0B0F19; }
                    #app > div { background-color: #0B0F19 !important; }
                    .loading-text { color: #9ca3af !important; }
                    .spinner-bg { border-color: rgba(255,255,255,0.05) !important; }
                }
            </style>
        </div>
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    </body>
</html>
