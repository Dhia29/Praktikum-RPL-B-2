<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class SupportController extends Controller
{
    /**
     * Mengambil daftar tiket milik user yang login
     */
    public function getUserTickets()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $tickets = SupportTicket::where('user_id', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->get();

        return response()->json(['data' => $tickets], 200);
    }

    /**
     * Membuat tiket baru oleh user
     */
    public function createTicket(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'subject' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'message' => 'required|string'
        ]);

        $ticket = SupportTicket::create([
            'user_id' => $user->id,
            'subject' => $request->subject,
            'category' => $request->category,
            'message' => $request->message,
            'status' => 'open',
            'handled_by' => 'ai'
        ]);

        // Insert first user message
        SupportTicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'sender' => 'user',
            'message' => $request->message
        ]);

        // Trigger AI reply asynchronously or synchronously
        $this->callGeminiAI($ticket, "Kamu adalah asisten customer service bernama LockER Support. Kategorinya: {$ticket->category}. Judul masalah: {$ticket->subject}. Pengguna berkata: {$ticket->message}");

        return response()->json([
            'message' => 'Tiket berhasil dibuat',
            'data' => $ticket
        ], 201);
    }

    private function callGeminiAI(SupportTicket $ticket, $prompt)
    {
        $apiKey = config('services.gemini.key');
        if (!$apiKey) {
            SupportTicketMessage::create([
                'support_ticket_id' => $ticket->id,
                'sender' => 'ai',
                'message' => 'Mohon maaf, sistem AI kami sedang tidak aktif (API Key tidak ditemukan). Anda bisa meminta bantuan admin secara langsung.'
            ]);
            return;
        }

        try {
            $response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    ['parts' => [['text' => $prompt]]]
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'Maaf, saya tidak dapat merespons saat ini.';
                
                SupportTicketMessage::create([
                    'support_ticket_id' => $ticket->id,
                    'sender' => 'ai',
                    'message' => $reply
                ]);
            }
        } catch (\Exception $e) {
            SupportTicketMessage::create([
                'support_ticket_id' => $ticket->id,
                'sender' => 'ai',
                'message' => 'Terjadi kesalahan sistem saat menghubungi AI.'
            ]);
        }
    }

    public function getTicketMessages($id)
    {
        $user = Auth::user();
        $ticket = SupportTicket::where('id', $id)->where('user_id', $user->id)->first();
        if (!$ticket) {
            return response()->json(['message' => 'Tiket tidak ditemukan'], 404);
        }

        $messages = SupportTicketMessage::where('support_ticket_id', $id)
                        ->orderBy('created_at', 'asc')
                        ->get();

        return response()->json(['data' => $messages, 'ticket' => $ticket], 200);
    }

    public function sendTicketMessage(Request $request, $id)
    {
        $user = Auth::user();
        $ticket = SupportTicket::where('id', $id)->where('user_id', $user->id)->first();
        if (!$ticket) {
            return response()->json(['message' => 'Tiket tidak ditemukan'], 404);
        }

        $request->validate(['message' => 'required|string']);

        SupportTicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'sender' => 'user',
            'message' => $request->message
        ]);

        if ($ticket->handled_by === 'ai' && $ticket->status === 'open') {
            // Build conversation history for context
            $messages = SupportTicketMessage::where('support_ticket_id', $id)->orderBy('created_at', 'asc')->get();
            $historyPrompt = "Kamu adalah asisten customer service bernama LockER Support. Masalah pengguna berkaitan dengan: {$ticket->category}. Ini riwayat obrolan:\n";
            foreach ($messages as $msg) {
                $senderName = $msg->sender === 'user' ? 'Pengguna' : 'LockER Support';
                $historyPrompt .= "{$senderName}: {$msg->message}\n";
            }
            $historyPrompt .= "Berikan respon terbaik yang informatif dan ramah.";

            $this->callGeminiAI($ticket, $historyPrompt);
        }

        return response()->json(['message' => 'Pesan terkirim'], 201);
    }

    public function handoverTicket($id)
    {
        $user = Auth::user();
        $ticket = SupportTicket::where('id', $id)->where('user_id', $user->id)->first();
        if (!$ticket) {
            return response()->json(['message' => 'Tiket tidak ditemukan'], 404);
        }

        if ($ticket->status === 'closed') {
            return response()->json(['message' => 'Tiket sudah ditutup'], 400);
        }

        $ticket->handled_by = 'admin';
        $ticket->save();

        SupportTicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'sender' => 'admin',
            'message' => 'Laporan Anda telah diteruskan ke tim Admin. Admin akan segera membalas pesan Anda di sini.'
        ]);

        return response()->json(['message' => 'Tiket diteruskan ke Admin', 'ticket' => $ticket], 200);
    }

    public function closeTicket($id)
    {
        $user = Auth::user();
        $ticket = SupportTicket::where('id', $id)->where('user_id', $user->id)->first();
        if (!$ticket) {
            return response()->json(['message' => 'Tiket tidak ditemukan'], 404);
        }

        $ticket->status = 'closed';
        $ticket->save();

        return response()->json(['message' => 'Tiket berhasil ditutup', 'ticket' => $ticket], 200);
    }

    public function deleteTicket($id)
    {
        $user = Auth::user();
        $ticket = SupportTicket::where('id', $id)->where('user_id', $user->id)->first();
        if (!$ticket) {
            return response()->json(['message' => 'Tiket tidak ditemukan'], 404);
        }

        $ticket->delete();

        return response()->json(['message' => 'Tiket berhasil dihapus'], 200);
    }

    /**
     * Mengambil semua tiket (Hanya Admin)
     */
    public function getAllTickets()
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden - Khusus Admin'], 403);
        }

        $tickets = SupportTicket::with('user:id,name,email')
                    ->orderBy('created_at', 'desc')
                    ->get();

        return response()->json(['data' => $tickets], 200);
    }

    /**
     * Membalas tiket (Hanya Admin)
     */
    public function replyTicket(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden - Khusus Admin'], 403);
        }

        $request->validate([
            'admin_reply' => 'required|string'
        ]);

        $ticket = SupportTicket::find($id);
        if (!$ticket) {
            return response()->json(['message' => 'Tiket tidak ditemukan'], 404);
        }

        $ticket->admin_reply = $request->admin_reply;
        $ticket->status = 'resolved';
        $ticket->save();

        if ($ticket->user) {
            $ticket->user->notify(new \App\Notifications\TicketRepliedNotification($ticket, $user->name));
        }

        return response()->json([
            'message' => 'Tiket berhasil dibalas',
            'data' => $ticket
        ], 200);
    }
}
