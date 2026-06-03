<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Validasi disesuaikan dengan kebutuhan form dan database
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'role' => 'required|in:seeker,company',
            'nama_lengkap_atau_perusahaan' => 'required|string',
            'npwp' => 'required_if:role,company',
            'industri' => 'required_if:role,company',
        ]);

        try {
            DB::beginTransaction();

            // Insert ke tabel users (Sesuai Migration)
            $user = User::create([
                'id' => Str::uuid()->toString(),
                'email' => $request->email,
                'password_hash' => Hash::make($request->password),
                'role' => $request->role,
                'status' => $request->role === 'company' ? 'Menunggu Verifikasi' : 'Aktif',
            ]);

            // Insert ke tabel profil
            if ($request->role === 'seeker') {
                DB::table('job_seeker_profiles')->insert([
                    'id' => Str::uuid()->toString(),
                    'user_id' => $user->id,
                    'nama_lengkap' => $request->nama_lengkap_atau_perusahaan,
                    'updated_at' => now(), // Migration ini cuma punya updated_at
                ]);
            } else {
                DB::table('company_profiles')->insert([
                    'id' => Str::uuid()->toString(),
                    'user_id' => $user->id,
                    'nama_perusahaan' => $request->nama_lengkap_atau_perusahaan,
                    'npwp' => $request->npwp,
                    'bidang_industri' => $request->industri,
                    'verifikasi_status' => 'Menunggu',
                    // Migration ini TIDAK punya timestamps sama sekali
                ]);
            }

            DB::commit();

            Auth::login($user);

            return response()->json([
                'message' => 'Registrasi berhasil!',
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal mendaftar: ' . $e->getMessage()], 500);
        }
    }

    public function login(Request $request)
    {
        // 1. Validasi input dari form login React
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2. Lakukan percobaan autentikasi
        // Laravel otomatis mencocokkan 'password' dengan kolom 'password_hash'
        // karena kita sudah mengaturnya di getAuthPasswordName() pada model User.php
        if (Auth::attempt($credentials)) {
            // 3. Regenerasi session untuk keamanan (mencegah Session Fixation)
            $request->session()->regenerate();

            return response()->json([
                'message' => 'Login berhasil!',
                'user' => Auth::user()
            ], 200);
        }

        // 4. Jika gagal, kembalikan respon error 401
        return response()->json([
            'message' => 'Email atau password yang Anda masukkan salah.'
        ], 401);
    }

    // --- FITUR LOGIN GOOGLE SSO --- //

    // 1. Mengarahkan user ke halaman login Google
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    // 2. Menangani kembalian data dari Google
    public function handleGoogleCallback()
    {
        try {
            // Ambil data user dari Google
            $googleUser = Socialite::driver('google')->user();

            // Cek apakah email ini sudah ada di database kita
            $existingUser = User::where('email', $googleUser->getEmail())->first();

            if ($existingUser) {
                // Jika sudah ada, langsung login-kan
                Auth::login($existingUser);
            } else {
                // Jika belum ada, buatkan akun baru (Secara default kita jadikan 'seeker')
                DB::beginTransaction();

                $newUser = User::create([
                    'id' => Str::uuid()->toString(),
                    'email' => $googleUser->getEmail(),
                    // Karena Google tidak memberikan password, kita buatkan password acak yang kuat
                    'password_hash' => Hash::make(Str::random(24)), 
                    'role' => 'seeker', // Default role untuk pendaftaran SSO
                    'status' => 'Aktif',
                ]);

                // Buatkan juga profil pencari kerjanya
                DB::table('job_seeker_profiles')->insert([
                    'id' => Str::uuid()->toString(),
                    'user_id' => $newUser->id,
                    'nama_lengkap' => $googleUser->getName(), // Ambil nama asli dari akun Google
                    'updated_at' => now(),
                ]);

                DB::commit();
                
                Auth::login($newUser);
            }

            // Setelah sukses, lempar kembali ke halaman React (loker)
            return redirect('/loker');

        } catch (\Exception $e) {
            DB::rollBack();
            // Jika gagal (misal batal memilih akun), kembalikan ke halaman awal
            return redirect('/')->with('error', 'Gagal masuk dengan Google.');
        }
    }

    // --- FUNGSI ME YANG SUDAH DISESUAIKAN DAN AMAN DARI BUG --- //
    public function me(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Tidak ada sesi aktif'], 401);
        }

        $user = Auth::user();
        $name = 'User'; // Default fallback

        // Kerangka data profil default agar React tidak crash saat data di DB masih kosong
        $profileData = [
            'headline' => '',
            'location' => '',
            'current_position' => '',
            'education' => '',
            'avatar_url' => null,
            'banner_url' => null,
        ];

        // Cari data profil berdasarkan role user yang aktif
        if ($user->role === 'seeker') {
            $profile = DB::table('job_seeker_profiles')->where('user_id', $user->id)->first();
            
            if ($profile) {
                $name = $profile->nama_lengkap;

                // Ekstrak string institusi dari data JSON kolom pendidikan secara aman
                $educationText = '';
                if (!empty($profile->pendidikan)) {
                    $pendidikanArr = json_decode($profile->pendidikan, true);
                    
                    // Jaga-jaga apabila format JSON mengalami double-encoding di database SQLite
                    if (is_string($pendidikanArr)) {
                        $pendidikanArr = json_decode($pendidikanArr, true);
                    }
                    
                    if (is_array($pendidikanArr) && !empty($pendidikanArr)) {
                        $educationText = $pendidikanArr[0]['institusi'] ?? '';
                    }
                }

                // Petakan data kolom snake_case database menjadi camelCase/nama prop properti React
               $profileData = [
                    'headline' => $profile->headline ?? '',
                    'location' => $profile->lokasi ?? '',
                    'current_position' => $profile->posisi_saat_ini ?? '',
                    'education' => $educationText,
                    'educations' => isset($profile->pendidikan) ? json_decode($profile->pendidikan) : [],
                    'experiences' => isset($profile->pengalaman) ? json_decode($profile->pengalaman) : [],
                    'certifications' => isset($profile->skill) ? json_decode($profile->skill) : [],
                    'cv_url' => $profile->cv_url ?? null,
                    'avatar_url' => $profile->avatar_url ?? null,
                    'banner_url' => $profile->banner_url ?? null,
                    'wa_number' => $profile->wa_number ?? '',
                    'insta_username' => $profile->insta_username ?? '',
                    'facebook_url' => $profile->facebook_url ?? '',
                    'github_username' => $profile->github_username ?? '',
                ];
            }
        } else if ($user->role === 'company') {
            $profile = DB::table('company_profiles')->where('user_id', $user->id)->first();
            if ($profile) {
                $name = $profile->nama_perusahaan;
            }
        }

        return response()->json([
            'user' => $user,
            'name' => $name,
            'profile' => $profileData
        ], 200);
    }
}