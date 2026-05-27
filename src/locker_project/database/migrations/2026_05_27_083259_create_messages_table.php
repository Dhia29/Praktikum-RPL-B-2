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
    Schema::create('messages', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->foreignUuid('from_user_id')->constrained('users')->cascadeOnDelete();
        $table->foreignUuid('to_user_id')->constrained('users')->cascadeOnDelete();
        $table->text('konten');
        $table->timestamp('read_at')->nullable();
        $table->timestamp('created_at')->useCurrent();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
