<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $allNotifications = $user->notifications()->latest()->get();
        
        if ($allNotifications->count() > 6) {
            $toDelete = $allNotifications->slice(6)->pluck('id');
            $user->notifications()->whereIn('id', $toDelete)->delete();
            $notifications = $allNotifications->take(6);
        } else {
            $notifications = $allNotifications;
        }

        $unreadCount = $user->unreadNotifications()->count();

        return response()->json([
            'notifications' => $notifications->values(),
            'unread_count' => $unreadCount
        ]);
    }

    public function markAsRead(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($request->has('id')) {
            $notification = $user->notifications()->where('id', $request->id)->first();
            if ($notification) {
                $notification->markAsRead();
            }
        } else {
            $user->unreadNotifications->markAsRead();
        }

        return response()->json(['message' => 'Success']);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $notification = $user->notifications()->where('id', $id)->first();
        if ($notification) {
            $notification->delete();
            return response()->json(['message' => 'Notification deleted']);
        }

        return response()->json(['message' => 'Not found'], 404);
    }
}
