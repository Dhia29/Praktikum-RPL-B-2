<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            // Jika null, berarti postingan masuk ke Feed Global. Jika terisi, masuk ke komunitas tertentu
            $table->foreignUuid('community_id')->nullable()->constrained('communities')->cascadeOnDelete();
            // Jika terisi, berarti postingan ini adalah hasil Repost dari postingan lain
            $table->foreignUuid('repost_of')->nullable()->constrained('posts')->cascadeOnDelete();
            $table->text('konten')->nullable();
            $table->string('media_url')->nullable();
            $table->string('media_type', 20)->nullable(); // 'image' atau 'video'
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};