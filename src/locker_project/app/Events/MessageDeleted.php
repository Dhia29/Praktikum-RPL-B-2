<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageDeleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $messageId;
    public $fromUserId;
    public $toUserId;

    public function __construct($messageId, $fromUserId, $toUserId)
    {
        $this->messageId = $messageId;
        $this->fromUserId = $fromUserId;
        $this->toUserId = $toUserId;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.' . $this->toUserId),
            new PrivateChannel('chat.' . $this->fromUserId),
        ];
    }
    
    public function broadcastWith(): array
    {
        return [
            'id' => $this->messageId
        ];
    }
}
