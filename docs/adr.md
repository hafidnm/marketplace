# Architecture Decision Records (ADR)

Dokumen ini mencatat keputusan arsitektur yang diambil selama pengembangan Marketplace Bapak-Bapak beserta alasan dan konsekuensinya.

---

## ADR-001: Sanctum Bearer Token (Stateless) vs Cookie Session

**Status**: Diterima  
**Tanggal**: 2026-11-10

### Konteks

Laravel Sanctum mendukung dua mode:
1. **SPA Cookie-based** (`EnsureFrontendRequestsAreStateful`) — cocok untuk same-domain atau subdomain
2. **API Token (Bearer)** — cocok untuk cross-origin atau mobile client

Frontend berjalan di `localhost:5173`, backend di `localhost:8000` — berbeda port = cross-origin.

### Keputusan

Gunakan **Bearer Token** (Sanctum `createToken()`). Token disimpan di `localStorage` dan dikirim sebagai header `Authorization: Bearer <token>`.

### Alasan

- Tidak perlu konfigurasi cookie SameSite yang kompleks untuk cross-origin localhost dev
- Lebih mudah ditest via `curl` dan Postman tanpa setup session/cookie
- Stateless — cocok untuk eventual mobile app di masa depan
- `getCsrfCookie()` tetap dipanggil sebelum login/register sebagai best practice (meski tidak wajib untuk token mode)

### Konsekuensi

- Token di `localStorage` rentan terhadap XSS — mitigasi: sanitasi input, CSP header di production
- Logout harus menghapus token secara eksplisit dari `localStorage`
- Tidak ada `refresh token` — expired token = user harus login ulang

---

## ADR-002: PostgreSQL sebagai Satu-satunya Database (tanpa SQLite)

**Status**: Diterima  
**Tanggal**: 2026-11-10

### Konteks

Laravel default menggunakan SQLite untuk testing (lebih cepat setup). Namun, fitur `ILIKE` (case-insensitive search PostgreSQL) tidak tersedia di SQLite.

### Keputusan

Gunakan **PostgreSQL** di semua environment (dev, test, production). `phpunit.xml` dikonfigurasi untuk tidak override `DB_CONNECTION`, sehingga test berjalan di PostgreSQL yang sama dengan development.

### Alasan

- `ILIKE` adalah fitur kunci untuk pencarian produk yang case-insensitive tanpa `LOWER()` workaround
- Enum column (`condition`, `status`) lebih ekspresif di PostgreSQL
- Konsistensi behavior dev vs production — tidak ada "works on my machine" issue
- PostgreSQL 17.4 sudah terinstall lokal, tidak perlu Docker

### Konsekuensi

- Setup testing memerlukan PostgreSQL aktif — tidak bisa run test tanpa DB
- Perlu buat database `marketplace_test` terpisah untuk testing (opsional)
- CI/CD pipeline perlu setup PostgreSQL service (tidak SQLite)

---

## ADR-003: Laravel Storage Abstraction (Public Disk)

**Status**: Diterima  
**Tanggal**: 2026-11-10

### Konteks

Foto listing perlu disimpan dan diakses via URL publik. Pilihan:
1. Store di `public/images/` langsung (tidak via Storage)
2. Store via `Storage::disk('public')` → symlink `public/storage`
3. Store di cloud (S3, Cloudinary)

### Keputusan

Gunakan **`Storage::disk('public')`** dengan symlink `public/storage → storage/app/public`.

### Alasan

- Abstraksi Storage memudahkan migrasi ke S3 cukup ganti disk di `config/filesystems.php`
- Path yang tersimpan di DB adalah relative path (`listings/xxx.jpg`) — tidak hardcode URL
- `Storage::url($path)` otomatis resolve ke URL yang benar berdasarkan `APP_URL`
- Symlink dibuat via `php artisan storage:link` (Windows: `cmd /c mklink /J`)

### Konsekuensi

- Perlu menjalankan `php artisan storage:link` setelah deploy baru
- Di Windows, symlink memerlukan hak admin atau Developer Mode aktif
- File foto tidak ikut version control (`.gitignore: storage/app/public/listings/`)

---

## ADR-004: Form Request untuk Semua Validasi Input

**Status**: Diterima  
**Tanggal**: 2026-11-10

### Konteks

Validasi input API bisa dilakukan:
1. Langsung di controller dengan `$request->validate()`
2. Menggunakan dedicated **Form Request** class

### Keputusan

Semua endpoint validasi menggunakan **Form Request** class yang terpisah.

### Alasan

- Single Responsibility: controller hanya handle logic, Form Request handle validasi
- Reusable: `UpdateListingRequest` bisa dipakai di banyak controller
- Testable: validasi bisa ditest terpisah dari controller
- Konsisten dengan spesifikasi CLAUDE.md

### Konsekuensi

- File count lebih banyak (6 Form Request class)
- Tim harus tahu konvensi Form Request untuk onboarding

---

## ADR-005: ListingPolicy untuk Ownership Check

**Status**: Diterima  
**Tanggal**: 2026-11-10

### Konteks

Endpoint edit, delete, dan updateStatus listing hanya boleh diakses oleh **pemilik** listing. Implementasi bisa:
1. Manual check `if ($listing->user_id !== auth()->id()) abort(403)`
2. Gate/Policy via `$this->authorize()`

### Keputusan

Gunakan **`ListingPolicy`** dengan `$this->authorize('update', $listing)` di controller.

### Alasan

- Separation of concerns: authorization logic terpusat di Policy
- Testable secara terpisah via `actingAs()->can()`
- Laravel best practice — konsisten dengan spesifikasi
- Error response otomatis `403 Forbidden` via exception handler

### Konsekuensi

- Perlu register policy di `AuthServiceProvider` (atau auto-discovery)
- Tambahan file: `ListingPolicy.php`

---

## ADR-006: SellerResource yang Minimal (Privacy-First)

**Status**: Diterima  
**Tanggal**: 2026-11-10

### Konteks

Detail listing perlu menyertakan info penjual. Data apa yang boleh di-expose?

- `UserResource` untuk `/api/me` — expose semua termasuk email
- Info penjual di halaman publik listing detail — email sensitif

### Keputusan

Buat **`SellerResource`** terpisah yang hanya berisi: `id`, `name`, `whatsapp`, `location`. Email dan password **tidak pernah** ada di response publik.

### Alasan

- Privacy: email penjual tidak perlu diketahui pembeli — WhatsApp cukup
- Mencegah email harvesting dari API publik
- Sesuai spesifikasi: "Info penjual cukup name, whatsapp, location (jangan expose email/password)"

### Konsekuensi

- Dua Resource class untuk User: `UserResource` (private) dan `SellerResource` (public)
- Developer harus ingat untuk pakai `SellerResource` (bukan `UserResource`) di `ListingResource`

---

## ADR-007: Tailwind CSS v4 (tanpa tailwind.config.js)

**Status**: Diterima  
**Tanggal**: 2026-11-10

### Konteks

Tailwind v4 mengubah cara konfigurasi — tidak lagi menggunakan `tailwind.config.js`, melainkan via plugin Vite dan CSS `@import`.

### Keputusan

Gunakan **Tailwind CSS v4** dengan `@tailwindcss/vite` plugin. Konfigurasi di `vite.config.ts`:
```ts
import tailwindcss from '@tailwindcss/vite';
// plugins: [react(), tailwindcss()]
```
Dan di CSS: `@import "tailwindcss";`

### Alasan

- Tailwind v4 lebih cepat (Oxide engine)
- Zero config untuk use-case standar
- Vite native integration — tidak perlu PostCSS config terpisah

### Konsekuensi

- **Breaking**: `tailwind.config.js` tidak digunakan — jangan buat, akan diabaikan
- Custom theme harus didefinisikan via CSS variables di `index.css` (bukan `theme.extend`)
- Beberapa plugin v3 mungkin tidak kompatibel dengan v4
