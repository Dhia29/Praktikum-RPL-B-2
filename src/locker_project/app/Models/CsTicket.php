<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CsTicket extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'assigned_admin_id',
        'subject',
        'category',
        'priority',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function assignedAdmin()
    {
        return $this->belongsTo(User::class, 'assigned_admin_id');
    }

    public function messages()
    {
        return $this->hasMany(CsTicketMessage::class, 'ticket_id');
    }
}
