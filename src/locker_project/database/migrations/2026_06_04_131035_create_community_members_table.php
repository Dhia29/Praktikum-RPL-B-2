<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('community_members', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('community_id')->constrained('communities')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('joined_at')->useCurrent();
            
            // Mencegah 1 user join komunitas yang sama 2 kali
            $table->unique(['community_id', 'user_id']); 
        });
    }
    public function down(): void {
        Schema::dropIfExists('community_members');
    }
};