<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JobController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\ConnectionController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\SupportController;

Route::get('/', function () {
    return view('welcome');
});
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/api/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('/api/resend-verification', [AuthController::class, 'resendCode']);
Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);
Route::get('/me', [AuthController::class, 'me']);
Route::get('/api/jobs', [JobController::class, 'index']);
Route::get('/api/jobs/me', [JobController::class, 'myJobs']);
Route::post('/api/jobs', [JobController::class, 'store']);
Route::put('/api/jobs/{id}', [JobController::class, 'update']);
Route::delete('/api/jobs/{id}', [JobController::class, 'destroy']);
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

// Catch-all route for React Router
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');