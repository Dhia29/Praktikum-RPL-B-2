<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_seeker_profiles', function (Blueprint $table) {
            // Menambahkan kolom untuk kebutuhan Intro LinkedIn-style
            $table->string('headline', 255)->nullable()->after('nama_lengkap');
            $table->string('lokasi', 255)->nullable()->after('headline');
            $table->string('posisi_saat_ini', 255)->nullable()->after('lokasi');
            $table->string('avatar_url', 500)->nullable()->after('cv_url');
            $table->string('banner_url', 500)->nullable()->after('avatar_url');
        });
    }

    public function down(): void
    {
        Schema::table('job_seeker_profiles', function (Blueprint $table) {
            $table->dropColumn(['headline', 'lokasi', 'posisi_saat_ini', 'avatar_url', 'banner_url']);
        });
    }
};