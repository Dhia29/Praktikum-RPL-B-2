<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;

#[Fillable(['id', 'email', 'password_hash', 'role', 'status'])]
#[Hidden(['password_hash', 'remember_token'])]
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    // 1. Beritahu Laravel kalau kita pakai UUID, bukan Auto Increment
    public $incrementing = false;
    protected $keyType = 'string';

    // 2. Beritahu Laravel kalau tabel ini TIDAK punya kolom updated_at
    const UPDATED_AT = null;

    // 3. Beritahu sistem Login Laravel untuk pakai 'password_hash'
    public function getAuthPasswordName()
    {
        return 'password_hash';
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password_hash' => 'hashed',
        ];
    }
}