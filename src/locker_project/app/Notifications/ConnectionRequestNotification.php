<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ConnectionRequestNotification extends Notification
{
    use Queueable;

    protected $senderName;

    public function __construct($senderName)
    {
        $this->senderName = $senderName;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'connection_request',
            'message' => "{$this->senderName} mengirimkan permintaan koneksi.",
            'action_url' => "/profile"
        ];
    }
}
