<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PostLikedNotification extends Notification
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
        return ['database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->line('The introduction to the notification.')
            ->action('Notification Action', url('/'))
            ->line('Thank you for using our application!');
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
            'post_id' => $this->post->id,
            'message' => "{$this->likerName} menyukai postingan Anda.",
            'action_url' => "/community/post/{$this->post->id}"
        ];
    }
}
