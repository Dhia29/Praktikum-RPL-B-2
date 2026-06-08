<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Connection;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ConnectionController extends Controller
{
    /**
     * Get suggestions (other job seekers not yet connected/pending).
     */
    public function getSuggestions(Request $request)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        // Get IDs of users we already have connections with (either pending or accepted)
        $connectedIds = Connection::where('sender_id', $user->id)
            ->orWhere('receiver_id', $user->id)
            ->get()
            ->map(function ($conn) use ($user) {
                return $conn->sender_id === $user->id ? $conn->receiver_id : $conn->sender_id;
            })
            ->toArray();

        // Add self to excluded list
        $excludedIds = $connectedIds;
        $excludedIds[] = $user->id;

        // Find mutual connections (2nd degree)
        // People who are connected to our accepted connections, but not to us.
        $acceptedConnections = Connection::where(function($q) use ($user) {
                $q->where('sender_id', $user->id)->orWhere('receiver_id', $user->id);
            })
            ->where('status', 'accepted')
            ->get()
            ->map(function ($conn) use ($user) {
                return $conn->sender_id === $user->id ? $conn->receiver_id : $conn->sender_id;
            })
            ->toArray();

        $mutualIds = [];
        if (!empty($acceptedConnections)) {
            $mutualConnections = Connection::where(function($q) use ($acceptedConnections) {
                    $q->whereIn('sender_id', $acceptedConnections)
                      ->orWhereIn('receiver_id', $acceptedConnections);
                })
                ->where('status', 'accepted')
                ->get();
            
            foreach($mutualConnections as $conn) {
                if (!in_array($conn->sender_id, $excludedIds)) $mutualIds[] = $conn->sender_id;
                if (!in_array($conn->receiver_id, $excludedIds)) $mutualIds[] = $conn->receiver_id;
            }
        }
        $mutualIds = array_unique($mutualIds);

        // Fetch mutuals first
        $suggestions = collect([]);
        if (!empty($mutualIds)) {
            $suggestions = DB::table('users')
                ->join('job_seeker_profiles', 'users.id', '=', 'job_seeker_profiles.user_id')
                ->where('users.role', 'seeker')
                ->whereIn('users.id', $mutualIds)
                ->select(
                    'users.id as user_id',
                    'job_seeker_profiles.nama_lengkap as name',
                    'job_seeker_profiles.headline',
                    'job_seeker_profiles.avatar_url',
                    'job_seeker_profiles.banner_url',
                    DB::raw('1 as is_mutual')
                )
                ->inRandomOrder()
                ->limit(10)
                ->get();
        }

        // Fill remaining with random users if we have less than 10
        if ($suggestions->count() < 10) {
            $excludeFromRandom = array_merge($excludedIds, $suggestions->pluck('user_id')->toArray());
            $randomUsers = DB::table('users')
                ->join('job_seeker_profiles', 'users.id', '=', 'job_seeker_profiles.user_id')
                ->where('users.role', 'seeker')
                ->whereNotIn('users.id', $excludeFromRandom)
                ->select(
                    'users.id as user_id',
                    'job_seeker_profiles.nama_lengkap as name',
                    'job_seeker_profiles.headline',
                    'job_seeker_profiles.avatar_url',
                    'job_seeker_profiles.banner_url',
                    DB::raw('0 as is_mutual')
                )
                ->inRandomOrder()
                ->limit(10 - $suggestions->count())
                ->get();
            
            $suggestions = $suggestions->concat($randomUsers);
        }

        return response()->json($suggestions);
    }

    /**
     * Get list of connections (accepted and pending requests).
     */
    public function getConnections(Request $request)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        // Get accepted mutuals
        $accepted = Connection::where(function($q) use ($user) {
                $q->where('sender_id', $user->id)->orWhere('receiver_id', $user->id);
            })
            ->where('status', 'accepted')
            ->get();

        $mutuals = [];
        foreach ($accepted as $conn) {
            $otherUserId = $conn->sender_id === $user->id ? $conn->receiver_id : $conn->sender_id;
            $profile = DB::table('job_seeker_profiles')->where('user_id', $otherUserId)->first();
            if ($profile) {
                $mutuals[] = [
                    'connection_id' => $conn->id,
                    'user_id' => $otherUserId,
                    'name' => $profile->nama_lengkap,
                    'headline' => $profile->headline,
                    'avatar_url' => $profile->avatar_url,
                    'banner_url' => $profile->banner_url,
                ];
            }
        }

        // Get pending incoming requests
        $pendingRequests = Connection::where('receiver_id', $user->id)
            ->where('status', 'pending')
            ->get();

        $requests = [];
        foreach ($pendingRequests as $conn) {
            $profile = DB::table('job_seeker_profiles')->where('user_id', $conn->sender_id)->first();
            if ($profile) {
                $requests[] = [
                    'connection_id' => $conn->id,
                    'user_id' => $conn->sender_id,
                    'name' => $profile->nama_lengkap,
                    'headline' => $profile->headline,
                    'avatar_url' => $profile->avatar_url,
                    'banner_url' => $profile->banner_url,
                ];
            }
        }

        return response()->json([
            'mutuals' => $mutuals,
            'requests' => $requests
        ]);
    }

    /**
     * Send connection request
     */
    public function sendRequest(Request $request)
    {
        $request->validate(['receiver_id' => 'required|uuid']);
        
        $sender = Auth::user();
        $receiverId = $request->receiver_id;

        if ($sender->id === $receiverId) {
            return response()->json(['message' => 'Cannot connect with yourself'], 400);
        }

        // Check if connection already exists
        $existing = Connection::where(function($q) use ($sender, $receiverId) {
            $q->where('sender_id', $sender->id)->where('receiver_id', $receiverId);
        })->orWhere(function($q) use ($sender, $receiverId) {
            $q->where('sender_id', $receiverId)->where('receiver_id', $sender->id);
        })->first();

        if ($existing) {
            return response()->json(['message' => 'Connection already exists or pending'], 400);
        }

        $connection = Connection::create([
            'id' => Str::uuid()->toString(),
            'sender_id' => $sender->id,
            'receiver_id' => $receiverId,
            'status' => 'pending'
        ]);

        // Fetch sender name
        $senderProfile = DB::table('job_seeker_profiles')->where('user_id', $sender->id)->first();
        $senderName = $senderProfile ? ($senderProfile->nama_lengkap ?? 'User') : 'User';
        
        $receiver = \App\Models\User::find($receiverId);
        if ($receiver) {
            $receiver->notify(new \App\Notifications\ConnectionRequestNotification($senderName));
        }

        return response()->json(['message' => 'Request sent', 'connection' => $connection]);
    }

    /**
     * Respond to connection request (accept or reject)
     */
    public function respondRequest(Request $request)
    {
        $request->validate([
            'connection_id' => 'required|uuid',
            'action' => 'required|in:accept,reject'
        ]);

        $user = Auth::user();
        $connection = Connection::findOrFail($request->connection_id);

        if ($connection->receiver_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($request->action === 'accept') {
            $connection->status = 'accepted';
            $connection->save();

            // Fetch accepter name
            $accepterProfile = DB::table('job_seeker_profiles')->where('user_id', $user->id)->first();
            $accepterName = $accepterProfile ? ($accepterProfile->nama_lengkap ?? 'User') : 'User';

            // sender_id is the person who originally sent the request
            $requester = \App\Models\User::find($connection->sender_id);
            if ($requester) {
                $requester->notify(new \App\Notifications\ConnectionAcceptedNotification($accepterName));
            }

            return response()->json(['message' => 'Request accepted']);
        } else {
            $connection->delete();
            return response()->json(['message' => 'Request rejected']);
        }
    }
}
