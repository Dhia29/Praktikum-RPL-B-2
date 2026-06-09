<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->foreignUuid('reply_to')->nullable()->constrained('posts')->cascadeOnDelete()->after('repost_of');
            $table->unsignedInteger('views_count')->default(0)->after('media_type');
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropForeign(['reply_to']);
            $table->dropColumn(['reply_to', 'views_count']);
        });
    }
};
