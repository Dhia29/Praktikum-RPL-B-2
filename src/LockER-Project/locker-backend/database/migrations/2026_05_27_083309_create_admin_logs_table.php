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
    Schema::create('admin_logs', function (Blueprint $table) {
        $table->uuid('id')->primary();
        $table->foreignUuid('admin_id')->constrained('users')->cascadeOnDelete();
        $table->string('action', 100);
        $table->string('target_entity', 50);
        $table->uuid('target_id');
        $table->timestamp('timestamp')->useCurrent();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_logs');
    }
};
