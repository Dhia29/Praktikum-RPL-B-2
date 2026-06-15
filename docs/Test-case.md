# Test Case Sistem LockER
**Rekayasa Perangkat Lunak – [02] Kelas B**
 
**Anggota Tim:**
- Laila Khoirunnisa (L0122087)
- Rafy Dhia Najmi Ilham (L0124140)
- Rahmat Daniel (L0124141)
- Rizky Rafif Putra Pratama (L0124155)
**Dosen:** Haryono Setiadi, S.T., M.Eng.
**Asisten:** Aisyah Sabrina Putri Audin · Lidya Khairunnisa
 
---
 
## 1. Test Case Multi-Role Login
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Validasi ketersediaan opsi otentikasi awal sistem (Multi-Role) | Sistem pertama kali dibuka | 1. Akses halaman utama 2. Periksa ketersediaan komponen tombol masuk email, daftar akun, dan portal admin | Halaman memuat lengkap opsi: Tombol Google, Form Email & Password, tautan "Daftar di sini", dan tombol "Masuk sebagai Administrator" | Sistem menampilkan seluruh opsi metode masuk dan navigasi pendaftaran secara lengkap di halaman depan | ✅ Pass |
| TC-002 | Login global menggunakan metode pihak ketiga (Lanjutkan dengan Google) | Halaman login utama terbuka | 1. Klik tombol **Lanjutkan dengan Google** 2. Pilih akun Google aktif pada jendela otentikasi yang muncul | Sistem sukses mengautentikasi akun pengguna lewat Google OAuth dan mengarahkan ke dashboard sesuai hak akses (Admin/Perusahaan/Pencari Kerja) | Sistem mengalami *bug* (proses macet, memunculkan halaman error) | ❌ Fail |
 
---
 
## 2. Test Case Pencari Kerja
 
### 2.1 Register & Login
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Register akun baru valid | Halaman register terbuka | 1. Isi nama lengkap, email baru, dan password valid 2. Unggah CV (.pdf) 3. Klik tombol Daftar | Akun berhasil dibuat, sistem mengirim email verifikasi, dan redirect ke halaman login atau dasbor | Muncul masukkan kode OTP, dan berhasil masuk dashboard | ✅ Pass |
| TC-002 | Register gagal – Email sudah terdaftar | Halaman register terbuka | 1. Isi email yang sudah pernah terdaftar 2. Isi kolom lain dengan valid 3. Klik tombol Daftar | Muncul pesan error "Alamat email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda." | Muncul pesan error "Alamat email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda." | ✅ Pass |
| TC-003 | Register gagal – Format email salah | Halaman register terbuka | 1. Isi email tanpa format "@" atau domain 2. Klik tombol Daftar | Muncul validasi "Sertakan @ pada alamat email" di bawah kolom email | Muncul validasi "Sertakan @ pada alamat email" di bawah kolom email | ✅ Pass |
| TC-004 | Login valid | Halaman login terbuka, akun terdaftar | 1. Isi email dan password valid 2. Klik Masuk | Redirect ke dashboard pengguna | Pengguna berhasil masuk ke dashboard | ✅ Pass |
| TC-005 | Login – email tidak terdaftar | Halaman login terbuka | 1. Isi email tidak terdaftar dan password apapun 2. Klik Masuk | Muncul pesan "Email atau password yang anda masukkan salah" | Muncul pesan "Email atau password yang anda masukkan salah" | ✅ Pass |
| TC-006 | Login – password salah | Halaman login terbuka | 1. Isi email valid 2. Isi password salah 3. Klik Masuk | Muncul pesan "Email atau password yang anda masukkan salah" | Muncul pesan "Email atau password yang anda masukkan salah" | ✅ Pass |
 
### 2.2 Menu Lowongan Kerja
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Daftar lowongan aktif | Pengguna sudah login dan berada di halaman Loker | Perhatikan card loker yang muncul di sisi kiri halaman | Sistem menampilkan daftar lowongan aktif, logo, judul loker, nama perusahaan, lokasi, tipe pekerjaan, deskripsi singkat, dan tautan "Lihat Detail" | Muncul daftar lowongan aktif dengan semua informasi yang dibutuhkan | ✅ Pass |
| TC-002 | Pencarian loker | Berada di halaman Loker | 1. Klik pada kolom input Pencarian 2. Ketik kata kunci yang valid 3. Klik Enter | Daftar lowongan otomatis terfilter dan hanya menampilkan loker yang sesuai dengan pencarian | Pencarian tidak dapat berjalan | ❌ Fail |
| TC-003 | Filter Lowongan Berdasarkan Kategori Pekerjaan | Berada di halaman Loker | 1. Klik pilihan pada bagian "Kategori Pekerjaan" 2. Pilih salah satu kategori (Semua Kategori, Full-Time, Part-Time, Internship, Contract) | Daftar lowongan diperbarui dan hanya menampilkan pekerjaan sesuai kategori | Muncul daftar lowongan yang telah diperbarui dan sesuai dengan kategori yang dipilih | ✅ Pass |
| TC-004 | Mengurutkan Lowongan (Sorting) | Berada di halaman Loker | 1. Klik pilihan pada bagian "Urutkan Berdasarkan" 2. Ubah pilihan ke opsi pengurutan lain | Urutan lowongan berubah sesuai dengan parameter sortir yang dipilih | Muncul lowongan sesuai urutan yang dipilih pengguna | ✅ Pass |
| TC-005 | Navigasi ke Halaman Detail Lowongan | Berada di halaman menu "Loker" dan terdapat minimal 1 lowongan kerja | Klik tautan teks "Lihat Detail →" pada salah satu lowongan | Sistem mengarahkan pengguna ke halaman detail lowongan (deskripsi, syarat, dan tombol lamar) | Muncul halaman detail dari lowongan yang dipilih | ✅ Pass |
 
### 2.3 Menu Lamaran
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Validasi Default Tab "Semua" | Pengguna sudah login dan berada di menu Lamaran | 1. Buka halaman menu "Lamaran" 2. Amati tab status yang aktif pertama kali | Sistem secara default langsung mengaktifkan tab "Semua" dan menampilkan seluruh berkas lamaran | Sistem otomatis mengaktifkan tab "Semua" dan menampilkan riwayat lamaran | ✅ Pass |
| TC-002 | Validasi Filter Tab "Antrian" | Berada di halaman menu "Lamaran" | 1. Klik pada tombol tab "Antrian" 2. Amati konten halaman yang muncul | Sistem memfilter daftar lamaran dan menampilkan halaman di Antrian | Daftar lamaran difilter dan menampilkan tampilan antrian | ✅ Pass |
| TC-003 | Validasi Filter Tab "Diproses" | Berada di halaman menu "Lamaran" dan memiliki lamaran yang sedang ditinjau | 1. Klik pada tombol tab "Diproses" | Sistem memfilter data dan hanya menampilkan lamaran yang statusnya sedang dalam seleksi | Daftar lamaran difilter dan menampilkan tampilan Diproses | ✅ Pass |
| TC-004 | Validasi Filter Tab "Interview" | Berada di halaman menu "Lamaran" dan memiliki lamaran berstatus interview | 1. Klik pada tombol tab "Interview" | Sistem menyaring data dan hanya menampilkan lowongan yang mendapatkan undangan wawancara | Daftar lamaran difilter dan menampilkan tampilan Interview | ✅ Pass |
| TC-005 | Validasi Filter Tab "Arsip" | Berada di halaman menu "Lamaran" dan memiliki lamaran yang selesai/ditolak | 1. Klik pada tombol tab "Arsip" | Sistem menyaring data dan hanya menampilkan lamaran yang proses rekrutmennya sudah final | Daftar lamaran difilter dan menampilkan tampilan Arsip | ✅ Pass |
 
### 2.4 Menu Pesan
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Akses halaman menu Pesan | Pengguna sudah login dan berada di halaman utama LockER | 1. Klik menu "Pesan" pada navbar atas 2. Amati pemuatan halaman Chat | Sistem berhasil memuat halaman Pesan, menampilkan daftar kontak di bilah kiri, dan ruang obrolan di sisi kanan | Sistem berhasil memuat halaman Pesan dan menampilkan daftar riwayat obrolan | ✅ Pass |
| TC-002 | Mengirim Pesan Teks Valid | Halaman ruang obrolan dengan salah satu perusahaan | 1. Ketik pesan teks pada kolom input obrolan 2. Klik ikon "Kirim" atau tekan Enter | Teks pesan berhasil dikirim, kolom input kembali kosong, dan pesan baru langsung muncul di bagian paling bawah | Pesan teks sukses terkirim dan langsung muncul di gelembung obrolan secara real-time | ✅ Pass |
| TC-003 | Validasi Input Pesan Kosong | Halaman ruang obrolan terbuka | 1. Biarkan kolom input teks kosong 2. Klik tombol "Kirim" atau tekan Enter | Sistem tidak melakukan tindakan pengiriman dan tidak memicu error | Sistem mengabaikan input kosong dan tidak mengirimkan gelembung chat kosong | ✅ Pass |
| TC-004 | Pengiriman Pesan Real-Time | Dua akun berbeda (Pencari Kerja dan HRD) masuk ke ruang obrolan yang sama secara bersamaan | 1. Akun HRD mengirimkan pesan baru 2. Amati layar ruang obrolan pada akun Pencari Kerja tanpa refresh | Pesan dari HRD otomatis langsung muncul di layar Pencari Kerja | Pesan dari lawan bicara langsung muncul secara instan tanpa harus me-refresh browser | ✅ Pass |
 
### 2.5 Menu Komunitas
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Akses Halaman Utama Komunitas | Pengguna sudah login sebagai Pencari Kerja | 1. Klik menu "Komunitas" pada bilah navigasi 2. Amati pemuatan halaman | Sistem menampilkan halaman utama komunitas, daftar utas terbaru, kategori diskusi, dan tombol buat postingan | Halaman utama Komunitas berhasil dimuat sepenuhnya | ✅ Pass |
| TC-002 | Membuat Postingan/Utas Baru Valid | Pengguna berada di halaman utama Komunitas | 1. Klik tombol "Buat Postingan Baru" 2. Isi judul diskusi 3. Pilih kategori 4. Isi konten 5. Klik "Terbitkan" | Sistem berhasil menyimpan postingan baru dan memunculkannya di baris paling atas halaman forum | Postingan baru berhasil disimpan dan langsung muncul di beranda forum komunitas secara real-time | ✅ Pass |
| TC-003 | Validasi Input Postingan Kosong | Halaman pembuatan postingan baru terbuka | 1. Kosongkan kolom judul dan isi konten 2. Klik tombol "Terbitkan" | Sistem menolak pengiriman dan menampilkan pesan peringatan bahwa judul dan konten tidak boleh kosong | Sistem mendeteksi kolom kosong dan menampilkan pesan error "Judul dan isi konten wajib diisi" | ✅ Pass |
| TC-004 | Memberikan Komentar pada Postingan | Salah satu utas/postingan milik pengguna lain dibuka | 1. Gulir ke bawah ke kolom komentar 2. Ketik opini atau jawaban 3. Klik tombol "Kirim Komentar" | Komentar berhasil ditambahkan dan jumlah counter komentar otomatis bertambah +1 | Komentar sukses diterbitkan dan jumlah total komentar otomatis diperbarui | ✅ Pass |
| TC-005 | Fitur Menyukai Postingan (Like/Upvote) | Beranda atau halaman detail postingan terbuka | 1. Klik ikon Love / tombol "Suka" pada salah satu postingan | Ikon berubah warna (menjadi aktif) dan angka jumlah Like bertambah secara instan | Tombol Like merespons klik pengguna, warna ikon berubah, dan angka counter Like bertambah +1 | ✅ Pass |
| TC-006 | Filter Postingan Berdasarkan Kategori | Halaman utama Komunitas terbuka dan menampilkan banyak postingan acak | 1. Klik salah satu tab kategori diskusi | Sistem menyaring konten forum dan hanya menampilkan postingan yang sesuai dengan kategori yang dipilih | Forum berhasil terfilter dengan akurat | ✅ Pass |
| TC-007 | Pencarian Postingan Forum (Search Bar) | Pengguna berada di halaman utama Komunitas | 1. Ketik kata kunci spesifik pada kolom pencarian forum 2. Tekan Enter atau klik ikon cari | Sistem menampilkan daftar postingan yang judul atau isinya mengandung kata kunci yang dicari | Sistem menampilkan hasil pencarian yang relevan sesuai kata kunci | ✅ Pass |
| TC-008 | Menghapus Postingan Milik Sendiri | Pengguna membuka detail postingan yang pernah dibuatnya sendiri | 1. Klik ikon opsi titik tiga pada postingan milik sendiri 2. Pilih "Hapus Postingan" 3. Klik "Konfirmasi Hapus" | Sistem menghapus data postingan dari database dan mengarahkan ke beranda komunitas dengan pesan sukses | Postingan berhasil dihapus secara permanen setelah pengguna menyetujui pop-up konfirmasi | ✅ Pass |
| TC-009 | Validasi Hak Akses Hapus Postingan Orang Lain | Pengguna membuka detail postingan milik akun lain | 1. Amati keberadaan opsi tombol "Hapus" atau "Edit" pada postingan milik orang lain | Sistem tidak menampilkan tombol "Hapus" atau "Edit" pada postingan orang lain | Tombol aksi ubah/hapus tersembunyi dengan aman dan tidak dapat diakses | ✅ Pass |
| TC-010 | Laporkan Postingan Sensitif/Melanggar (Report) | Pengguna menemukan postingan ilegal, spam, atau mengandung SARA | 1. Klik ikon opsi atau tombol "Laporkan" 2. Pilih alasan pelaporan 3. Klik "Kirim Laporan" | Sistem merekam laporan ke database admin dan menampilkan notifikasi "Terima kasih, laporan Anda telah diterima" | Laporan berhasil dikirim ke dashboard admin dan pengguna menerima umpan balik visual | ✅ Pass |
 
### 2.6 Menu Notifikasi
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Fungsionalitas tombol lonceng Notifikasi | User sudah login dan berada di halaman panel | 1. Perhatikan bagian header kanan atas 2. Klik ikon **Lonceng / Notifikasi** | Sistem memicu munculnya jendela kecil (pop-up box) berjudul "Notifikasi" secara overlay di bawah ikon | Jendela pop-up "Notifikasi" berhasil muncul di layar secara interaktif | ✅ Pass |
 
### 2.7 Menu Customer Service
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Menampilkan halaman riwayat tiket kosong | Pengguna berada di halaman Customer Service | 1. Klik tab **Riwayat Tiket** | Sistem menampilkan ikon chat, teks "Belum Ada Riwayat", keterangan, dan tombol "Buat Tiket Sekarang" | Sistem menampilkan ikon chat, teks "Belum Ada Riwayat", keterangan, dan tombol "Buat Tiket Sekarang" | ✅ Pass |
| TC-002 | Navigasi ke form buat tiket melalui tombol riwayat | Pengguna berada di tab **Riwayat Tiket** yang kosong | 1. Klik tombol **Buat Tiket Sekarang** | Sistem otomatis mengalihkan tampilan ke tab **Buat Tiket Baru** | Sistem otomatis mengalihkan tampilan ke tab **Buat Tiket Baru** | ✅ Pass |
| TC-003 | Membuat tiket baru dengan data valid | Pengguna berada di tab **Buat Tiket Baru** | 1. Isi kolom Subjek 2. Pilih opsi pada dropdown Kategori Masalah 3. Isi kolom Pesan / Detail Masalah 4. Klik tombol kirim/submit | Tiket berhasil dibuat, muncul notifikasi sukses, dan tiket masuk ke daftar antrean/riwayat | Tiket berhasil dibuat, muncul notifikasi sukses, dan tiket masuk ke daftar antrean/riwayat | ✅ Pass |
| TC-004 | Membuat tiket baru dengan kolom kosong | Pengguna berada di tab **Buat Tiket Baru** | 1. Kosongkan semua kolom (Subjek, Kategori Masalah, Pesan) | Tombol Kirim Tiket tidak dapat diklik, pengguna harus melengkapi kolom | Tombol Kirim Tiket tidak dapat diklik | ✅ Pass |
| TC-005 | Kembali dari halaman Customer Service | Pengguna berada di modal/pop-up Customer Service | 1. Klik tombol panah kembali (←) di sebelah tulisan **LockER** | Pop-up Customer Service tertutup dan pengguna kembali ke halaman utama/sebelumnya | Pop-up Customer Service tertutup dan pengguna kembali ke halaman utama/sebelumnya | ✅ Pass |
 
### 2.8 Menu Profil
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Akses Halaman Profil Sendiri | Pengguna sudah login sebagai Pencari Kerja | 1. Klik foto profil atau menu "Profil Saya" di pojok kanan atas 2. Amati pemuatan halaman profil | Sistem berhasil menampilkan halaman profil secara lengkap | Halaman profil dimuat dengan lancar dan menampilkan informasi data diri pengguna | ✅ Pass |
| TC-002 | Mengubah Informasi Biodata Valid | Pengguna berada di halaman profil dan mengklik tombol "Edit Profil" | 1. Ubah data pada kolom Nama Lengkap, Nomor Telepon, dan Alamat 2. Isi kolom Ringkasan Profesional 3. Klik tombol "Simpan" | Sistem berhasil memperbarui data dan menampilkan notifikasi sukses "Profil berhasil diperbarui" | Perubahan biodata berhasil disimpan dan langsung ter-update di halaman profil | ✅ Pass |
| TC-003 | Validasi Input Kosong pada Edit Biodata | Halaman form edit profil dalam posisi terbuka | 1. Kosongkan kolom Nama Lengkap dan Nomor Telepon 2. Klik tombol "Simpan" | Sistem menolak proses penyimpanan dan menampilkan pesan error validasi | Sistem mendeteksi kolom kosong dan memblokir aksi simpan dengan memunculkan pesan peringatan merah | ✅ Pass |
| TC-004 | Mengubah Foto Profil (Upload Avatar) | Pengguna berada di halaman pengaturan atau profil | 1. Klik ikon kamera atau tombol "Ubah Foto" 2. Pilih file gambar berekstensi .jpg atau .png berukuran 1MB 3. Klik "Simpan Foto" | Sistem sukses mengunggah foto baru ke server dan memperbarui tampilan avatar secara real-time | Foto profil baru gagal terunggah | ❌ Fail |
| TC-005 | Validasi Ekstensi File Foto Profil | Pengguna mencoba mengubah foto profil | 1. Klik tombol "Ubah Foto" 2. Pilih file non-gambar (misal: document.pdf atau archive.rar) 3. Coba lakukan proses unggah | Sistem otomatis menolak file tersebut dan memunculkan pesan validasi "Format file tidak didukung. Harap unggah file gambar (JPG/PNG)" | Sistem berhasil memfilter ekstensi file dan mencegah file non-gambar masuk ke direktori foto | ✅ Pass |
| TC-006 | Menambah Riwayat Pendidikan | Pengguna berada di bagian komponen "Pendidikan" di halaman profil | 1. Klik tombol "+ Tambah Pendidikan" 2. Isi Nama Institusi, Jurusan, Tahun Masuk, dan Tahun Lulus 3. Klik "Simpan" | Data pendidikan baru berhasil tersimpan dan muncul di daftar riwayat pendidikan secara kronologis | Riwayat pendidikan baru berhasil ditambahkan ke profil | ✅ Pass |
| TC-007 | Mengunggah Dokumen CV/Resume | Pengguna berada di bagian "Dokumen Penunjang" atau "Upload CV" | 1. Klik tombol "Unggah CV" 2. Pilih file dokumen berekstensi .pdf berukuran 1.5MB 3. Klik "Unggah" | Sistem berhasil menyimpan file PDF ke storage server dan menampilkan ikon unduh CV di profil | File CV berformat PDF sukses terunggah dan link unduhan aktif langsung tersedia | ✅ Pass |
| TC-008 | Validasi Ukuran Maksimal Dokumen CV | Pengguna mencoba mengunggah file CV di profil | 1. Pilih file PDF yang berukuran sangat besar (misal: 10MB) 2. Klik tombol "Unggah" | Sistem memblokir file tersebut dan menampilkan pesan error "Ukuran file terlalu besar. Maksimal batas ukuran file adalah 2MB" | Sistem berhasil membatasi ukuran file upload | ✅ Pass |
| TC-009 | Menambahkan Tag Keahlian (Skills) | Pengguna berada di komponen "Keahlian" di halaman profil | 1. Ketik keahlian pada kolom input (misal: "Laravel") 2. Tekan Enter atau klik tombol tambah | Sistem menambahkan keahlian tersebut dalam bentuk tag/badge visual yang rapi | Tag keahlian baru sukses ditambahkan dan tersusun rapi | ✅ Pass |
| TC-010 | Menghapus Tag Keahlian yang Sudah Ada | Terdapat beberapa tag keahlian yang terpajang di profil pengguna | 1. Klik ikon silang kecil (X) pada salah satu tag keahlian | Sistem langsung menghapus tag keahlian tersebut dari tampilan profil dan memperbarui datanya di database | Tag keahlian berhasil terhapus secara permanen dari profil | ✅ Pass |
 
### 2.9 Log Out (Pencari Kerja)
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Fungsionalitas tombol Keluar Sistem (Logout) | Pengguna sudah login dan berada di halaman panel | 1. Perhatikan menu navigasi paling bawah di sidebar kiri 2. Klik tombol **Keluar Sistem** | Sistem menghapus sesi masuk (session) yang aktif dan mengarahkan kembali pengguna ke gerbang login utama | Tombol tidak merespons (macet), sesi tidak terhapus, dan halaman tidak berpindah ke menu login | ❌ Fail |
 
---
 
## 3. Test Case Perusahaan
 
### 3.1 Registrasi dan Login
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Mengakses form pendaftaran akun tipe Perusahaan | Pengguna berada di halaman registrasi awal | 1. Perhatikan tab pilihan jenis akun di bagian atas form 2. Klik tombol tab **Perusahaan** | Form dinamis berubah menampilkan kolom data legalitas usaha seperti Bidang Industri dan Nomor NPWP | Tampilan form pendaftaran bertukar ke tipe Perusahaan secara responsif | ✅ Pass |
| TC-002 | Validasi fungsionalitas submit pendaftaran data mitra | Pengguna berada di halaman registrasi awal | 1. Isi field Nama Perusahaan, Bidang Industri, NPWP, Email, dan Password 2. Klik tombol **Daftarkan Perusahaan** | Sistem memvalidasi kelengkapan berkas data, menyimpan akun mitra baru, dan melempar notifikasi sukses | Akun instansi berhasil terdaftar ke database sistem LockER | ✅ Pass |
| TC-003 | Autentikasi akun via email dan kata sandi | Pengguna berada di halaman gerbang masuk utama (/) | 1. Masukkan alamat email dan password terdaftar 2. Klik tombol **Masuk** | Sistem mencocokkan kredensial dan mengarahkan pengguna ke dasbor sesuai role | Pengguna berhasil masuk ke sistem dan dialihkan ke beranda utama LockER | ✅ Pass |
| TC-004 | Fungsionalitas menyembunyikan/menampilkan password | Pengguna berada di halaman login atau registrasi | 1. Ketikkan beberapa karakter pada kolom Password 2. Klik ikon **Mata** di ujung kanan kolom | Karakter password bertukar format secara instan antara bentuk sensor (bullet) dan teks asli | Ikon penyamar sandi bekerja dengan akurat | ✅ Pass |
 
### 3.2 Loker (Perusahaan)
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Menampilkan daftar Loker dan kondisi data kosong | Perusahaan sudah login dan berada di URL /loker | 1. Perhatikan area konten utama pada menu tab **Semua Lowongan** | Jika instansi belum menerbitkan lowongan, muncul ilustrasi tas kerja dengan teks "Belum Ada Lowongan" | Komponen pemberitahuan status kosong termuat rapi di tengah halaman panel | — |
| TC-002 | Mengakses form pembuatan lowongan baru | Perusahaan berada di halaman utama | 1. Klik tombol magenta bertanda tambah **+ Buat Lowongan** | Sistem mengarahkan ke halaman formulir pengisian kriteria lowongan kerja baru | Halaman formulir pengisian data lowongan kerja berhasil dimuat tanpa kendala | — |
| TC-003 | Pencarian loker (Perusahaan) | Berada di halaman Loker | 1. Klik pada kolom input Pencarian 2. Ketik kata kunci yang valid 3. Klik Enter | Daftar lowongan otomatis terfilter dan hanya menampilkan loker yang sesuai dengan pencarian | Pencarian tidak dapat berjalan | ❌ Fail |
| TC-004 | Filter Lowongan Berdasarkan Kategori Pekerjaan | Berada di halaman Loker | 1. Klik pilihan pada bagian "Kategori Pekerjaan" 2. Pilih salah satu kategori | Daftar lowongan diperbarui dan hanya menampilkan pekerjaan sesuai kategori | Muncul daftar lowongan yang telah diperbarui dan sesuai dengan kategori yang dipilih | ✅ Pass |
| TC-005 | Mengurutkan Lowongan (Sorting) | Berada di halaman Loker | 1. Klik pilihan pada bagian "Urutkan Berdasarkan" 2. Ubah pilihan ke opsi pengurutan lain | Urutan lowongan berubah sesuai dengan parameter sortir yang dipilih | Muncul lowongan sesuai urutan yang dipilih pengguna | ✅ Pass |
| TC-006 | Navigasi ke Halaman Detail Lowongan | Berada di halaman menu "Loker" dan terdapat minimal 1 lowongan kerja | Klik tautan teks "Lihat Detail →" pada salah satu lowongan | Sistem mengarahkan pengguna ke halaman detail lowongan secara lengkap | Muncul halaman detail dari lowongan yang dipilih | ✅ Pass |
 
### 3.3 Lamaran (Daftar Pelamar Masuk)
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Memeriksa log berkas lamaran masuk | Perusahaan sudah login dan beralih ke URL /lamaran | 1. Klik menu tab **Lamaran** pada navbar atas 2. Perhatikan area pengumuman "Daftar Pelamar Masuk" | Jika lowongan belum memiliki pelamar, sistem menyajikan teks "Belum Ada Pelamar" | Halaman sukses menampilkan wadah informasi pelamar lengkap dengan dropdown filter lowongan | ✅ Pass |
 
### 3.4 Pesan (Perusahaan)
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Akses halaman menu Pesan | Pengguna sudah login dan berada di halaman utama LockER | 1. Klik menu "Pesan" pada navbar atas 2. Amati pemuatan halaman Chat | Sistem berhasil memuat halaman Pesan, menampilkan daftar kontak di bilah kiri, dan ruang obrolan di sisi kanan | Sistem berhasil memuat halaman Pesan dan menampilkan daftar riwayat obrolan | ✅ Pass |
| TC-002 | Mengirim Pesan Teks Valid | Halaman ruang obrolan | 1. Ketik pesan teks pada kolom input obrolan 2. Klik ikon "Kirim" atau tekan Enter | Teks pesan berhasil dikirim dan pesan baru langsung muncul di bagian paling bawah | Pesan teks sukses terkirim secara real-time | ✅ Pass |
| TC-003 | Validasi Input Pesan Kosong | Halaman ruang obrolan terbuka | 1. Biarkan kolom input teks kosong 2. Klik tombol "Kirim" atau tekan Enter | Sistem tidak melakukan tindakan pengiriman dan tidak memicu error | Sistem mengabaikan input kosong | ✅ Pass |
| TC-004 | Pengiriman Pesan Real-Time | Dua akun berbeda masuk ke ruang obrolan yang sama | 1. Akun HRD mengirimkan pesan baru 2. Amati layar ruang obrolan pada akun Pencari Kerja tanpa refresh | Pesan dari HRD otomatis langsung muncul di layar Pencari Kerja | Pesan dari lawan bicara langsung muncul secara instan | ✅ Pass |
 
### 3.5 Komunitas (Perusahaan)
 
*(Sama dengan Test Case Komunitas – Pencari Kerja, TC-001 s/d TC-010, seluruhnya berstatus ✅ Pass)*
 
### 3.6 Notifikasi (Perusahaan)
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Fungsionalitas tombol lonceng Notifikasi | User sudah login dan berada di halaman panel | 1. Perhatikan bagian header kanan atas 2. Klik ikon **Lonceng / Notifikasi** | Sistem memicu munculnya jendela kecil pop-up berjudul "Notifikasi" secara overlay di bawah ikon | Jendela pop-up "Notifikasi" berhasil muncul di layar secara interaktif | ✅ Pass |
 
### 3.7 Customer Service (Perusahaan)
 
*(Sama dengan Test Case Customer Service – Pencari Kerja, TC-001 s/d TC-005, seluruhnya berstatus ✅ Pass)*
 
### 3.8 Profil (Perusahaan)
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Memuat tinjauan umum profil badan usaha | Perusahaan mengakses halaman profil badan usaha (/profile-perusahaan) | 1. Gulir ke bawah menuju kartu **Gambaran Umum** 2. Periksa detail data: Situs Web, Ukuran Perusahaan, dan Nomor NPWP | Sistem menampilkan teks deskripsi perusahaan beserta atribut info legalitas instansi secara mendetail | Seluruh data gambaran umum tervisualisasi dengan pas sesuai profil perusahaan | ✅ Pass |
| TC-002 | Mengalihkan ke tautan URL eksternal instansi | Halaman profil perusahaan terbuka (/profile-perusahaan) | 1. Cari tautan berikon keluar **Kunjungi Website** 2. Klik tautan tersebut | Browser membuka tab baru dan memuat alamat URL eksternal resmi milik perusahaan terkait | Tautan eksternal berhasil mengarahkan pengguna ke situs resmi mitra kerja dengan aman | ✅ Pass |
 
### 3.9 Log Out (Perusahaan)
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Fungsionalitas tombol Keluar Sistem (Logout) | Pengguna sudah login dan berada di halaman panel | 1. Perhatikan menu navigasi paling bawah di sidebar kiri 2. Klik tombol **Keluar Sistem** | Sistem menghapus sesi masuk yang aktif dan mengarahkan kembali pengguna ke gerbang login utama | Tombol tidak merespons (macet), sesi tidak terhapus, dan halaman tidak berpindah ke menu login | ❌ Fail |
 
---
 
## 4. Test Case Admin
 
### 4.1 Login (Admin)
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Akses halaman khusus login administrator | Halaman login utama terbuka | 1. Gulir ke bagian bawah formulir login utama 2. Klik tautan/tombol "Masuk sebagai Administrator" | Sistem mengarahkan pengguna ke halaman Administrator Access Portal dengan URL /admin/login | Halaman berganti ke portal admin dengan judul "Administrator Access Portal" | ✅ Pass |
| TC-002 | Login sukses sebagai administrator valid | Halaman login admin terbuka | 1. Masukkan email dan password admin yang terdaftar 2. Klik tombol Masuk | Sistem berhasil memvalidasi akun admin dan mengarahkan ke halaman Admin Dashboard utama | Pengguna berhasil masuk ke dashboard khusus admin | ✅ Pass |
| TC-003 | Login admin gagal – Password salah | Halaman login admin terbuka | 1. Masukkan email admin yang benar 2. Masukkan kombinasi password yang salah 3. Klik tombol Masuk | Sistem menampilkan pesan kesalahan autentikasi dan menahan pengguna di halaman login admin | Muncul Pesan Invalid Credentials | ✅ Pass |
| TC-004 | Login admin gagal – email dan password salah | Halaman login admin terbuka | 1. Masukkan email dan password admin yang salah 2. Klik tombol Masuk | Sistem menampilkan pesan kesalahan autentikasi | Muncul Pesan "You are not an administrator." | ✅ Pass |
| TC-005 | Login admin gagal – Kolom dikosongkan | Halaman login admin terbuka | 1. Kosongkan kolom email dan password admin 2. Klik tombol Masuk | Sistem mencegah pengiriman data dan memunculkan peringatan validasi pada kolom yang kosong | Form menolak submit dan menampilkan indikator peringatan wajib isi | ✅ Pass |
| TC-006 | Fungsionalitas tombol kembali ke beranda utama | Halaman login admin terbuka | 1. Perhatikan bagian bawah formulir portal admin 2. Klik tautan "Kembali ke Beranda Utama" | Sistem mengalihkan kembali pengguna dari halaman admin menuju ke halaman login utama/landing page | Pengguna berhasil diarahkan kembali ke tampilan login umum awal | ✅ Pass |
 
### 4.2 Dashboard (Admin)
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Menampilkan halaman ringkasan data (Overview) | Admin sudah berhasil login | 1. Masuk ke menu **Dashboard** pada sidebar | Sistem menampilkan halaman Overview berisi kartu metrik data, Aktivitas Terbaru, dan Status Sistem Validasi | Halaman ringkasan Overview termuat dengan lengkap menampilkan metrik angka secara dinamis | ✅ Pass |
| TC-002 | Fungsionalitas tombol navigasi Tinjau Perusahaan | Halaman dashboard admin terbuka | 1. Perhatikan kartu metrik "Menunggu Verifikasi" 2. Klik tautan **Tinjau Perusahaan** | Sistem langsung mengarahkan admin menuju ke halaman **Manajemen Perusahaan** | Halaman berpindah secara instan ke daftar verifikasi berkas perusahaan | ✅ Pass |
| TC-003 | Fungsionalitas tombol navigasi Tinjau Lowongan | Halaman dashboard admin terbuka | 1. Perhatikan kartu metrik "Lowongan Tertunda" 2. Klik tautan **Tinjau Lowongan** | Sistem langsung mengarahkan admin menuju ke halaman **Moderasi Lowongan** | Halaman berpindah ke tab verifikasi pemublikasian lowongan kerja | ✅ Pass |
| TC-004 | Fungsionalitas tombol Lihat Laporan Sistem | Halaman dashboard admin terbuka | 1. Perhatikan kartu ungu "Status Sistem Validasi" 2. Klik tombol **Lihat Laporan Sistem** | Sistem memproses permintaan dan menampilkan dokumen log validasi operasional platform LockER | Menampilkan berkas teks atau lembar log validasi keandalan sistem platform LockER | ✅ Pass |
| TC-005 | Kondisi kartu aktivitas ketika data kosong | Halaman dashboard admin terbuka | 1. Perhatikan kotak section "Aktivitas Terbaru" 2. Pastikan belum ada log aksi terbaru | Tampilan box memuat teks "Belum ada aktivitas baru" beserta ikon jam sebagai indikator status kosong | Sistem menampilkan info keadaan kosong dengan teks penjelasan yang simetris dan jelas | ✅ Pass |
 
### 4.3 Manajemen Pengguna
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Menampilkan halaman Daftar Pengguna (Pencari Kerja) | Admin sudah login dan berada di dashboard | 1. Perhatikan menu pada sidebar kiri 2. Klik menu **Manajemen Pengguna** | Sistem mengarahkan ke admin/users dan memuat tabel seluruh data akun pencari kerja yang terdaftar | Halaman berhasil memuat tabel pencari kerja dengan kolom Informasi Akun, Peran, Status, dan Aksi | ✅ Pass |
| TC-002 | Fungsionalitas aksi tombol ceklis (Verifikasi Akun) | Halaman Manajemen Pengguna terbuka | 1. Pilih salah satu baris pengguna 2. Klik ikon **Ceklis Hijau** pada kolom Aksi | Sistem memperbarui atau mengonfirmasi ulang status verifikasi akun pengguna tersebut di database | Sistem memproses pembaruan status verifikasi akun pengguna dengan lancar | ✅ Pass |
| TC-003 | Fungsionalitas aksi tombol tempat sampah (Hapus Pengguna) | Halaman Manajemen Pengguna terbuka | 1. Pilih salah satu baris pengguna 2. Klik ikon **Tempat Sampah Merah** pada kolom Aksi | Sistem memicu dialog konfirmasi hapus dan menghapus data pengguna dari database jika disetujui | Baris data pengguna terhapus dari tabel dan jumlah total data otomatis berkurang | ✅ Pass |
| TC-004 | Fungsionalitas navigasi pagination data | Halaman Manajemen Pengguna terbuka | 1. Gulir ke bagian bawah kanan tabel data 2. Klik tombol **Selanjutnya** atau **Sebelumnya** | Sistem mengubah muatan baris tabel untuk menampilkan daftar pengguna di halaman berikutnya atau sebelumnya | Navigasi halaman tabel merespons dengan memuat baris data sesuai urutan halaman | ✅ Pass |
| TC-005 | Akurasi pencatatan informasi teks status | Halaman Manajemen Pengguna terbuka | 1. Perhatikan indikator lingkaran dan teks pada kolom Status & Verifikasi | Sistem menampilkan tanda visual berupa titik hijau disertai teks "• Aktif" | Tulisan status akun terbaca dengan warna hijau kontras yang rapi | ✅ Pass |
 
### 4.4 Manajemen Perusahaan
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Menampilkan halaman list data Manajemen Perusahaan | Admin sudah login dan berada di dashboard | 1. Perhatikan menu navigasi sidebar bagian kiri 2. Klik menu **Manajemen Perusahaan** | Sistem mengarahkan ke admin/companies dan menampilkan daftar akun perusahaan | Halaman berhasil memuat tabel perusahaan | ✅ Pass |
| TC-002 | Fungsionalitas menyetujui akun (Tombol Terima) | Halaman Manajemen Perusahaan terbuka | 1. Cari baris perusahaan berstatus "Menunggu Persetujuan" 2. Klik tombol **Terima** | Sistem memperbarui status menjadi aktif dan mengizinkan perusahaan mempublikasikan lowongan | Status berubah dari "Menunggu Persetujuan" menjadi aktif | ✅ Pass |
| TC-003 | Fungsionalitas menolak pendaftaran akun (Tombol Tolak) | Halaman Manajemen Perusahaan terbuka | 1. Cari baris perusahaan berstatus "Menunggu Persetujuan" 2. Klik tombol **Tolak** | Sistem mengubah status pendaftaran akun perusahaan menjadi ditolak | Sistem menolak berkas pengajuan perusahaan dan memperbarui log status data | ✅ Pass |
| TC-004 | Fungsionalitas menonaktifkan akun perusahaan | Halaman Manajemen Perusahaan terbuka | 1. Cari baris data perusahaan 2. Klik tombol **Nonaktifkan** | Sistem mengubah status operasional akun perusahaan menjadi tidak aktif | Akun perusahaan yang dipilih berhasil diubah statusnya menjadi nonaktif | ✅ Pass |
| TC-005 | Fungsionalitas menghapus data akun perusahaan | Halaman Manajemen Perusahaan terbuka | 1. Cari baris data perusahaan 2. Klik tombol **Hapus** | Sistem memicu dialog konfirmasi hapus dan menghapus seluruh rekaman data perusahaan secara permanen | Rekaman baris data profil perusahaan hilang dari daftar tabel manajemen sistem | ✅ Pass |
 
### 4.5 Layanan Pelanggan (Admin)
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Menampilkan halaman Daftar Tiket Dukungan | Admin sudah login dan berada di dashboard | 1. Klik menu **Layanan Pelanggan** pada sidebar | Sistem mengarahkan ke URL admin/tickets dan memuat antarmuka pengelolaan tiket | Halaman berhasil memuat tabel tiket | ✅ Pass |
| TC-002 | Pengujian fitur filter berdasarkan status tiket | Halaman Layanan Pelanggan terbuka | 1. Klik menu dropdown pilihan status di kanan atas tabel 2. Pilih salah satu kategori status | Sistem menyaring tampilan tabel untuk hanya menampilkan daftar tiket sesuai status pilihan | Menu dropdown responsif dan sistem memfilter baris list tiket | ✅ Pass |
| TC-003 | Kondisi tabel ketika belum ada tiket keluhan masuk | Halaman Layanan Pelanggan terbuka | 1. Perhatikan bagian tengah tabel 2. Pastikan belum ada data keluhan yang masuk | Sistem menampilkan baris pemberitahuan teks "Belum ada tiket bantuan saat ini." | Tabel memuat informasi keadaan kosong dengan teks penjelasan yang jelas | ✅ Pass |
 
### 4.6 Moderasi Lowongan
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Menampilkan halaman Daftar Lowongan Pekerjaan | Admin sudah login dan berada di dashboard | 1. Klik menu **Moderasi Lowongan** | Sistem mengarahkan ke URL admin/jobs dan menampilkan daftar lowongan | Halaman berhasil memuat tabel lowongan | ✅ Pass |
| TC-002 | Pengujian fitur filter berdasarkan status lowongan | Halaman Moderasi Lowongan terbuka | 1. Klik menu dropdown pilihan status 2. Pilih salah satu kategori status | Sistem menyaring tampilan tabel untuk hanya menampilkan daftar lowongan sesuai status pilihan | Menu dropdown responsif dan sistem memfilter baris list lowongan kerja | ✅ Pass |
| TC-003 | Kondisi tabel ketika tidak ada lowongan pekerjaan | Halaman Moderasi Lowongan terbuka | 1. Perhatikan bagian tengah tabel 2. Pastikan belum ada data lowongan | Sistem menampilkan teks pemberitahuan "Tidak ada lowongan pekerjaan saat ini." | Tabel memuat informasi keadaan kosong dengan indikator jumlah angka nol yang akurat | ✅ Pass |
| TC-004 | Fungsionalitas navigasi pagination data lowongan | Halaman Moderasi Lowongan terbuka | 1. Gulir ke bagian bawah kanan tabel data 2. Klik tombol **Selanjutnya** atau **Sebelumnya** | Sistem mengubah muatan baris tabel untuk menampilkan daftar lowongan di halaman berikutnya atau sebelumnya | Tombol merespons perintah navigasi halaman data dengan lancar | ✅ Pass |
 
### 4.7 Laporan Komunitas
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Menampilkan halaman Pengawasan Komunitas | Admin sudah login dan berada di dashboard | 1. Klik menu **Laporan Komunitas** | Sistem mengarahkan ke URL /admin/community/reports dan menampilkan halaman Pengawasan Komunitas | Halaman berhasil terbuka dan memuat struktur sub-tab pemantauan aktivitas komunitas | ✅ Pass |
| TC-002 | Menampilkan data sub-tab Live Update Postingan | Halaman Laporan Komunitas terbuka | 1. Klik tombol sub-tab **Live Update Postingan** | Sistem menampilkan tabel pantauan postingan terbaru | Tabel khusus pantauan kiriman konten termuat lengkap | ✅ Pass |
| TC-003 | Menampilkan data sub-tab Laporan Masuk | Halaman Laporan Komunitas terbuka | 1. Klik tombol sub-tab **Laporan Masuk** | Sistem beralih tampilan dan memuat tabel pengaduan pengguna | Halaman sukses beralih ke sub-tab aduan lengkap | ✅ Pass |
| TC-004 | Pengujian fitur filter status pada sub-tab Laporan Masuk | Halaman Laporan Komunitas terbuka | 1. Aktifkan sub-tab **Laporan Masuk** 2. Klik dropdown filter status | Sistem menyaring baris laporan aduan komunitas sesuai status pilihan admin | Menu dropdown filter status berfungsi dengan responsif | ✅ Pass |
 
### 4.8 Sistem Analytics Platform
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Menampilkan halaman Tinjauan Platform (Analytics) | Admin sudah login dan berada di dashboard | 1. Klik menu **Analytics Platform** | Sistem mengarahkan ke URL /admin/analytics dan menampilkan statistik performa LockER dalam 30 hari terakhir | Halaman berhasil memuat ringkasan analitik metrik utama, grafik pertumbuhan, dan distribusi pengguna | ✅ Pass |
| TC-002 | Fungsionalitas tombol Ekspor Laporan | Halaman Analytics Platform terbuka | 1. Klik tombol **Ekspor Laporan** | Sistem memproses data dan otomatis mengunduh berkas rekapan dokumen laporan performa platform | Berkas dokumen laporan statistik ringkasan berhasil terunduh | ✅ Pass |
| TC-003 | Validasi akurasi kartu metrik ringkasan platform | Halaman Analytics Platform terbuka | 1. Periksa nilai numerik pada kartu: Total Pengguna, Total Perusahaan, Total Lowongan, Total Lamaran, dan Sesi Aktif | Nilai data pada masing-masing kartu berukuran besar, sinkron dengan database, dan memuat status indikator "Real-time" | Seluruh data numerik tampil sesuai nilai riil sistem | ✅ Pass |
| TC-004 | Memuat komponen Grafik Pertumbuhan Pengguna Baru | Halaman Analytics Platform terbuka | 1. Gulir halaman ke bagian bawah kartu metrik utama 2. Perhatikan box section **Grafik Pertumbuhan Pengguna Baru** | Sistem menampilkan sumbu grafik pertumbuhan pendaftaran akun yang valid selama 30 hari terakhir | Komponen diagram grafik garis pertumbuhan terpasang dan termuat secara presisi | ✅ Pass |
| TC-005 | Memuat komponen Distribusi Pengguna | Halaman Analytics Platform terbuka | 1. Perhatikan box section **Distribusi Pengguna** 2. Periksa label Pencari Kerja dan Perusahaan | Sistem menampilkan diagram lingkaran atau visualisasi beserta pembagian persentase proporsi kelompok pengguna | Data persentase distribusi pembagian kelompok tipe pengguna tampil proporsional | ✅ Pass |
 
### 4.9 Sistem Pengaturan
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Menampilkan halaman Pengaturan Utama (Tab Umum) | Admin sudah login dan berada di dashboard | 1. Klik menu **Pengaturan** 2. Klik tombol **Simpan Perubahan** | Sistem mengarahkan ke URL /admin/settings#umum dan menampilkan panel "Pengaturan Umum Platform" | Halaman pengaturan berhasil dimuat dengan form Nama Platform dan Email Dukungan | ✅ Pass |
| TC-002 | Mengubah fungsionalitas status toggle pada Tab Umum | Halaman Pengaturan (Tab Umum) terbuka | 1. Klik toggle switch pada opsi **Mode Pemeliharaan** atau **Tutup Pendaftaran** 2. Perhatikan perubahan label 3. Klik **Simpan Perubahan** | Status switch berubah dari "Nonaktif" menjadi "Aktif" atau sebaliknya secara interaktif | Komponen toggle switch responsif saat diklik | ✅ Pass |
| TC-003 | Mengakses dan mengubah Pengaturan Moderasi | Halaman Pengaturan terbuka | 1. Klik sub-tab **Moderasi** 2. Ubah toggle Auto-Approve atau sesuaikan angka batas kedaluwarsa lowongan 3. Klik **Simpan Perubahan** | Sistem beralih ke URL #moderasi dan berhasil memperbarui data ketika tombol simpan ditekan | Perpindahan sub-tab berjalan lancar dan input modifikasi dapat diisi dengan benar | ✅ Pass |
| TC-004 | Mengonfigurasi preferensi kiriman notifikasi admin | Halaman Pengaturan terbuka | 1. Klik sub-tab **Notifikasi** 2. Atur status sakelar Notifikasi Perusahaan Baru dan Notifikasi Tiket Baru 3. Klik **Simpan Perubahan** | Sistem menampilkan form kontrol email peringatan admin dan menyimpan konfigurasi preferensi terbaru | Pengaturan notifikasi email berhasil diperbarui | ✅ Pass |
| TC-005 | Menyesuaikan pengaturan Lokalisasi & Zona Waktu | Halaman Pengaturan terbuka | 1. Klik sub-tab **Lokalisasi** 2. Klik dropdown **Bahasa Utama** atau **Zona Waktu Default** lalu pilih opsi 3. Klik **Simpan Perubahan** | Sistem berpindah ke URL #lokalisasi, menampilkan pilihan dropdown regional, dan menerapkan perubahan | Menu dropdown pilihan bahasa (ID) dan zona waktu (WIB) berfungsi normal serta konfigurasi sukses tersimpan | ✅ Pass |
 
### 4.10 Notifikasi (Admin)
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Fungsionalitas tombol lonceng Notifikasi Admin | Admin sudah login dan berada di halaman panel | 1. Perhatikan bagian header kanan atas 2. Klik ikon **Lonceng / Notifikasi** | Sistem memicu munculnya jendela kecil pop-up berjudul "Notifikasi Admin" secara overlay di bawah ikon | Jendela pop-up "Notifikasi Admin" berhasil muncul di layar secara interaktif | ✅ Pass |
| TC-002 | Kondisi jendela pop-up Notifikasi Admin saat kosong | Halaman panel terbuka dan jendela notifikasi diaktifkan | 1. Klik ikon lonceng hingga jendela pop-up terbuka 2. Pastikan belum ada pemberitahuan baru | Jendela menampilkan indikator teks abu-abu bertuliskan "Belum ada notifikasi." di bagian tengah kotak | Sistem menampilkan status kosong dengan teks penjelasan yang rapi dan simetris | ✅ Pass |
 
### 4.11 Log Out (Admin)
 
| TC-ID | Judul | Precondition | Steps | Expected Result | Actual Result | Status |
|-------|-------|--------------|-------|-----------------|---------------|--------|
| TC-001 | Fungsionalitas tombol Keluar Sistem (Logout) | Admin sudah login dan berada di halaman panel | 1. Perhatikan menu navigasi paling bawah di sidebar kiri 2. Klik tombol **Keluar Sistem** | Sistem menghapus sesi masuk (session) admin yang aktif dan mengarahkan kembali pengguna ke gerbang login utama | Tombol tidak merespons (macet), sesi admin tidak terhapus, dan halaman tidak berpindah ke menu login | ❌ Fail |
 
---
 
## Ringkasan Status Test Case
 
| Status | Jumlah |
|--------|--------|
| ✅ Pass | 74 |
| ❌ Fail | 5 |
| — (Tidak ada status) | 3 |
| **Total** | **82** |
 
### Daftar Test Case dengan Status FAIL
 
| No | Modul | Judul |
|----|-------|-------|
| 1 | Multi-Role Login (TC-002) | Login global menggunakan Google OAuth |
| 2 | Pencari Kerja – Menu Lowongan (TC-002) | Pencarian loker |
| 3 | Pencari Kerja – Menu Profil (TC-004) | Mengubah Foto Profil (Upload Avatar) |
| 4 | Pencari Kerja / Perusahaan – Log Out | Fungsionalitas tombol Keluar Sistem (Logout) |
| 5 | Perusahaan – Loker (TC-003) | Pencarian loker (Perusahaan) |
| 6 | Admin – Log Out | Fungsionalitas tombol Keluar Sistem (Logout) |