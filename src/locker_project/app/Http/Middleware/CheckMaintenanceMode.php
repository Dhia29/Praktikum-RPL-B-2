<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\PlatformSetting;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Don't block admin routes
        if ($request->is('api/admin*') || $request->is('admin*')) {
            return $next($request);
        }

        $maintenanceMode = PlatformSetting::get('maintenance_mode', '0');

        if ($maintenanceMode === '1') {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Platform sedang dalam perbaikan. Silakan kembali lagi nanti.'
                ], 503);
            }
            // For web routes, it's an SPA so it's fine to just return the view,
            // the SPA will handle 503 from the API requests.
        }

        return $next($request);
    }
}
