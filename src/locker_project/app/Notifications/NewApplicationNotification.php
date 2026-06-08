<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewApplicationNotification extends Notification
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
            'title' => 'Lamaran Baru Masuk',
            'message' => "{$this->jobseekerName} telah melamar untuk posisi {$this->jobTitle}.",
            'action_url' => "/lamaran",
        ];
    }
}
