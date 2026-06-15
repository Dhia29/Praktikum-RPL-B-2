<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Notification;

class PostLikedNotification extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    protected $post;
    protected $likerName;

    /**
     * Create a new notification instance.
     */
    public function __construct($post, $likerName)
    {
        $this->post = $post;
        $this->likerName = $likerName;
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
            'type' => 'post_like',
            'title' => 'Post Liked',
            'post_id' => $this->post->id,
            'message' => "{$this->likerName} liked your post.",
            'action_url' => "/community/post/{$this->post->id}"
        ];
    }
}
