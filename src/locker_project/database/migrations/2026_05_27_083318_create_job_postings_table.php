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
    Schema::create('job_postings', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->foreignUuid('company_id')->constrained('company_profiles')->cascadeOnDelete();
        $table->string('judul', 200);
        $table->text('deskripsi');
        $table->string('kategori', 100);
        $table->string('lokasi', 200);
        $table->date('deadline');
        $table->string('status', 20);
        $table->timestamp('created_at')->useCurrent();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_postings');
    }
};
