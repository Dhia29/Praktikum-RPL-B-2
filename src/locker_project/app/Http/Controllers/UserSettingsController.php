<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserSettingsController extends Controller
{
    /**
     * GET /api/user/settings
     */
    public function index()
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user = Auth::user();
        $settings = DB::table('user_settings')->where('user_id', $user->id)->first();

        $defaults = [
            'notify_application_status' => true,
            'notify_messages' => true,
            'notify_community' => true,
            'notify_connections' => true,
            'visibility_email' => 'none',
            'visibility_phone' => 'none',
            'visibility_location' => 'public',
            'visibility_education' => 'public',
            'visibility_experience' => 'public',
            'visibility_social_links' => 'connections',
            'theme' => 'light',
        ];

        if ($settings) {
            $defaults = [
                'notify_application_status' => (bool) $settings->notify_application_status,
                'notify_messages' => (bool) $settings->notify_messages,
                'notify_community' => (bool) $settings->notify_community,
                'notify_connections' => (bool) $settings->notify_connections,
                'visibility_email' => $settings->visibility_email ?? 'none',
                'visibility_phone' => $settings->visibility_phone ?? 'none',
                'visibility_location' => $settings->visibility_location ?? 'public',
                'visibility_education' => $settings->visibility_education ?? 'public',
                'visibility_experience' => $settings->visibility_experience ?? 'public',
                'visibility_social_links' => $settings->visibility_social_links ?? 'connections',
                'theme' => $settings->theme ?? 'light',
                'language' => $settings->language ?? 'id',
            ];
        }

        return response()->json($defaults);
    }

    /**
     * POST /api/user/settings
     */
    public function update(Request $request)
    {
        \Log::info('UserSettingsController@update accessed', $request->all());

        if (!Auth::check()) {
            \Log::warning('UserSettingsController@update Unauthorized');
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user = Auth::user();
        $visibilityRule = 'sometimes|in:public,connections,none';

        try {
            $validated = $request->validate([
                'notify_application_status' => 'sometimes|boolean',
                'notify_messages' => 'sometimes|boolean',
                'notify_community' => 'sometimes|boolean',
                'notify_connections' => 'sometimes|boolean',
                'visibility_email' => $visibilityRule,
                'visibility_phone' => $visibilityRule,
                'visibility_location' => $visibilityRule,
                'visibility_education' => $visibilityRule,
                'visibility_experience' => $visibilityRule,
                'visibility_social_links' => $visibilityRule,
                'theme' => 'sometimes|in:light,dark',
                'language' => 'sometimes|string|in:id,en',
            ]);
            \Log::info('UserSettingsController@update validation passed', $validated);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed: ', $e->errors());
            throw $e;
        }

        try {
            DB::table('user_settings')->updateOrInsert(
                ['user_id' => $user->id],
                array_merge($validated, ['updated_at' => now()])
            );
            \Log::info('UserSettingsController@update DB insert passed');
        } catch (\Exception $e) {
            \Log::error('DB insert failed: ' . $e->getMessage());
            return response()->json(['message' => 'DB Error: ' . $e->getMessage()], 500);
        }

        return response()->json(['message' => 'Settings saved successfully.']);
    }

    /**
     * POST /api/account/change-password
     */
    public function changePassword(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password_hash)) {
            return response()->json(['message' => 'Current password is incorrect.'], 403);
        }

        DB::table('users')->where('id', $user->id)->update([
            'password_hash' => Hash::make($request->new_password),
        ]);

        return response()->json(['message' => 'Password changed successfully.']);
    }

    /**
     * POST /api/account/change-email
     */
    public function changeEmail(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'password' => 'required|string',
            'new_email' => 'required|email|unique:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();

        if (!Hash::check($request->password, $user->password_hash)) {
            return response()->json(['message' => 'Password is incorrect.'], 403);
        }

        DB::table('users')->where('id', $user->id)->update([
            'email' => $request->new_email,
        ]);

        return response()->json(['message' => 'Email changed successfully.']);
    }

    /**
     * DELETE /api/account
     */
    public function deleteAccount(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate(['password' => 'required|string']);
        $user = Auth::user();

        if (!Hash::check($request->password, $user->password_hash)) {
            return response()->json(['message' => 'Password is incorrect.'], 403);
        }

        DB::beginTransaction();
        try {
            if ($user->role === 'seeker') {
                DB::table('job_seeker_profiles')->where('user_id', $user->id)->delete();
            } else {
                DB::table('company_profiles')->where('user_id', $user->id)->delete();
            }
            DB::table('user_settings')->where('user_id', $user->id)->delete();
            DB::table('users')->where('id', $user->id)->delete();
            DB::commit();

            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json(['message' => 'Account deleted successfully.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to delete account.'], 500);
        }
    }

    /**
     * GET /api/account/blocked-users
     */
    public function blockedUsers()
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        // Placeholder — returns empty list for now
        return response()->json([]);
    }

    /**
     * POST /api/logout
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully.']);
    }
}
