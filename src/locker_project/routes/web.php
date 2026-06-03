<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JobController;
use App\Http\Controllers\ProfileController;

use App\Http\Controllers\ConnectionController;

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

// Connection Routes
Route::get('/api/connections', [ConnectionController::class, 'getConnections']);
Route::get('/api/connections/suggestions', [ConnectionController::class, 'getSuggestions']);
Route::post('/api/connections/request', [ConnectionController::class, 'sendRequest']);
Route::post('/api/connections/respond', [ConnectionController::class, 'respondRequest']);

// Catch-all route for React Router
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');