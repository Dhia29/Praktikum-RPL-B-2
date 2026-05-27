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
    Schema::create('community_posts', function (Blueprint $table) {
        $table->uuid('id')->primary();
        // FK ke tabel users dengan penghapusan otomatis jika user dihapus
        $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
        $table->text('content');
        // varchar, nullable() berarti opsional (boleh dikosongkan jika tidak ada foto/video)
        $table->string('media_url', 500)->nullable(); 
        $table->timestamp('created_at')->useCurrent();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('community_posts');
    }
};
