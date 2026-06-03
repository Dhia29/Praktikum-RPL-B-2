<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_seeker_profiles', function (Blueprint $table) {
            $table->string('wa_number', 20)->nullable()->after('pendidikan');
            $table->string('insta_username', 50)->nullable()->after('wa_number');
            $table->string('facebook_url', 255)->nullable()->after('insta_username');
            $table->string('github_username', 50)->nullable()->after('facebook_url');
        });
    }

    public function down(): void
    {
        Schema::table('job_seeker_profiles', function (Blueprint $table) {
            $table->dropColumn(['wa_number', 'insta_username', 'facebook_url', 'github_username']);
        });
    }
};