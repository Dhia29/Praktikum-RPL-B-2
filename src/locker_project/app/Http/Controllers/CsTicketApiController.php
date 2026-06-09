<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CsTicket;
use App\Models\CsTicketMessage;
use Illuminate\Support\Facades\Auth;

class CsTicketApiController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id() ?? $request->user()->id;
        $tickets = CsTicket::where('user_id', $userId)->orderBy('created_at', 'desc')->get();
        return response()->json($tickets);
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'priority' => 'required|in:low,medium,high,critical',
            'message' => 'required|string'
        ]);

        $userId = Auth::id() ?? $request->user()->id;

        $ticket = CsTicket::create([
            'user_id' => $userId,
            'subject' => $request->subject,
            'category' => $request->category,
            'priority' => $request->priority,
            'status' => 'open'
        ]);

        CsTicketMessage::create([
            'ticket_id' => $ticket->id,
            'sender_id' => $userId,
            'message' => $request->message,
            'is_internal_note' => false
        ]);

        return response()->json([
            'message' => 'Ticket created successfully',
            'ticket' => $ticket
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $userId = Auth::id() ?? $request->user()->id;
        $ticket = CsTicket::with(['messages' => function($query) {
            $query->where('is_internal_note', false)->orderBy('created_at', 'asc');
        }, 'messages.sender'])->where('id', $id)->where('user_id', $userId)->firstOrFail();

        return response()->json($ticket);
    }

    public function reply(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string'
        ]);

        $userId = Auth::id() ?? $request->user()->id;
        $ticket = CsTicket::where('id', $id)->where('user_id', $userId)->firstOrFail();

        $message = CsTicketMessage::create([
            'ticket_id' => $ticket->id,
            'sender_id' => $userId,
            'message' => $request->message,
            'is_internal_note' => false
        ]);

        // Automatically update ticket status
        $ticket->update(['status' => 'pending_response']);

        return response()->json([
            'message' => 'Reply sent successfully',
            'data' => $message
        ], 201);
    }
}
