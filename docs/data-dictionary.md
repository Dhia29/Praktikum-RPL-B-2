# [cite_start]Data Dictionary [cite: 1]
## [cite_start]LockER — Career Platform [cite: 2]
[cite_start]**Praktikum RPL · Kelompok 02 Kelas B · Program Studi Informatika UNS · 2026** [cite: 3]

---

### [cite_start]Tabel: users [cite: 4]
Entitas induk semua akun pengguna. [cite_start]Dibedakan berdasarkan atribut role (JOB_SEEKER, COMPANY, ADMIN). [cite: 5]

| Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK, NOT NULL | [cite_start]Primary key, auto-generated [cite: 6] |
| email | VARCHAR(255) | UNIQUE, NOT NULL | [cite_start]Email unik, digunakan untuk login (V-01) [cite: 6] |
| password_hash | VARCHAR(255) | NOT NULL | [cite_start]Password di-hash dengan bcrypt; plain text dilarang (V-03) [cite: 6] |
| role | VARCHAR(20) | NOT NULL | Nilai: JOB_SEEKER &#124; COMPANY &#124; [cite_start]ADMIN [cite: 6] |
| status | VARCHAR(20) | NOT NULL, DEFAULT active | [cite_start]Nilai: active &#124; pending &#124; disabled [cite: 6] |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | [cite_start]Waktu pembuatan akun [cite: 6] |

### [cite_start]Tabel: job_seeker_profiles [cite: 7]
Profil profesional milik Pencari Kerja. [cite_start]Berelasi 1:1 dengan tabel users. [cite: 8]

| Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK, NOT NULL | [cite_start]Primary key [cite: 9] |
| user_id | UUID | FK → users.id, NOT NULL | [cite_start]Relasi 1:1 ke tabel users [cite: 9] |
| nama_lengkap | VARCHAR(200) | NOT NULL | [cite_start]Nama lengkap pencari kerja [cite: 9] |
| pendidikan | JSON | NULLABLE | [cite_start]Array riwayat pendidikan (institusi, tahun, gelar) [cite: 9] |
| pengalaman | JSON | NULLABLE | [cite_start]Array riwayat kerja (posisi, perusahaan, durasi) [cite: 9] |
| skill | JSON | NULLABLE | [cite_start]Array keahlian (nama skill, level) [cite: 9] |
| cv_url | VARCHAR(500) | NULLABLE | [cite_start]URL file CV; tipe PDF, maks 5 MB (V-06) [cite: 9] |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT now() | [cite_start]Waktu terakhir profil diperbarui [cite: 9] |

### [cite_start]Tabel: company_profiles [cite: 10]
Profil bisnis Perusahaan. [cite_start]Memerlukan verifikasi Admin sebelum akun aktif (BR-01). [cite: 11]

| Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK, NOT NULL | [cite_start]Primary key [cite: 12] |
| user_id | UUID | FK → users.id, NOT NULL | [cite_start]Relasi 1:1 ke tabel users [cite: 12] |
| nama_perusahaan | VARCHAR(200) | NOT NULL | [cite_start]Wajib diisi; tidak boleh kosong (V-05) [cite: 12] |
| npwp | VARCHAR(30) | NOT NULL | [cite_start]Nomor Pokok Wajib Pajak; dasar verifikasi Admin (V-04) [cite: 12] |
| bidang_industri | VARCHAR(100) | NOT NULL | [cite_start]Sektor industri perusahaan [cite: 12] |
| logo_url | VARCHAR(500) | NULLABLE | [cite_start]URL logo perusahaan [cite: 12] |
| lokasi | VARCHAR(200) | NULLABLE | [cite_start]Kota / daerah kantor utama [cite: 12] |
| deskripsi | TEXT | NULLABLE | [cite_start]Deskripsi singkat perusahaan [cite: 12] |
| verifikasi_status | VARCHAR(20) | NOT NULL, DEFAULT pending | [cite_start]Nilai: pending &#124; verified &#124; rejected (BR-01) [cite: 12] |

### [cite_start]Tabel: job_postings [cite: 13]
Lowongan kerja yang dibuat Perusahaan. [cite_start]Masuk status pending dan dimoderasi Admin sebelum tayang (BR-02). [cite: 14]

| Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK, NOT NULL | [cite_start]Primary key [cite: 15] |
| company_id | UUID | FK → company_profiles.id, NOT NULL | [cite_start]Relasi 1:N ke company_profiles [cite: 15] |
| judul | VARCHAR(200) | NOT NULL | [cite_start]Judul posisi; wajib diisi (V-08) [cite: 15] |
| deskripsi | TEXT | NOT NULL | [cite_start]Deskripsi pekerjaan dan kualifikasi [cite: 15] |
| kategori | VARCHAR(100) | NOT NULL | [cite_start]Bidang / kategori pekerjaan [cite: 15] |
| lokasi | VARCHAR(200) | NOT NULL | [cite_start]Kota atau Remote [cite: 15] |
| deadline | DATE | NOT NULL | [cite_start]Harus lebih besar dari tanggal hari ini (V-07) [cite: 15] |
| status | VARCHAR(20) | NOT NULL, DEFAULT pending | [cite_start]Nilai: pending &#124; active &#124; hidden &#124; expired (BR-02) [cite: 15] |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | [cite_start]Waktu lowongan dibuat [cite: 15] |

### [cite_start]Tabel: applications [cite: 16]
Lamaran kerja Pencari Kerja ke lowongan. [cite_start]Junction table relasi M:N antara job_postings dan job_seeker_profiles. [cite: 17]

| Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK, NOT NULL | [cite_start]Primary key [cite: 18] |
| job_id | UUID | FK → job_postings.id, NOT NULL | [cite_start]Lowongan yang dilamar [cite: 18] |
| jobseeker_id | UUID | FK → job_seeker_profiles.id, NOT NULL | [cite_start]Identitas pelamar [cite: 18] |
| (job_id, jobseeker_id) | — | UNIQUE INDEX | [cite_start]Mencegah apply ganda ke lowongan yang sama (BR-03, V-09) [cite: 18] |
| status | VARCHAR(20) | NOT NULL, DEFAULT submitted | [cite_start]Nilai: submitted &#124; review &#124; interview &#124; rejected (FR-11) [cite: 18] |
| cv_snapshot_url | VARCHAR(500) | NULLABLE | [cite_start]Snapshot URL CV pada saat lamaran dikirim [cite: 18] |
| submitted_at | TIMESTAMP | NOT NULL, DEFAULT now() | [cite_start]Waktu lamaran dikirimkan [cite: 18] |

### [cite_start]Tabel: messages [cite: 19]
[cite_start]Pesan teks dua arah antara Pencari Kerja dan Perusahaan terkait proses rekrutmen (FR-12). [cite: 20]

| Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK, NOT NULL | [cite_start]Primary key [cite: 21] |
| from_user_id | UUID | FK → users.id, NOT NULL | [cite_start]Pengirim pesan [cite: 21] |
| to_user_id | UUID | FK → users.id, NOT NULL | [cite_start]Penerima pesan [cite: 21] |
| konten | TEXT | NOT NULL | [cite_start]Isi pesan teks [cite: 21] |
| read_at | TIMESTAMP | NULLABLE | [cite_start]NULL = belum dibaca; terisi saat pertama kali dibaca [cite: 21] |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | [cite_start]Waktu pesan dikirim [cite: 21] |

### [cite_start]Tabel: admin_logs [cite: 22]
Audit trail semua aksi administratif. [cite_start]Dicatat otomatis setiap Admin melakukan aksi moderasi atau manajemen pengguna (BR-06). [cite: 23]

| Kolom | Tipe Data | Constraint | Keterangan |
| --- | --- | --- | --- |
| id | UUID | PK, NOT NULL | [cite_start]Primary key [cite: 24] |
| admin_id | UUID | FK → users.id, NOT NULL | [cite_start]Admin yang melakukan aksi [cite: 24] |
| action | VARCHAR(100) | NOT NULL | [cite_start]Contoh: APPROVE_JOB, DISABLE_USER, DELETE_POST [cite: 24] |
| target_entity | VARCHAR(50) | NOT NULL | [cite_start]Nama tabel yang menjadi target aksi [cite: 24] |
| target_id | UUID | NOT NULL | [cite_start]ID record yang dikenai aksi [cite: 24] |
| timestamp | TIMESTAMP | NOT NULL, DEFAULT now() | [cite_start]Waktu aksi dicatat [cite: 24] |