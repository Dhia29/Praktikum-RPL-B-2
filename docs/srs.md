**BAB I**
**PENDAHULUAN**

**1.1 Tujuan Dokumen**
Dokumen Software Requirements Specification (SRS) ini disusun sebagai referensi tunggal untuk menyelaraskan pemahaman teknis antara tim pengembang dan asisten dosen mengenai fungsi serta batasan sistem LockER. Dokumen ini berfungsi sebagai pedoman utama dalam tahap perancangan arsitektur, pembuatan basis data, hingga implementasi kode program untuk menjamin tidak adanya penyimpangan fitur selama proses pengembangan. Selain itu, dokumen ini bertindak sebagai kontrak fungsional yang menjadi acuan dasar dalam proses verifikasi dan validasi pada tahap pengujian akhir praktikum. Melalui dokumen ini, setiap kebutuhan dipastikan memiliki keterlacakan (traceability) yang kuat terhadap problem statement dan user stories yang telah disusun pada tahap sebelumnya, sehingga solusi yang dibangun tetap relevan dengan kebutuhan pengguna.

**1.2 Ruang Lingkup**
Ruang lingkup pengembangan LockER mencakup pembangunan platform karier digital berbasis web yang mengintegrasikan kebutuhan tiga aktor utama: Admin, Perusahaan, dan Pencari Kerja. Sistem ini memfokuskan fungsionalitasnya pada digitalisasi proses rekrutmen, mulai dari pengelolaan profil profesional, publikasi lowongan pekerjaan yang terverifikasi, hingga mekanisme pengajuan lamaran secara daring. Sistem ini dirancang untuk mengatasi hambatan informasi lowongan yang tersebar tidak merata dengan menyediakan pusat data lowongan yang dapat difilter berdasarkan kriteria tertentu, serta menyediakan dashbord khusus bagi perusahaan untuk mengelola pelamar secara teroganisir.

**1.3 Definisi dan Akronim**

| ISTILAH | DEFINISI |
| :--- | :--- |
| Pencari Kerja | pengguna yang mencari dan melamar pekerjaan |
| Perusahaan | entitas pemberi kerja yang memiliki otorisasi posting lowongan |
| Bcrypt | algoritma enkripsi yang digunakan untuk mengamankan kredensial pengguna |
| Traceability | keterhubungan antara kode fitur dengan kebutuhan awal |
| NPWP | dokumen identitas pajak yang digunakan sebagai syarat verifikasi legalitas perusahaan dalam sistem ini |

---

**BAB II**
**DESKRIPSI UMUM**

**2.1 Perspektif Produk**
lockER merupakan aplikasi job portal yang dasarnya merupakan two-sided marketplace karena melibatkan dua stakeholder yaitu perusahaan dan job seekers. Aplikasi ini dibuat untuk menyediakan layanan yang menghubungkan potential human resources dengan peluang karir secara efisien, transparan, dan sesuai persona. Bagi perspektif pencari kerja, hal ini merupakan sebuah kesempatan untuk career path mereka yang sedang dibangun. Dengan melihat informasi peluang karir yang sangat informatif dan tentunya disesuaikan dengan skills dan passion mereka. Bagi perspektif rekruter (company), mereka akan lebih mudah dalam scouting talent sesuai dengan kebutuhan mereka sekaligus seleksi yang dilakukan oleh HRD dari perusahaan yang membuka lowongan kerja terbilang mudah karena bisa melakukan appointment dengan talent yang melamar langsung melalui direct message dalam aplikasi yang dari bentuk seperti gmail.

**2.2 Fungsi Produk**

**A. Fungsi untuk Pencari Kerja (Job Seeker)**
1. Manajemen Akun & Profil: Mendaftar, masuk (login), dan mengelola profil lengkap (data diri, riwayat pendidikan, pengalaman kerja, skill, dan unggah CV/portofolio).
2. Pencarian Pekerjaan: Mencari lowongan kerja dengan filter spesifik (kata kunci, lokasi, rentang gaji, tipe pekerjaan, industri).
3. Pelamaran Pekerjaan: Mengirimkan profil dan lampiran dokumen tambahan ke lowongan yang dipilih hanya dengan satu atau beberapa klik.
4. Pelacakan Status (Application Tracking): Memantau status lamaran yang telah dikirim (misal: Terkirim, Sedang Direview, Panggilan Wawancara, Ditolak).
5. Sistem Notifikasi: Menerima pemberitahuan terkait status lamaran, pesan dari rekruter, atau rekomendasi lowongan baru yang sesuai profil.

**B. Fungsi untuk Perusahaan/Rekruter**
1. Manajemen Akun Perusahaan
Mendaftar, memverifikasi legalitas perusahaan, dan melengkapi profil perusahaan (logo, deskripsi, budaya kerja).
2. Job Posting
Membuat, mengedit, mempublikasikan, menonaktifkan, atau menghapus iklan lowongan kerja.
3. Listing Talent
Melihat daftar pelamar, memfilter kandidat, mengunduh CV, mengubah status pelamar (terima/tolak/wawancara), dan mengirim pesan/jadwal wawancara ke kandidat.
4. Pencarian Talenta (Resume Search)
Mencari profil kandidat secara proaktif dari database platform tanpa harus menunggu mereka melamar.
5. Appointment Pelamar Kerja
Company dapat membuat appointment dengan pelamar untuk menjadwalkan interview atau hari pertama kerja dengan menerapkan deskripsi yang mungkin bisa untuk peraturan atau seragam.
6. Direct Message kepada Pelamar
Untuk mengirim pesan informasi kepada pelamar atau sebaliknya (konfirmasi dari kedua belah pihak)

**2.3 Karakteristik Pengguna**

**A. Pencari Kerja (Job Seeker)**
1. Usia produktif (18-35 tahun), dari berbagai latar belakang pendidikan.
2. Dapat menggunakan aplikasi berbasis smartphone atau web browser standar.
3. Mencari opportunity yang bisa berupa Internship, Part-Time, Full-Time, Remote.

**B Perusahaan/Rekruter**
1. HRD, Manajer, atau Pemilik Usaha (UMKM/Startup).
2. Terbiasa menggunakan komputer untuk pekerjaan administratif, mengoperasikan perangkat lunak perkantoran, dan email.
3. Mengakses platform melalui PC/Laptop (Desktop) pada jam kerja untuk meninjau CV yang banyak dan memfilter data dengan detail.

**2.4 Batasan**

**A. Batasan Teknis & Lingkungan**
1. Aplikasi sepenuhnya bergantung pada koneksi internet yang stabil; tidak ada fungsionalitas utama yang berjalan secara offline.
2. Sistem diakses melalui web browser (Chrome, Safari, Mozilla) yang responsif

**B. Batasan Keamanan & Privasi (Regulasi)**
1. Sistem wajib mematuhi Undang-Undang Pelindungan Data Pribadi (UU PDP). Data sensitif seperti NIK, nomor telepon, dan CV hanya boleh diakses oleh perusahaan yang dilamar, tidak untuk publik.
2. Password pengguna harus dienkripsi di dalam basis data dan tidak boleh disimpan dalam bentuk plain text.

**C. Batasan Aturan Bisnis**
1. Lowongan yang di-posting oleh perusahaan baru tidak akan langsung tayang (publish), melainkan masuk ke status pending hingga disetujui (verifikasi manual) oleh Admin untuk menghindari penipuan loker.
2. Pencari kerja tidak bisa melamar pada lowongan yang sama lebih dari satu kali.

---

**BAB III**
**KEBUTUHAN FUNGSIONAL**

| ID FR | Deskripsi Kebutuhan Fungsional | Prioritas | Ref (User Story) |
| :--- | :--- | :--- | :--- |
| FR-01 | Registrasi Pengguna: Sistem harus memfasilitasi pendaftaran akun bagi Pencari Kerja (menggunakan email/password) dan Perusahaan (menyertakan NPWP) | High | US-01, US-02 |
| FR-02 | Autentikasi Login: Sistem harus mengautentikasi pengguna berdasarkan email dan password, lalu mengarahkan mereka ke dashboard sesuai dengan rolenya masing-masing. | High | US-03, BK-01 |
| FR-03 | Manajemen Akun oleh Admin: Sistem harus memungkinkan Admin untuk menonaktifkan atau menghapus akun pengguna untuk menjaga kualitas dan integritas platform. | High | US-04, BK-01 |
| FR-04 | Pengelolaan Profil Pencari Kerja: Sistem harus menyediakan fitur untuk mengunggah CV (maksimal 5MB) dan fitur memperbarui data pendidikan dan keahlian bagi Pencari Kerja. | High | US-05, BK-04 |
| FR-05 | Pengelolaan Profil Perusahaan: Sistem harus memungkinkan Perusahaan untuk mengisi identitas bisnis seperti logo, lokasi, dan deskripsi perusahaan | High | US-06, BK-02 |
| FR-06 | Posting Lowongan Kerja: Sistem harus menyediakan fitur bagi Perusahaan untuk membuat, mengedit, dan mempublikasikan lowongan pekerjaanyang mencakup judul, deskripsi, dan deadline | High | US-08, BK-05 |
| FR-07 | Sistem Pelamaran: Sistem harus memproses pengiriman data profil dan CV pencari kerja sebagai lamaran resmi ke lowongan yang dipilih. | High | US-07, BK-06 |
| FR-08 | Pencarian & Filter: Sistem harus menyediakan fitur pencarian lowongan kerja berdasarkan kata kunci posisi atau lokasi. | Medium | BK-07 |
| FR-09 | Pelacakan Status: Sistem harus menampilkan status lamaran (Submitted, Review, Interview, Rejected) secara real-time di dashboard Pencari Kerja. | Medium | BK-08 |

---

**BAB IV**
**KEBUTUHAN NON-FUNGSIONAL**

| ID | Kategori | Deskripsi Kebutuhan |
| :--- | :--- | :--- |
| NFR-01 | Usability | Antarmuka pengguna harus menerapkan estetika desain minimalis dan industrial dengan skema warna monokrom (hitam-putih) untuk memastikan navigasi yang bersih, profesional, dan fokus pada konten lowongan. |
| NFR-02 | Availability | Sistem harus memiliki tingkat ketersediaan (uptime) minimal 99,8% setiap bulan, terutama untuk memastikan platform tetap aktif tanpa gangguan selama periode virtual career expo berlangsung. |
| NFR-03 | Performance | Waktu pemuatan halaman utama dan pencarian lowongan kerja tidak boleh melebihi 2 detik pada kondisi jaringan internet stabil (kecepatan minimal 5 Mbps). |
| NFR-04 | Security | Semua data sensitif pengguna, terutama kata sandi dan dokumen pribadi (CV/Portofolio), wajib dienkripsi menggunakan protokol keamanan standar industri (seperti AES-256 atau hashing bcrypt). |
| NFR-05 | Scalability | Arsitektur sistem harus mampu menangani lonjakan trafik hingga 5.000 pengguna aktif secara bersamaan tanpa adanya penurunan performa yang signifikan saat pembukaan bursa kerja besar. |
| NFR-06 | Reliability | Sistem harus melakukan backup data secara otomatis setiap 24 jam ke server cadangan untuk mencegah kehilangan data pelamar maupun data perusahaan. |
| NFR-07 | Compatibility | Aplikasi web harus dapat diakses dan berfungsi dengan optimal pada berbagai peramban modern seperti Google Chrome, Mozilla Firefox, dan Safari, serta responsif saat dibuka melalui perangkat seluler. |
| NFR-08 | Maintainability | Kode program harus disusun menggunakan pola desain yang modular (seperti MVC) dan didokumentasikan dengan baik agar memudahkan proses pembaruan fitur di masa mendatang. |

---

**BAB V**
**CATATAN DAN ASUMSI**

**A. Asumsi (Assumptions)** Asumsi adalah kondisi atau faktor lingkungan yang dianggap benar dan tersedia selama proses pengembangan serta operasional sistem LockER:
1. Ketersediaan Perangkat dan Jaringan: Diasumsikan bahwa semua pengguna (Pencari Kerja, Perusahaan/Rekruter, dan Admin) memiliki perangkat keras yang memadai (PC/Laptop untuk Rekruter, Smartphone untuk Pencari Kerja) dan terhubung dengan koneksi internet yang stabil, mengingat sistem LockER tidak memiliki fungsionalitas offline (merujuk pada Batasan Teknis 2.4.A).
2. Literasi Digital Pengguna: Diasumsikan bahwa pengguna memiliki literasi digital dasar, termasuk kemampuan mengoperasikan web browser modern (Chrome, Mozilla, Safari) dan menggunakan aplikasi email atau direct message dasar.
3. Validitas Identitas Perusahaan: Diasumsikan bahwa dokumen NPWP yang diunggah oleh perusahaan saat registrasi adalah dokumen yang sah dan aktif secara hukum, yang nantinya akan menjadi dasar kuat bagi Admin untuk melakukan verifikasi manual.
4. Dukungan Infrastruktur Cloud/Server: Diasumsikan bahwa infrastruktur server pihak ketiga yang akan digunakan (seperti AWS, Google Cloud, atau layanan hosting lainnya) memiliki kapabilitas untuk mendukung kebutuhan non-fungsional aplikasi, seperti uptime 99,8%, kemampuan menampung hingga 5.000 concurrent users, serta fitur auto-backup harian (merujuk pada NFR-02, NFR-05, NFR-06).
5. Keamanan Berkas Eksternal: Diasumsikan bahwa berkas dokumen (file PDF untuk CV/Portofolio maksimal 5MB) yang diunggah oleh pengguna adalah berkas yang wajar dan bukan malware, meskipun sistem tetap harus menyiapkan langkah pencegahan di sisi server.

**B. Catatan (Notes / Dependencies)** Catatan berisi penjelasan tambahan, ketergantungan sistem (dependencies), atau peringatan yang perlu diperhatikan oleh tim pengembang dan stakeholder.
1. Ketergantungan Kinerja Admin (Bottleneck Potensial): Karena setiap lowongan yang di-posting oleh perusahaan baru harus melalui verifikasi manual oleh Admin agar berstatus publish (merujuk pada Batasan Aturan Bisnis 2.4.C), maka kecepatan tampilnya lowongan sangat bergantung pada Service Level Agreement (SLA) atau jam operasional Admin aplikasi.
2. Kepatuhan Regulasi (UU PDP): Untuk memenuhi Batasan Keamanan & Privasi terkait Undang-Undang Pelindungan Data Pribadi, sistem harus dilengkapi dengan fitur Terms and Conditions (Syarat & Ketentuan) serta Privacy Policy (Kebijakan Privasi) yang mensyaratkan persetujuan eksplisit (checkbox) dari pengguna saat proses registrasi awal (merujuk pada FR-01).
3. Pengelolaan Storage: Fitur unggah CV/Portofolio dengan batas maksimal 5MB per pengguna mengharuskan tim pengembang untuk memantau kapasitas storage server secara berkala, terutama ketika aplikasi telah mencapai skala ribuan pengguna.