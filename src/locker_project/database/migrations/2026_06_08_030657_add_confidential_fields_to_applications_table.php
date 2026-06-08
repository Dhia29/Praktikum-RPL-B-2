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
        Schema::table('applications', function (Blueprint $table) {
            $table->string('nik', 16)->nullable()->after('cv_snapshot_url');
            $table->date('tanggal_lahir')->nullable()->after('nik');
            $table->string('ijazah_url')->nullable()->after('tanggal_lahir');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn(['nik', 'tanggal_lahir', 'ijazah_url']);
        });
    }
};
