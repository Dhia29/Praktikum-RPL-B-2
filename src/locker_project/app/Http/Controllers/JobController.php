<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class JobController extends Controller
{
    public function index()
    {
        try {
            // Mengambil data loker dan menggabungkannya dengan profil perusahaan
            $jobs = DB::table('job_postings')
                ->join('company_profiles', 'job_postings.company_id', '=', 'company_profiles.id')
                ->select(
                    'job_postings.id',
                    'job_postings.judul as role',              // Sesuaikan dengan kolom 'judul'
                    'job_postings.kategori as type',           // Sesuaikan dengan kolom 'kategori'
                    'job_postings.lokasi as location',         // Sesuaikan dengan kolom 'lokasi'
                    'job_postings.deskripsi as description',   // Sesuaikan dengan kolom 'deskripsi'
                    'job_postings.created_at',
                    'company_profiles.nama_perusahaan as company'
                )
                // Pastikan penulisan status di database (Aktif/aktif) sama persis dengan ini
                ->where('job_postings.status', 'Aktif') 
                ->orderBy('job_postings.created_at', 'desc')
                ->get();

            return response()->json($jobs, 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengambil data: ' . $e->getMessage()], 500);
        }
    }

    public function myJobs(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'company') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $company = DB::table('company_profiles')->where('user_id', $user->id)->first();
            if (!$company) {
                return response()->json(['message' => 'Profil perusahaan tidak ditemukan'], 404);
            }

            $jobs = DB::table('job_postings')
                ->join('company_profiles', 'job_postings.company_id', '=', 'company_profiles.id')
                ->select(
                    'job_postings.id',
                    'job_postings.judul as role',
                    'job_postings.kategori as type',
                    'job_postings.lokasi as location',
                    'job_postings.deskripsi as description',
                    'job_postings.created_at',
                    'job_postings.status',
                    'company_profiles.nama_perusahaan as company'
                )
                ->where('job_postings.company_id', $company->id)
                ->orderBy('job_postings.created_at', 'desc')
                ->get();

            return response()->json($jobs, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengambil data: ' . $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'company') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $validated = $request->validate([
                'judul' => 'required|string|max:200',
                'kategori' => 'required|string|max:100',
                'lokasi' => 'required|string|max:200',
                'deskripsi' => 'required|string',
                'deadline' => 'required|date'
            ]);

            $company = DB::table('company_profiles')->where('user_id', $user->id)->first();

            $jobId = Str::uuid()->toString();
            DB::table('job_postings')->insert([
                'id' => $jobId,
                'company_id' => $company->id,
                'judul' => $validated['judul'],
                'deskripsi' => $validated['deskripsi'],
                'kategori' => $validated['kategori'],
                'lokasi' => $validated['lokasi'],
                'deadline' => $validated['deadline'],
                'status' => 'Aktif',
                'created_at' => now(),
            ]);

            $newJob = DB::table('job_postings')->where('id', $jobId)->first();
            return response()->json(['message' => 'Lowongan berhasil dibuat', 'job' => $newJob], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal menyimpan data: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'company') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $validated = $request->validate([
                'judul' => 'required|string|max:200',
                'kategori' => 'required|string|max:100',
                'lokasi' => 'required|string|max:200',
                'deskripsi' => 'required|string',
                'deadline' => 'required|date',
                'status' => 'required|string|max:20'
            ]);

            $company = DB::table('company_profiles')->where('user_id', $user->id)->first();
            
            $job = DB::table('job_postings')->where('id', $id)->first();
            if (!$job || $job->company_id !== $company->id) {
                return response()->json(['message' => 'Lowongan tidak ditemukan atau Anda tidak berhak'], 404);
            }

            DB::table('job_postings')->where('id', $id)->update([
                'judul' => $validated['judul'],
                'deskripsi' => $validated['deskripsi'],
                'kategori' => $validated['kategori'],
                'lokasi' => $validated['lokasi'],
                'deadline' => $validated['deadline'],
                'status' => $validated['status']
            ]);

            return response()->json(['message' => 'Lowongan berhasil diperbarui'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal memperbarui data: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'company') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $company = DB::table('company_profiles')->where('user_id', $user->id)->first();
            
            $job = DB::table('job_postings')->where('id', $id)->first();
            if (!$job || $job->company_id !== $company->id) {
                return response()->json(['message' => 'Lowongan tidak ditemukan atau Anda tidak berhak'], 404);
            }

            // Opsi: kita ubah statusnya jadi 'Ditutup' alih-alih menghapus (Soft Delete)
            DB::table('job_postings')->where('id', $id)->update([
                'status' => 'Ditutup'
            ]);

            return response()->json(['message' => 'Lowongan berhasil ditutup'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal menutup lowongan: ' . $e->getMessage()], 500);
        }
    }
}