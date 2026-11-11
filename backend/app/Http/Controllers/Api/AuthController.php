<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'whatsapp' => $validated['whatsapp'] ?? null,
            'location' => $validated['location'] ?? null,
        ]);

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return $this->successResponse([
            'user' => new UserResource($user),
        ], 'Registrasi akun berhasil.', 201);
    }

    /**
     * Login user with credentials and establish a session.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        if (!Auth::guard('web')->attempt([
            'email' => $validated['email'],
            'password' => $validated['password'],
        ])) {
            return $this->errorResponse(
                'Email atau password yang Anda masukkan salah.',
                'INVALID_CREDENTIALS',
                422
            );
        }

        $request->session()->regenerate();
        $user = Auth::guard('web')->user();

        return $this->successResponse([
            'user' => new UserResource($user),
        ], 'Login berhasil.');
    }

    /**
     * Logout user and invalidate the session.
     */
    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return $this->successResponse(null, 'Logout berhasil.');
    }

    /**
     * Get profile of currently authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return $this->successResponse(
            new UserResource($request->user()),
            'Data profil berhasil diambil.'
        );
    }
}
