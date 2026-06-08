<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Models\User;
use App\Models\AdminLog;
use Illuminate\Support\Facades\Auth;

class AdminCsTicketController extends Controller
{
    public function index(Request $request)
    {
        $query = SupportTicket::with('user', 'admin');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $tickets = $query->orderBy('created_at', 'desc')->get();

        return response()->json(compact('tickets'));
    }

    public function show($id)
    {
        $ticket = SupportTicket::with(['user', 'admin', 'messages'])->findOrFail($id);
        $admins = User::where('role', 'ADMIN')->get();

        return response()->json(compact('ticket', 'admins'));
    }

    public function reply(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string'
        ]);

        $ticket = SupportTicket::findOrFail($id);

        SupportTicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'sender' => 'admin',
            'message' => $request->message
        ]);

        $ticket->update([
            'status' => 'in_progress',
            'handled_by' => 'admin'
        ]);

        AdminLog::create([
            'admin_id' => Auth::id(),
            'action' => 'Reply to Support Ticket',
            'target_entity' => 'support_tickets',
            'target_id' => $ticket->id
        ]);

        $ticketUser = User::find($ticket->user_id);
        if ($ticketUser) {
            $ticketUser->notify(new \App\Notifications\TicketRepliedNotification($ticket, Auth::user()->email ?? 'Admin'));
        }

        return response()->json(['message' => 'Message sent successfully.']);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:open,in_progress,resolved,closed'
        ]);

        $ticket = SupportTicket::findOrFail($id);
        $ticket->status = $request->status;
        $ticket->save();

        AdminLog::create([
            'admin_id' => Auth::id(),
            'action' => 'Update Support Ticket Status',
            'target_entity' => 'support_tickets',
            'target_id' => $ticket->id
        ]);

        return response()->json(['message' => 'Ticket updated successfully.']);
    }

    public function assign(Request $request, $id)
    {
        $request->validate([
            'assigned_admin_id' => 'required|exists:users,id'
        ]);

        $ticket = SupportTicket::findOrFail($id);
        $ticket->update([
            'replied_by' => $request->assigned_admin_id
        ]);

        AdminLog::create([
            'admin_id' => Auth::id(),
            'action' => 'Assign Support Ticket',
            'target_entity' => 'support_tickets',
            'target_id' => $ticket->id
        ]);

        return response()->json(['message' => 'Ticket assigned successfully.']);
    }
}
