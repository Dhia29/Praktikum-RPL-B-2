<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Notification;

class NewReportNotification extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    protected $post;
    protected $reporter;

    /**
     * Create a new notification instance.
     */
    public function __construct($post, $reporter)
    {
        $this->post = $post;
        $this->reporter = $reporter;
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
            'type' => 'new_report',
            'title' => 'Laporan Komunitas Baru',
            'message' => $this->reporter->name . ' telah melaporkan sebuah postingan.',
            'post_id' => $this->post->id,
            'reporter_id' => $this->reporter->id
        ];
    }
}
