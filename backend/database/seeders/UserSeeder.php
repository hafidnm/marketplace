<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1 user utama untuk testing login
        User::firstOrCreate(
            ['email' => 'bambang@marketplace.test'],
            [
                'name' => 'Pak Bambang Prakoso',
                'whatsapp' => '6281234567890',
                'location' => 'Jakarta Selatan',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        // 4 user bapak-bapak lainnya
        $otherUsers = [
            [
                'name' => 'Pak Joko Widodo Santoso',
                'email' => 'joko.santoso@marketplace.test',
                'whatsapp' => '6281298765432',
                'location' => 'Bandung',
            ],
            [
                'name' => 'Pak Hendra Kurniawan',
                'email' => 'hendra.kurniawan@marketplace.test',
                'whatsapp' => '6281311223344',
                'location' => 'Bekasi',
            ],
            [
                'name' => 'Pak Agus Gunawan',
                'email' => 'agus.gunawan@marketplace.test',
                'whatsapp' => '6281544332211',
                'location' => 'Tangerang Selatan',
            ],
            [
                'name' => 'Pak Budi Hartono',
                'email' => 'budi.hartono@marketplace.test',
                'whatsapp' => '6281776655443',
                'location' => 'Surabaya',
            ],
        ];

        foreach ($otherUsers as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                array_merge($userData, [
                    'password' => Hash::make('password123'),
                    'email_verified_at' => now(),
                ])
            );
        }
    }
}
