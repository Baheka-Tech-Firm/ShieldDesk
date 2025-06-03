<?php

namespace App\Http\Controllers;

use App\Models\RiskAssessment;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class AssessmentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'physicalSecurity' => 'required|integer|min:0|max:100',
            'dataProtection' => 'required|integer|min:0|max:100',
            'accessControl' => 'required|integer|min:0|max:100',
            'networkSecurity' => 'required|integer|min:0|max:100',
        ]);

        $companyId = 1; // Mock company ID for development
        $userId = 1; // Mock user ID for development

        $scores = [
            $request->physicalSecurity,
            $request->dataProtection,
            $request->accessControl,
            $request->networkSecurity
        ];

        $overallScore = round(array_sum($scores) / count($scores));

        // Update or create risk assessment
        $riskAssessment = RiskAssessment::updateOrCreate(
            ['company_id' => $companyId],
            [
                'user_id' => $userId,
                'physical_security_score' => $request->physicalSecurity,
                'data_protection_score' => $request->dataProtection,
                'access_control_score' => $request->accessControl,
                'network_security_score' => $request->networkSecurity,
                'overall_score' => $overallScore,
            ]
        );

        // Log the activity
        ActivityLog::create([
            'company_id' => $companyId,
            'user_id' => $userId,
            'action' => 'updated',
            'resource' => 'Risk Assessment',
            'details' => [
                'overall_score' => $overallScore,
                'scores' => $scores
            ]
        ]);

        return response()->json($riskAssessment, 201);
    }
}