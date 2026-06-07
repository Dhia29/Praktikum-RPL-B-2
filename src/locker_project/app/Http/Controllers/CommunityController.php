<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CommunityController extends Controller
{
    // 1. Ambil Semua Postingan (Global / Berdasarkan Komunitas)
    public function getPosts(Request $request)
    {
        $communityId = $request->query('community_id');
        $authId = Auth::id();

        try {
            $query = DB::table('posts');

            $isSavedTab = $request->query('saved') === 'true';

            if ($isSavedTab) {
                // Fetch saved posts for the current user
                $savedPostIds = DB::table('post_saves')->where('user_id', $authId)->pluck('post_id');
                $query->whereIn('id', $savedPostIds);
            } else if ($communityId) {
                // CEK KEAMANAN: Pastikan user adalah member jika ingin melihat feed komunitas privat
                $isMember = DB::table('community_members')
                    ->where('community_id', $communityId)
                    ->where('user_id', $authId)
                    ->exists();

                if (!$isMember) {
                    return response()->json(['message' => 'Akses ditolak. Anda bukan anggota komunitas ini.'], 403);
                }

                $query->where('community_id', $communityId);
                // Sembunyikan balasan dari feed utama komunitas (opsional, tapi biasanya balasan tidak tampil di timeline utama)
                $query->whereNull('reply_to');
            } else {
                $query->whereNull('community_id'); // Feed Global
                $query->whereNull('reply_to'); // Sembunyikan balasan dari timeline utama
            }

            $posts = $query->orderBy('created_at', 'desc')->get();
            $formattedPosts = [];

            foreach ($posts as $post) {
                // Ambil info pembuat postingan saat ini
                $author = $this->getUserProfileInfo($post->user_id);

                $originalPostData = null;
                // JIKALAU INI ADALAH REPOST, ambil data postingan aslinya
                if ($post->repost_of) {
                    $origPost = DB::table('posts')->where('id', $post->repost_of)->first();
                    if ($origPost) {
                        $originalPostData = [
                            'konten' => $origPost->konten,
                            'media_url' => $origPost->media_url,
                            'media_type' => $origPost->media_type,
                            'created_at' => $origPost->created_at,
                            'author' => $this->getUserProfileInfo($origPost->user_id)
                        ];
                    }
                }

                // Hitung Interaksi
                $likesCount = DB::table('post_likes')->where('post_id', $post->id)->count();
                $repostsCount = DB::table('posts')->where('repost_of', $post->id)->count();
                $repliesCount = DB::table('posts')->where('reply_to', $post->id)->count();
                $hasLiked = DB::table('post_likes')->where('post_id', $post->id)->where('user_id', $authId)->exists();
                $hasSaved = DB::table('post_saves')->where('post_id', $post->id)->where('user_id', $authId)->exists();
                $savesCount = DB::table('post_saves')->where('post_id', $post->id)->count();
                $hasReposted = DB::table('posts')->where('repost_of', $post->id)->where('user_id', $authId)->exists();

                // Increment dummy view count for now (optional)
                DB::table('posts')->where('id', $post->id)->increment('views_count');

                $formattedPosts[] = [
                    'id' => $post->id,
                    'konten' => $post->konten,
                    'media_url' => $post->media_url,
                    'media_type' => $post->media_type,
                    'created_at' => $post->created_at,
                    'author' => $author,
                    'repost_of' => $post->repost_of,
                    'original_post' => $originalPostData,
                    'likes_count' => $likesCount,
                    'replies_count' => $repliesCount,
                    'saves_count' => $savesCount,
                    'views_count' => $post->views_count + 1,
                    'has_liked' => $hasLiked,
                    'has_saved' => $hasSaved,
                    'is_me' => $post->user_id === $authId
                ];
            }

            return response()->json(['data' => $formattedPosts], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal memuat feed: ' . $e->getMessage()], 500);
        }
    }

    // 2. Buat Postingan Baru
    public function createPost(Request $request)
    {
        $request->validate([
            'konten' => 'nullable|string',
            'media' => 'nullable|file|max:20480', // Maks 20MB jikalau video
            'community_id' => 'nullable|uuid',
            'reply_to' => 'nullable|uuid'
        ]);

        $authId = Auth::id();

        try {
            $mediaUrl = null;
            $mediaType = null;

            if ($request->hasFile('media')) {
                $file = $request->file('media');
                $path = $file->store('community_media', 'public');
                $mediaUrl = asset('storage/' . $path);
                
                $mime = $file->getMimeType();
                $mediaType = str_starts_with($mime, 'video/') ? 'video' : 'image';
            }

            $id = Str::uuid()->toString();
            DB::table('posts')->insert([
                'id' => $id,
                'user_id' => $authId,
                'community_id' => $request->community_id,
                'repost_of' => null,
                'reply_to' => $request->reply_to,
                'konten' => $request->konten,
                'media_url' => $mediaUrl,
                'media_type' => $mediaType,
                'created_at' => now()
            ]);

            // Kirim Notifikasi Balasan
            if ($request->reply_to) {
                $originalPost = DB::table('posts')->where('id', $request->reply_to)->first();
                if ($originalPost && $originalPost->user_id !== $authId) {
                    $owner = \App\Models\User::find($originalPost->user_id);
                    $replierName = $this->getUserProfileInfo($authId)['name'];
                    if ($owner && $replierName) {
                        $owner->notify(new \App\Notifications\PostRepliedNotification($originalPost, $replierName));
                    }
                }
            }

            return response()->json(['message' => 'Post berhasil dibuat!'], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal memposting: ' . $e->getMessage()], 500);
        }
    }


    // 4. Hapus Postingan
    public function deletePost($id)
    {
        $authId = Auth::id();

        try {
            $post = DB::table('posts')->where('id', $id)->first();

            if (!$post) {
                return response()->json(['message' => 'Postingan tidak ditemukan'], 404);
            }

            if ($post->user_id !== $authId) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Hapus juga file medianya jika ada (Opsional, perlu cek storage/public)
            
            DB::table('posts')->where('id', $id)->delete();

            return response()->json(['message' => 'Postingan berhasil dihapus'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal menghapus postingan: ' . $e->getMessage()], 500);
        }
    }

    public function reportPost(Request $request, $id)
    {
        $authId = Auth::id();
        $reason = $request->input('reason', 'Lainnya');

        try {
            $existing = DB::table('post_reports')->where('post_id', $id)->where('reporter_id', $authId)->first();
            if ($existing) {
                return response()->json(['message' => 'Anda sudah melaporkan postingan ini sebelumnya.'], 400);
            }

            DB::table('post_reports')->insert([
                'post_id' => $id,
                'reporter_id' => $authId,
                'reason' => $reason,
                'created_at' => now()
            ]);

            return response()->json(['message' => 'Postingan berhasil dilaporkan.'], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal melaporkan postingan: ' . $e->getMessage()], 500);
        }
    }

    public function getPostReplies($id)
    {
        $authId = Auth::id();

        try {
            $replies = DB::table('posts')
                ->where('reply_to', $id)
                ->orderBy('created_at', 'asc')
                ->get();

            $formattedReplies = [];

            foreach ($replies as $reply) {
                // Info User
                $userInfo = $this->getUserProfileInfo($reply->user_id);
                $reply->user_name = $userInfo['name'];
                $reply->user_avatar = $userInfo['avatar_url'];

                // Hitung Interaksi
                $likesCount = DB::table('post_likes')->where('post_id', $reply->id)->count();
                $repliesCount = DB::table('posts')->where('reply_to', $reply->id)->count();
                $hasLiked = DB::table('post_likes')->where('post_id', $reply->id)->where('user_id', $authId)->exists();
                $hasSaved = DB::table('post_saves')->where('post_id', $reply->id)->where('user_id', $authId)->exists();
                $savesCount = DB::table('post_saves')->where('post_id', $reply->id)->count();

                $formattedReplies[] = [
                    'id' => $reply->id,
                    'user_id' => $reply->user_id,
                    'user_name' => $reply->user_name,
                    'user_avatar' => $reply->user_avatar,
                    'konten' => $reply->konten,
                    'media_url' => $reply->media_url,
                    'media_type' => $reply->media_type,
                    'created_at' => $reply->created_at,
                    'likes_count' => $likesCount,
                    'replies_count' => $repliesCount,
                    'saves_count' => $savesCount,
                    'views_count' => $reply->views_count,
                    'has_liked' => $hasLiked,
                    'has_saved' => $hasSaved,
                    'is_me' => $reply->user_id === $authId
                ];
            }

            return response()->json(['data' => $formattedReplies], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal memuat komentar: ' . $e->getMessage()], 500);
        }
    }

    // 4. Buat Kelompok Komunitas Baru (Telah diperbarui untuk Avatar & Auto-Join)
    public function createCommunity(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'avatar' => 'nullable|image|max:5120' // Opsional: Maks 5MB foto profil komunitas
        ]);

        $authId = Auth::id();

        try {
            $avatarUrl = null;
            if ($request->hasFile('avatar')) {
                $path = $request->file('avatar')->store('community_avatars', 'public');
                $avatarUrl = asset('storage/' . $path);
            }

            $communityId = Str::uuid()->toString();
            
            DB::beginTransaction(); // Transaksi karena insert ke 2 tabel
            
            // Insert data komunitas
            DB::table('communities')->insert([
                'id' => $communityId,
                'creator_id' => $authId,
                'nama' => $request->nama,
                'deskripsi' => $request->deskripsi,
                'avatar_url' => $avatarUrl, // Fitur tambahan: Menyimpan avatar
                'created_at' => now()
            ]);

            // Otomatis jadikan pembuat sebagai member pertama
            DB::table('community_members')->insert([
                'community_id' => $communityId,
                'user_id' => $authId,
                'joined_at' => now()
            ]);

            DB::commit();

            return response()->json(['message' => 'Komunitas berhasil dibuat!'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membuat grup: ' . $e->getMessage()], 500);
        }
    }

    // 5. Ambil Daftar Semua Komunitas yang Ada (Telah diperbarui untuk Status Member)
    public function getCommunities()
    {
        $authId = Auth::id();
        try {
            $communities = DB::table('communities')->get();
            $formatted = [];
            
            foreach ($communities as $c) {
                // Mengecek apakah user adalah member
                $isMember = DB::table('community_members')
                    ->where('community_id', $c->id)
                    ->where('user_id', $authId)
                    ->exists();
                    
                $formatted[] = [
                    'id' => $c->id,
                    'nama' => $c->nama,
                    'deskripsi' => $c->deskripsi,
                    'avatar_url' => $c->avatar_url ?? null,
                    'is_member' => $isMember
                ];
            }
            
            return response()->json(['data' => $formatted], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal memuat list'], 500);
        }
    }
    
    // 6. Fitur Gabung Komunitas
    public function joinCommunity(Request $request)
    {
        $request->validate(['community_id' => 'required|uuid']);
        
        try {
            DB::table('community_members')->insertOrIgnore([
                'community_id' => $request->community_id,
                'user_id' => Auth::id(),
                'joined_at' => now()
            ]);
            return response()->json(['message' => 'Berhasil bergabung dengan komunitas!'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal bergabung'], 500);
        }
    }

    // 7. Fitur Keluar dari Komunitas (Leave Community)
    public function leaveCommunity(Request $request)
    {
        $request->validate(['community_id' => 'required|uuid']);
        $authId = Auth::id();

        try {
            DB::table('community_members')
                ->where('community_id', $request->community_id)
                ->where('user_id', $authId)
                ->delete();

            return response()->json(['message' => 'Berhasil keluar komunitas'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal keluar: ' . $e->getMessage()], 500);
        }
    }

    // Toggle Like
    public function toggleLike($id)
    {
        $authId = Auth::id();
        try {
            $existing = DB::table('post_likes')->where('post_id', $id)->where('user_id', $authId)->first();
            if ($existing) {
                DB::table('post_likes')->where('id', $existing->id)->delete();
                return response()->json(['message' => 'Unliked', 'has_liked' => false]);
            } else {
                DB::table('post_likes')->insert([
                    'post_id' => $id,
                    'user_id' => $authId,
                    'created_at' => now()
                ]);

                // Kirim notifikasi
                $post = DB::table('posts')->where('id', $id)->first();
                if ($post && $post->user_id !== $authId) {
                    $owner = \App\Models\User::find($post->user_id);
                    $likerName = $this->getUserProfileInfo($authId)['name'];
                    if ($owner && $likerName) {
                        $owner->notify(new \App\Notifications\PostLikedNotification($post, $likerName));
                    }
                }

                return response()->json(['message' => 'Liked', 'has_liked' => true]);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal like: ' . $e->getMessage()], 500);
        }
    }

    // Toggle Save
    public function toggleSave($id)
    {
        $authId = Auth::id();
        try {
            $existing = DB::table('post_saves')->where('post_id', $id)->where('user_id', $authId)->first();
            if ($existing) {
                DB::table('post_saves')->where('id', $existing->id)->delete();
                return response()->json(['message' => 'Unsaved', 'has_saved' => false]);
            } else {
                DB::table('post_saves')->insert([
                    'post_id' => $id,
                    'user_id' => $authId,
                    'created_at' => now()
                ]);
                return response()->json(['message' => 'Saved', 'has_saved' => true]);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal save: ' . $e->getMessage()], 500);
        }
    }

    // Helper Ringkas Pencari Data User
    private function getUserProfileInfo($userId) {
        $user = DB::table('users')->where('id', $userId)->first();
        if (!$user) return ['name' => 'User', 'avatar_url' => null];

        if ($user->role === 'seeker') {
            $p = DB::table('job_seeker_profiles')->where('user_id', $userId)->first();
            return ['name' => $p->nama_lengkap ?? 'Pencari Kerja', 'avatar_url' => $p->avatar_url ?? null];
        } else {
            $p = DB::table('company_profiles')->where('user_id', $userId)->first();
            return ['name' => $p->nama_perusahaan ?? 'Perusahaan', 'avatar_url' => $p->logo_url ?? null];
        }
    }
}