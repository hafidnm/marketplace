<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => config('app.name', 'Marketplace API'),
        'status' => 'ok',
        'version' => '1.0.0',
    ]);
});
