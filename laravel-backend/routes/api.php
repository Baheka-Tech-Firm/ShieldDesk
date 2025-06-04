<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\VulnerabilityController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health Check (Public)
Route::get('health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0',
        'service' => 'Laravel Backend'
    ]);
});

// Mock Auth for now - in production would use proper authentication
Route::middleware(['api'])->group(function () {
    
    // Vulnerability Scanner
    Route::prefix('vulnerabilities')->group(function () {
        Route::get('stats', [VulnerabilityController::class, 'getStats']);
        Route::get('assets', [VulnerabilityController::class, 'getAssets']);
        Route::post('assets', [VulnerabilityController::class, 'createAsset']);
        Route::get('/', [VulnerabilityController::class, 'getVulnerabilities']);
        Route::put('{id}', [VulnerabilityController::class, 'updateVulnerability']);
        Route::post('scan', [VulnerabilityController::class, 'startScan']);
        Route::get('scans', [VulnerabilityController::class, 'getScanHistory']);
    });
    
    // File Vault Mock Routes
    Route::prefix('vault')->group(function () {
        Route::get('files', function () {
            return response()->json([]);
        });
        Route::get('folders', function () {
            return response()->json([]);
        });
        Route::get('stats', function () {
            return response()->json([
                'totalFiles' => 0,
                'totalSize' => 0,
                'storageUsed' => 0,
                'storageLimit' => 1000000000
            ]);
        });
        Route::get('settings', function () {
            return response()->json([
                'enableVirusScanning' => true,
                'enableVersionControl' => true,
                'watermarkDownloads' => false,
                'requireMFA' => false
            ]);
        });
    });
    
    // Monitoring Mock Routes
    Route::prefix('monitoring')->group(function () {
        Route::get('health', function () {
            return response()->json([
                'laravel' => true,
                'database' => true,
                'cache' => true,
                'queue' => true,
                'last_updated' => now()->toISOString()
            ]);
        });
        
        Route::get('system-metrics', function () {
            return response()->json([
                'cpu_usage' => rand(10, 90),
                'memory_usage' => rand(30, 80),
                'disk_usage' => rand(40, 75),
                'network_traffic' => rand(100, 1000)
            ]);
        });
        
        Route::get('alerts', function () {
            return response()->json([]);
        });
    });
    
    // POPIA Compliance Mock Routes
    Route::prefix('popia')->group(function () {
        Route::get('/', function () {
            return response()->json([]);
        });
    });
});