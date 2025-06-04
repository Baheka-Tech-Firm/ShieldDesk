<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

Route::get('/', function () {
    return view('welcome');
});

// Dashboard API endpoint
Route::get('/api/dashboard', [DashboardController::class, 'index']);
