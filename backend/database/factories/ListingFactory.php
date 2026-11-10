<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Listing>
 */
class ListingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $locations = [
            'Jakarta Selatan',
            'Jakarta Timur',
            'Bandung',
            'Bekasi',
            'Tangerang Selatan',
            'Depok',
            'Surabaya',
            'Semarang',
            'Yogyakarta',
            'Malang',
        ];

        // Random price between 50,000 and 10,000,000 rounded to 10,000
        $rawPrice = fake()->numberBetween(5, 1000) * 10000;

        return [
            'user_id' => User::factory(),
            'category_id' => Category::factory(),
            'name' => fake()->sentence(4),
            'description' => fake()->paragraphs(3, true),
            'price' => $rawPrice,
            'condition' => fake()->randomElement(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']),
            'status' => fake()->randomElement(['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'SOLD']),
            'location' => fake()->randomElement($locations),
        ];
    }

    /**
     * State for available status.
     */
    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'AVAILABLE',
        ]);
    }

    /**
     * State for sold status.
     */
    public function sold(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'SOLD',
        ]);
    }
}
