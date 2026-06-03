<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    // --- FUNGSI EXISTING: EDIT INTRO (Sama seperti kemarin) ---
    public function updateIntro(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:200',
            'headline' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'current_position' => 'nullable|string|max:255',
            'education' => 'nullable|string|max:255',
        ]);

        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'Sesi habis'], 401);

        try {
            DB::beginTransaction();

            if ($user->role === 'seeker') {
                $pendidikanJson = null;
                if ($request->filled('education')) {
                    $pendidikanJson = json_encode([['institusi' => $request->education]]);
                }

                $profile = DB::table('job_seeker_profiles')->where('user_id', $user->id)->first();

                if ($profile) {
                    DB::table('job_seeker_profiles')->where('user_id', $user->id)->update([
                        'nama_lengkap' => $request->name,
                        'headline' => $request->headline,
                        'lokasi' => $request->location,
                        'posisi_saat_ini' => $request->current_position,
                        'pendidikan' => $pendidikanJson,
                        'updated_at' => now(),
                    ]);
                } else {
                    DB::table('job_seeker_profiles')->insert([
                        'id' => Str::uuid()->toString(),
                        'user_id' => $user->id,
                        'nama_lengkap' => $request->name,
                        'headline' => $request->headline,
                        'lokasi' => $request->location,
                        'posisi_saat_ini' => $request->current_position,
                        'pendidikan' => $pendidikanJson,
                        'updated_at' => now(),
                    ]);
                }
            }

            DB::commit();
            return response()->json(['message' => 'Profil berhasil diperbarui!', 'data' => ['name' => $request->name, 'headline' => $request->headline, 'location' => $request->location, 'current_position' => $request->current_position, 'education' => $request->education]], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal update: ' . $e->getMessage()], 500);
        }
    }

    public function updateContact(Request $request)
    {
        // 1. Validasi (Ganti linkedin_url menjadi facebook_url)
        $request->validate([
            'wa_number' => 'nullable|string|max:20|regex:/^[0-9]+$/',
            'insta_username' => 'nullable|string|max:50',
            'facebook_url' => 'nullable|url|max:255', // <-- SEPERTI INI
            'github_username' => 'nullable|string|max:50',
        ]);

        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'Sesi habis'], 401);

        try {
            DB::beginTransaction();

            $cleanWa = null;
            if ($request->wa_number) {
                $cleanWa = preg_replace('/[^0-9]/', '', $request->wa_number);
                if (str_starts_with($cleanWa, '08')) {
                    $cleanWa = '628' . substr($cleanWa, 2);
                }
            }

            // 2. Update ke Database menggunakan facebook_url
            DB::table('job_seeker_profiles')
                ->where('user_id', $user->id)
                ->update([
                    'wa_number' => $cleanWa,
                    'insta_username' => $request->insta_username,
                    'facebook_url' => $request->facebook_url, // <-- SEPERTI INI
                    'github_username' => $request->github_username,
                    'updated_at' => now(),
                ]);

            DB::commit();
            
            return response()->json([
                'message' => 'Kontak berhasil diperbarui!',
                'data' => [
                    'wa_number' => $cleanWa,
                    'insta_username' => $request->insta_username,
                    'facebook_url' => $request->facebook_url, // <-- SEPERTI INI
                    'github_username' => $request->github_username,
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal update kontak: ' . $e->getMessage()], 500);
        }
    }

    // --- FUNGSI EXISTING: UPLOAD GAMBAR (Diupdate sedikit agar lebih aman) ---
    public function uploadImage(Request $request)
    {
        $request->validate(['image' => 'required|image|mimes:jpeg,png,jpg|max:5120', 'type' => 'required|in:avatar,banner']);
        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'Sesi habis'], 401);

        try {
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('profiles', 'public');
                $url = asset('storage/' . $path);
                $column = $request->type === 'avatar' ? 'avatar_url' : 'banner_url';
                
                // Gunakan updateOrInsert agar lebih aman jika datanya belum ada sama sekali
                DB::table('job_seeker_profiles')->updateOrInsert(
                    ['user_id' => $user->id],
                    [
                        $column => $url,
                        'updated_at' => now(),
                        // Pastikan UUID terbuat jika ini Insert baru
                        'id' => DB::raw('IFNULL(id, "' . (string) Str::uuid() . '")')
                    ]
                );

                return response()->json(['url' => $url, 'message' => 'Upload berhasil!'], 200);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal upload: ' . $e->getMessage()], 500);
        }
    }

    public function getPublicProfile($id)
    {
        // Temukan user dan profilnya
        $profile = DB::table('job_seeker_profiles')
            ->where('user_id', $id)
            ->first();

        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        // Return data publik (hindari return data sensitif jika ada)
        return response()->json([
            'id' => $profile->user_id,
            'name' => $profile->nama_lengkap,
            'headline' => $profile->headline,
            'location' => $profile->lokasi,
            'current_position' => $profile->posisi_saat_ini,
            'education' => $profile->pendidikan ? json_decode($profile->pendidikan)[0]->institusi ?? null : null,
            'educations' => $profile->pendidikan ? json_decode($profile->pendidikan) : [],
            'experiences' => $profile->pengalaman ? json_decode($profile->pengalaman) : [],
            'certifications' => $profile->skill ? json_decode($profile->skill) : [],
            'cv_url' => $profile->cv_url,
            'avatar_url' => $profile->avatar_url,
            'banner_url' => $profile->banner_url,
            'wa_number' => $profile->wa_number,
            'insta_username' => $profile->insta_username,
            'facebook_url' => $profile->facebook_url,
            'github_username' => $profile->github_username,
        ], 200);
    }

    public function updateExperiences(Request $request)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'Sesi habis'], 401);

        $experiences = $request->input('experiences', []);

        try {
            DB::table('job_seeker_profiles')
                ->where('user_id', $user->id)
                ->update([
                    'pengalaman' => json_encode($experiences),
                    'updated_at' => now(),
                ]);
            return response()->json(['message' => 'Pengalaman berhasil diperbarui!', 'data' => $experiences], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal update pengalaman: ' . $e->getMessage()], 500);
        }
    }

    public function updateEducations(Request $request)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'Sesi habis'], 401);

        $educations = $request->input('educations', []);

        try {
            DB::table('job_seeker_profiles')
                ->where('user_id', $user->id)
                ->update([
                    'pendidikan' => json_encode($educations),
                    'updated_at' => now(),
                ]);
            return response()->json(['message' => 'Pendidikan berhasil diperbarui!', 'data' => $educations], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal update pendidikan: ' . $e->getMessage()], 500);
        }
    }
    public function updateCertifications(Request $request)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'Sesi habis'], 401);

        $certifications = $request->input('certifications', []);

        try {
            DB::table('job_seeker_profiles')
                ->where('user_id', $user->id)
                ->update([
                    'skill' => json_encode($certifications),
                    'updated_at' => now(),
                ]);
            return response()->json(['message' => 'Sertifikasi berhasil diperbarui!', 'data' => $certifications], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal update sertifikasi: ' . $e->getMessage()], 500);
        }
    }

    public function uploadCertificationFile(Request $request)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'Sesi habis'], 401);

        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = \Illuminate\Support\Str::random(40) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('public/certifications', $filename);
            
            $url = '/storage/certifications/' . $filename;
            
            return response()->json(['url' => $url, 'message' => 'File berhasil diunggah.'], 200);
        }
        
        return response()->json(['message' => 'Tidak ada file.'], 400);
    }

    public function uploadCV(Request $request)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'Sesi habis'], 401);

        $request->validate([
            'cv' => 'required|file|mimes:pdf|max:5120',
        ]);

        if ($request->hasFile('cv')) {
            $file = $request->file('cv');
            $filename = \Illuminate\Support\Str::random(40) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('public/cvs', $filename);
            
            $url = '/storage/cvs/' . $filename;
            
            try {
                DB::table('job_seeker_profiles')
                    ->where('user_id', $user->id)
                    ->update([
                        'cv_url' => $url,
                        'updated_at' => now(),
                    ]);
                return response()->json(['url' => $url, 'message' => 'CV berhasil diunggah.'], 200);
            } catch (\Exception $e) {
                return response()->json(['message' => 'Gagal menyimpan URL CV: ' . $e->getMessage()], 500);
            }
        }
        
        return response()->json(['message' => 'Tidak ada file.'], 400);
    }

    public function deleteCV(Request $request)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'Sesi habis'], 401);

        try {
            // Kita bisa menggunakan fitur penghapusan file aslinya di storage, 
            // tapi minimal kita hapus dari database
            DB::table('job_seeker_profiles')
                ->where('user_id', $user->id)
                ->update([
                    'cv_url' => null,
                    'updated_at' => now(),
                ]);
            return response()->json(['message' => 'CV berhasil dihapus.'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal menghapus CV: ' . $e->getMessage()], 500);
        }
    }
}