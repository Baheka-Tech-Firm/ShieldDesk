<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $companyId = 1; // Mock company ID for development
        
        $users = User::where('company_id', $companyId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    public function invite(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'name' => 'required|string|max:255',
            'role' => 'required|string|in:admin,compliance,it,hr,employee',
        ]);

        $companyId = 1; // Mock company ID for development
        
        // Create pending user invitation
        $user = User::create([
            'firebase_uid' => 'pending_' . uniqid(),
            'email' => $request->email,
            'name' => $request->name,
            'role' => $request->role,
            'company_id' => $companyId,
        ]);

        // Send invitation email (implement email service)
        // Mail::to($request->email)->send(new UserInvitation($user));

        return response()->json([
            'message' => 'Invitation sent successfully',
            'user' => $user
        ], 201);
    }

    public function notifications(Request $request)
    {
        $userId = 1; // Mock user ID for development
        
        $notifications = Notification::where('user_id', $userId)
            ->where('read', false)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return response()->json($notifications);
    }

    public function markNotificationRead(Request $request, $id)
    {
        $notification = Notification::findOrFail($id);
        
        $notification->update(['read' => true]);

        return response()->json(['message' => 'Notification marked as read']);
    }
}