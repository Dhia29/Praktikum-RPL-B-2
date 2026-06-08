<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewFollowerNotification extends Notification
{
    use Queueable;

    protected $followerName;
    protected $followerId;

    /**
     * Create a new notification instance.
     */
    public function __construct($followerName, $followerId)
    {
        $this->followerName = $followerName;
        $this->followerId = $followerId;
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
            'title' => 'Pengikut Baru!',
            'message' => "{$this->followerName} mulai mengikuti perusahaan Anda.",
            'action_url' => "/profile/{$this->followerId}",
        ];
    }
}
