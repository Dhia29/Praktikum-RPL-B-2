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
    Schema::create('job_seeker_profiles', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
        $table->string('nama_lengkap', 200);
        $table->json('pendidikan')->nullable();
        $table->json('pengalaman')->nullable();
        $table->json('skill')->nullable();
        $table->string('cv_url', 500)->nullable();
        $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_seeker_profiles');
    }
};
