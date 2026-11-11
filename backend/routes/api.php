<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ListingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ==========================================
// 1. Authentication Endpoints (Strict Throttle)
// ==========================================
Route::middleware(['throttle:10,1'])->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// ==========================================
// 2. Protected User Endpoints (Auth Sanctum)
// ==========================================
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Listing Mutation Endpoints
    Route::post('/listings', [ListingController::class, 'store']);
    Route::put('/listings/{id}', [ListingController::class, 'update']);
    Route::post('/listings/{id}/update', [ListingController::class, 'update']); // browser fallback (no PUT support)
    Route::delete('/listings/{id}', [ListingController::class, 'destroy']);
    Route::patch('/listings/{id}/status', [ListingController::class, 'updateStatus']);
});

// ==========================================
// 3. Public Catalog & Listing Endpoints
// ==========================================
Route::middleware(['throttle:60,1'])->group(function () {
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/listings', [ListingController::class, 'index']);
    Route::get('/listings/{id}', [ListingController::class, 'show']);
    Route::get('/users/{id}/listings', [ListingController::class, 'userListings']);
});
