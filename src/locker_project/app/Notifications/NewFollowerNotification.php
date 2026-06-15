<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Notification;

class NewFollowerNotification extends Notification implements ShouldBroadcastNow
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
        return ['database', 'broadcast'];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New Follower!',
            'message' => "{$this->followerName} started following your company.",
            'action_url' => "/profile/{$this->followerId}",
        ];
    }
}
