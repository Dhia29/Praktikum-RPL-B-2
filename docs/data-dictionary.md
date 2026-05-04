# Data Dictionary
## LockER — Career Platform
**Praktikum RPL · Kelompok 02 Kelas B · Program Studi Informatika UNS · 2026**

---

### Tabel: users
Entitas induk semua akun pengguna. Dibedakan berdasarkan atribut role (JOB_SEEKER, COMPANY, ADMIN).

| Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK, NOT NULL | Primary key, auto-generated |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email unik, digunakan untuk login (V-01) |
| password_hash | VARCHAR(255) | NOT NULL | Password di-hash dengan bcrypt; plain text dilarang (V-03) |
| role | VARCHAR(20) | NOT NULL | Nilai: JOB_SEEKER &#124; COMPANY &#124; ADMIN |
| status | VARCHAR(20) | NOT NULL, DEFAULT active | Nilai: active &#124; pending &#124; disabled |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | Waktu pembuatan akun |

### Tabel: job_seeker_profiles
Profil profesional milik Pencari Kerja. Berelasi 1:1 dengan tabel users.

| Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK, NOT NULL | Primary key |
| user_id | UUID | FK → users.id, NOT NULL | Relasi 1:1 ke tabel users |
| nama_lengkap | VARCHAR(200) | NOT NULL | Nama lengkap pencari kerja |
| pendidikan | JSON | NULLABLE | Array riwayat pendidikan (institusi, tahun, gelar) |
| pengalaman | JSON | NULLABLE | Array riwayat kerja (posisi, perusahaan, durasi) |
| skill | JSON | NULLABLE | Array keahlian (nama skill, level) |
| cv_url | VARCHAR(500) | NULLABLE | URL file CV; tipe PDF, maks 5 MB (V-06) |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT now() | Waktu terakhir profil diperbarui |

### Tabel: company_profiles
Profil bisnis Perusahaan. Memerlukan verifikasi Admin sebelum akun aktif (BR-01).

| Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK, NOT NULL | Primary key |
| user_id | UUID | FK → users.id, NOT NULL | Relasi 1:1 ke tabel users |
| nama_perusahaan | VARCHAR(200) | NOT NULL | Wajib diisi; tidak boleh kosong (V-05) |
| npwp | VARCHAR(30) | NOT NULL | Nomor Pokok Wajib Pajak; dasar verifikasi Admin (V-04) |
| bidang_industri | VARCHAR(100) | NOT NULL | Sektor industri perusahaan |
| logo_url | VARCHAR(500) | NULLABLE | URL logo perusahaan |
| lokasi | VARCHAR(200) | NULLABLE | Kota / daerah kantor utama |
| deskripsi | TEXT | NULLABLE | Deskripsi singkat perusahaan |
| verifikasi_status | VARCHAR(20) | NOT NULL, DEFAULT pending | Nilai: pending &#124; verified &#124; rejected (BR-01) |

### Tabel: job_postings
Lowongan kerja yang dibuat Perusahaan. Masuk status pending dan dimoderasi Admin sebelum tayang (BR-02).

| Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK, NOT NULL | Primary key |
| company_id | UUID | FK → company_profiles.id, NOT NULL | Relasi 1:N ke company_profiles |
| judul | VARCHAR(200) | NOT NULL | Judul posisi; wajib diisi (V-08) |
| deskripsi | TEXT | NOT NULL | Deskripsi pekerjaan dan kualifikasi |
| kategori | VARCHAR(100) | NOT NULL | Bidang / kategori pekerjaan |
| lokasi | VARCHAR(200) | NOT NULL | Kota atau Remote |
| deadline | DATE | NOT NULL | Harus lebih besar dari tanggal hari ini (V-07) |
| status | VARCHAR(20) | NOT NULL, DEFAULT pending | Nilai: pending &#124; active &#124; hidden &#124; expired (BR-02) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | Waktu lowongan dibuat |

### Tabel: applications
Lamaran kerja Pencari Kerja ke lowongan. Junction table relasi M:N antara job_postings dan job_seeker_profiles.

| Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK, NOT NULL | Primary key |
| job_id | UUID | FK → job_postings.id, NOT NULL | Lowongan yang dilamar |
| jobseeker_id | UUID | FK → job_seeker_profiles.id, NOT NULL | Identitas pelamar |
| (job_id, jobseeker_id) | — | UNIQUE INDEX | Mencegah apply ganda ke lowongan yang sama (BR-03, V-09) |
| status | VARCHAR(20) | NOT NULL, DEFAULT submitted | Nilai: submitted &#124; review &#124; interview &#124; rejected (FR-11) |
| cv_snapshot_url | VARCHAR(500) | NULLABLE | Snapshot URL CV pada saat lamaran dikirim |
| submitted_at | TIMESTAMP | NOT NULL, DEFAULT now() | Waktu lamaran dikirimkan |

### Tabel: messages
Pesan teks dua arah antara Pencari Kerja dan Perusahaan terkait proses rekrutmen (FR-12).

| Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK, NOT NULL | Primary key |
| from_user_id | UUID | FK → users.id, NOT NULL | Pengirim pesan |
| to_user_id | UUID | FK → users.id, NOT NULL | Penerima pesan |
| konten | TEXT | NOT NULL | Isi pesan teks |
| read_at | TIMESTAMP | NULLABLE | NULL = belum dibaca; terisi saat pertama kali dibaca |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | Waktu pesan dikirim |

### Tabel: admin_logs
Audit trail semua aksi administratif. Dicatat otomatis setiap Admin melakukan aksi moderasi atau manajemen pengguna (BR-06).

| Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK, NOT NULL | Primary key |
| admin_id | UUID | FK → users.id, NOT NULL | Admin yang melakukan aksi |
| action | VARCHAR(100) | NOT NULL | Contoh: APPROVE_JOB, DISABLE_USER, DELETE_POST |
| target_entity | VARCHAR(50) | NOT NULL | Nama tabel yang menjadi target aksi |
| target_id | UUID | NOT NULL | ID record yang dikenai aksi |
| timestamp | TIMESTAMP | NOT NULL, DEFAULT now() | Waktu aksi dicatat |