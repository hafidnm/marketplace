<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Stateful API (CSRF cookie-based) is DISABLED.
        // This app uses Sanctum Bearer Token (stateless), so CSRF verification
        // on /api/* routes is not needed and would cause HTTP 419 errors.
        // $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'error' => [
                        'code' => 'VALIDATION_ERROR',
                        'message' => $e->getMessage(),
                        'details' => $e->errors(),
                    ],
                ], 422);
            }
        });

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'error' => [
                        'code' => 'UNAUTHENTICATED',
                        'message' => 'Unauthenticated or token expired.',
                    ],
                ], 401);
            }
        });

        $exceptions->render(function (AuthorizationException|AccessDeniedHttpException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'error' => [
                        'code' => 'FORBIDDEN',
                        'message' => $e->getMessage() ?: 'Anda tidak memiliki hak akses untuk tindakan ini.',
                    ],
                ], 403);
            }
        });

        $exceptions->render(function (ModelNotFoundException|NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'error' => [
                        'code' => 'NOT_FOUND',
                        'message' => 'Resource tidak ditemukan.',
                    ],
                ], 404);
            }
        });

        $exceptions->render(function (ThrottleRequestsException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'error' => [
                        'code' => 'TOO_MANY_REQUESTS',
                        'message' => 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
                    ],
                ], 429);
            }
        });
    })->create();
