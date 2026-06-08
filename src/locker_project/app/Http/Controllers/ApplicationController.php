<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ApplicationController extends Controller
{
    public function myApplications(Request $request)
    {
        $user = Auth::user();
        
        // Pastikan hanya pencari kerja yang bisa mengakses ini
        if (!$user || $user->role !== 'seeker') {
            return response()->json(['message' => 'Tidak memiliki otorisasi'], 401);
        }

        try {
            // 1. Cari ID profil job seeker
            $profile = DB::table('job_seeker_profiles')->where('user_id', $user->id)->first();
            
            if (!$profile) {
                return response()->json(['data' => []], 200);
            }

            // 2. Ambil data lamaran, di-join dengan tabel lowongan dan perusahaan
            // Catatan: Sesuaikan nama tabel 'job_postings' dan 'company_profiles' jika berbeda
            $applications = DB::table('applications')
                ->join('job_postings', 'applications.job_id', '=', 'job_postings.id')
                ->join('company_profiles', 'job_postings.company_id', '=', 'company_profiles.id')
                ->where('applications.jobseeker_id', $profile->id)
                ->select(
                    'applications.id',
                    'applications.status',
                    'applications.submitted_at',
                    'job_postings.judul as job_title',
                    'job_postings.lokasi as job_location',
                    'company_profiles.nama_perusahaan as company_name',
                    'company_profiles.logo_url as company_logo' // Asumsi ada logo perusahaan
                )
                ->orderBy('applications.submitted_at', 'desc')
                ->get();

            return response()->json(['data' => $applications], 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal memuat data: ' . $e->getMessage()], 500);
        }
    }

    public function apply(Request $request, $jobId)
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'seeker') {
            return response()->json(['message' => 'Hanya pencari kerja yang dapat melamar pekerjaan'], 403);
        }

        $request->validate([
            'nik' => 'required|string|max:16',
            'tanggal_lahir' => 'required|date',
            'ijazah' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        try {
            $profile = DB::table('job_seeker_profiles')->where('user_id', $user->id)->first();
            
            if (!$profile) {
                return response()->json(['message' => 'Profil pencari kerja tidak ditemukan. Lengkapi profil Anda terlebih dahulu.'], 404);
            }

            // Cek apakah lowongan tersedia
            $job = DB::table('job_postings')->where('id', $jobId)->first();
            if (!$job || $job->status !== 'Aktif') {
                return response()->json(['message' => 'Lowongan tidak tersedia atau sudah ditutup'], 404);
            }

            // Cek apakah sudah melamar
            $existingApplication = DB::table('applications')
                ->where('job_id', $jobId)
                ->where('jobseeker_id', $profile->id)
                ->first();

            if ($existingApplication) {
                return response()->json(['message' => 'Anda sudah melamar pekerjaan ini sebelumnya'], 400);
            }

            // CV Snapshot Url dari profil
            $cvUrl = $profile->cv_url ?? null;

            // Upload Ijazah
            $ijazahPath = null;
            if ($request->hasFile('ijazah')) {
                $ijazahPath = $request->file('ijazah')->store('ijazah', 'public');
            }

            // Masukkan data lamaran
            DB::table('applications')->insert([
                'id' => \Illuminate\Support\Str::uuid()->toString(),
                'job_id' => $jobId,
                'jobseeker_id' => $profile->id,
                'status' => 'Pending',
                'cv_snapshot_url' => $cvUrl,
                'nik' => $request->input('nik'),
                'tanggal_lahir' => $request->input('tanggal_lahir'),
                'ijazah_url' => $ijazahPath,
                'submitted_at' => now(),
            ]);

            // Send Notification
            $companyProfile = DB::table('company_profiles')->where('id', $job->company_id)->first();
            if ($companyProfile) {
                $companyUser = \App\Models\User::find($companyProfile->user_id);
                if ($companyUser) {
                    $companyUser->notify(new \App\Notifications\NewApplicationNotification($profile->nama_lengkap, $job->judul));
                }
            }

            // Notify admin dashboard
            event(new \App\Events\AdminDashboardUpdated('new_application', [
                'job_title' => $job->judul,
                'applicant' => $profile->nama_lengkap
            ]));

            return response()->json(['message' => 'Berhasil melamar pekerjaan ini!'], 201);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    public function companyApplications(Request $request)
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'company') {
            return response()->json(['message' => 'Tidak memiliki otorisasi'], 401);
        }

        try {
            $company = DB::table('company_profiles')->where('user_id', $user->id)->first();
            
            if (!$company) {
                return response()->json(['data' => []], 200);
            }

            $applications = DB::table('applications')
                ->join('job_postings', 'applications.job_id', '=', 'job_postings.id')
                ->join('job_seeker_profiles', 'applications.jobseeker_id', '=', 'job_seeker_profiles.id')
                ->where('job_postings.company_id', $company->id)
                ->select(
                    'applications.id',
                    'applications.status',
                    'applications.submitted_at',
                    'applications.cv_snapshot_url',
                    'applications.nik',
                    'applications.tanggal_lahir',
                    'applications.ijazah_url',
                    'job_postings.judul as job_title',
                    'job_seeker_profiles.nama_lengkap as seeker_name',
                    'job_seeker_profiles.avatar_url as seeker_avatar',
                    'job_seeker_profiles.user_id as seeker_user_id'
                )
                ->orderBy('applications.submitted_at', 'desc')
                ->get();

            return response()->json(['data' => $applications], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $user = Auth::user();
        
        if (!$user || $user->role !== 'company') {
            return response()->json(['message' => 'Tidak memiliki otorisasi'], 401);
        }

        $request->validate([
            'status' => 'required|string|in:Pending,Review,Interview,Diterima,Ditolak,Menunggu Review,Terkirim,Diproses,Tes Teknis,Wawancara'
        ]);

        try {
            // Ensure this application belongs to a job posted by this company
            $company = DB::table('company_profiles')->where('user_id', $user->id)->first();
            if (!$company) {
                return response()->json(['message' => 'Profil perusahaan tidak ditemukan'], 404);
            }

            $application = DB::table('applications')
                ->join('job_postings', 'applications.job_id', '=', 'job_postings.id')
                ->join('job_seeker_profiles', 'applications.jobseeker_id', '=', 'job_seeker_profiles.id')
                ->where('applications.id', $id)
                ->where('job_postings.company_id', $company->id)
                ->select('applications.id', 'job_seeker_profiles.user_id as seeker_user_id')
                ->first();

            if (!$application) {
                return response()->json(['message' => 'Lamaran tidak ditemukan atau Anda tidak memiliki akses'], 404);
            }

            DB::table('applications')->where('id', $id)->update([
                'status' => $request->input('status')
            ]);

            broadcast(new \App\Events\ApplicationStatusUpdated($id, $request->input('status'), $application->seeker_user_id));

            return response()->json(['message' => 'Status lamaran berhasil diperbarui'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }
}