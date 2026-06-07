<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\AdminLog;

class AdminCommunityReportController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('community_reports')
            ->join('users as reporters', 'community_reports.reporter_id', '=', 'reporters.id')
            ->leftJoin('community_posts', 'community_reports.post_id', '=', 'community_posts.id')
            ->leftJoin('users as post_owners', 'community_posts.user_id', '=', 'post_owners.id')
            ->select(
                'community_reports.*',
                'reporters.email as reporter_email',
                'post_owners.email as post_owner_email'
            );

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('community_reports.status', $request->status);
        }

        $reports = $query->orderBy('community_reports.created_at', 'desc')->get();

        return response()->json(compact('reports'));
    }

    public function show($id)
    {
        $report = DB::table('community_reports')
            ->join('users as reporters', 'community_reports.reporter_id', '=', 'reporters.id')
            ->leftJoin('community_posts', 'community_reports.post_id', '=', 'community_posts.id')
            ->leftJoin('users as post_owners', 'community_posts.user_id', '=', 'post_owners.id')
            ->select(
                'community_reports.*',
                'reporters.email as reporter_email',
                'reporters.role as reporter_role',
                'community_posts.content as post_content',
                'community_posts.media_url as post_media',
                'post_owners.id as post_owner_id',
                'post_owners.email as post_owner_email',
                'post_owners.role as post_owner_role'
            )
            ->where('community_reports.id', $id)
            ->first();

        if (!$report) {
            return response()->json(['error' => 'Report not found.'], 404);
        }

        return response()->json(compact('report'));
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,under_review,resolved,rejected'
        ]);

        DB::table('community_reports')->where('id', $id)->update([
            'status' => $request->status,
            'updated_at' => now()
        ]);

        AdminLog::create([
            'admin_id' => Auth::id(),
            'action' => 'Update Community Report Status',
            'target_entity' => 'community_reports',
            'target_id' => $id
        ]);

        return response()->json(['message' => 'Report status updated to ' . $request->status . '.']);
    }

    public function deletePost($id)
    {
        $report = DB::table('community_reports')->where('id', $id)->first();
        if (!$report) {
            return response()->json(['error' => 'Report not found.'], 404);
        }

        $postId = $report->post_id;

        // Ensure post exists before deleting
        $postExists = DB::table('community_posts')->where('id', $postId)->exists();
        if ($postExists) {
            DB::table('community_posts')->where('id', $postId)->delete();

            // Also mark report as resolved
            DB::table('community_reports')->where('post_id', $postId)->update([
                'status' => 'resolved',
                'updated_at' => now()
            ]);

            AdminLog::create([
                'admin_id' => Auth::id(),
                'action' => 'Delete Community Post (Report)',
                'target_entity' => 'community_posts',
                'target_id' => $postId
            ]);

            return response()->json(['message' => 'Post deleted and associated reports resolved.']);
        }

        return response()->json(['error' => 'Post already deleted or not found.'], 404);
    }
}
