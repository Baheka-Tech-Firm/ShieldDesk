<?php

namespace App\Http\Controllers;

use App\Models\PopiaItem;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ComplianceController extends Controller
{
    public function index(Request $request)
    {
        $companyId = 1; // Mock company ID for development
        
        $popiaItems = PopiaItem::where('company_id', $companyId)
            ->with('completedBy')
            ->orderBy('id')
            ->get();

        return response()->json($popiaItems);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'completed' => 'required|boolean',
        ]);

        $popiaItem = PopiaItem::findOrFail($id);
        $userId = 1; // Mock user ID for development
        
        $popiaItem->update([
            'completed' => $request->completed,
            'completed_by' => $request->completed ? $userId : null,
            'completed_at' => $request->completed ? now() : null,
        ]);

        // Log the activity
        ActivityLog::create([
            'company_id' => $popiaItem->company_id,
            'user_id' => $userId,
            'action' => $request->completed ? 'completed' : 'uncompleted',
            'resource' => 'POPIA Item: ' . $popiaItem->title,
            'details' => [
                'item_id' => $popiaItem->id,
                'status' => $request->completed ? 'completed' : 'pending'
            ]
        ]);

        return response()->json($popiaItem->load('completedBy'));
    }
}