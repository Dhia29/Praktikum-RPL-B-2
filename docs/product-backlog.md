# Product Backlog - LockER

Dokumen ini berisi daftar *Product Backlog* untuk pengembangan platform *job fair* LockER. Prioritas fitur ditentukan menggunakan metode MoSCoW (*Must-have, Should-have, Could-have, Won't-have*).

## Must-have (Minimum Viable Product - MVP)
Fitur-fitur ini bersifat krusial dan wajib ada agar aplikasi dasar LockER dapat berfungsi sebagai platform rekrutmen.

* **[Must-have] BK-01: Autentikasi dan Dasbor Administrator**
    * **Story:** Sebagai Administrator, saya ingin dapat masuk ke dasbor khusus admin menggunakan kredensial yang aman, sehingga saya dapat mengelola fungsionalitas sistem secara keseluruhan.
    * **GitHub Label:** `enhancement`, `priority: must-have`, `role: admin`

* **[Must-have] BK-02: Registrasi dan Autentikasi Pengguna**
    * **Story:** Sebagai Pengguna (*Job Seeker* dan *Employer*), saya ingin dapat mendaftar, masuk (*login*), dan keluar (*logout*) dari sistem, sehingga keamanan akun dan data saya terjamin.
    * **GitHub Label:** `enhancement`, `priority: must-have`

* **[Must-have] BK-03: Moderasi Lowongan Pekerjaan**
    * **Story:** Sebagai Administrator, saya ingin dapat menghapus atau menyembunyikan lowongan pekerjaan yang melanggar aturan, sehingga keamanan pencari kerja terjaga.
    * **GitHub Label:** `enhancement`, `priority: must-have`, `role: admin`

* **[Must-have] BK-04: Manajemen Profil Pencari Kerja**
    * **Story:** Sebagai Pencari Kerja, saya ingin dapat membuat dan mengedit profil profesional saya (termasuk riwayat pendidikan, pengalaman, dan keahlian), sehingga perusahaan dapat melihat kualifikasi saya.
    * **GitHub Label:** `enhancement`, `priority: must-have`

* **[Must-have] BK-05: Pembuatan Lowongan Pekerjaan (Job Posting)**
    * **Story:** Sebagai Perusahaan (*Employer*), saya ingin dapat membuat, mengedit, dan menghapus lowongan pekerjaan, sehingga saya dapat menarik kandidat yang relevan.
    * **GitHub Label:** `enhancement`, `priority: must-have`

* **[Must-have] BK-06: Sistem Pelamaran Pekerjaan**
    * **Story:** Sebagai Pencari Kerja, saya ingin dapat mengirimkan profil saya sebagai lamaran pada lowongan pekerjaan tertentu, sehingga saya bisa masuk ke dalam tahap seleksi perusahaan.
    * **GitHub Label:** `enhancement`, `priority: must-have`

## Should-have
Fitur-fitur ini penting untuk memberikan nilai tambah dan kenyamanan bagi pengguna, namun rilis awal aplikasi masih dapat berjalan tanpanya jika waktu pengembangan terbatas.

* **[Should-have] BK-07: Pencarian dan Filter Lowongan Pekerjaan**
    * **Story:** Sebagai Pencari Kerja, saya ingin dapat mencari dan memfilter lowongan pekerjaan berdasarkan lokasi, posisi, atau jenis pekerjaan (*full-time/part-time*), sehingga saya dapat menemukan pekerjaan yang paling relevan dengan efisien.
    * **GitHub Label:** `enhancement`, `priority: should-have`

* **[Should-have] BK-08: Pelacakan Status Lamaran**
    * **Story:** Sebagai Pencari Kerja, saya ingin dapat melihat status lamaran saya (misal: *Submitted, Under Review, Interview, Rejected*), sehingga saya mendapatkan kejelasan mengenai proses rekrutmen.
    * **GitHub Label:** `enhancement`, `priority: should-have`

* **[Should-have] BK-09: Pesan Langsung (Direct Messaging)**
    * **Story:** Sebagai Pengguna, saya ingin memiliki fitur pesan teks (*chat*), sehingga Pencari Kerja dan Perusahaan dapat berkomunikasi secara langsung terkait proses rekrutmen.
    * **GitHub Label:** `enhancement`, `priority: should-have`

## Could-have
Fitur-fitur ini merupakan tambahan yang bagus (*nice-to-have*) untuk memperluas fungsionalitas, namun hanya akan dikerjakan jika sumber daya dan waktu masih tersisa.

* **[Could-have] BK-10: Linimasa (Timeline/Feed) Profesional**
    * **Story:** Sebagai Pengguna, saya ingin dapat membagikan postingan, artikel, atau pencapaian di sebuah beranda, sehingga saya dapat membangun *networking* seperti pada platform LinkedIn.
    * **GitHub Label:** `enhancement`, `priority: could-have`

* **[Could-have] BK-11: Fitur Bantuan dan Layanan Pelanggan (Customer Service)**
    * **Story:** Sebagai Administrator, saya ingin dapat menerima, melacak, dan membalas tiket bantuan (*support ticket*) atau keluhan dari pengguna, sehingga saya dapat membantu menyelesaikan kendala yang mereka hadapi dalam menggunakan platform.
    * **GitHub Label:** `enhancement`, `priority: could-have`, `role: admin`, `support`

* **[Could-have] BK-12: Notifikasi Lokal & Teleportasi Navigasi**
    * **Story:** Sebagai Pengguna, saya ingin mendapatkan notifikasi ketika ada pembaruan status lamaran atau pesan baru, sehingga saya tidak tertinggal informasi penting.
    * **GitHub Label:** `enhancement`, `priority: could-have`

## Won't-have (Not in this release)
Fitur-fitur ini diluar cakupan pengembangan saat ini dan tidak akan disertakan pada versi rilis pertama aplikasi LockER.

* **[Won't-have] BK-13: Integrasi Wawancara Video Langsung**
    * **Story:** Sebagai Perusahaan, saya ingin dapat melakukan wawancara video *live* langsung di dalam aplikasi. (Dikeluarkan dari rilis ini karena tingginya kompleksitas teknis pengembangan fitur *real-time video*).
    * **GitHub Label:** `wontfix`, `priority: wont-have`

* **[Won't-have] BK-14: Fitur Berlangganan Premium (Monetisasi)**
    * **Story:** Sebagai Perusahaan, saya ingin dapat membayar untuk mempromosikan lowongan kerja saya (*job boosting*). (Dikeluarkan karena rilis awal difokuskan pada pengujian fungsionalitas utama aplikasi, bukan monetisasi).
    * **GitHub Label:** `wontfix`, `priority: wont-have`

## Extra Features (Implemented Outside Initial Backlog)
Fitur-fitur berikut tidak direncanakan pada *backlog* awal, namun telah berhasil diimplementasikan di dalam sistem berjalan saat ini untuk meningkatkan *User Experience* dan utilitas platform:

* **[Extra] EX-01: Autentikasi Menggunakan Google (Social Login)**
    * **Deskripsi:** Pengguna dapat mendaftar dan masuk secara instan menggunakan akun Google mereka tanpa harus membuat kata sandi baru.

* **[Extra] EX-02: Sistem Koneksi / Jejaring (Networking)**
    * **Deskripsi:** Pengguna dapat mengirim permintaan koneksi, menerima koneksi, dan mendapatkan saran koneksi baru (*Suggestions*), menyerupai sistem pertemanan.

* **[Extra] EX-03: Grup Komunitas (Community Groups)**
    * **Deskripsi:** Selain *feed* global, pengguna dapat membuat, bergabung (*join*), dan keluar (*leave*) dari sebuah grup komunitas yang spesifik.

* **[Extra] EX-04: Interaksi Lanjutan pada Postingan**
    * **Deskripsi:** Pengguna dapat menyukai (*Like*), menyimpan (*Save*), serta melaporkan (*Report*) sebuah postingan di dalam komunitas/linimasa.

* **[Extra] EX-05: Penjadwalan Pertemuan (*Appointment*) & Blokir Pengguna di Chat**
    * **Deskripsi:** Di dalam fitur *Direct Messaging*, pengguna dapat saling mengirim kartu jadwal/undangan *meeting*, menerima/menolak jadwal, menghapus pesan, serta memblokir kontak tertentu.

* **[Extra] EX-06: Manajemen Berkas Profil (Unggah CV & Sertifikasi)**
    * **Deskripsi:** Pengguna dapat mengunggah berkas CV (PDF) dan berkas bukti sertifikasi secara langsung di profil profesional mereka.