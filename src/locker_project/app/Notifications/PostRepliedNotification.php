<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Notification;

class PostRepliedNotification extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    protected $post;
    protected $replierName;

    /**
     * Create a new notification instance.
     */
    public function __construct($post, $replierName)
    {
        $this->post = $post;
        $this->replierName = $replierName;
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
            'type' => 'post_reply',
            'title' => 'Post Reply',
            'post_id' => $this->post->id,
            'message' => "{$this->replierName} replied to your post.",
            'action_url' => "/community/post/{$this->post->id}"
        ];
    }
}
