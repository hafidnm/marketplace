# Architecture Decision Records

Format setiap ADR: **Konteks**, **Keputusan**, **Alternatif**, dan
**Konsekuensi**.

## ADR-001: Laravel sebagai Backend API

**Status:** Diterima

### Konteks

Backend membutuhkan REST API, Form Request, Policy, Eloquent, Resource, dan
integrasi Sanctum.

### Keputusan

Gunakan Laravel sebagai backend API.

### Alternatif

Node.js dengan Express/NestJS atau framework PHP lain.

### Konsekuensi

Laravel menyediakan konvensi dan komponen yang langsung dipakai repository.
Tim mengikuti lifecycle Laravel dan kebutuhan PHP/Composer.

## ADR-002: PostgreSQL sebagai Database

**Status:** Diterima

### Konteks

Migration memakai foreign key, enum `condition`/`status`, index filter,
dan controller memakai operator PostgreSQL `ILIKE`.

### Keputusan

Gunakan PostgreSQL untuk development dan deployment.

### Alternatif

SQLite atau MySQL.

### Konsekuensi

Behavior search lokal konsisten dengan target PostgreSQL. Environment harus
menyediakan PostgreSQL dan ekstensi PHP `pdo_pgsql`.

## ADR-003: Sanctum SPA Cookie Session

**Status:** Diterima

### Konteks

Frontend first-party berjalan pada origin terpisah dari API dan membutuhkan
session yang bertahan saat refresh. Repository sempat menggunakan personal
access token/Bearer dengan `createToken`, tetapi alur itu kemudian dikembalikan.

### Keputusan

Gunakan Sanctum SPA cookie/session: `statefulApi`, CSRF cookie, web guard,
session regenerate saat register/login, dan invalidate saat logout.

### Alternatif

Bearer token di header `Authorization`, disimpan di client; pendekatan ini
sempat dicoba tetapi bukan mode yang dipakai sekarang.

### Konsekuensi

Browser/Axios wajib mengirim credentials dan `X-XSRF-TOKEN`. CORS harus
mengizinkan origin frontend secara eksplisit. Session tidak disimpan di
`localStorage`, tetapi browser tetap bergantung pada cookie dan session store.

## ADR-004: React SPA Terpisah

**Status:** Diterima

### Konteks

Frontend membutuhkan navigasi client-side, katalog interaktif, form upload, dan
state auth di browser.

### Keputusan

Gunakan React + Vite + TypeScript sebagai aplikasi SPA terpisah dari Laravel API.

### Alternatif

Blade/server-rendered UI dalam project Laravel yang sama.

### Konsekuensi

Frontend dan backend memiliki proses development serta environment URL sendiri.
CORS, Sanctum stateful domain, dan build frontend perlu dikonfigurasi konsisten.

## ADR-005: Link WhatsApp `wa.me`

**Status:** Diterima

### Konteks

Fitur wajib hanya memerlukan kontak penjual dengan pesan awal otomatis.

### Keputusan

Frontend membuat link WhatsApp melalui `wa.me`; isi chat tidak disimpan di API.

### Alternatif

Membangun chat internal, menyimpan thread, dan mengelola delivery status.

### Konsekuensi

Implementasi sederhana dan tidak membutuhkan messaging backend. Percakapan,
delivery, dan availability tetap bergantung pada WhatsApp.

## ADR-006: Upload Lokal sebagai MVP

**Status:** Diterima

### Konteks

Controller saat ini menerima multipart upload, memvalidasi 1 sampai 5 gambar,
lalu menyimpan file dengan `Storage::disk('public')`.

### Keputusan

Gunakan local public disk untuk MVP dan simpan relative path pada
`listing_images.path`. URL response dibuat oleh `ListingResource`.

### Alternatif

Presigned upload ke S3-compatible object storage atau service image khusus.

### Konsekuensi

Setup lokal sederhana dan behavior dapat diuji tanpa cloud. Untuk scale-out,
storage lokal perlu diganti atau disinkronkan ke object storage; resize
thumbnail dan CDN belum menjadi implementasi saat ini.
