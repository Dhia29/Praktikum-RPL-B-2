<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CsTicket;
use App\Models\CsTicketMessage;
use App\Models\User;
use App\Models\AdminLog;
use Illuminate\Support\Facades\Auth;

class AdminCsTicketController extends Controller
{
    public function index(Request $request)
    {
        $query = CsTicket::with('user', 'assignedAdmin');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $tickets = $query->orderBy('created_at', 'desc')->get();

        return response()->json(compact('tickets'));
    }

    public function show($id)
    {
        $ticket = CsTicket::with(['user', 'assignedAdmin', 'messages.sender'])->findOrFail($id);
        $admins = User::where('role', 'ADMIN')->get();

        return response()->json(compact('ticket', 'admins'));
    }

    public function reply(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string',
            'is_internal_note' => 'nullable'
        ]);

        $ticket = CsTicket::findOrFail($id);

        CsTicketMessage::create([
            'ticket_id' => $ticket->id,
            'sender_id' => Auth::id(),
            'message' => $request->message,
            'is_internal_note' => $request->has('is_internal_note') ? true : false
        ]);

        if (!$request->has('is_internal_note')) {
            $ticket->update(['status' => 'waiting_for_user']);
        }

        AdminLog::create([
            'admin_id' => Auth::id(),
            'action' => 'Reply to CS Ticket',
            'target_entity' => 'cs_tickets',
            'target_id' => $ticket->id
        ]);

        return response()->json(['message' => 'Message sent successfully.']);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:open,pending_response,in_progress,waiting_for_user,resolved,closed',
            'priority' => 'nullable|in:low,medium,high,critical'
        ]);

        $ticket = CsTicket::findOrFail($id);
        $ticket->status = $request->status;
        if ($request->has('priority')) {
            $ticket->priority = $request->priority;
        }
        $ticket->save();

        AdminLog::create([
            'admin_id' => Auth::id(),
            'action' => 'Update CS Ticket Status',
            'target_entity' => 'cs_tickets',
            'target_id' => $ticket->id
        ]);

        return response()->json(['message' => 'Ticket updated successfully.']);
    }

    public function assign(Request $request, $id)
    {
        $request->validate([
            'assigned_admin_id' => 'required|exists:users,id'
        ]);

        $ticket = CsTicket::findOrFail($id);
        $ticket->update([
            'assigned_admin_id' => $request->assigned_admin_id
        ]);

        AdminLog::create([
            'admin_id' => Auth::id(),
            'action' => 'Assign CS Ticket',
            'target_entity' => 'cs_tickets',
            'target_id' => $ticket->id
        ]);

        return response()->json(['message' => 'Ticket assigned successfully.']);
    }
}
