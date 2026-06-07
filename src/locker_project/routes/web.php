<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JobController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ConnectionController;
use App\Http\Controllers\CommunityReportApiController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\CsTicketApiController;


Route::get('/', function () {
    return view('welcome');
});
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);
Route::get('/me', [AuthController::class, 'me']);
Route::get('/api/jobs', [JobController::class, 'index']);
Route::get('/api/profile/{id}', [ProfileController::class, 'getPublicProfile']);
Route::post('/api/profile/intro', [ProfileController::class, 'updateIntro']);
Route::post('/api/profile/upload-image', [ProfileController::class, 'uploadImage']);
Route::post('/api/profile/contact', [ProfileController::class, 'updateContact']);
Route::put('/api/profile/experiences', [ProfileController::class, 'updateExperiences']);
Route::put('/api/profile/educations', [ProfileController::class, 'updateEducations']);
Route::put('/api/profile/certifications', [ProfileController::class, 'updateCertifications']);
Route::post('/api/profile/certifications/upload', [ProfileController::class, 'uploadCertificationFile']);
Route::post('/api/profile/cv', [ProfileController::class, 'uploadCV']);
Route::delete('/api/profile/cv', [ProfileController::class, 'deleteCV']);
Route::get('/api/applications/me', [ApplicationController::class, 'myApplications']);
Route::get('/api/connections', [ConnectionController::class, 'getConnections']);
Route::get('/api/connections/suggestions', [ConnectionController::class, 'getSuggestions']);
Route::post('/api/connections/request', [ConnectionController::class, 'sendRequest']);
Route::post('/api/connections/respond', [ConnectionController::class, 'respondRequest']);
// Community Routes
Route::post('/api/community/reports', [CommunityReportApiController::class, 'store']);



// CS Tickets Routes
Route::middleware('web')->group(function() { // Requires auth for user
    Route::get('/api/cs-tickets', [CsTicketApiController::class, 'index']);
    Route::post('/api/cs-tickets', [CsTicketApiController::class, 'store']);
    Route::get('/api/cs-tickets/{id}', [CsTicketApiController::class, 'show']);
    Route::post('/api/cs-tickets/{id}/messages', [CsTicketApiController::class, 'reply']);
});



// Admin API Auth Routes (No 'admin' middleware required for login)
Route::prefix('api/admin')->middleware(['web'])->group(function () {
    Route::post('/login', [AdminController::class, 'login']);
});

Route::prefix('api/admin')->middleware(['web', 'admin'])->group(function () {
    Route::post('/logout', [AdminController::class, 'logout'])->name('api.admin.logout');
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('api.admin.dashboard');
    Route::get('/users', [AdminController::class, 'users'])->name('api.admin.users');
    Route::post('/users/{id}/verify-company', [AdminController::class, 'verifyCompany'])->name('api.admin.users.verify_company');
    Route::post('/users/{id}/toggle-status', [AdminController::class, 'toggleUserStatus'])->name('api.admin.users.toggle_status');
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser'])->name('api.admin.users.delete');
    
    Route::get('/jobs', [AdminController::class, 'jobs'])->name('api.admin.jobs');
    Route::get('/analytics', [AdminController::class, 'analytics'])->name('api.admin.analytics');
    Route::get('/settings', [AdminController::class, 'settings'])->name('api.admin.settings');
    Route::post('/settings', [AdminController::class, 'updateSettings'])->name('api.admin.settings.update');
    Route::post('/jobs/{id}/verify', [AdminController::class, 'verifyJob'])->name('api.admin.jobs.verify');
    Route::delete('/jobs/{id}', [AdminController::class, 'deleteJob'])->name('api.admin.jobs.delete');

    Route::get('/tickets', [AdminCsTicketController::class, 'index'])->name('api.admin.tickets');
    Route::get('/tickets/{id}', [AdminCsTicketController::class, 'show'])->name('api.admin.tickets.show');
    Route::post('/tickets/{id}/reply', [AdminCsTicketController::class, 'reply'])->name('api.admin.tickets.reply');
    Route::post('/tickets/{id}/status', [AdminCsTicketController::class, 'updateStatus'])->name('api.admin.tickets.status');
    Route::post('/tickets/{id}/assign', [AdminCsTicketController::class, 'assign'])->name('api.admin.tickets.assign');
    
    // Community Reports
    Route::get('/community/reports', [AdminCommunityReportController::class, 'index'])->name('api.admin.community.reports');
    Route::get('/community/reports/{id}', [AdminCommunityReportController::class, 'show'])->name('api.admin.community.reports.show');
    Route::post('/community/reports/{id}/status', [AdminCommunityReportController::class, 'updateStatus'])->name('api.admin.community.reports.update_status');
    Route::delete('/community/reports/{id}/post', [AdminCommunityReportController::class, 'deletePost'])->name('api.admin.community.reports.delete_post');
});

// Admin SPA Route
Route::get('/admin/{any?}', function () {
    return view('admin-app');
})->where('any', '.*');


// User API Routes
Route::get('/api/messages/rooms', [MessageController::class, 'getChatRooms']);
Route::get('/api/messages/history/{receiverId}', [MessageController::class, 'getMessages']);
Route::post('/api/messages/send', [MessageController::class, 'sendMessage']);
Route::post('/api/messages/{id}/respond-appointment', [MessageController::class, 'respondAppointment']);
Route::get('/api/messages/search-users', [MessageController::class, 'searchUsers']);
Route::post('/api/messages/settings/{contactId}', [MessageController::class, 'updateChatSettings']);
Route::delete('/api/messages/{id}', [MessageController::class, 'deleteMessage']);
Route::get('/api/community/posts', [CommunityController::class, 'getPosts']);
Route::get('/api/community/posts/{id}/replies', [CommunityController::class, 'getPostReplies']);
Route::post('/api/community/posts/create', [CommunityController::class, 'createPost']);
Route::post('/api/community/posts/{id}/like', [CommunityController::class, 'toggleLike']);
Route::post('/api/community/posts/{id}/save', [CommunityController::class, 'toggleSave']);
Route::post('/api/community/posts/{id}/report', [CommunityController::class, 'reportPost']);
Route::delete('/api/community/posts/{id}', [CommunityController::class, 'deletePost']);
Route::get('/api/community/list', [CommunityController::class, 'getCommunities']);
Route::post('/api/community/create', [CommunityController::class, 'createCommunity']);
Route::post('/api/community/join', [CommunityController::class, 'joinCommunity']);
Route::delete('/api/community/leave', [CommunityController::class, 'leaveCommunity']);
Route::get('/api/support/my-tickets', [SupportController::class, 'getUserTickets']);
Route::post('/api/support/tickets', [SupportController::class, 'createTicket']);
Route::get('/api/support/tickets/{id}/messages', [SupportController::class, 'getTicketMessages']);
Route::post('/api/support/tickets/{id}/messages', [SupportController::class, 'sendTicketMessage']);
Route::post('/api/support/tickets/{id}/handover', [SupportController::class, 'handoverTicket']);
Route::post('/api/support/tickets/{id}/close', [SupportController::class, 'closeTicket']);
Route::delete('/api/support/tickets/{id}', [SupportController::class, 'deleteTicket']);
Route::get('/api/support/admin/tickets', [SupportController::class, 'getAllTickets']);
Route::post('/api/support/admin/tickets/{id}/reply', [SupportController::class, 'replyTicket']);

// Notifications
Route::get('/api/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
Route::post('/api/notifications/mark-as-read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);

// Catch-all route for React Router (User)
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');