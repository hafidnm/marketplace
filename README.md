# LaPak. - Lapaknya Para Bapak!

Jual barang pribadi, temukan barang incaran, dan saling terhubung dalam satu
komunitas.

## Fitur MVP

- Register, login, logout, dan profil pengguna.
- Katalog listing dengan pagination, pencarian, filter kategori, kondisi, dan status.
- Detail listing dengan kategori, foto, lokasi, dan informasi penjual.
- Profil penjual publik dengan statistik, filter listing, dan kontak WhatsApp.
- Membuat, mengubah, menghapus listing milik sendiri.
- Mengubah status listing menjadi `AVAILABLE` atau `SOLD`.
- Upload 1 sampai 5 foto per listing.
- Tombol kontak WhatsApp melalui link `wa.me` di frontend.

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router, Axios.
- Backend: Laravel, PHP, REST API.
- Database: PostgreSQL melalui Eloquent ORM.
- Auth: Laravel Sanctum SPA cookie/session dengan CSRF cookie dan web guard.
- Storage lokal: Laravel `Storage::disk('public')`.

Catatan sumber kebenaran: `backend/composer.json` saat ini mendeklarasikan
`php: ^8.3` dan `laravel/framework: ^13.17`. Dokumen lain menyebut Laravel 11
atau PHP 8.2+, tetapi setup bersih harus mengikuti constraint Composer aktif.

## Struktur Project

```text
backend/
  app/Http/Controllers/Api/     # Auth, category, listing
  app/Http/Requests/             # Validasi Form Request
  app/Http/Resources/            # Bentuk response JSON
  app/Models/                   # User, Category, Listing, ListingImage
  app/Policies/                 # ListingPolicy
  database/migrations/          # Skema database
  database/seeders/             # Data demo
  routes/api.php                # Endpoint REST
frontend/
  src/api/                      # Axios client
  src/context/                  # AuthContext
  src/pages/                    # Halaman SPA
  src/components/               # Komponen UI
docs/                           # Dokumentasi teknis
```

## Setup Lokal dari Clone Bersih

### Prasyarat

- Git.
- PHP yang memenuhi `backend/composer.json` (`^8.3` saat ini).
- Composer 2.x.
- Node.js 20+ dan npm.
- PostgreSQL yang berjalan lokal, atau Docker Desktop sebagai opsi.

### 1. Clone dan siapkan database

```bash
git clone <url-repository>
cd marketplace
```

Buat database PostgreSQL:

```sql
CREATE DATABASE marketplace;
```

Sesuaikan username dan password PostgreSQL pada `backend/.env`.

Docker Compose hanya menyediakan PostgreSQL secara opsional:

```bash
docker compose up -d
```

Konfigurasi default container mengikuti `DB_DATABASE`, `DB_USERNAME`,
`DB_PASSWORD`, dan `DB_PORT`, dengan fallback `marketplace`, `postgres`,
`postgres`, dan `5432`.

### 2. Install dan migrasi backend

```bash
cd backend
copy .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
```

Pada macOS/Linux, gunakan `cp .env.example .env` sebagai pengganti `copy`.
Seeder membuat lima user, sembilan kategori, dan 30 listing beserta placeholder
gambar sesuai kode seeder.

Kategori bawaan: Pakaian, Aksesoris, Elektronik, Kendaraan, Perkakas, Hobi dan
Olahraga, Rumah Tangga, Buku dan Media, serta Lainnya.

### 3. Install dan jalankan frontend

Buka terminal baru:

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Pada macOS/Linux gunakan `cp .env.example .env`.

Jalankan backend pada terminal lain:

```bash
cd backend
php artisan serve
```

Akses:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Health endpoint Laravel: `http://localhost:8000/up`

Akun demo dari `UserSeeder`:

```text
Email: bambang@marketplace.test
Password: password123
```

## Konfigurasi Environment

Salin `backend/.env.example` dan isi nilai lokal. Jangan commit `.env`.

| Variabel | Kegunaan | Contoh non-rahasia |
|---|---|---|
| `APP_URL` | URL backend dan basis URL asset | `http://localhost:8000` |
| `FRONTEND_URL` | Origin frontend yang diizinkan CORS | `http://localhost:5173` |
| `SANCTUM_STATEFUL_DOMAINS` | Domain SPA stateful | `localhost:5173` |
| `DB_CONNECTION` | Driver database | `pgsql` |
| `DB_HOST` / `DB_PORT` | Host dan port PostgreSQL | `127.0.0.1` / `5432` |
| `DB_DATABASE` | Nama database | `marketplace` |
| `DB_USERNAME` / `DB_PASSWORD` | Credential database | isi lokal, jangan commit |
| `SESSION_DRIVER` | Penyimpanan session | `database` |
| `SESSION_DOMAIN` | Domain cookie session | `localhost` |
| `FILESYSTEM_DISK` | Disk default file | `public` |
| `VITE_API_URL` | URL backend untuk frontend | `http://localhost:8000` |

`SESSION_DRIVER=database` berarti session lokal memakai tabel `sessions`.
`CACHE_STORE=database` dan `QUEUE_CONNECTION=database` juga merupakan default
di `.env.example`; Redis hanya tersedia sebagai konfigurasi koneksi dan belum
menjadi implementasi runtime default.

## Status Implementasi

Sudah berjalan: SPA auth Sanctum, Policy ownership, Form Request validation,
rate limit pada route auth dan katalog, index migration, Eloquent pagination,
dan upload lokal melalui disk `public`.

Rancangan/pengembangan berikutnya: CDN, S3/object storage, Redis runtime,
presigned upload, queue resize thumbnail, read replica, dan autoscaling.

Detail arsitektur dan batasan rancangan:

- [Arsitektur aplikasi](docs/architecture.md)
- [Arsitektur infrastruktur](docs/infrastructure.md)

## Dokumentasi

- [API](docs/api.md)
- [Database dan ERD](docs/database.md)
- [Architecture Decision Records](docs/adr.md)
- [Deployment](docs/deployment.md)
- Screenshot: `docs/screenshots/` (placeholder)
