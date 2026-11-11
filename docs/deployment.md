# Panduan Deployment

Panduan ini memisahkan setup yang benar-benar didukung kode saat ini dari
rancangan cloud yang dijelaskan di [infrastructure.md](infrastructure.md).
Implementasi saat ini memakai Laravel API, PostgreSQL, session database, dan
local public storage.

## Prasyarat

| Komponen | Sumber kebenaran |
|---|---|
| PHP | `backend/composer.json` saat ini membutuhkan `^8.3` |
| Composer | Instalasi dependency Laravel |
| Node.js/npm | Build frontend |
| PostgreSQL | `DB_CONNECTION=pgsql` pada `.env.example` |
| PHP extension | `pdo_pgsql`, `fileinfo`, dan extension Laravel terkait |
| Web server | `php artisan serve` untuk lokal; Nginx/PHP-FPM adalah rekomendasi deployment |

## Deployment Lokal

Ikuti [README.md](../README.md): buat database, salin `.env.example`, jalankan
`composer install`, `key:generate`, `migrate --seed`, `storage:link`, lalu
`npm install` dan `npm run dev`.

## Environment Production

Jangan commit `.env`, password database, atau secret ke repository.
Variabel minimum yang perlu disesuaikan:

| Variabel | Production |
|---|---|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_URL` | URL API HTTPS |
| `FRONTEND_URL` | URL frontend HTTPS |
| `SANCTUM_STATEFUL_DOMAINS` | host frontend stateful |
| `DB_CONNECTION` | `pgsql` |
| `DB_HOST`, `DB_PORT` | host/port PostgreSQL |
| `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | database production |
| `SESSION_DRIVER` | `database` pada implementasi saat ini |
| `SESSION_DOMAIN` | domain cookie yang sesuai |
| `FILESYSTEM_DISK` | `public` pada implementasi saat ini |
| `VITE_API_URL` | URL API saat build frontend |

Production perlu HTTPS karena auth bergantung pada cookie session dan CSRF.
CORS berasal dari `FRONTEND_URL` dan `supports_credentials` aktif di
`config/cors.php`.

## Backend

```bash
cd backend
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
```

Seeder hanya jalankan bila memang membutuhkan data demo:

```bash
php artisan db:seed
```

Arahkan document root web server ke `backend/public`, bukan ke root project.
Jika menggunakan PHP-FPM/Nginx, konfigurasi socket dan permission harus
disesuaikan dengan host deployment.

## Frontend

```bash
cd frontend
npm ci
npm run build
```

Serve directory `frontend/dist` melalui web server. Pastikan
`VITE_API_URL` sudah benar sebelum build karena Vite membundel konfigurasi
environment saat proses build.

## Logging dan Monitoring

Saat ini Laravel menulis log melalui `LOG_CHANNEL=stack`,
`LOG_STACK=single`, dan `LOG_LEVEL=debug` pada `.env.example`. Production
sebaiknya memakai level yang sesuai, mengumpulkan file log secara terpusat,
dan tidak mencatat password, cookie, atau credential.

Minimum monitoring:

- HTTP status 4xx/5xx dan latency API.
- Koneksi/error PostgreSQL.
- Kapasitas `storage/app/public`.
- Status PHP-FPM dan web server.
- Kegagalan migration, queue, atau upload bila komponen tersebut diaktifkan.

CDN, Redis, queue worker, object storage, read replica, dan autoscaling adalah
rancangan lanjutan, bukan dependency runtime default saat ini.

## Backup

Implementasi tidak menyediakan command backup khusus. Gunakan backup PostgreSQL
yang sesuai provider/host, contohnya:

```bash
pg_dump -U marketplace_user -h 127.0.0.1 marketplace_prod > backup.sql
psql -U marketplace_user -h 127.0.0.1 marketplace_prod < backup.sql
```

Backup file foto harus mencakup `backend/storage/app/public`. Untuk production
scale-out, lihat strategi snapshot/PITR dan object storage pada
[infrastructure.md](infrastructure.md).

## Troubleshooting

| Gejala | Pemeriksaan |
|---|---|
| `419 CSRF token mismatch` | Panggil `/sanctum/csrf-cookie` lebih dulu; gunakan origin yang sama dengan `FRONTEND_URL`; kirim credentials dan `X-XSRF-TOKEN` |
| `401 Unauthenticated` | Pastikan cookie session terkirim, `SANCTUM_STATEFUL_DOMAINS` benar, dan session store dapat ditulis |
| CORS error | Samakan origin browser dengan `FRONTEND_URL`; jangan mencampur `localhost` dan `127.0.0.1` |
| Foto tidak muncul | Pastikan path tersimpan, `APP_URL` benar, dan jalankan `php artisan storage:link` |
| `storage:link` gagal di Windows | Aktifkan Developer Mode atau jalankan terminal dengan permission yang sesuai |
| Koneksi PostgreSQL gagal | Periksa service PostgreSQL, host, port, nama database, username, dan password |
| `could not find driver` / PDO PostgreSQL | Aktifkan extension `pdo_pgsql` pada PHP CLI dan PHP-FPM yang digunakan |
| `429 Too Many Requests` | Route auth dibatasi 10/menit; route katalog dibatasi 60/menit |
| Upload ditolak | File harus image jpeg/png/jpg/webp, maksimal 2 MB per file, maksimal 5 file |
