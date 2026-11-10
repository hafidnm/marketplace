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
            'Perkakas & Pertukangan',
            'Otomotif & Sparepart',
            'Hobi Kopi & Barista',
            'Audio & Sound Vintage',
            'Alat Pancing & Outdoor',
            'Elektronik & Gadget Lawas',
            'Aquascape & Tanaman Hias',
            'Jam Tangan & Koleksi Pria',
        ];

        foreach ($categories as $categoryName) {
            Category::firstOrCreate(
                ['slug' => Str::slug($categoryName)],
                ['name' => $categoryName]
            );
        }
    }
}
