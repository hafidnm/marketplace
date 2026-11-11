<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MarketplaceApiTest extends TestCase
{
    /**
     * Test categories endpoint.
     */
    public function test_can_list_categories(): void
    {
        $response = $this->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'name', 'slug', 'listings_count'],
                ],
            ]);
    }

    /**
     * Test listings catalog with search and filters.
     */
    public function test_can_list_and_search_listings(): void
    {
        // 1. Basic index
        $response = $this->getJson('/api/listings');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'name',
                            'price',
                            'condition',
                            'status',
                            'location',
                            'category',
                            'seller' => ['id', 'name', 'whatsapp', 'location'], // no email!
                        ],
                    ],
                    'meta',
                ],
            ]);

        // 2. ILIKE search
        $searchResponse = $this->getJson('/api/listings?q=Cordless');
        $searchResponse->assertStatus(200);

        // 3. Filter condition and status
        $filterResponse = $this->getJson('/api/listings?condition=LIKE_NEW&status=AVAILABLE');
        $filterResponse->assertStatus(200);
    }

    /**
     * Test single listing detail.
     */
    public function test_can_view_listing_detail(): void
    {
        $listing = Listing::first();
        $this->assertNotNull($listing);

        $response = $this->getJson('/api/listings/' . $listing->id);
        $response->assertStatus(200)
            ->assertJsonPath('data.id', $listing->id)
            ->assertJsonPath('data.seller.name', $listing->user->name)
            ->assertJsonMissing(['email']); // Verify seller email is never exposed
    }

    /**
     * Test auth flow: register, me, logout.
     */
    public function test_auth_registration_and_profile(): void
    {
        $this->withHeader('Origin', 'http://localhost:5173');

        $userData = [
            'name' => 'Pak Test Santoso',
            'email' => 'pak.santoso.' . uniqid() . '@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'whatsapp' => '62899998888',
            'location' => 'Semarang',
        ];

        // Register
        $regResponse = $this->postJson('/api/register', $userData);
        $regResponse->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'user' => ['id', 'name', 'email', 'whatsapp', 'location'],
                ],
            ]);

        // Access /api/me with the session established by registration.
        $meResponse = $this->getJson('/api/me');

        $meResponse->assertStatus(200)
            ->assertJsonPath('data.email', $userData['email']);

        // Logout
        $logoutResponse = $this->postJson('/api/logout');

        $logoutResponse->assertStatus(200);
    }

    /**
     * Test login endpoint with valid and invalid credentials.
     */
    public function test_auth_login(): void
    {
        $this->withHeader('Origin', 'http://localhost:5173');

        // Invalid login
        $failResponse = $this->postJson('/api/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'wrongpass',
        ]);
        $failResponse->assertStatus(422)
            ->assertJsonStructure([
                'error' => ['code', 'message'],
            ]);

        // Valid login with demo user
        $successResponse = $this->postJson('/api/login', [
            'email' => 'bambang@marketplace.test',
            'password' => 'password123',
        ]);
        $successResponse->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'user' => ['id', 'name', 'email', 'whatsapp'],
                ],
            ]);
    }

    /**
     * Test CRUD listing with owner authorization.
     */
    public function test_listing_crud_and_policy(): void
    {
        Storage::fake('public');

        $owner = User::where('email', 'bambang@marketplace.test')->first();
        $otherUser = User::where('id', '!=', $owner->id)->first();
        $category = Category::first();

        // 1. Create listing
        $image1 = UploadedFile::fake()->image('tool1.jpg', 600, 600)->size(500);
        $image2 = UploadedFile::fake()->image('tool2.jpg', 600, 600)->size(500);

        $createResponse = $this->actingAs($owner, 'sanctum')
            ->postJson('/api/listings', [
                'category_id' => $category->id,
                'name' => 'Gergaji Mesin Jigsaw Makita M4301B',
                'description' => 'Mulus terawat, pisau gergaji tajam ada 3 pcs.',
                'price' => 450000,
                'condition' => 'LIKE_NEW',
                'location' => 'Jakarta Selatan',
                'images' => [$image1, $image2],
            ]);

        $createResponse->assertStatus(201);
        $listingId = $createResponse->json('data.id');
        $this->assertNotNull($listingId);

        // 2. Unauthorized update by other user should be 403
        $unauthUpdate = $this->actingAs($otherUser, 'sanctum')
            ->putJson('/api/listings/' . $listingId, [
                'name' => 'Hacked Name',
            ]);
        $unauthUpdate->assertStatus(403)
            ->assertJsonPath('error.code', 'FORBIDDEN');

        // 3. Authorized update by owner should be 200
        $authUpdate = $this->actingAs($owner, 'sanctum')
            ->putJson('/api/listings/' . $listingId, [
                'name' => 'Gergaji Mesin Jigsaw Makita M4301B (Updated)',
                'price' => 420000,
            ]);
        $authUpdate->assertStatus(200)
            ->assertJsonPath('data.name', 'Gergaji Mesin Jigsaw Makita M4301B (Updated)');

        // 4. Update status to SOLD
        $statusUpdate = $this->actingAs($owner, 'sanctum')
            ->patchJson('/api/listings/' . $listingId . '/status', [
                'status' => 'SOLD',
            ]);
        $statusUpdate->assertStatus(200)
            ->assertJsonPath('data.status', 'SOLD');

        // 5. Delete listing
        $deleteResponse = $this->actingAs($owner, 'sanctum')
            ->deleteJson('/api/listings/' . $listingId);
        $deleteResponse->assertStatus(200);

        // Verify deleted
        $this->getJson('/api/listings/' . $listingId)
            ->assertStatus(404)
            ->assertJsonPath('error.code', 'NOT_FOUND');
    }

    /**
     * Test user listings endpoint.
     */
    public function test_can_get_user_listings(): void
    {
        $user = User::first();
        $response = $this->getJson('/api/users/' . $user->id . '/listings');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data',
                    'meta',
                ],
            ]);
    }
}
