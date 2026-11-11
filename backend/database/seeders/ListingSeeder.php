<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Listing;
use App\Models\ListingImage;
use App\Models\User;
use Illuminate\Database\Seeder;

class ListingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $categories = Category::all()->keyBy('slug');

        if ($users->isEmpty() || $categories->isEmpty()) {
            return;
        }

        $imageLibrary = [
            'perkakas' => [
                'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&auto=format&fit=crop&q=80',
            ],
            'otomotif' => [
                'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&auto=format&fit=crop&q=80',
            ],
            'kopi' => [
                'https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80',
            ],
            'audio' => [
                'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
            ],
            'outdoor' => [
                'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
            ],
            'elektronik' => [
                'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
            ],
            'aquascape' => [
                'https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?w=800&auto=format&fit=crop&q=80',
            ],
            'jam' => [
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&auto=format&fit=crop&q=80',
            ],
        ];

        $items = [
            // 1 - 4: Perkakas
            [
                'category' => 'perkakas',
                'img_key' => 'perkakas',
                'name' => 'Bor Cordless Bosch GSB 120-LI Lengkap Box & Baterai Cadangan',
                'description' => 'Kondisi normal jaya, pemakaian pribadi buat rapihin rak dapur. Baterai masih awet 2 buah, charger original, mata bor bawaan komplit. Nego bensin.',
                'price' => 750000,
                'condition' => 'LIKE_NEW',
                'status' => 'AVAILABLE',
                'location' => 'Jakarta Selatan',
            ],
            [
                'category' => 'perkakas',
                'img_key' => 'perkakas',
                'name' => 'Mesin Pasah Kayu Planner Maktec MT191',
                'description' => 'Barang simpanan gudang, mata pisau masih tajam bawaan. Suara mesin halus, carbon brush baru diganti orisinil. Siap pakai buat proyek woodworking akhir pekan.',
                'price' => 520000,
                'condition' => 'GOOD',
                'status' => 'AVAILABLE',
                'location' => 'Bandung',
            ],
            [
                'category' => 'rumah-tangga',
                'img_key' => 'perkakas',
                'name' => 'Toolbox Rumah Tangga Tekiro 60 Pcs',
                'description' => 'Dijual karena mau pindahan rumah. Kelengkapan 98% komplit, chrome vanadium mulus tanpa karat. Cocok untuk perbaikan rumah sehari-hari.',
                'price' => 450000,
                'condition' => 'LIKE_NEW',
                'status' => 'AVAILABLE',
                'location' => 'Bekasi',
            ],
            [
                'category' => 'perkakas',
                'img_key' => 'perkakas',
                'name' => 'Mesin Las Inverter Lakoni Falcon 120e',
                'description' => 'Fungsi 100% normal. Jarang dipakai cuma buat bikin teralis pagar rumah. Kabel massa dan kabel stang las tebal.',
                'price' => 600000,
                'condition' => 'GOOD',
                'status' => 'SOLD',
                'location' => 'Tangerang Selatan',
            ],

            // 5 - 8: Otomotif
            [
                'category' => 'kendaraan',
                'img_key' => 'otomotif',
                'name' => 'Karburator Dellorto 20:20 Original Vespa PX Excel',
                'description' => 'Copotan Vespa Excel pribadi. Daleman spuyer masih standar pabrik, langsam enak, tarikan padat. Dijual karena ganti ukuran 24:24.',
                'price' => 380000,
                'condition' => 'GOOD',
                'status' => 'AVAILABLE',
                'location' => 'Jakarta Selatan',
            ],
            [
                'category' => 'kendaraan',
                'img_key' => 'otomotif',
                'name' => 'Knalpot Standar Racing RX King Bobokan Alifka Suara Garing',
                'description' => 'Krom kinclong 90%, las-lasan rapi tidak ada bocor. Suara kemrincing gurih khas raja jalanan. Plat tebal.',
                'price' => 290000,
                'condition' => 'GOOD',
                'status' => 'AVAILABLE',
                'location' => 'Depok',
            ],
            [
                'category' => 'kendaraan',
                'img_key' => 'otomotif',
                'name' => 'Dongkrak Buaya 2 Ton Tekiro Hidrolik Portable',
                'description' => 'Beli dari baru belum pernah kepakai ke jalan raya, cuma taruh di bagasi mobil kijang kapsul. Kardus masih ada.',
                'price' => 320000,
                'condition' => 'NEW',
                'status' => 'AVAILABLE',
                'location' => 'Surabaya',
            ],
            [
                'category' => 'kendaraan',
                'img_key' => 'otomotif',
                'name' => 'Velg Kaleng OEM Honda Civic Ferio R14 4x100',
                'description' => 'Satu set 4 biji, no peyang, cat orisinil abu gelap. Cocok untuk tampilan retro/sleeper. Siap COD.',
                'price' => 1200000,
                'condition' => 'FAIR',
                'status' => 'SOLD',
                'location' => 'Bandung',
            ],

            // 9 - 12: Kopi
            [
                'category' => 'hobi-dan-olahraga',
                'img_key' => 'kopi',
                'name' => 'Manual Espresso Maker Flair Classic Portafilter Bottomless',
                'description' => 'Bagi pecinta espresso tebal krema. Kelengkapan carrying case, pressure gauge, tamper stainless 40mm. Terawat bersih selalu dibersihkan usai seduh.',
                'price' => 1950000,
                'condition' => 'LIKE_NEW',
                'status' => 'AVAILABLE',
                'location' => 'Jakarta Selatan',
            ],
            [
                'category' => 'hobi-dan-olahraga',
                'img_key' => 'kopi',
                'name' => 'Hand Grinder Timemore Chestnut C2 Grey',
                'description' => 'Burr stainless steel masih sangat tajam, putaran presisi. Cocok dari pour over V60 sampai Mokapot. Dus dan pouch lengkap.',
                'price' => 450000,
                'condition' => 'LIKE_NEW',
                'status' => 'AVAILABLE',
                'location' => 'Semarang',
            ],
            [
                'category' => 'hobi-dan-olahraga',
                'img_key' => 'kopi',
                'name' => 'Teko Leher Angsa Kettle Gooseneck Suhu Analog 1000ml',
                'description' => 'Bahan stainless steel tebal 304, flow air lancar stabil untuk seduhan manual brew pagi hari bersama cemilan singkong rebus.',
                'price' => 175000,
                'condition' => 'GOOD',
                'status' => 'AVAILABLE',
                'location' => 'Yogyakarta',
            ],
            [
                'category' => 'hobi-dan-olahraga',
                'img_key' => 'kopi',
                'name' => 'Mesin Kopi Espresso Ferratti Ferro FCM-3605',
                'description' => 'Unit normal, steam wand kencang untuk latte art. Jarang dipakai karena bapak sudah beralih ke kopi tubruk tubruk rempah.',
                'price' => 1400000,
                'condition' => 'GOOD',
                'status' => 'SOLD',
                'location' => 'Jakarta Timur',
            ],

            // 13 - 16: Audio
            [
                'category' => 'elektronik',
                'img_key' => 'audio',
                'name' => 'Amplifier Vintage Sansui AU-D55X Stereo Integrated Amp',
                'description' => 'Koleksi pribadi. Karakter suara warm, bass empuk, vokal tebal ala 80-an. Komponen dalam orisinil buatan Jepang, potensio tidak kresek-kresek.',
                'price' => 2850000,
                'condition' => 'GOOD',
                'status' => 'AVAILABLE',
                'location' => 'Jakarta Selatan',
            ],
            [
                'category' => 'elektronik',
                'img_key' => 'audio',
                'name' => 'Speaker Pasif Bookshelf Pioneer CS-F900 8 Inch 3-Way',
                'description' => 'Box kayu jati kokoh tanpa keropos. Cone utuh, treble jernih. Suara mantap untuk dengerin lagu Koes Plus dan The Beatles.',
                'price' => 1650000,
                'condition' => 'GOOD',
                'status' => 'AVAILABLE',
                'location' => 'Malang',
            ],
            [
                'category' => 'buku-dan-media',
                'img_key' => 'audio',
                'name' => 'Turntable Piringan Hitam Audio Technica AT-LP60X USB',
                'description' => 'Jarum stylus baru diganti orisinil. Bisa langsung colok ke speaker aktif via RCA atau AUX. Kondisi sangat terawat bebas debu.',
                'price' => 1800000,
                'condition' => 'LIKE_NEW',
                'status' => 'AVAILABLE',
                'location' => 'Bandung',
            ],
            [
                'category' => 'buku-dan-media',
                'img_key' => 'audio',
                'name' => 'Kaset Pita Lawas Koleksi Ebiet G. Ade & Iwan Fals 10 Kaset',
                'description' => 'Pita tidak kusut, suara bening, mika kaset original. Dijual borongan 10 kaset bagi sesama penghobi lagu nostalgia.',
                'price' => 200000,
                'condition' => 'GOOD',
                'status' => 'AVAILABLE',
                'location' => 'Solo',
            ],

            // 17 - 20: Outdoor & Pancing
            [
                'category' => 'hobi-dan-olahraga',
                'img_key' => 'outdoor',
                'name' => 'Reel Pancing Shimano Sedona 2500 HG Flueger Spool',
                'description' => 'Reel legendaris awet tahan banting. Drag smooth, putaran enteng. Baru dipakai 2 kali di empang harian ikan mas.',
                'price' => 620000,
                'condition' => 'LIKE_NEW',
                'status' => 'AVAILABLE',
                'location' => 'Bekasi',
            ],
            [
                'category' => 'hobi-dan-olahraga',
                'img_key' => 'outdoor',
                'name' => 'Joran Daido Carbon Solid 180cm Sambung 2 Action Medium',
                'description' => 'Kelenturan pas, blank carbon kuat sudah teruji strike bawal 3kg. Ring guide keramik anti keriting senar.',
                'price' => 240000,
                'condition' => 'GOOD',
                'status' => 'AVAILABLE',
                'location' => 'Depok',
            ],
            [
                'category' => 'hobi-dan-olahraga',
                'img_key' => 'outdoor',
                'name' => 'Kursi Lipat Mancing Naturehike Portable Beban 120kg',
                'description' => 'Bahan oxford tebal, rangka besi ringan dan kokoh. Enak dibawa nongkrong mancing berjam-jam sambil ngopi.',
                'price' => 185000,
                'condition' => 'NEW',
                'status' => 'AVAILABLE',
                'location' => 'Jakarta Timur',
            ],
            [
                'category' => 'hobi-dan-olahraga',
                'img_key' => 'outdoor',
                'name' => 'Box Pancing Besar Plano 3 Tray dengan Sekat Komplit',
                'description' => 'Kotak perkakas umpan dan mata kail. Kunci engsel masih kencang, tidak ada retak sama sekali.',
                'price' => 190000,
                'condition' => 'FAIR',
                'status' => 'SOLD',
                'location' => 'Surabaya',
            ],

            // 21 - 24: Elektronik Lawas
            [
                'category' => 'elektronik',
                'img_key' => 'elektronik',
                'name' => 'Handycam Sony DCR-HC40E MiniDV Masih Fungsi Mulus',
                'description' => 'Bisa play pita kaset MiniDV nostalgia, layar LCD sentuh normal, optik lensa Carl Zeiss bersih tanpa jamur. Lengkap charger desktop.',
                'price' => 850000,
                'condition' => 'GOOD',
                'status' => 'AVAILABLE',
                'location' => 'Jakarta Selatan',
            ],
            [
                'category' => 'elektronik',
                'img_key' => 'elektronik',
                'name' => 'Nokia 3310 Reborn Original Dual SIM Baterai Seminggu',
                'description' => 'HP cadangan khusus telepon & SMS dinas. Tombol empuk renyah, sinyal kencang 4G ready, kelengkapan fullset dus buku.',
                'price' => 310000,
                'condition' => 'LIKE_NEW',
                'status' => 'AVAILABLE',
                'location' => 'Semarang',
            ],
            [
                'category' => 'elektronik',
                'img_key' => 'elektronik',
                'name' => 'Radio Komunikasi HT Baofeng UV-5R Dual Band UHF VHF',
                'description' => 'Sering dipakai saat touring motor bapak-bapak. Antena dapat 2 (standar + helical panjang). Baterai awet 2 hari stand by.',
                'price' => 220000,
                'condition' => 'GOOD',
                'status' => 'AVAILABLE',
                'location' => 'Bandung',
            ],
            [
                'category' => 'elektronik',
                'img_key' => 'elektronik',
                'name' => 'Keyboard Mekanikal IBM Model M Clicky Switch PS/2',
                'description' => 'Legenda pengetikan bapak era 90an. Suara buckling spring renyah tiada tanding. Berat 2.5kg asli made in USA.',
                'price' => 1750000,
                'condition' => 'FAIR',
                'status' => 'SOLD',
                'location' => 'Yogyakarta',
            ],

            // 25 - 27: Aquascape
            [
                'category' => 'lainnya',
                'img_key' => 'aquascape',
                'name' => 'Perlengkapan CO2 Aquascape 3kg Lengkap',
                'description' => 'Regulator dengan bubble counter dan solenoid valve. Sisa gas CO2 masih sekitar 60%. Cocok untuk koleksi aquascape di rumah.',
                'price' => 850000,
                'condition' => 'GOOD',
                'status' => 'AVAILABLE',
                'location' => 'Jakarta Selatan',
            ],
            [
                'category' => 'pakaian',
                'img_key' => 'outdoor',
                'name' => 'Jaket Outdoor Pria Consina Ukuran L',
                'description' => 'Jaket ringan untuk kegiatan luar ruang. Resleting dan lapisan dalam masih baik, sudah dicuci bersih dan siap dipakai.',
                'price' => 1350000,
                'condition' => 'LIKE_NEW',
                'status' => 'AVAILABLE',
                'location' => 'Tangerang Selatan',
            ],
            [
                'category' => 'hobi-dan-olahraga',
                'img_key' => 'aquascape',
                'name' => 'Filter Canister Eheim Classic 250 Media Komplit Substrat Pro',
                'description' => 'Pompa sunyi senyap khas Jerman. Selang lily pipe kaca inlet outlet include. Air tank dijamin bening kristal.',
                'price' => 950000,
                'condition' => 'GOOD',
                'status' => 'AVAILABLE',
                'location' => 'Surabaya',
            ],

            // 28 - 30: Jam Tangan
            [
                'category' => 'aksesoris',
                'img_key' => 'jam',
                'name' => 'Jam Tangan Seiko 5 Automatic SNK809 Dial Hitam Rantai Pas',
                'description' => 'Mesin otomatis 7S26 bandel no minus. Akurasi harian mantap +/- 8 detik. Kaca hardlex mulus tanpa gores. Tangan pertama dari toko resmi.',
                'price' => 1150000,
                'condition' => 'LIKE_NEW',
                'status' => 'AVAILABLE',
                'location' => 'Jakarta Selatan',
            ],
            [
                'category' => 'aksesoris',
                'img_key' => 'jam',
                'name' => 'Casio G-Shock DW-5600E Original Kotak Hitam Klasik Keanu Reeves',
                'description' => 'Jam harian anti air anti benturan. Bezel dan strap karet masih lentur original belum getas. Baterai baru diganti di servis center Casio.',
                'price' => 580000,
                'condition' => 'GOOD',
                'status' => 'AVAILABLE',
                'location' => 'Bekasi',
            ],
            [
                'category' => 'aksesoris',
                'img_key' => 'jam',
                'name' => 'Jam Tangan Citizen Promaster Diver 200m Eco-Drive Solar',
                'description' => 'Bertenaga sinar matahari tidak perlu ganti baterai. Lume jarum menyala hijau terang dalam gelap. Box selam tabung gas orisinil ada.',
                'price' => 1850000,
                'condition' => 'GOOD',
                'status' => 'SOLD',
                'location' => 'Bandung',
            ],
        ];

        foreach ($items as $index => $item) {
            // Assign user in round-robin fashion across 5 users
            $user = $users[$index % $users->count()];
            $category = $categories[$item['category']] ?? $categories->first();

            $listing = Listing::create([
                'user_id' => $user->id,
                'category_id' => $category->id,
                'name' => $item['name'],
                'description' => $item['description'],
                'price' => $item['price'],
                'condition' => $item['condition'],
                'status' => $item['status'],
                'location' => $item['location'],
            ]);

            // Create 1-3 images per listing
            $imagePool = $imageLibrary[$item['img_key']] ?? $imageLibrary['perkakas'];
            $imageCount = ($index % 3) + 1; // Produces 1, 2, or 3 images

            for ($i = 0; $i < $imageCount; $i++) {
                $imgPath = $imagePool[$i % count($imagePool)];
                ListingImage::create([
                    'listing_id' => $listing->id,
                    'path' => $imgPath,
                    'sort_order' => $i,
                ]);
            }
        }
    }
}
