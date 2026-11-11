<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of categories with item counts.
     */
    public function index(): JsonResponse
    {
        $categories = Category::withCount('listings')
            ->orderByRaw("CASE WHEN slug = 'lainnya' THEN 1 ELSE 0 END")
            ->orderBy('name')
            ->get();

        $data = $categories->map(fn ($cat) => [
            'id' => $cat->id,
            'name' => $cat->name,
            'slug' => $cat->slug,
            'listings_count' => $cat->listings_count,
        ]);

        return $this->successResponse(
            $data,
            'Daftar kategori berhasil diambil.'
        );
    }
}
