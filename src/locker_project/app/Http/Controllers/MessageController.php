<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MessageController extends Controller
{
    // 1. Ambil daftar obrolan (Inbox Room)
    public function getChatRooms()
    {
        $authId = Auth::id();
        if (!$authId) return response()->json(['message' => 'Sesi habis'], 401);

        try {
            // Cari siapa saja yang pernah chat dengan kita
            $contactIds = DB::table('messages')
                ->where('from_user_id', $authId)
                ->orWhere('to_user_id', $authId)
                ->select(DB::raw("CASE WHEN from_user_id = '" . $authId . "' THEN to_user_id ELSE from_user_id END as contact_id"))
                ->distinct()
                ->pluck('contact_id');

            $rooms = [];
            foreach ($contactIds as $id) {
                $userTarget = DB::table('users')->where('id', $id)->first();
                if (!$userTarget) continue;

                $name = 'User';
                $avatar = null;

                if ($userTarget->role === 'seeker') {
                    $profile = DB::table('job_seeker_profiles')->where('user_id', $id)->first();
                    $name = $profile->nama_lengkap ?? 'Pencari Kerja';
                    $avatar = $profile->avatar_url ?? null;
                } else {
                    $profile = DB::table('company_profiles')->where('user_id', $id)->first();
                    $name = $profile->nama_perusahaan ?? 'Perusahaan';
                    $avatar = $profile->logo_url ?? null;
                }

                // Ambil pengaturan chat
                $settings = DB::table('user_chat_settings')
                    ->where('user_id', $authId)
                    ->where('contact_id', $id)
                    ->first();

                // Cek apakah kita diblokir oleh lawan
                $contactSettings = DB::table('user_chat_settings')
                    ->where('user_id', $id)
                    ->where('contact_id', $authId)
                    ->first();

                // Ambil pesan terakhir untuk preview
                $lastMessageQuery = DB::table('messages')
                    ->where(function($q) use ($authId, $id) {
                        $q->where(function($q2) use ($authId, $id) {
                            $q2->where('from_user_id', $authId)
                               ->where('to_user_id', $id)
                               ->where('deleted_by_sender', false);
                        })->orWhere(function($q2) use ($authId, $id) {
                            $q2->where('from_user_id', $id)
                               ->where('to_user_id', $authId)
                               ->where('deleted_by_receiver', false);
                        });
                    })
                    ->orderBy('created_at', 'desc');

                if ($settings && $settings->deleted_until) {
                    $lastMessageQuery->where('created_at', '>', $settings->deleted_until);
                }
                
                $lastMessage = $lastMessageQuery->first();
                
                if (!$lastMessage && (!$settings || !$settings->is_pinned)) {
                    continue;
                }

                $rooms[] = [
                    'id' => $id,
                    'name' => $name,
                    'avatar_url' => $avatar,
                    'role' => $userTarget->role,
                    'last_message' => $lastMessage ? $lastMessage->konten : '',
                    'time' => $lastMessage ? $lastMessage->created_at : now(),
                    // Cek apakah pesan sudah dibaca berdasarkan kolom read_at
                    'is_read' => $lastMessage ? ($lastMessage->read_at !== null) : true,
                    'is_pinned' => $settings ? (bool)$settings->is_pinned : false,
                    'is_archived' => $settings ? (bool)$settings->is_archived : false,
                    'is_blocked' => $settings ? (bool)$settings->is_blocked : false,
                    'is_blocked_by_contact' => $contactSettings ? (bool)$contactSettings->is_blocked : false,
                ];
            }

            return response()->json(['data' => $rooms], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal memuat kontak: ' . $e->getMessage()], 500);
        }
    }

    // 2. Ambil riwayat chat lengkap dengan satu user
    public function getMessages($receiverId)
    {
        $authId = Auth::id();
        try {
            // Tandai pesan yang masuk ke kita menjadi "sudah dibaca" (isi timestamp read_at)
            DB::table('messages')
                ->where('from_user_id', $receiverId)
                ->where('to_user_id', $authId)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);

            $settings = DB::table('user_chat_settings')
                ->where('user_id', $authId)
                ->where('contact_id', $receiverId)
                ->first();

            $query = DB::table('messages')
                ->where(function($q) use ($authId, $receiverId) {
                    $q->where(function($q2) use ($authId, $receiverId) {
                        $q2->where('from_user_id', $authId)
                           ->where('to_user_id', $receiverId)
                           ->where('deleted_by_sender', false);
                    })->orWhere(function($q2) use ($authId, $receiverId) {
                        $q2->where('from_user_id', $receiverId)
                           ->where('to_user_id', $authId)
                           ->where('deleted_by_receiver', false);
                    });
                });

            if ($settings && $settings->deleted_until) {
                $query->where('created_at', '>', $settings->deleted_until);
            }

            $chats = $query->orderBy('created_at', 'asc')->get();

            return response()->json(['data' => $chats], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal memuat pesan'], 500);
        }
    }

    // 3. Kirim pesan baru
    public function sendMessage(Request $request)
    {
        $request->validate([
            'to_user_id' => 'required|uuid',
            'konten' => 'nullable|string',
            'media' => 'nullable|file|max:102400', // Maksimal file 100MB
            'appointment_date' => 'nullable|date',
            'appointment_title' => 'nullable|string',
            'appointment_description' => 'nullable|string',
            'appointment_link' => 'nullable|string'
        ]);

        $authId = Auth::id();

        // Cek apakah pengirim diblokir oleh penerima
        $isBlockedByReceiver = DB::table('user_chat_settings')
            ->where('user_id', $request->to_user_id)
            ->where('contact_id', $authId)
            ->where('is_blocked', true)
            ->exists();

        if ($isBlockedByReceiver) {
            return response()->json(['message' => 'Anda tidak dapat mengirim pesan ke pengguna ini (Telah diblokir)'], 403);
        }

        // Cek apakah pengirim memblokir penerima
        $isBlockingReceiver = DB::table('user_chat_settings')
            ->where('user_id', $authId)
            ->where('contact_id', $request->to_user_id)
            ->where('is_blocked', true)
            ->exists();

        if ($isBlockingReceiver) {
            return response()->json(['message' => 'Anda harus membuka blokir pengguna ini terlebih dahulu untuk mengirim pesan'], 403);
        }

        // Pastikan ada teks ATAU media ATAU appointment yang dikirim
        if (empty($request->konten) && !$request->hasFile('media') && empty($request->appointment_date)) {
            return response()->json(['message' => 'Pesan tidak boleh kosong'], 422);
        }

        try {
            $mediaUrl = null;
            $mediaType = null;
            $mediaName = null;

            // Proses upload file jika ada
            if ($request->hasFile('media')) {
                $file = $request->file('media');
                $mediaName = $file->getClientOriginalName();
                $path = $file->store('messages_media', 'public');
                $mediaUrl = asset('storage/' . $path);
                
                // Deteksi tipe file
                $mime = $file->getMimeType();
                if (str_starts_with($mime, 'image/')) {
                    $mediaType = 'image';
                } elseif (str_starts_with($mime, 'video/')) {
                    $mediaType = 'video';
                } else {
                    $mediaType = 'file';
                }
            }

            $newMessage = [
                'id' => Str::uuid()->toString(),
                'from_user_id' => $authId,
                'to_user_id' => $request->to_user_id,
                'konten' => $request->konten ?? '', // Fallback string kosong jika null
                'media_url' => $mediaUrl,
                'media_type' => $mediaType,
                'media_name' => $mediaName,
                'appointment_date' => $request->appointment_date,
                'appointment_title' => $request->appointment_title,
                'appointment_description' => $request->appointment_description,
                'appointment_link' => $request->appointment_link,
                'appointment_status' => $request->appointment_date ? 'pending' : null,
                'read_at' => null,
                'created_at' => now()
            ];

            DB::table('messages')->insert($newMessage);

            broadcast(new \App\Events\MessageSent($newMessage));

            // Fetch sender profile to get name
            $senderProfile = DB::table('job_seeker_profiles')->where('user_id', $authId)->first();
            $senderName = $senderProfile ? ($senderProfile->nama_lengkap ?? 'User') : 'User';
            if (!$senderProfile) {
                $companyProfile = DB::table('company_profiles')->where('user_id', $authId)->first();
                if ($companyProfile) {
                    $senderName = $companyProfile->nama_perusahaan ?? 'Perusahaan';
                }
            }

            // Send notification to receiver
            $receiver = \App\Models\User::find($request->to_user_id);
            if ($receiver) {
                $receiver->notify(new \App\Notifications\MessageReceivedNotification($senderName, $authId));
            }

            return response()->json(['message' => 'Pesan terkirim', 'data' => $newMessage], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengirim pesan: ' . $e->getMessage()], 500);
        }
    }

    public function respondAppointment(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:accepted,declined'
        ]);

        $authId = Auth::id();

        // Cari pesan
        $message = DB::table('messages')->where('id', $id)->first();

        if (!$message) {
            return response()->json(['message' => 'Pesan tidak ditemukan'], 404);
        }

        // Pastikan pengguna ini adalah penerima pesan
        if ($message->to_user_id !== $authId) {
            return response()->json(['message' => 'Anda tidak berhak merespons jadwal ini'], 403);
        }

        try {
            DB::table('messages')->where('id', $id)->update([
                'appointment_status' => $request->status
            ]);

            $updatedMessage = DB::table('messages')->where('id', $id)->first();
            broadcast(new \App\Events\MessageUpdated($updatedMessage));

            return response()->json(['message' => 'Berhasil merespons jadwal', 'status' => $request->status], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal merespons jadwal: ' . $e->getMessage()], 500);
        }
    }

    public function searchUsers(Request $request)
    {
        $authId = Auth::id();
        $keyword = $request->query('q');

        if (!$keyword) {
            return response()->json(['data' => []], 200);
        }

        try {
            // Cari dari Pencari Kerja (Seeker)
            $seekers = DB::table('users')
                ->join('job_seeker_profiles', 'users.id', '=', 'job_seeker_profiles.user_id')
                ->where('users.id', '!=', $authId) // Jangan munculkan diri sendiri
                ->where('users.role', 'seeker')
                ->where(function($query) use ($keyword) {
                    $query->where('job_seeker_profiles.nama_lengkap', 'ilike', "%{$keyword}%")
                          ->orWhere('users.email', 'ilike', "%{$keyword}%")
                          ->orWhere('users.id', $keyword);
                })
                ->select(
                    'users.id',
                    'job_seeker_profiles.nama_lengkap as name',
                    'job_seeker_profiles.avatar_url',
                    'users.role',
                    'job_seeker_profiles.headline as description' // Headline untuk subtitle
                )
                ->limit(10)
                ->get();

            // Cari dari Perusahaan (Company)
            $companies = DB::table('users')
                ->join('company_profiles', 'users.id', '=', 'company_profiles.user_id')
                ->where('users.id', '!=', $authId)
                ->where('users.role', 'company')
                ->where(function($query) use ($keyword) {
                    $query->where('company_profiles.nama_perusahaan', 'ilike', "%{$keyword}%")
                          ->orWhere('users.email', 'ilike', "%{$keyword}%")
                          ->orWhere('users.id', $keyword);
                })
                ->select(
                    'users.id',
                    'company_profiles.nama_perusahaan as name',
                    'company_profiles.logo_url as avatar_url',
                    'users.role',
                    'company_profiles.bidang_industri as description' // Industri untuk subtitle
                )
                ->limit(10)
                ->get();

            // Gabungkan hasil pencarian
            $results = $seekers->merge($companies);

            return response()->json(['data' => $results], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mencari pengguna: ' . $e->getMessage()], 500);
        }
    }

    public function updateChatSettings(Request $request, $contactId)
    {
        $request->validate([
            'action' => 'required|in:pin,unpin,archive,unarchive,block,unblock,delete_history'
        ]);

        $authId = Auth::id();

        try {
            $settings = DB::table('user_chat_settings')
                ->where('user_id', $authId)
                ->where('contact_id', $contactId)
                ->first();

            if (!$settings) {
                // Buat baru jika belum ada
                DB::table('user_chat_settings')->insert([
                    'user_id' => $authId,
                    'contact_id' => $contactId,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            $updateData = ['updated_at' => now()];

            switch ($request->action) {
                case 'pin':
                    $updateData['is_pinned'] = true;
                    break;
                case 'unpin':
                    $updateData['is_pinned'] = false;
                    break;
                case 'archive':
                    $updateData['is_archived'] = true;
                    break;
                case 'unarchive':
                    $updateData['is_archived'] = false;
                    break;
                case 'block':
                    $updateData['is_blocked'] = true;
                    break;
                case 'unblock':
                    $updateData['is_blocked'] = false;
                    break;
                case 'delete_history':
                    $updateData['deleted_until'] = now();
                    break;
            }

            DB::table('user_chat_settings')
                ->where('user_id', $authId)
                ->where('contact_id', $contactId)
                ->update($updateData);

            return response()->json(['message' => 'Pengaturan obrolan diperbarui'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal memperbarui pengaturan: ' . $e->getMessage()], 500);
        }
    }

    public function deleteMessage(Request $request, $id)
    {
        $authId = Auth::id();
        $type = $request->query('type', 'for_me'); // 'for_me' or 'for_everyone'

        try {
            $message = DB::table('messages')->where('id', $id)->first();
            if (!$message) return response()->json(['message' => 'Pesan tidak ditemukan'], 404);

            if ($type === 'for_everyone') {
                if ($message->from_user_id !== $authId) {
                    return response()->json(['message' => 'Hanya pengirim yang dapat menghapus untuk semua orang'], 403);
                }
                DB::table('messages')->where('id', $id)->delete();
                broadcast(new \App\Events\MessageDeleted($id, $message->from_user_id, $message->to_user_id));
                return response()->json(['message' => 'Pesan dihapus untuk semua orang'], 200);
            } else {
                // for_me
                if ($message->from_user_id === $authId) {
                    DB::table('messages')->where('id', $id)->update(['deleted_by_sender' => true]);
                } elseif ($message->to_user_id === $authId) {
                    DB::table('messages')->where('id', $id)->update(['deleted_by_receiver' => true]);
                } else {
                    return response()->json(['message' => 'Akses ditolak'], 403);
                }

                // Hapus fisik jika kedua pihak sudah menghapus
                $checkMsg = DB::table('messages')->where('id', $id)->first();
                if ($checkMsg && $checkMsg->deleted_by_sender && $checkMsg->deleted_by_receiver) {
                    DB::table('messages')->where('id', $id)->delete();
                }

                return response()->json(['message' => 'Pesan dihapus untuk Anda'], 200);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal menghapus pesan: ' . $e->getMessage()], 500);
        }
    }
}