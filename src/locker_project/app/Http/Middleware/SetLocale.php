<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\App;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->hasHeader('Accept-Language')) {
            $locale = $request->header('Accept-Language');
            // Assuming the frontend will send 'id' or 'en'
            $locale = explode(',', $locale)[0]; // take the first if multiple
            if (in_array($locale, ['id', 'en'])) {
                App::setLocale($locale);
            }
        }

        return $next($request);
    }
}
