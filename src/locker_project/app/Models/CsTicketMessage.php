<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CsTicketMessage extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'ticket_id',
        'sender_id',
        'message',
        'is_internal_note',
        'read_at',
    ];

    protected $casts = [
        'is_internal_note' => 'boolean',
        'read_at' => 'datetime',
    ];

    public function ticket()
    {
        return $this->belongsTo(CsTicket::class, 'ticket_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
