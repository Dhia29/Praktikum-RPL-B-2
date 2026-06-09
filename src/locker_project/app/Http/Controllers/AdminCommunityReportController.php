<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\AdminLog;

class AdminCommunityReportController extends Controller
{
    // 1. Get All Posts (Live Update)
    public function getAllPosts(Request $request)
    {
        $query = DB::table('posts')
            ->leftJoin('users', 'posts.user_id', '=', 'users.id')
            ->leftJoin('communities', 'posts.community_id', '=', 'communities.id')
            ->select(
                'posts.*',
                'users.email as user_email',
                'users.role as user_role',
                'communities.nama as community_name'
            );

        $posts = $query->orderBy('posts.created_at', 'desc')->get();

        // Include report count for each post
        foreach ($posts as $post) {
            $post->report_count = DB::table('post_reports')->where('post_id', $post->id)->count();
        }

        return response()->json(compact('posts'));
    }

    // 2. Get All Reports
    public function index(Request $request)
    {
        $query = DB::table('post_reports')
            ->join('users as reporters', 'post_reports.reporter_id', '=', 'reporters.id')
            ->leftJoin('posts', 'post_reports.post_id', '=', 'posts.id')
            ->leftJoin('users as post_owners', 'posts.user_id', '=', 'post_owners.id')
            ->select(
                'post_reports.*',
                'reporters.email as reporter_email',
                'post_owners.email as post_owner_email'
            );

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('post_reports.status', $request->status);
        }

        $reports = $query->orderBy('post_reports.created_at', 'desc')->get();

        return response()->json(compact('reports'));
    }

    // 3. Show Report Detail
    public function show($id)
    {
        $report = DB::table('post_reports')
            ->join('users as reporters', 'post_reports.reporter_id', '=', 'reporters.id')
            ->leftJoin('posts', 'post_reports.post_id', '=', 'posts.id')
            ->leftJoin('users as post_owners', 'posts.user_id', '=', 'post_owners.id')
            ->select(
                'post_reports.*',
                'reporters.email as reporter_email',
                'reporters.role as reporter_role',
                'posts.konten as post_content',
                'posts.media_url as post_media',
                'post_owners.id as post_owner_id',
                'post_owners.email as post_owner_email',
                'post_owners.role as post_owner_role'
            )
            ->where('post_reports.id', $id)
            ->first();

        if (!$report) {
            return response()->json(['error' => 'Report not found.'], 404);
        }

        return response()->json(compact('report'));
    }

    // 4. Update Report Status
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,under_review,resolved,rejected'
        ]);

        DB::table('post_reports')->where('id', $id)->update([
            'status' => $request->status,
            'updated_at' => now()
        ]);

        AdminLog::create([
            'admin_id' => Auth::id(),
            'action' => 'Update Post Report Status',
            'target_entity' => 'post_reports',
            'target_id' => $id
        ]);

        return response()->json(['message' => 'Report status updated to ' . $request->status . '.']);
    }

    // 5. Delete Post (Admin Action)
    public function deletePost($id)
    {
        // This endpoint can be called with either a report ID or a post ID.
        // First check if the ID provided is a report ID
        $report = DB::table('post_reports')->where('id', $id)->first();
        
        $postId = null;
        if ($report) {
            $postId = $report->post_id;
            // Mark report as resolved if deleting from report context
            DB::table('post_reports')->where('post_id', $postId)->update([
                'status' => 'resolved',
                'updated_at' => now()
            ]);
        } else {
            // Assume the ID provided is directly the Post ID
            $postId = $id;
        }

        // Ensure post exists before deleting
        $postExists = DB::table('posts')->where('id', $postId)->exists();
        if ($postExists) {
            DB::table('posts')->where('id', $postId)->delete();

            AdminLog::create([
                'admin_id' => Auth::id(),
                'action' => 'Delete Post by Admin',
                'target_entity' => 'posts',
                'target_id' => $postId
            ]);

            return response()->json(['message' => 'Postingan berhasil dihapus.']);
        }

        return response()->json(['error' => 'Post already deleted or not found.'], 404);
    }
}
