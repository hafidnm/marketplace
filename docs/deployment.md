# Panduan Deployment – Marketplace Bapak-Bapak

> Panduan ini mencakup proses deployment ke server production Linux (Ubuntu 22.04+) dengan Nginx + PHP-FPM + PostgreSQL. Untuk development lokal, lihat README.md.

---

## Prasyarat Server

| Komponen | Versi Minimal | Perintah cek |
|----------|---------------|--------------|
| PHP | 8.2+ | `php -v` |
| Composer | 2.x | `composer -V` |
| Node.js | 20+ | `node -v` |
| PostgreSQL | 14+ | `psql --version` |
| Nginx | 1.18+ | `nginx -v` |

---

## 1. Persiapan Server

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install PHP 8.3 + ekstensi
sudo apt install -y php8.3-fpm php8.3-pgsql php8.3-mbstring \
  php8.3-xml php8.3-curl php8.3-zip php8.3-bcmath php8.3-fileinfo

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx
```

---

## 2. Setup Database

```bash
# Buat user dan database
sudo -u postgres psql <<EOF
CREATE USER marketplace_user WITH PASSWORD 'your_strong_password';
CREATE DATABASE marketplace_prod OWNER marketplace_user;
GRANT ALL PRIVILEGES ON DATABASE marketplace_prod TO marketplace_user;
EOF
```

---

## 3. Clone dan Setup Backend

```bash
# Clone project
git clone <repo-url> /var/www/marketplace
cd /var/www/marketplace/backend

# Install dependencies
composer install --optimize-autoloader --no-dev

# Konfigurasi environment
cp .env.example .env
# Edit .env:
nano .env
```

**Isi `.env` untuk production:**

```dotenv
APP_NAME="Marketplace Bapak-Bapak"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=marketplace_prod
DB_USERNAME=marketplace_user
DB_PASSWORD=your_strong_password

FRONTEND_URL=https://yourdomain.com

FILESYSTEM_DISK=public
```

```bash
# Generate key
php artisan key:generate

# Jalankan migration + seeder (opsional untuk production)
php artisan migrate --force

# Buat symlink storage
php artisan storage:link

# Optimasi
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
sudo chown -R www-data:www-data /var/www/marketplace/backend
sudo chmod -R 755 /var/www/marketplace/backend/storage
sudo chmod -R 755 /var/www/marketplace/backend/bootstrap/cache
```

---

## 4. Build Frontend

```bash
cd /var/www/marketplace/frontend

# Install dependencies
npm ci

# Set environment
cp .env.example .env.production.local
# Edit: VITE_API_URL=https://api.yourdomain.com
nano .env.production.local

# Build untuk production
npm run build
# Output: dist/ folder siap serve
```

---

## 5. Konfigurasi Nginx

### Backend API (PHP-FPM)

```nginx
# /etc/nginx/sites-available/marketplace-api
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/marketplace/backend/public;

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location /storage {
        alias /var/www/marketplace/backend/storage/app/public;
    }

    client_max_body_size 10M;  # Untuk upload foto

    location ~ /\.ht {
        deny all;
    }
}
```

### Frontend (Static SPA)

```nginx
# /etc/nginx/sites-available/marketplace-frontend
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/marketplace/frontend/dist;

    index index.html;

    # SPA routing — semua request ke index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Aktifkan sites
sudo ln -s /etc/nginx/sites-available/marketplace-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/marketplace-frontend /etc/nginx/sites-enabled/

# Test dan reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. SSL dengan Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx

# Issue certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Auto-renewal (sudah otomatis via systemd timer)
sudo systemctl status certbot.timer
```

---

## 7. Update CORS untuk Production

Edit `backend/.env`:

```dotenv
FRONTEND_URL=https://yourdomain.com
```

Backend `config/cors.php` sudah menggunakan `env('FRONTEND_URL')` untuk `allowed_origins`.

---

## 8. Proses Deploy Update (CI/CD Manual)

```bash
cd /var/www/marketplace

# Pull changes
git pull origin main

# Backend
cd backend
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Frontend
cd ../frontend
npm ci
npm run build

# Restart PHP-FPM jika ada perubahan PHP
sudo systemctl restart php8.3-fpm
```

---

## 9. Monitoring & Logs

```bash
# Laravel logs
tail -f /var/www/marketplace/backend/storage/logs/laravel.log

# Nginx access log
tail -f /var/log/nginx/access.log

# Nginx error log
tail -f /var/log/nginx/error.log

# PHP-FPM log
tail -f /var/log/php8.3-fpm.log

# PostgreSQL log
sudo tail -f /var/log/postgresql/postgresql-*.log
```

---

## 10. Backup Database

```bash
# Backup manual
pg_dump -U marketplace_user -h 127.0.0.1 marketplace_prod > backup_$(date +%Y%m%d).sql

# Restore
psql -U marketplace_user -h 127.0.0.1 marketplace_prod < backup_20261110.sql
```

---

## Troubleshooting Umum

| Masalah | Solusi |
|---------|--------|
| `500 Internal Server Error` | Cek `storage/logs/laravel.log`, pastikan `APP_DEBUG=false` |
| Upload foto gagal | Cek permission `storage/app/public`, cek `client_max_body_size` Nginx |
| CORS error di browser | Pastikan `FRONTEND_URL` di `.env` sesuai origin frontend |
| Storage URL `null` | Jalankan `php artisan storage:link`, pastikan `APP_URL` benar |
| Throttle 429 | Tunggu 1 menit, atau hapus cache: `php artisan cache:clear` |
