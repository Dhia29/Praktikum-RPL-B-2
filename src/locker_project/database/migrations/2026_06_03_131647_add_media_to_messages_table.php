<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->string('media_url')->nullable()->after('konten');
            $table->string('media_type', 20)->nullable()->after('media_url'); // 'image', 'video', atau 'file'
            // Mengubah kolom konten menjadi nullable agar user bisa mengirim gambar saja tanpa teks
            $table->text('konten')->nullable()->change(); 
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn(['media_url', 'media_type']);
            $table->text('konten')->nullable(false)->change();
        });
    }
};