<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CommunityReport;
use Illuminate\Support\Facades\Auth;

class CommunityReportApiController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'post_id' => 'required|uuid|exists:community_posts,id',
            'reason' => 'required|string|max:255',
        ]);

        $userId = Auth::id() ?? $request->user()->id;

        if (!$userId) {
             return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Check if already reported by this user
        $existingReport = CommunityReport::where('reporter_id', $userId)
                                         ->where('post_id', $request->post_id)
                                         ->first();

        if ($existingReport) {
            return response()->json(['message' => 'You have already reported this post.'], 400);
        }

        $report = CommunityReport::create([
            'reporter_id' => $userId,
            'post_id' => $request->post_id,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Report submitted successfully.',
            'report' => $report
        ], 201);
    }
}
