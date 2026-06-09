# Final-Project-RPL-
Final Project RPL Kelompok 2 Kelas B Mata Kuliah RPL

# LockER

LockER adalah sistem informasi berbasis web yang dirancang untuk menghubungkan perusahaan dengan pencari kerja secara langsung. Platform ini mengusung konsep *career expo digital*, sehingga proses rekrutmen menjadi lebih cepat, efisien, dan transparan.


## Anggota Kelompok

| Rafy Dhia Najmi Ilham | L0124140 | Project Manager |
| Rizky Rafif Putra Pratama | L0124255 | Developer |
| Rahmat Daniel | L0124141 | Developer |
| Laila Khoirunnisa | L0122087 | Quality Assurance |

## Fitur Utama
1. Registrasi & Login 
2. Profil User & Perusahaan
3. Posting Lowongan Kerja
4. Apply Pekerjaan
5. Carrer Expo

## Tech Stack
HTML, CSS, Laravel, PHP, MySql

## Panduan Instalasi (Untuk Developer Baru)

Berikut adalah langkah-langkah untuk mengatur dan menjalankan proyek ini di lingkungan lokal (localhost):

1. **Clone Repository & Masuk ke Direktori Proyek**
   ```bash
   git clone <url-repo-ini>
   cd Praktikum-RPL-B-2/src/locker_project
   ```

2. **Install Dependencies**
   Pastikan PHP, Composer, dan Node.js sudah terinstal.
   ```bash
   composer install
   npm install
   ```

3. **Konfigurasi Environment (.env)**
   Salin file konfigurasi dan sesuaikan pengaturannya.
   ```bash
   cp .env.example .env
   ```
   Buka file `.env` dan atur koneksi database menjadi MySQL (ubah sesuai konfigurasi database komputermu):
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=locker_project
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. **Generate Application Key**
   ```bash
   php artisan key:generate
   ```

5. **Buat Database & Jalankan Migrasi**
   - Pastikan MySQL (melalui XAMPP, Herd, dll.) sudah berjalan.
   - Buat database kosong bernama `locker_project`.
   - Jalankan perintah berikut untuk membuat struktur tabel:
   ```bash
   php artisan migrate
   ```

6. **Jalankan Server Lokal**
   Buka terminal baru untuk masing-masing perintah berikut:
   
   Untuk menjalankan server backend Laravel:
   ```bash
   php artisan serve
   ```
   
   Untuk me-compile aset frontend (Vite/Tailwind):
   ```bash
   npm run dev
   ```

7. **Jalankan Web Socket**
   Buka terminal baru untuk masing-masing perintah berikut:

   Untuk menginstall Laravel Reverb:
   ```bash
   php artisan reverb:install
   ```
   
   Untuk menjalankan Laravel Reverb:
   ```bash
   php artisan reverb:start
   ```

Aplikasi sekarang dapat diakses melalui browser di `http://127.0.0.1:8000`.
