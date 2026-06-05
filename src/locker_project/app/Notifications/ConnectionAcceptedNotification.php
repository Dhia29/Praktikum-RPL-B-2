<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ConnectionAcceptedNotification extends Notification
{
    use Queueable;

    protected $accepterName;

    public function __construct($accepterName)
    {
        $this->accepterName = $accepterName;
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
            'type' => 'connection_accepted',
            'message' => "{$this->accepterName} menerima permintaan koneksi Anda.",
            'action_url' => "/profile"
        ];
    }
}
