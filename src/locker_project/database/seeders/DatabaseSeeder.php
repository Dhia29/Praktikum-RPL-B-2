<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(AdminSeeder::class);

        $jobSeekerId = Str::uuid()->toString();
        $employerId = Str::uuid()->toString();

        // 1. Create Job Seeker User
        DB::table('users')->insert([
            'id' => $jobSeekerId,
            'email' => 'jobseeker@example.com',
            'password_hash' => Hash::make('password123'),
            'role' => 'job_seeker',
            'status' => 'active',
            'created_at' => now(),
        ]);

        // 2. Create Job Seeker Profile
        DB::table('job_seeker_profiles')->insert([
            'id' => Str::uuid()->toString(),
            'user_id' => $jobSeekerId,
            'nama_lengkap' => 'Budi Jobseeker',
            'pendidikan' => json_encode(['S1 Teknik Informatika']),
            'pengalaman' => json_encode(['Web Developer 2 years']),
            'skill' => json_encode(['PHP', 'Laravel', 'JavaScript']),
            'updated_at' => now(),
        ]);

        // 3. Create Employer User
        DB::table('users')->insert([
            'id' => $employerId,
            'email' => 'employer@example.com',
            'password_hash' => Hash::make('password123'),
            'role' => 'employer',
            'status' => 'active',
            'created_at' => now(),
        ]);

        // 4. Create Employer Profile
        DB::table('company_profiles')->insert([
            'id' => Str::uuid()->toString(),
            'user_id' => $employerId,
            'nama_perusahaan' => 'PT. Tech Solution',
            'npwp' => '12.345.678.9-012.000',
            'bidang_industri' => 'Information Technology',
            'verifikasi_status' => 'verified',
        ]);
    }
}
