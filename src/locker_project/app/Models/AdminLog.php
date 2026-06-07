<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AdminLog extends Model
{
    use HasFactory;

    protected $table = 'admin_logs';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false; // Using custom timestamp column

    protected $fillable = [
        'id',
        'admin_id',
        'action',
        'target_entity',
        'target_id',
        'timestamp',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = Str::uuid()->toString();
            }
        });
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
