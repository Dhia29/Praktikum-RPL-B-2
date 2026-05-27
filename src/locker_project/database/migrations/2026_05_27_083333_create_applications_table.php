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
    Schema::create('applications', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->foreignUuid('job_id')->constrained('job_postings')->cascadeOnDelete();
        $table->foreignUuid('jobseeker_id')->constrained('job_seeker_profiles')->cascadeOnDelete();
        $table->string('status', 20);
        $table->string('cv_snapshot_url', 500)->nullable();
        $table->timestamp('submitted_at')->useCurrent();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
