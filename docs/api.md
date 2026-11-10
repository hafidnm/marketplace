# Dokumentasi REST API - Marketplace Bapak-Bapak

Dokumen ini berisi spesifikasi lengkap REST API untuk platform Marketplace Secondhand Komunitas Bapak-Bapak.

- **Base URL**: `http://localhost:8000/api`
- **Default Headers**:
  - `Accept: application/json`
  - `Content-Type: application/json` (kecuali upload multipart)
  - `Authorization: Bearer <TOKEN>` (untuk endpoint terproteksi)

---

## 1. Format Response & Error Handling

### Response Sukses
Format standar response sukses:
```json
{
  "success": true,
  "message": "Pesan deskriptif aksi yang berhasil.",
  "data": { ... }
}
```

### Response Error Konsisten
Sesuai arsitektur, seluruh error respons diformat seragam dengan objek `error`:
```json
{
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHENTICATED | FORBIDDEN | NOT_FOUND | TOO_MANY_REQUESTS | BAD_REQUEST",
    "message": "Deskripsi pesan error.",
    "details": { ... } // opsional, berisi rincian validasi per field
  }
}
```

---

## 2. Rate Limiting

- **Auth Endpoints (`/api/register`, `/api/login`)**: Strict throttle **10 requests per minute** (`throttle:10,1`).
- **General Endpoints**: **60 requests per minute** (`throttle:60,1`).

---

## 3. Daftar Endpoint

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/api/register` | Publik | Registrasi pengguna baru |
| `POST` | `/api/login` | Publik | Login & peroleh Sanctum token / sesi |
| `POST` | `/api/logout` | Sanctum | Logout & revocasi token aktif |
| `GET` | `/api/me` | Sanctum | Mendapatkan data profil pengguna yang login |
| `GET` | `/api/categories` | Publik | Daftar kategori barang & jumlah listing |
| `GET` | `/api/listings` | Publik | Katalog barang (search, filter, pagination) |
| `GET` | `/api/listings/{id}` | Publik | Detail lengkap barang + info penjual + foto |
| `POST` | `/api/listings` | Sanctum | Pasang barang baru (multipart, max 5 foto) |
| `PUT` | `/api/listings/{id}` | Sanctum (Owner) | Perbarui informasi barang dagangan |
| `PATCH` | `/api/listings/{id}/status` | Sanctum (Owner) | Ubah status barang (`AVAILABLE` atau `SOLD`) |
| `DELETE` | `/api/listings/{id}` | Sanctum (Owner) | Hapus listing beserta file gambarnya |
| `GET` | `/api/users/{id}/listings` | Publik | Daftar barang yang dijual oleh user tertentu |

---

## 4. Contoh cURL untuk Setiap Endpoint

### A. Auth Endpoints

#### 1. Registrasi Akun (`POST /api/register`)
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pak Sugeng Santoso",
    "email": "sugeng@marketplace.test",
    "password": "password123",
    "password_confirmation": "password123",
    "whatsapp": "6281234567899",
    "location": "Jakarta Timur"
  }'
```

#### 2. Login (`POST /api/login`)
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bambang@marketplace.test",
    "password": "password123"
  }'
```

#### 3. Cek Profil Saya (`GET /api/me`)
```bash
curl -X GET http://localhost:8000/api/me \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <TOKEN>"
```

#### 4. Logout (`POST /api/logout`)
```bash
curl -X POST http://localhost:8000/api/logout \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <TOKEN>"
```

---

### B. Kategori & Katalog Barang

#### 5. Daftar Kategori (`GET /api/categories`)
```bash
curl -X GET http://localhost:8000/api/categories \
  -H "Accept: application/json"
```

#### 6. Jelajah & Pencarian Barang (`GET /api/listings`)
Mendukung query parameter:
- `q`: Pencarian teks pada judul atau deskripsi (menggunakan PostgreSQL `ILIKE`)
- `category_id`: Filter berdasarkan ID kategori
- `condition`: Filter kondisi (`NEW`, `LIKE_NEW`, `GOOD`, `FAIR`)
- `status`: Filter ketersediaan (`AVAILABLE`, `SOLD`)
- `page`: Nomor halaman (default `1`)
- `per_page`: Jumlah item per halaman (default `12`, maks `50`)

Contoh pencarian barang perkakas kondisi Like New:
```bash
curl -X GET "http://localhost:8000/api/listings?q=Cordless&condition=LIKE_NEW&status=AVAILABLE&page=1" \
  -H "Accept: application/json"
```

#### 7. Detail Barang (`GET /api/listings/{id}`)
*Catatan Keamanan*: Endpoint ini mengembalikan data penjual via `SellerResource` yang hanya memuat nama, nomor WhatsApp, dan domisili tanpa pernah mengekspos email atau kata sandi penjual.
```bash
curl -X GET http://localhost:8000/api/listings/1 \
  -H "Accept: application/json"
```

#### 8. Listing Milik User Tertentu (`GET /api/users/{id}/listings`)
```bash
curl -X GET "http://localhost:8000/api/users/1/listings?page=1" \
  -H "Accept: application/json"
```

---

### C. Kelola Barang (Owner Only / Authenticated)

#### 9. Pasang Barang Baru (`POST /api/listings`)
Menggunakan format `multipart/form-data` dengan maksimal 5 gambar (maks 2MB per gambar).
```bash
curl -X POST http://localhost:8000/api/listings \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -F "category_id=1" \
  -F "name=Gergaji Mesin Jigsaw Makita M4301B" \
  -F "description=Mulus terawat, pisau gergaji tajam bonus 3 pcs, pemakaian pribadi." \
  -F "price=450000" \
  -F "condition=LIKE_NEW" \
  -F "location=Jakarta Selatan" \
  -F "images[]=@/path/to/foto1.jpg" \
  -F "images[]=@/path/to/foto2.jpg"
```

#### 10. Edit Barang (`PUT /api/listings/{id}`)
Hanya pemilik barang yang diizinkan mengedit (diverifikasi via `ListingPolicy`).
```bash
curl -X PUT http://localhost:8000/api/listings/1 \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "Bor Cordless Bosch GSB 120-LI (Nego Tipis)",
    "price": 700000,
    "description": "Deskripsi diperbarui: sudah termasuk mata obeng cadangan."
  }'
```

#### 11. Ubah Status Ketersediaan (`PATCH /api/listings/{id}/status`)
Mengubah status menjadi `AVAILABLE` atau `SOLD` (hanya pemilik barang).
```bash
curl -X PATCH http://localhost:8000/api/listings/1/status \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "status": "SOLD"
  }'
```

#### 12. Hapus Barang (`DELETE /api/listings/{id}`)
Menghapus barang dari database serta menghapus file gambar fisiknya dari storage publik.
```bash
curl -X DELETE http://localhost:8000/api/listings/1 \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <TOKEN>"
```
