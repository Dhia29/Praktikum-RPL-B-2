# Bug Report – Sistem LockER
**Rekayasa Perangkat Lunak – [02] Kelas B | Universitas Sebelas Maret Surakarta 2026**
 
---
 
## BUG-001
 
**Judul:** [BUG] Login dengan Google OAuth gagal – proses macet dan memunculkan halaman error
 
**Severity:** Critical
 
**Steps to Reproduce:**
1. Akses halaman login utama sistem LockER
2. Klik tombol **Lanjutkan dengan Google** di bagian atas formulir login
3. Pilih akun Google aktif pada jendela otentikasi yang muncul
4. Tunggu respons sistem
**Expected:**
Sistem sukses mengautentikasi akun pengguna lewat Google OAuth dan mengarahkan masuk ke dashboard sesuai hak aksesnya (Admin / Perusahaan / Pencari Kerja).
 
**Actual:**
Sistem mengalami bug — proses autentikasi macet dan memunculkan halaman error, pengguna tidak dapat masuk ke dashboard.
 
**Screenshot:** [Lihat folder screenshot di Google Drive](https://drive.google.com/drive/folders/1PewatPBNd2wZDPBAyswrd0Im7iqSpUdM?usp=sharing)
 
**Environment:**
- Browser: -
- OS: -
- Versi Aplikasi: LockER v1.0 (2026)
---
 
## BUG-002
 
**Judul:** [BUG] Fitur pencarian lowongan kerja tidak berfungsi (Pencari Kerja)
 
**Severity:** High
 
**Steps to Reproduce:**
1. Login sebagai Pencari Kerja
2. Navigasi ke halaman menu **Loker**
3. Klik pada kolom input **Pencarian**
4. Ketik kata kunci yang valid (misal: "Developer" atau "Marketing")
5. Tekan Enter dan amati pembaruan daftar lowongan
**Expected:**
Daftar lowongan otomatis terfilter dan hanya menampilkan loker yang sesuai dengan kata kunci yang dimasukkan.
 
**Actual:**
Pencarian tidak dapat berjalan — daftar lowongan tidak berubah setelah memasukkan kata kunci.
 
**Screenshot:** [Lihat folder screenshot di Google Drive](https://drive.google.com/drive/folders/1PewatPBNd2wZDPBAyswrd0Im7iqSpUdM?usp=sharing)
 
**Environment:**
- Browser: -
- OS: -
- Versi Aplikasi: LockER v1.0 (2026)
---
 
## BUG-003
 
**Judul:** [BUG] Upload foto profil gagal – foto baru tidak berhasil terunggah ke server (Pencari Kerja)
 
**Severity:** Medium
 
**Steps to Reproduce:**
1. Login sebagai Pencari Kerja
2. Akses halaman **Profil Saya** melalui pojok kanan atas
3. Klik ikon kamera atau tombol **Ubah Foto**
4. Pilih file gambar berekstensi `.jpg` atau `.png` berukuran 1MB
5. Klik tombol **Simpan Foto**
**Expected:**
Sistem sukses mengunggah foto baru ke server, memperbarui tampilan avatar di halaman profil dan navbar secara real-time.
 
**Actual:**
Foto profil baru gagal terunggah — tidak ada perubahan pada avatar yang ditampilkan di halaman profil maupun navbar.
 
**Screenshot:** [Lihat folder screenshot di Google Drive](https://drive.google.com/drive/folders/1PewatPBNd2wZDPBAyswrd0Im7iqSpUdM?usp=sharing)
 
**Environment:**
- Browser: -
- OS: -
- Versi Aplikasi: LockER v1.0 (2026)
---
 
## BUG-004
 
**Judul:** [BUG] Fitur pencarian lowongan kerja tidak berfungsi (Perusahaan)
 
**Severity:** High
 
**Steps to Reproduce:**
1. Login sebagai akun Perusahaan
2. Navigasi ke halaman menu **Loker**
3. Klik pada kolom input **Pencarian**
4. Ketik kata kunci yang valid
5. Tekan Enter dan amati pembaruan daftar lowongan
**Expected:**
Daftar lowongan otomatis terfilter dan hanya menampilkan loker yang sesuai dengan pencarian.
 
**Actual:**
Pencarian tidak dapat berjalan — daftar lowongan tidak diperbarui setelah memasukkan kata kunci.
 
**Screenshot:** [Lihat folder screenshot di Google Drive](https://drive.google.com/drive/folders/1PewatPBNd2wZDPBAyswrd0Im7iqSpUdM?usp=sharing)
 
**Environment:**
- Browser: -
- OS: -
- Versi Aplikasi: LockER v1.0 (2026)
---
 
## BUG-005
 
**Judul:** [BUG] Tombol Keluar Sistem (Logout) tidak merespons – sesi pengguna tidak terhapus
 
**Severity:** Critical
 
**Steps to Reproduce:**
1. Login ke sistem LockER (sebagai Pencari Kerja, Perusahaan, atau Admin)
2. Perhatikan menu navigasi paling bawah di sidebar kiri
3. Klik tombol **Keluar Sistem**
4. Amati respons sistem
**Expected:**
Sistem menghapus sesi masuk (session) yang aktif saat ini dan mengarahkan kembali pengguna ke gerbang login utama.
 
**Actual:**
Tombol tidak merespons (macet), sesi pengguna tidak terhapus, dan halaman tidak berpindah ke menu login — pengguna tetap berada di halaman panel tanpa perubahan apapun.
 
**Screenshot:** [Lihat folder screenshot di Google Drive](https://drive.google.com/drive/folders/1PewatPBNd2wZDPBAyswrd0Im7iqSpUdM?usp=sharing)
 
**Environment:**
- Browser: -
- OS: -
- Versi Aplikasi: LockER v1.0 (2026)