<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('company_profiles', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
        $table->string('nama_perusahaan', 200);
        $table->string('npwp', 30);
        $table->string('bidang_industri', 100);
        $table->string('logo_url', 500)->nullable();
        $table->string('lokasi', 200)->nullable();
        $table->text('deskripsi')->nullable();
        $table->string('verifikasi_status', 20);
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_profiles');
    }
};
