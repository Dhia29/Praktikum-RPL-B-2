<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Notification;

class TicketRepliedNotification extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    protected $ticket;
    protected $adminName;

    /**
     * Create a new notification instance.
     */
    public function __construct($ticket, $adminName = 'Admin')
    {
        $this->ticket = $ticket;
        $this->adminName = $adminName;
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
            'type' => 'ticket_reply',
            'title' => 'Support Ticket Reply',
            'ticket_id' => $this->ticket->id,
            'message' => "{$this->adminName} replied to your report: {$this->ticket->subject}",
            'action_url' => "/support/tickets/{$this->ticket->id}"
        ];
    }
}
