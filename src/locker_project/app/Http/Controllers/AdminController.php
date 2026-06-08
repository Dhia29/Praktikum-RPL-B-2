<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\AdminLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Mail\CompanyApprovedNotification;
use App\Models\SupportTicket;
use App\Models\PlatformSetting;

class AdminController extends Controller
{

    /**
     * Handle Admin Login
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (\Illuminate\Support\Facades\Auth::attempt($credentials)) {
            $request->session()->regenerate();
            if (\Illuminate\Support\Facades\Auth::user()->role === 'ADMIN') {
                return response()->json(['message' => 'Login successful.']);
            } else {
                \Illuminate\Support\Facades\Auth::logout();
                return response()->json(['message' => 'You are not an administrator.'], 403);
            }
        }

        return response()->json(['message' => 'Invalid credentials.'], 401);
    }

    /**
     * Handle Admin Logout
     */
    public function logout(Request $request)
    {
        \Illuminate\Support\Facades\Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * Show Admin Dashboard
     */
    public function dashboard()
    {
        $totalUsers = DB::table('users')->where('role', '!=', 'ADMIN')->count();
        $pendingCompanies = DB::table('company_profiles')->where('verifikasi_status', 'Menunggu')->count();
        $pendingJobs = DB::table('job_postings')->where('status', 'Menunggu Persetujuan')->count();

        return response()->json(compact('totalUsers', 'pendingCompanies', 'pendingJobs'));
    }

    /**
     * Users Management - Index
     */
    public function users()
    {
        $users = DB::table('users')
            ->leftJoin('job_seeker_profiles', 'users.id', '=', 'job_seeker_profiles.user_id')
            ->select(
                'users.*', 
                'job_seeker_profiles.nama_lengkap as seeker_name'
            )
            ->where('users.role', 'seeker')
            ->orderBy('users.created_at', 'desc')
            ->get();

        return response()->json(compact('users'));
    }

    /**
     * Companies Management - Index
     */
    public function companies()
    {
        $companies = DB::table('users')
            ->join('company_profiles', 'users.id', '=', 'company_profiles.user_id')
            ->select(
                'users.*', 
                'company_profiles.nama_perusahaan as company_name',
                'company_profiles.verifikasi_status as company_status',
                'company_profiles.npwp',
                'company_profiles.bidang_industri'
            )
            ->where('users.role', 'company')
            ->orderBy('users.created_at', 'desc')
            ->get();

        // Let's structure the companies similarly to how React expects it
        $structuredCompanies = $companies->map(function ($company) {
            return [
                'id' => $company->id,
                'name' => $company->company_name,
                'email' => $company->email,
                'status' => $company->status,
                'created_at' => $company->created_at,
                'profile' => [
                    'industry' => $company->bidang_industri ?? '-',
                    'npwp' => $company->npwp ?? '-',
                ]
            ];
        });

        return response()->json(['companies' => $structuredCompanies]);
    }

    /**
     * Jobs Moderation - Index
     */
    public function jobs()
    {
        $jobs = DB::table('job_postings')
            ->join('company_profiles', 'job_postings.company_id', '=', 'company_profiles.id')
            ->select(
                'job_postings.id',
                'job_postings.judul as role',
                'job_postings.kategori as type',
                'job_postings.lokasi as location',
                'job_postings.deskripsi as description',
                'job_postings.created_at',
                'job_postings.status',
                'company_profiles.nama_perusahaan as company_name'
            )
            ->orderBy('job_postings.created_at', 'desc')
            ->get();

        return response()->json(compact('jobs'));
    }

    /**
     * Moderation Actions for Users
     */
    public function verifyCompany(Request $request, $userId)
    {
        DB::table('users')->where('id', $userId)->update(['status' => 'Aktif']);
        DB::table('company_profiles')->where('user_id', $userId)->update(['alasan_penolakan' => null]);
        
        AdminLog::create([
            'admin_id' => Auth::id(),
            'action' => 'Verify Company',
            'target_entity' => 'users',
            'target_id' => $userId
        ]);
        
        // Send Email Notification (optional)
        $user = DB::table('users')->where('id', $userId)->first();
        $company = DB::table('company_profiles')->where('user_id', $userId)->first();
        if ($user && $company) {
            try {
                Mail::to($user->email)->send(new CompanyApprovedNotification($company->nama_perusahaan));
            } catch (\Exception $e) {
                // Ignore email failure for now
            }
        }
        
        return response()->json(['message' => 'Company successfully verified.']);
    }

    public function rejectCompany(Request $request, $userId)
    {
        $request->validate([
            'alasan_penolakan' => 'required|string|max:1000'
        ]);

        DB::table('users')->where('id', $userId)->update(['status' => 'Ditolak']);
        DB::table('company_profiles')->where('user_id', $userId)->update([
            'alasan_penolakan' => $request->alasan_penolakan
        ]);
        
        AdminLog::create([
            'admin_id' => Auth::id(),
            'action' => 'Reject Company',
            'target_entity' => 'users',
            'target_id' => $userId
        ]);
        
        return response()->json(['message' => 'Company has been rejected.']);
    }

    public function toggleUserStatus(Request $request, $userId)
    {
        $user = DB::table('users')->where('id', $userId)->first();
        if ($user) {
            $newStatus = $user->status === 'active' ? 'inactive' : 'active';
            DB::table('users')->where('id', $userId)->update(['status' => $newStatus]);
            
            AdminLog::create([
                'admin_id' => Auth::id(),
                'action' => $newStatus === 'active' ? 'Activate User' : 'Deactivate User',
                'target_entity' => 'users',
                'target_id' => $userId
            ]);
            
            return response()->json(['message' => "User status updated to {$newStatus}."]);
        }
        return response()->json(['message' => 'User not found.'], 404);
    }

    public function deleteUser(Request $request, $userId)
    {
        // Delete the user from the users table.
        // The foreign key constraints on profile tables should cascade delete,
        // but if not configured properly, this will fail or leave orphans.
        // It's safer to ensure profile deletion if DB doesn't cascade.
        DB::table('job_seeker_profiles')->where('user_id', $userId)->delete();
        $company = DB::table('company_profiles')->where('user_id', $userId)->first();
        if ($company) {
            DB::table('job_postings')->where('company_id', $company->id)->delete();
            DB::table('company_profiles')->where('id', $company->id)->delete();
        }
        DB::table('users')->where('id', $userId)->delete();

        AdminLog::create([
            'admin_id' => Auth::id(),
            'action' => 'Delete User',
            'target_entity' => 'users',
            'target_id' => $userId
        ]);

        return response()->json(['message' => 'User account permanently deleted.']);
    }

    /**
     * Moderation Actions for Jobs
     */
    public function verifyJob(Request $request, $jobId)
    {
        DB::table('job_postings')->where('id', $jobId)->update(['status' => 'Aktif']);
        
        AdminLog::create([
            'admin_id' => Auth::id(),
            'action' => 'Verify Job',
            'target_entity' => 'job_postings',
            'target_id' => $jobId
        ]);
        
        return response()->json(['message' => 'Job posting successfully published.']);
    }

    public function deleteJob(Request $request, $jobId)
    {
        DB::table('job_postings')->where('id', $jobId)->delete();
        
        AdminLog::create([
            'admin_id' => Auth::id(),
            'action' => 'Delete Job',
            'target_entity' => 'job_postings',
            'target_id' => $jobId
        ]);
        
        return response()->json(['message' => 'Job posting successfully deleted.']);
    }

    /**
     * Customer Service (Tickets)
     */
    public function tickets()
    {
        $tickets = DB::table('support_tickets')
            ->join('users', 'support_tickets.user_id', '=', 'users.id')
            ->select('support_tickets.*', 'users.email', 'users.role')
            ->orderBy('support_tickets.created_at', 'desc')
            ->get();
            
        return view('admin.tickets.index', compact('tickets'));
    }

    public function showTicket($id)
    {
        $ticket = DB::table('support_tickets')
            ->join('users', 'support_tickets.user_id', '=', 'users.id')
            ->select('support_tickets.*', 'users.email', 'users.role')
            ->where('support_tickets.id', $id)
            ->first();
            
        if (!$ticket) return redirect()->back()->with('error', 'Ticket not found.');

        return view('admin.tickets.show', compact('ticket'));
    }

    public function replyTicket(Request $request, $id)
    {
        $request->validate([
            'admin_reply' => 'required|string',
            'status' => 'required|in:open,in_progress,resolved,closed'
        ]);

        DB::table('support_tickets')->where('id', $id)->update([
            'admin_reply' => $request->admin_reply,
            'status' => $request->status,
            'replied_by' => Auth::id(),
            'updated_at' => now()
        ]);
        
        AdminLog::create([
            'admin_id' => Auth::id(),
            'action' => 'Reply Ticket',
            'target_entity' => 'support_tickets',
            'target_id' => $id
        ]);

        return redirect()->route('admin.tickets.show', $id)->with('success', 'Ticket successfully updated and replied.');
    }

    /**
     * Analytics Page
     */
    public function analytics()
    {
        $totalUsers = DB::table('users')->where('role', '!=', 'ADMIN')->count();
        $totalCompanies = DB::table('company_profiles')->count();
        $totalJobs = DB::table('job_postings')->count();
        $totalApplications = DB::table('job_applications')->count(); // Added for more stats
        $activeSessions = rand(15, 120); // Simulated real-time metric

        // Distribusi Pengguna
        $jobSeekers = DB::table('users')->where('role', 'user')->count();
        $companies = DB::table('users')->where('role', 'company')->count();
        $total = $jobSeekers + $companies;
        
        $jobSeekersPercentage = $total > 0 ? round(($jobSeekers / $total) * 100) : 0;
        $companiesPercentage = $total > 0 ? round(($companies / $total) * 100) : 0;

        // Pertumbuhan Pengguna (30 Hari Terakhir)
        $startDate = \Carbon\Carbon::now()->subDays(30);
        $dailyRegistrationsRaw = DB::table('users')
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as total'))
            ->where('created_at', '>=', $startDate)
            ->where('role', '!=', 'ADMIN')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $labels = [];
        $data = [];
        for ($i = 0; $i < 30; $i++) {
            $date = \Carbon\Carbon::now()->subDays(29 - $i)->format('Y-m-d');
            $labels[] = \Carbon\Carbon::parse($date)->format('d M');
            $match = $dailyRegistrationsRaw->firstWhere('date', $date);
            $data[] = $match ? $match->total : 0;
        }

        $growthChart = [
            'labels' => $labels,
            'data' => $data
        ];

        return response()->json(compact(
            'totalUsers',
            'totalCompanies',
            'totalJobs',
            'totalApplications',
            'activeSessions',
            'jobSeekersPercentage',
            'companiesPercentage',
            'growthChart'
        ));
    }

    /**
     * Settings Page
     */
    public function settings()
    {
        $settings = [
            'platform_name' => PlatformSetting::get('platform_name', 'LockER'),
            'support_email' => PlatformSetting::get('support_email', 'support@locker.com'),
            'auto_approve_jobs' => PlatformSetting::get('auto_approve_jobs', '0'),
        ];
        return response()->json($settings);
    }

    public function updateSettings(Request $request)
    {
        $request->validate([
            'platform_name' => 'required|string|max:255',
            'support_email' => 'required|email|max:255',
        ]);

        PlatformSetting::set('platform_name', $request->platform_name);
        PlatformSetting::set('support_email', $request->support_email);
        PlatformSetting::set('auto_approve_jobs', $request->has('auto_approve_jobs') ? '1' : '0');

        AdminLog::create([
            'admin_id' => Auth::id(),
            'action' => 'Update Settings',
            'target_entity' => 'platform_settings',
            'target_id' => Auth::id() // Using admin id as target since it's global
        ]);

        return response()->json(['message' => 'Pengaturan berhasil diperbarui.']);
    }
}
