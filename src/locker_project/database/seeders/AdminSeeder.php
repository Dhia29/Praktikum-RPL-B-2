<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminEmail = 'admin@locker.com';

        // Check if admin already exists
        $admin = DB::table('users')->where('email', $adminEmail)->first();

        if (!$admin) {
            DB::table('users')->insert([
                'id' => Str::uuid()->toString(),
                'email' => $adminEmail,
                'password_hash' => Hash::make('admin123'),
                'role' => 'ADMIN',
                'status' => 'active',
                'created_at' => now(),
            ]);
        }
    }
}
