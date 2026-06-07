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
                ->join('company_profiles', 'job_postings.company_id', '=', 'company_profiles.user_id')
                ->where('applications.jobseeker_id', $profile->id)
                ->select(
                    'applications.id',
                    'applications.status',
                    'applications.submitted_at',
                    'job_postings.title as job_title',
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
}