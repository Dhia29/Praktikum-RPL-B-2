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
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->string('banner_url', 500)->nullable()->after('logo_url');
            $table->string('employee_count', 50)->nullable()->after('bidang_industri');
            $table->string('website_url', 500)->nullable()->after('employee_count');
            $table->integer('follower_count')->default(0)->after('lokasi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->dropColumn(['banner_url', 'employee_count', 'website_url', 'follower_count']);
        });
    }
};
