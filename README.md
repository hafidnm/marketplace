# Marketplace Barang Bekas Komunitas Bapak-Bapak

Mini project marketplace barang bekas (secondhand) untuk komunitas bapak-bapak.

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + React Router
- **Backend**: Laravel 11 (PHP 8.2+), REST API, Laravel Sanctum (SPA Cookie Auth)
- **Database**: PostgreSQL (terinstall langsung di lokal atau opsional via Docker Compose)

## Struktur Direktori

```text
├── backend/            # Aplikasi Laravel 11 (API-only)
├── frontend/           # Aplikasi React + Vite + TypeScript + Tailwind
├── docs/               # Dokumentasi arsitektur, API, database, dsb.
├── docker-compose.yml  # (Opsional) PostgreSQL service via Docker
├── .env.example        # Environment variable template root
└── README.md
```

## Dokumentasi

- [Arsitektur aplikasi](docs/architecture.md) - user flow, komponen, sequence,
  caching, indexing, security, dan keputusan desain.
- [Arsitektur infrastruktur](docs/infrastructure.md) - security boundary,
  scaling, reliability, backup, monitoring, evolusi, dan estimasi biaya.
- [Dokumentasi API](docs/api.md)
- [Database](docs/database.md)
- [ADR](docs/adr.md)

## Cara Menjalankan Project

### 1. Database (Pilih salah satu cara)

#### Opsi A: PostgreSQL Lokal Langsung (Default / Rekomendasi)
Jika PostgreSQL sudah terinstall langsung di laptop/komputer Anda:
1. Pastikan service PostgreSQL Anda sudah berjalan.
2. Buat database baru bernama `marketplace` melalui psql atau GUI client (DBeaver/pgAdmin):
   ```sql
   CREATE DATABASE marketplace;
   ```
3. Sesuaikan `DB_USERNAME` dan `DB_PASSWORD` di file `backend/.env` sesuai konfigurasi user PostgreSQL lokal Anda.

#### Opsi B: Opsional via Docker Compose
Jika Anda lebih memilih menjalankan PostgreSQL melalui container Docker:
1. Pastikan Docker Desktop aktif.
2. Jalankan perintah di root direktori:
   ```bash
   docker compose up -d
   ```
   Service PostgreSQL akan berjalan di port `5432` dengan database `marketplace`, user `postgres`, password `postgres`.

---

### 2. Backend (Laravel API)
Masuk ke direktori backend:
```bash
cd backend
cp .env.example .env
# Sesuaikan konfigurasi DB (DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD) di .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```
Backend API akan aktif di `http://localhost:8000`.

---

### 3. Frontend (React + Vite)
Buka terminal baru, masuk ke direktori frontend:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend development server akan aktif di `http://localhost:5173`.
