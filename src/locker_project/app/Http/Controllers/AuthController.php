<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerificationEmail;
use App\Mail\ResetPasswordEmail;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'role' => 'required|in:seeker,company',
            'nama_lengkap_atau_perusahaan' => 'required|string',
            'npwp' => 'required_if:role,company',
            'industri' => 'required_if:role,company',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Insert ke tabel users (Sesuai Migration)
            $user = User::create([
                'id' => Str::uuid()->toString(),
                'email' => $request->email,
                'password_hash' => Hash::make($request->password),
                'role' => $request->role,
                // Untuk pencari kerja: jangan otomatis verifikasi, pakai OTP
                'status' => 'Menunggu Verifikasi',
                'email_verified_at' => $request->role === 'company' ? now() : null,
            ]);

            // Inisialisasi kolom verifikasi
            DB::table('users')->where('id', $user->id)->update([
                'verification_code' => null,
                'verification_expires_at' => null,
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

            // Jika role seeker, kirimkan kode verifikasi (OTP) via email
            if ($request->role === 'seeker') {
                $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
                DB::table('users')->where('id', $user->id)->update([
                    'verification_code' => $code,
                    'verification_expires_at' => now()->addMinutes(15),
                ]);

                // Cari nama dari profil untuk personalisasi email
                $name = $request->nama_lengkap_atau_perusahaan ?? 'Pengguna';
                try {
                    Mail::to($user->email)->send(new VerificationEmail($code, $name));
                } catch (\Exception $e) {
                    \Log::error('Failed to send registration verification email: ' . $e->getMessage());
                }

                return response()->json([
                    'message' => 'Registrasi berhasil! Silakan masukkan kode verifikasi yang telah dikirim ke email Anda.',
                    'requires_verification' => true,
                    'email' => $user->email
                ], 201);
            }

            return response()->json([
                'message' => 'Registrasi berhasil! Silakan login menggunakan akun Anda.',
                'requires_verification' => false,
                'email' => $user->email
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
            $user = Auth::user();

            // 3. Regenerasi session untuk keamanan (mencegah Session Fixation)
            $request->session()->regenerate();

            return response()->json([
                'message' => 'Login berhasil!',
                'user' => $user
            ], 200);
        }

        // 4. Jika gagal, kembalikan respon error 401
        return response()->json([
            'message' => 'Email atau password yang Anda masukkan salah.'
        ], 401);
    }

    public function verifyEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        if (!is_null($user->email_verified_at)) {
            return response()->json(['message' => 'Email sudah terverifikasi.'], 400);
        }

        if ($user->verification_code !== $request->code) {
            return response()->json(['message' => 'Kode verifikasi tidak valid.'], 400);
        }

        if ($user->verification_expires_at < now()) {
            return response()->json(['message' => 'Kode verifikasi telah kedaluwarsa. Silakan minta kode baru.'], 400);
        }

        DB::table('users')->where('id', $user->id)->update([
            'email_verified_at' => now(),
            'verification_code' => null,
            'verification_expires_at' => null,
            'status' => $user->role === 'company' ? 'Menunggu Persetujuan' : 'Aktif'
        ]);

        $user->status = $user->role === 'company' ? 'Menunggu Persetujuan' : 'Aktif';

        // Login user
        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Email berhasil diverifikasi!',
            'user' => $user
        ], 200);
    }

    public function resendCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        if (!is_null($user->email_verified_at)) {
            return response()->json(['message' => 'Email sudah terverifikasi.'], 400);
        }

        // Check if we just sent one recently to prevent spam
        if ($user->verification_expires_at && $user->verification_expires_at > now()->addMinutes(14)) {
            return response()->json(['message' => 'Tunggu beberapa saat sebelum meminta kode baru.'], 429);
        }

        $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

        DB::table('users')->where('id', $user->id)->update([
            'verification_code' => $code,
            'verification_expires_at' => now()->addMinutes(15),
        ]);

        // Cari nama untuk email
        $name = 'Pengguna';
        if ($user->role === 'seeker') {
            $profile = DB::table('job_seeker_profiles')->where('user_id', $user->id)->first();
            $name = $profile->nama_lengkap ?? $name;
        } else {
            $profile = DB::table('company_profiles')->where('user_id', $user->id)->first();
            $name = $profile->nama_perusahaan ?? $name;
        }

        try {
            Mail::to($user->email)->send(new VerificationEmail($code, $name));
        } catch (\Exception $e) {
            \Log::error('Failed to resend verification email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Kode verifikasi baru telah dikirim ke email Anda.'
        ], 200);
    }

    // --- FITUR LUPA PASSWORD --- //

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email tidak terdaftar di sistem kami.'], 404);
        }

        $token = Str::random(60);
        
        DB::table('users')->where('id', $user->id)->update([
            'reset_password_token' => hash('sha256', $token),
            'reset_password_expires_at' => now()->addMinutes(60),
        ]);

        $name = 'Pengguna';
        if ($user->role === 'seeker') {
            $profile = DB::table('job_seeker_profiles')->where('user_id', $user->id)->first();
            $name = $profile->nama_lengkap ?? $name;
        } else {
            $profile = DB::table('company_profiles')->where('user_id', $user->id)->first();
            $name = $profile->nama_perusahaan ?? $name;
        }

        try {
            Mail::to($user->email)->send(new ResetPasswordEmail($token, $user->email, $name));
        } catch (\Exception $e) {
            \Log::error('Failed to send reset password email: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal mengirim email reset password. Silakan coba lagi.'], 500);
        }

        return response()->json(['message' => 'Tautan reset password telah dikirim ke email Anda.'], 200);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|min:8|confirmed'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Permintaan tidak valid.'], 400);
        }

        if ($user->reset_password_token !== hash('sha256', $request->token)) {
            return response()->json(['message' => 'Tautan reset password tidak valid atau sudah digunakan.'], 400);
        }

        if ($user->reset_password_expires_at < now()) {
            return response()->json(['message' => 'Tautan reset password telah kedaluwarsa. Silakan minta yang baru.'], 400);
        }

        DB::table('users')->where('id', $user->id)->update([
            'password_hash' => Hash::make($request->password),
            'reset_password_token' => null,
            'reset_password_expires_at' => null,
        ]);

        return response()->json(['message' => 'Password berhasil diperbarui. Silakan login dengan password baru Anda.'], 200);
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
                $profileData = [
                    'headline' => $profile->bidang_industri ?? '',
                    'location' => $profile->lokasi ?? '',
                    'description' => $profile->deskripsi ?? '',
                    'avatar_url' => $profile->logo_url ?? null,
                    'banner_url' => $profile->banner_url ?? null,
                    'npwp' => $profile->npwp ?? '',
                    'employee_count' => $profile->employee_count ?? '',
                    'website_url' => $profile->website_url ?? '',
                    'follower_count' => $profile->follower_count ?? 0,
                ];
                if ($user->status === 'Ditolak') {
                    $profileData['alasan_penolakan'] = $profile->alasan_penolakan;
                }
            }
        }

        return response()->json([
            'user' => $user,
            'name' => $name,
            'profile' => $profileData
        ], 200);
    }
}