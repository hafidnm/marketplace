<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Listing\StoreListingRequest;
use App\Http\Requests\Listing\UpdateListingRequest;
use App\Http\Requests\Listing\UpdateListingStatusRequest;
use App\Http\Resources\ListingResource;
use App\Models\Listing;
use App\Models\ListingImage;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ListingController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    /**
     * Display a listing of items with search, filter, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Listing::query()
            ->with(['category', 'user', 'primaryImage', 'images']);

        // Search using PostgreSQL ILIKE
        if ($request->filled('q')) {
            $searchTerm = '%' . trim($request->query('q')) . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'ILIKE', $searchTerm)
                  ->orWhere('description', 'ILIKE', $searchTerm);
            });
        }

        // Filter by category_id
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }

        // Filter by condition (NEW, LIKE_NEW, GOOD, FAIR)
        if ($request->filled('condition')) {
            $query->where('condition', $request->query('condition'));
        }

        // Filter by status (AVAILABLE, SOLD)
        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        // Sort by newest first
        $query->orderBy('created_at', 'desc');

        $perPage = min(max((int) $request->query('per_page', 12), 1), 50);
        $listings = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar barang berhasil diambil.',
            'data' => ListingResource::collection($listings)->response()->getData(true),
        ]);
    }

    /**
     * Display the specified listing detail with seller info & images.
     */
    public function show(int $id): JsonResponse
    {
        $listing = Listing::with(['category', 'user', 'images'])
            ->findOrFail($id);

        return $this->successResponse(
            new ListingResource($listing),
            'Detail barang berhasil diambil.'
        );
    }

    /**
     * Store a newly created listing with multipart data and images.
     */
    public function store(StoreListingRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        $listing = DB::transaction(function () use ($validated, $user, $request) {
            $newListing = Listing::create([
                'user_id' => $user->id,
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                'condition' => $validated['condition'],
                'status' => 'AVAILABLE',
                'location' => $validated['location'],
            ]);

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $imageFile) {
                    $path = $imageFile->store('listings', 'public');
                    ListingImage::create([
                        'listing_id' => $newListing->id,
                        'path' => $path,
                        'sort_order' => $index,
                    ]);
                }
            }

            return $newListing;
        });

        $listing->load(['category', 'user', 'images']);

        return $this->successResponse(
            new ListingResource($listing),
            'Barang berhasil dipasang di marketplace.',
            201
        );
    }

    /**
     * Update the specified listing (Owner only via ListingPolicy).
     */
    public function update(UpdateListingRequest $request, int $id): JsonResponse
    {
        $listing = Listing::findOrFail($id);

        // Check ownership via policy
        $this->authorize('update', $listing);

        $validated = $request->validated();

        DB::transaction(function () use ($listing, $validated, $request) {
            $listing->update(array_filter([
                'category_id' => $validated['category_id'] ?? null,
                'name' => $validated['name'] ?? null,
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'] ?? null,
                'condition' => $validated['condition'] ?? null,
                'location' => $validated['location'] ?? null,
            ], fn ($val) => $val !== null));

            // If new images provided, append them or replace
            if ($request->hasFile('images')) {
                $currentMaxSort = (int) $listing->images()->max('sort_order');
                foreach ($request->file('images') as $i => $imageFile) {
                    $path = $imageFile->store('listings', 'public');
                    ListingImage::create([
                        'listing_id' => $listing->id,
                        'path' => $path,
                        'sort_order' => $currentMaxSort + $i + 1,
                    ]);
                }
            }
        });

        $listing->load(['category', 'user', 'images']);

        return $this->successResponse(
            new ListingResource($listing),
            'Listing barang berhasil diperbarui.'
        );
    }

    /**
     * Delete the specified listing (Owner only via ListingPolicy).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $listing = Listing::with('images')->findOrFail($id);

        // Check ownership via policy
        $this->authorize('delete', $listing);

        // Delete uploaded image files
        foreach ($listing->images as $image) {
            if (!str_starts_with($image->path, 'http')) {
                Storage::disk('public')->delete($image->path);
            }
        }

        $listing->delete();

        return $this->successResponse(
            null,
            'Listing barang berhasil dihapus.'
        );
    }

    /**
     * Update listing status: AVAILABLE or SOLD (Owner only via ListingPolicy).
     */
    public function updateStatus(UpdateListingStatusRequest $request, int $id): JsonResponse
    {
        $listing = Listing::with(['category', 'user', 'images'])->findOrFail($id);

        // Check ownership via policy
        $this->authorize('updateStatus', $listing);

        $listing->update([
            'status' => $request->validated('status'),
        ]);

        return $this->successResponse(
            new ListingResource($listing),
            'Status barang berhasil diubah menjadi ' . $listing->status . '.'
        );
    }

    /**
     * Get listings belonging to a specific user.
     */
    public function userListings(Request $request, int $id): JsonResponse
    {
        // Verify user exists
        $user = User::findOrFail($id);

        $query = Listing::where('user_id', $user->id)
            ->with(['category', 'user', 'primaryImage', 'images'])
            ->orderBy('created_at', 'desc');

        // Optional status filter
        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $perPage = min(max((int) $request->query('per_page', 12), 1), 50);
        $listings = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar barang milik ' . $user->name . ' berhasil diambil.',
            'data' => ListingResource::collection($listings)->response()->getData(true),
        ]);
    }
}
