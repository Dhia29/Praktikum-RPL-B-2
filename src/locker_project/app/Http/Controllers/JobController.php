<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
}