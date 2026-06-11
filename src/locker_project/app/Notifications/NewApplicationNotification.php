<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Notification;

class NewApplicationNotification extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    protected $jobseekerName;
    protected $jobTitle;

    /**
     * Create a new notification instance.
     */
    public function __construct($jobseekerName, $jobTitle)
    {
        $this->jobseekerName = $jobseekerName;
        $this->jobTitle = $jobTitle;
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
            'title' => 'New Application Received',
            'message' => "{$this->jobseekerName} has applied for the {$this->jobTitle} position.",
            'action_url' => "/lamaran",
        ];
    }
}
