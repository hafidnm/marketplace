# Dokumentasi API LaPak.

Base URL lokal: `http://localhost:8000/api`.
Endpoint CSRF berada di `http://localhost:8000/sanctum/csrf-cookie`.

Dokumentasi ini mengikuti `backend/routes/api.php`, controller, Form Request,
dan API Resource yang ada di repository.

## Autentikasi SPA

Frontend tidak memakai Bearer token. Alurnya:

1. Kirim `GET /sanctum/csrf-cookie` dengan credentials.
2. Browser menyimpan cookie `XSRF-TOKEN` dan cookie session.
3. Kirim `POST /api/register` atau `POST /api/login` dengan header
   `X-XSRF-TOKEN` dan credentials.
4. Request protected berikutnya mengirim cookie session yang sama.
5. `POST /api/logout` menghapus session secara server-side.

Axios frontend menggunakan `withCredentials: true` dan `withXSRFToken: true`.
Origin harus sama dengan `FRONTEND_URL`, misalnya `http://localhost:5173`.

Contoh dengan curl:

```bash
curl -c cookies.txt -b cookies.txt \
  -H "Accept: application/json" \
  http://localhost:8000/sanctum/csrf-cookie
```

Nilai cookie `XSRF-TOKEN` perlu di-URL-decode lalu dikirim sebagai
`X-XSRF-TOKEN`. Browser/Axios mengurus langkah ini otomatis.

## Format Response

Response sukses:

```json
{
  "success": true,
  "message": "Pesan hasil operasi.",
  "data": {}
}
```

Response error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data yang diberikan tidak valid.",
    "details": {}
  }
}
```

`details` hanya ada bila error menyediakan rincian validasi.

## Daftar Endpoint

| Method | Path | Auth | Throttle | Kegunaan |
|---|---|---|---|---|
| `POST` | `/register` | Tidak | 10/menit | Membuat user dan session |
| `POST` | `/login` | Tidak | 10/menit | Login dan membuat session |
| `GET` | `/me` | Ya | Tidak dedicated | User session saat ini |
| `POST` | `/logout` | Ya | Tidak dedicated | Invalidate session |
| `GET` | `/categories` | Tidak | 60/menit | Semua kategori + jumlah listing |
| `GET` | `/listings` | Tidak | 60/menit | Katalog, search, filter, pagination |
| `GET` | `/listings/:id` | Tidak | 60/menit | Detail listing |
| `GET` | `/users/:id` | Tidak | 60/menit | Profil publik penjual |
| `GET` | `/users/:id/listings` | Tidak | 60/menit | Listing milik user |
| `POST` | `/listings` | Ya | Tidak dedicated | Membuat listing |
| `PUT` | `/listings/:id` | Ya, owner | Tidak dedicated | Mengubah listing |
| `POST` | `/listings/:id/update` | Ya, owner | Tidak dedicated | Fallback update browser |
| `PATCH` | `/listings/:id/status` | Ya, owner | Tidak dedicated | Mengubah status |
| `DELETE` | `/listings/:id` | Ya, owner | Tidak dedicated | Menghapus listing |

Protected endpoint memakai `auth:sanctum`. Mutation listing juga memanggil
`ListingPolicy`, sehingga user lain mendapat `403`.

## Detail Endpoint

### Register

`POST /api/register`

Body JSON:

| Field | Wajib | Aturan |
|---|---|---|
| `name` | Ya | string, maksimal 255 |
| `email` | Ya | email valid, unik |
| `password` | Ya | minimal 8 karakter, harus cocok dengan `password_confirmation` |
| `password_confirmation` | Ya | konfirmasi password |
| `whatsapp` | Tidak | string, maksimal 30 |
| `location` | Tidak | string, maksimal 255 |

Response `201` berisi `data.user` dengan `id`, `name`, `email`, `whatsapp`,
`location`, `created_at`, dan `updated_at`.

### Login

`POST /api/login`

Body JSON: `email`, `password`. Response `200` berisi `data.user` dan
menetapkan session cookie. Credential salah menghasilkan `422` dengan code
`INVALID_CREDENTIALS`.

### Me dan Logout

`GET /api/me` mengembalikan `data` berupa user terautentikasi.
`POST /api/logout` mengembalikan sukses tanpa `data` dan meng-invalidate session.

```bash
curl -b cookies.txt -c cookies.txt \
  -H "Accept: application/json" \
  http://localhost:8000/api/me

curl -X POST -b cookies.txt -c cookies.txt \
  -H "Accept: application/json" \
  http://localhost:8000/api/logout
```

### Categories

`GET /api/categories` tidak memiliki parameter. Setiap item berisi `id`, `name`,
`slug`, dan `listings_count`.

### List Listings

`GET /api/listings`

Query parameter yang dibaca controller:

| Parameter | Keterangan |
|---|---|
| `q` | Search `name` atau `description` dengan PostgreSQL `ILIKE` |
| `category_id` | Filter ID kategori |
| `condition` | `NEW`, `LIKE_NEW`, `GOOD`, atau `FAIR` |
| `status` | `AVAILABLE` atau `SOLD` |
| `page` | Nomor halaman offset pagination Laravel |
| `per_page` | Default 12, dibatasi 1 sampai 50 |

Response `data` berisi struktur pagination Laravel: `data`, `current_page`,
`last_page`, `per_page`, `total`, dan metadata link lainnya. Item listing
berisi `id`, `name`, `description`, `price`, `condition`, `status`, `location`,
`category`, `seller`, `primary_image`, `images`, `created_at`, dan `updated_at`.

```bash
curl "http://localhost:8000/api/listings?q=bor&condition=LIKE_NEW&per_page=12" \
  -H "Accept: application/json"
```

### Detail Listing

`GET /api/listings/:id` mengembalikan satu item dengan kategori, seller,
primary image, dan semua images. Seller publik hanya berisi `id`, `name`,
`whatsapp`, dan `location`; email tidak dikembalikan.

ID yang tidak ditemukan menghasilkan `404` dengan code `NOT_FOUND`.

### Listing User

`GET /api/users/:id/listings`

Query `status`, `page`, dan `per_page` didukung. `per_page` dibatasi 1 sampai
50 dan response memakai struktur pagination Laravel. User yang tidak ditemukan
menghasilkan `404`.

### Profil publik penjual

`GET /api/users/:id`

Endpoint ini publik dan memakai throttle katalog `60/menit`. Response hanya
berisi data yang aman untuk profil publik:

```json
{
  "success": true,
  "message": "Profil penjual berhasil diambil.",
  "data": {
    "id": 1,
    "name": "Bambang",
    "location": "Jakarta",
    "whatsapp": "628123456789",
    "created_at": "2026-11-10T10:00:00+00:00",
    "available_listings_count": 4,
    "sold_listings_count": 2
  }
}
```

Email, password, dan field internal tidak dikembalikan. User yang tidak
ditemukan menghasilkan `404`. Frontend menampilkan profil ini pada
`/penjual/:id`; jika ID adalah user yang sedang login, frontend mengarahkan ke
`/profile`. Profil publik tidak menyediakan tombol edit, hapus, atau ubah
status.

### Create Listing

`POST /api/listings` memakai `multipart/form-data` dan wajib authenticated.

| Field | Wajib | Aturan |
|---|---|---|
| `category_id` | Ya | harus ada di `categories.id` |
| `name` | Ya | string, maksimal 255 |
| `description` | Ya | string |
| `price` | Ya | integer minimal 0 |
| `condition` | Ya | `NEW`, `LIKE_NEW`, `GOOD`, `FAIR` |
| `location` | Ya | string, maksimal 255 |
| `images[]` | Ya | array 1 sampai 5 file |
| `images.*` | Ya | jpeg/png/jpg/webp, maksimal 2048 KB per file |

Status awal selalu `AVAILABLE`. File disimpan melalui disk `public` dan path
disimpan di `listing_images`.

### Update Listing

`PUT /api/listings/:id` atau `POST /api/listings/:id/update` memakai body
JSON atau multipart. Semua field listing bersifat opsional, tetapi bila
dikirim harus memenuhi aturan validasi create. Foto baru ditambahkan ke galeri;
foto lama tidak diganti otomatis.

Hanya owner yang boleh mengubah. Response `200` berisi listing terbaru.

### Update Status

`PATCH /api/listings/:id/status` dengan body:

```json
{"status": "SOLD"}
```

Nilai hanya `AVAILABLE` atau `SOLD`.

### Delete Listing

`DELETE /api/listings/:id` hanya untuk owner. File lokal yang bukan URL HTTP
juga dihapus dari disk `public`. Response `200` berisi `success` dan `message`.

## Kode Error

| HTTP | Code | Kondisi |
|---:|---|---|
| 401 | `UNAUTHENTICATED` | Tidak ada atau session sudah berakhir |
| 403 | `FORBIDDEN` | Bukan owner listing |
| 404 | `NOT_FOUND` | User, listing, atau resource tidak ditemukan |
| 422 | `VALIDATION_ERROR` | Form Request gagal; login salah memakai `INVALID_CREDENTIALS` |
| 429 | `TOO_MANY_REQUESTS` | Throttle Laravel terlampaui |

## Contoh Create Listing

```bash
curl -X POST http://localhost:8000/api/listings \
  -b cookies.txt -c cookies.txt \
  -H "Accept: application/json" \
  -H "X-XSRF-TOKEN: <decoded-xsrf-token>" \
  -F "category_id=1" \
  -F "name=Bor Cordless" \
  -F "description=Kondisi baik" \
  -F "price=450000" \
  -F "condition=GOOD" \
  -F "location=Jakarta Selatan" \
  -F "images[]=@foto.jpg"
```
