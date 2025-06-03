<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\RiskAssessment;
use App\Models\File;
use App\Models\PopiaItem;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Mock user for development (replace with actual authentication)
        $userId = 1;
        $companyId = 1;

        try {
            $riskAssessment = RiskAssessment::where('company_id', $companyId)->first();
            $files = File::where('company_id', $companyId)->latest()->take(5)->get();
            $popiaItems = PopiaItem::where('company_id', $companyId)->get();
            $activityLogs = ActivityLog::where('company_id', $companyId)
                ->latest()
                ->take(5)
                ->get();

            return response()->json([
                'riskAssessment' => $riskAssessment,
                'files' => $files,
                'popiaItems' => $popiaItems,
                'activityLogs' => $activityLogs,
                'user' => ['id' => $userId, 'companyId' => $companyId]
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to load dashboard'], 500);
        }
    }
}