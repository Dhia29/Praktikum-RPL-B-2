# Identifikasi Role dan User Story

Dokumen ini memuat 8 Role/User Story utama beserta kriteria penerimaannya (Acceptance Criteria) untuk platform LockER.

### 1. Register sebagai Pencari Kerja
**User Story:** *As a* pencari kerja, *I want to* mendaftar akun baru menggunakan email dan password, *So that* saya dapat mengakses fitur platform dan melamar pekerjaan.

**Acceptance Criteria:**
* **Skenario 1: Registrasi Berhasil**
  * **Given** saya berada di halaman Register dan memilih role “Pencari Kerja”,
  * **When** saya mengisi nama lengkap, email yang belum terdaftar, password minimal 8 karakter, dan konfirmasi password yang sesuai, lalu menekan tombol “Daftar”,
  * **Then** sistem membuat akun baru, mengirimkan email verifikasi, dan menampilkan pesan “Registrasi BERHASIL! Silahkan cek email Anda untuk verifikasi.”
* **Skenario 2: Email Sudah Terdaftar**
  * **Given** saya berada di halaman Register,
  * **When** saya mengisi email yang sudah terdaftar di sistem, lalu menekan tombol “Daftar”,
  * **Then** sistem menampilkan pesan error “Email sudah digunakan, silahkan gunakan email lain.” dan tidak membuat akun baru.

---

### 2. Register sebagai Perusahaan
**User Story:** *As a* perusahaan, *I want to* mendaftar akun dengan menyertakan identitas perusahaan, *So that* saya dapat memposting lowongan dan mengelola pelamar.

**Acceptance Criteria:**
* **Skenario 1: Pendaftaran Menunggu Verifikasi**
  * **Given** saya berada di halaman Register dan memilih role “Perusahaan”,
  * **When** saya mengisi semua field wajib (nama perusahaan, email, password, bidang industri, nomor NPWP) lalu menekan tombol “Daftar”,
  * **Then** sistem menyimpan data perusahaan dengan status “Menunggu Verifikasi”, mengirim notifikasi ke Admin, dan menampilkan pesan “Pendaftaran Anda sedang ditinjau oleh Admin.”
* **Skenario 2: Persetujuan oleh Admin**
  * **Given** Admin melihat daftar perusahaan baru yang menunggu verifikasi di dashboard Admin,
  * **When** Admin menekan tombol “Setujui” pada akun perusahaan tersebut,
  * **Then** status akun perusahaan berubah menjadi “Aktif” dan sistem mengirimkan email notifikasi persetujuan ke Perusahaan.

---

### 3. Login ke Platform
**User Story:** *As a* pengguna (Admin / Perusahaan / Pencari Kerja), *I want to* login menggunakan email dan password, *So that* saya dapat mengakses fitur sesuai role saya.

**Acceptance Criteria:**
* **Skenario 1: Login Berhasil**
  * **Given** saya berada di halaman Login dan akun saya sudah aktif,
  * **When** saya memasukkan email dan password yang benar lalu menekan tombol “Masuk”,
  * **Then** sistem mengautentikasi saya dan mengarahkan ke dashboard sesuai role (Admin -> Dashboard Admin, Perusahaan -> Dashboard Perusahaan, Pencari Kerja -> Dashboard Pencari Kerja).
* **Skenario 2: Kredensial Salah**
  * **Given** saya berada di halaman Login,
  * **When** saya memasukkan email yang terdaftar namun password yang salah, lalu menekan tombol “Masuk”,
  * **Then** sistem menampilkan pesan error “Email atau password salah.” dan tidak memberikan akses ke sistem.

---

### 4. Kelola Akun Admin
**User Story:** *As a* admin, *I want to* melihat, menonaktifkan, atau menghapus akun pengguna, *So that* saya dapat menjaga keamanan dan kualitas pengguna di platform.

**Acceptance Criteria:**
* **Skenario 1: Menonaktifkan Akun**
  * **Given** saya login sebagai Admin dan berada di halaman Manajemen Pengguna,
  * **When** saya memilih akun pengguna tertentu dan menekan tombol “Nonaktifkan”,
  * **Then** status akun pengguna berubah menjadi “Nonaktif”, pengguna tersebut tidak dapat login, dan sistem mencatat aksi ini di log aktivitas Admin.
* **Skenario 2: Menghapus Akun Permanen**
  * **Given** saya login sebagai Admin dan berada di halaman Manajemen Pengguna,
  * **When** saya menekan tombol “Hapus” pada akun pengguna dan mengonfirmasi dialog konfirmasi yang muncul,
  * **Then** akun pengguna terhapus permanen dari sistem dan tidak dapat dipulihkan kembali.

---

### 5. Membuat & Mengedit Profil Pencari Kerja
**User Story:** *As a* pencari kerja, *I want to* mengisi dan memperbarui profil saya, *So that* perusahaan dapat mengetahui kualifikasi dan pengalaman saya.

**Acceptance Criteria:**
* **Skenario 1: Pembaruan Profil Berhasil**
  * **Given** saya login sebagai Pencari Kerja dan berada di halaman Edit Profil,
  * **When** saya mengisi field pendidikan, pengalaman kerja, dan skill lalu menekan tombol “Simpan Perubahan”,
  * **Then** sistem menyimpan data terbaru dan menampilkan pesan “Profil berhasil diperbaharui”.
* **Skenario 2: Validasi Ukuran File CV**
  * **Given** saya berada di halaman Edit Profil,
  * **When** saya memilih file PDF berukuran lebih dari 5 MB dan menekan tombol “Unggah CV”,
  * **Then** sistem menampilkan pesan error “Ukuran file melebihi batas maksimum 5 MB” dan tidak menyimpan file tersebut.

---

### 6. Membuat & Mengedit Profil Perusahaan
**User Story:** *As a* perusahaan, *I want to* mengisi profil perusahaan secara lengkap, *So that* pencari kerja dapat mengenal perusahaan kami sebelum melamar.

**Acceptance Criteria:**
* **Skenario 1: Pembaruan Profil Berhasil**
  * **Given** saya login sebagai Perusahaan dan berada di halaman "Edit Profil",
  * **When** saya mengisi atau mengubah data (seperti Nama Perusahaan, Deskripsi, Lokasi, dan Logo) lalu menekan tombol "Simpan",
  * **Then** sistem menyimpan perubahan tersebut ke database dan menampilkan pesan "Profil berhasil diperbarui".
* **Skenario 2: Validasi Kolom Wajib**
  * **Given** saya berada di halaman "Edit Profil",
  * **When** saya menghapus kolom nama perusahaan (menjadikannya kosong) lalu menekan "Simpan",
  * **Then** sistem menolak perubahan dan menampilkan pesan error bahwa kolom nama wajib diisi.

---

### 7. Melihat Profil Pencari Kerja (Perusahaan)
**User Story:** *As a* perusahaan, *I want to* melihat profil lengkap pencari kerja yang melamar, *So that* saya dapat menilai kesesuaian kandidat dengan posisi yang ditawarkan.

**Acceptance Criteria:**
* **Skenario 1: Menampilkan Detail Profil**
  * **Given** saya login sebagai Perusahaan dan berada di daftar pelamar pada salah satu lowongan,
  * **When** saya mengklik nama salah satu pencari kerja,
  * **Then** sistem menampilkan halaman detail profil pencari kerja tersebut yang berisi riwayat pendidikan, pengalaman, dan keahlian secara lengkap.
* **Skenario 2: Profil Dihapus/Tidak Ditemukan**
  * **Given** saya mencoba mengakses URL profil pencari kerja yang sudah menghapus akunnya,
  * **When** halaman dimuat,
  * **Then** sistem menampilkan halaman "404 Not Found" atau pesan bahwa data pengguna tidak ditemukan.

---

### 8. Membuat Posting Lowongan
**User Story:** *As a* perusahaan, *I want to* memposting lowongan kerja baru, *So that* pencari kerja dapat mengetahui dan melamar posisi yang tersedia.

**Acceptance Criteria:**
* **Skenario 1: Publikasi Lowongan Berhasil**
  * **Given** saya login sebagai Perusahaan dan berada di halaman "Tambah Lowongan",
  * **When** saya mengisi formulir lowongan (Judul, Deskripsi Pekerjaan, Kategori, dan Deadline) dengan benar lalu menekan tombol "Posting",
  * **Then** sistem mempublikasikan lowongan tersebut sehingga bisa dilihat oleh Pencari Kerja di daftar lowongan.
* **Skenario 2: Validasi Tanggal Deadline**
  * **Given** saya berada di halaman "Tambah Lowongan",
  * **When** saya mengisi tanggal deadline yang sudah lewat dari tanggal hari ini,
  * **Then** sistem memberikan peringatan bahwa tanggal deadline tidak boleh di masa lalu dan mencegah pengiriman formulir.