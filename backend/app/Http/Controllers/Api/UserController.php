<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserPublicResource;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    use ApiResponse;

    /**
     * Display a public seller profile and listing statistics.
     */
    public function show(int $id): JsonResponse
    {
        $user = User::query()
            ->withCount([
                'listings as available_listings_count' => fn ($query) => $query->where('status', 'AVAILABLE'),
                'listings as sold_listings_count' => fn ($query) => $query->where('status', 'SOLD'),
            ])
            ->findOrFail($id);

        return $this->successResponse(
            new UserPublicResource($user),
            'Profil penjual berhasil diambil.'
        );
    }
}
