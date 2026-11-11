<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Pakaian',
            'Aksesoris',
            'Elektronik',
            'Kendaraan',
            'Perkakas',
            'Hobi dan Olahraga',
            'Rumah Tangga',
            'Buku dan Media',
            'Lainnya',
        ];

        foreach ($categories as $categoryName) {
            Category::firstOrCreate(
                ['slug' => Str::slug($categoryName)],
                ['name' => $categoryName]
            );
        }
    }
}
