<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->string('user_id')->unique();
            
            // Notification preferences
            $table->boolean('notify_application_status')->default(true);
            $table->boolean('notify_messages')->default(true);
            $table->boolean('notify_community')->default(true);
            $table->boolean('notify_connections')->default(true);
            
            // Visibility: 'public', 'connections', 'none'
            $table->string('visibility_email')->default('none');
            $table->string('visibility_phone')->default('none');
            $table->string('visibility_location')->default('public');
            $table->string('visibility_education')->default('public');
            $table->string('visibility_experience')->default('public');
            $table->string('visibility_social_links')->default('connections');
            
            // Appearance
            $table->string('theme')->default('light'); // 'light' or 'dark'
            
            $table->timestamp('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};
