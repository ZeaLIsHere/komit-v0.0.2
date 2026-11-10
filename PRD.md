# PRD.md — Product Requirements Document (Komit-V2)

> **Rantai Dokumen Wajib (Execution Chain):**
> 1. Baca [`AGENTS.md`](./AGENTS.md) untuk aturan engineering, keamanan, dan daftar skill.
> 2. Gunakan skill **`understand-*` (Understand-Anything)** saat membangun atau melanjutkan fitur untuk membaca peta arsitektur (`.ua/knowledge-graph.json`), menganalisis domain (`understand-domain`), dan mengecek dampak perubahan (`understand-diff`).
> 3. Aktifkan skill UI/Visual (`impeccable`, `design-taste-frontend`, `unslop`, `anatomy`).
> 4. Gunakan **`PRD.md`** ini sebagai sumber kebenaran fitur, alur bisnis, dan skema data.
> 5. Terapkan [`DESIGN.md`](./DESIGN.md) untuk seluruh implementasi UI, warna, tipografi, spacing, dan komponen.

---

## 1. Ringkasan Produk
**Komit-V2** adalah platform *Productized Service & SaaS* terpadu untuk mahasiswa Ilmu Komputer / Teknik Informatika yang melayani berbagai kebutuhan pengerjaan tugas kuliah, praktikum, dan proyek akademik secara profesional, terstruktur, dan terpercaya.

Komit-V2 tidak hanya menangani otomasi commit GitHub, melainkan menjadi **pusat pemesanan jasa tugas kuliah IT** dengan 4 pilar layanan utama:
1. **Proyek Kelompok Kuliah (`project_joki`):** Pengerjaan proyek koding berkelompok skala semester/UAS dari nol hingga siap demo. Dilengkapi fitur unggulan *Cicil Commit GitHub Terjadwal* atas nama akun GitHub asli masing-masing anggota via OAuth, rekomendasi ide + gimmick pemikat dosen oleh AI, panduan presentasi README, dan add-on slide presentasi.
2. **Koding Ringan (`tugas_ringan`):** Pengerjaan tugas pemrograman mandiri, algoritma, struktur data, pembuatan skrip, praktikum harian, atau bug fixing dengan turnaround cepat, clean code, dan penjelasan alur kode.
3. **Makalah Akademik (`makalah`):** Penulisan makalah resmi, laporan praktikum, paper ilmiah, review jurnal, serta perancangan sistem (UML, ERD, arsitektur) yang terstruktur, bebas plagiasi, berstandar sitasi ilmiah (IEEE/APA), dan didukung AI topic outline builder (`topik.md`).
4. **Slide Presentasi (`ppt`):** Pembuatan slide presentasi modern, visual, dan persuasif (PPTX, PDF, Canva) untuk ujian, seminar, tugas mingguan, atau demo proyek kelompok.

---

## 2. Target Pengguna
1. **Mahasiswa Pemesan (Client / Buyer):** Mahasiswa IT yang memesan salah satu dari 4 layanan tugas kuliah, memilih konfigurasi paket, membayar tagihan via QRIS Statis, memantau kemajuan pengerjaan, dan mengunduh hasil deliverable langsung dari dashboard.
2. **Anggota Kelompok (Contributor — Khusus Layanan Proyek Kelompok):** Teman sekelompok yang menerima tautan undangan dari ketua kelompok untuk menghubungkan akun GitHub mereka (`Connect GitHub OAuth`) agar grafik kontribusi di repository terbagi secara adil dan natural.
3. **Admin & Tim Joki (Operator):** Tim internal yang memverifikasi bukti pembayaran QRIS via popup modal, memantau antrean pesanan, meriset dokumen acuan penulisan via AI `topik.md`, menjadwalkan commit (jika proyek koding), serta mengunggah file deliverable hasil pengerjaan (Google Drive / PDF / PPTX / Docx) ke dashboard klien.

---

## 3. Struktur Layanan & Formula Harga

### A. 4 Kategori Layanan Utama (`service_type`)
| Kategori Layanan | Kode Teknis | Target Output | Kebutuhan GitHub |
|---|---|---|---|
| **Proyek Kelompok Kuliah** | `project_joki` | Kode aplikasi lengkap, commit berjadwal, README demo | Wajib (Akun Anggota) |
| **Koding Ringan** | `tugas_ringan` | File kode sumber (script/project), dokumentasi singkat | Opsional / Tanpa Commit |
| **Makalah Akademik** | `makalah` | File dokumen `.docx` / `.pdf` terstruktur rapi | Tidak Butuh GitHub |
| **Slide Presentasi** | `ppt` | Slide presentasi `.pptx` / `.pdf` siap presentasi | Tidak Butuh GitHub |

### B. Paket Proyek Kelompok (`package_type`)
1. **Paket Full (`full`):** Rekomendasi ide AI + Gimmick Dosen + Koding Full + Cicil Commit GitHub berkala + Gratis README bahan presentasi demo UAS.
2. **Paket Koding Saja (`code_only`):** Ide dan arsitektur dari mahasiswa, tim mengerjakan implementasi kode + Cicil Commit GitHub terjadwal.
3. **Paket Ide & Blueprint (`idea_only`):** Rekomendasi ide inovatif dari AI + Arsitektur sistem + Panduan teknis pengerjaan mandiri.

### C. Formula Harga
- **Proyek Kelompok Kuliah:** Formula dasar adil kelompok: $N \times \text{Rp } 50.000$ (Contoh: kelompok 4 orang = Rp 200.000).
- **Koding Ringan:** Mulai dari Rp 35.000 – Rp 100.000 tergantung tingkat kerumitan modul atau algoritma.
- **Makalah Akademik:** Mulai dari Rp 75.000 berdasarkan jumlah halaman, topik bahasan, dan kedalaman tinjauan pustaka.
- **Slide Presentasi:** Rp 75.000 (tersedia juga sebagai Add-on opsional untuk pesanan proyek koding).

---

## 4. Alur Pengguna End-to-End (User Flow)

### Langkah 1: Pemesanan & Pembayaran (`/order`)
1. User masuk ke `/order` (wajib login via Google / GitHub / Email & Password).
2. Memilih salah satu dari 4 kategori layanan (`service_type`):
   - **Jika Proyek Kelompok / Koding Ringan:** User memasukkan konfigurasi paket, kuota anggota kelompok, dan verifikasi akun GitHub klien.
   - **Jika Makalah / Slide Presentasi:** Form otomatis beradaptasi tanpa kolom kredensial GitHub. User cukup memasukkan Nama Pemesan, NIM, Topik/Judul Dokumen (`doc_topic`), dan Instruksi Khusus (`doc_details`).
3. Sistem menghitung total harga secara transparan.
4. Sistem menyajikan **QRIS Statis**. User melakukan transfer dan mengunggah foto bukti bayar.
5. **In-Browser Image Compression (`src/lib/image-compress.ts`):** Foto bukti transfer (3–8 MB) otomatis dikompresi di browser via HTML5 Canvas menjadi format JPEG ~30–60 KB sebelum disimpan langsung ke Cloud Firestore. Hal ini menghilangkan ketergantungan pada Firebase Storage berbayar (Blaze plan) dan menjaga dokumen tetap aman di bawah limit 1 MB Firestore.
6. Status pesanan dibuat dengan `payment_status: 'pending'` dan `status: 'waiting_payment'`.

### Langkah 2: Verifikasi Pembayaran oleh Admin (`/admin`)
1. Admin membuka Workspace Operator di `/admin`.
2. Admin melihat antrean pembayaran masuk dengan metrik real-time.
3. Admin menekan tombol **"Bukti Bayar"** yang langsung memunculkan **Popup Modal** tanpa berpindah halaman, lengkap dengan detail pemesan, nominal `tabular-nums`, zoom preview gambar, dan opsi unduh gambar asli.
4. Admin menekan **Approve** $\rightarrow$ `payment_status: 'paid'`, `status: 'setup'`. Proyek terbuka untuk tahap pengerjaan.
5. Jika transfer tidak valid, Admin menekan **Reject** $\rightarrow$ `payment_status: 'rejected'`.

### Langkah 3: Setup & Penyiapan Proyek (`/project/[id]/setup` & `/admin/project/[id]`)
1. **Jika Layanan Proyek Kelompok (`project_joki`):**
   - User memasukkan *niche* topik mata kuliah (misal: *"Sistem Keuangan Komunitas"*).
   - Endpoint AI `/api/ai/ideas` menghasilkan 3 ide aplikasi inovatif yang dilengkapi **Gimmick Pemikat Dosen** (fitur pemikat nilai A untuk demo UAS).
   - User memilih dan mengunci 1 ide, lalu melengkapi data anggota kelompok (Nama, NIM, KOM, Username GitHub).
   - Sistem membagikan tautan undangan `/join/[id]` untuk **Connect GitHub (OAuth)** tiap anggota kelompok.
2. **Jika Layanan Makalah / Slide PPT (`makalah` / `ppt`):**
   - User melengkapi daftar identitas resmi anggota tim (Nama & NIM) tanpa langkah koneksi GitHub yang tidak relevan.
   - Di sisi Admin (`/admin/project/[id]`), Admin dapat menekan tombol **"Buat topik.md ⚡"** yang memicu Groq LPU API (`/api/ai/topic-doc`) untuk menyusun rancangan outline terstruktur, struktur bab/slide, poin pembahasan, dan daftar referensi jurnal ilmiah terkini sebagai acuan penulisan.

### Langkah 4: Pelaksanaan Pengerjaan & Pengiriman Hasil Deliverable
1. **Proyek Kelompok Kuliah (Git Flow):**
   - Tim joki mengerjakan kode aplikasi di repository GitHub.
   - Commit di-push bertahap mingguan atas nama token OAuth anggota kelompok melalui cron `/api/cron/push-commits` sehingga grafik kontribusi terlihat merata.
   - Klien dapat menekan tombol **"Generate README"** di dashboard untuk memperoleh panduan bahan presentasi UAS dan bocoran tanya-jawab dosen.
2. **Makalah, Slide Presentasi & Koding Ringan (Document & File Flow):**
   - Tim joki menyelesaikan penulisan makalah atau pembuatan slide presentasi sesuai acuan `topik.md`.
   - Di halaman `/admin/project/[id]`, Admin memasukkan tautan file hasil pengerjaan (Google Drive publik, Dropbox, atau tautan langsung PDF/PPTX/Docx) pada card **"Kirim Hasil Pengerjaan"**.
   - Admin menekan tombol **"Kirim & Selesaikan"** yang secara otomatis mengupdate `doc_file_url` dan mengubah status proyek menjadi `completed`.
   - Di Client Dashboard (`/project/[id]`), card hasil pengerjaan otomatis berubah dari `Sedang Dikerjakan` menjadi `✓ Siap Diunduh`, dan memunculkan tombol unduh deliverable resmi bagi mahasiswa.

---

## 5. Spesifikasi Teknis & Skema Database

### A. Skema Data `projects` (Cloud Firestore & Supabase)
- `id` (string, PK) — ID unik proyek / pesanan
- `customer_id` (string, nullable, FK $\rightarrow$ `users.id`) — Akun pemesan
- `buyer_name` (string, required) — Nama pemesan / ketua
- `buyer_email` (string, nullable) — Email konfirmasi
- `buyer_whatsapp` (string, required) — Kontak WhatsApp aktif
- `service_type` (string, enum: `'project_joki' | 'tugas_ringan' | 'makalah' | 'ppt'`)
- `package_type` (string, enum: `'full' | 'code_only' | 'idea_only'`)
- `member_count` (number, range: 1–8) — Jumlah anggota tim
- `total_price` (number, required) — Total tagihan pembayaran
- `payment_proof_url` (string, nullable) — Foto bukti transfer QRIS (Base64 JPEG terkompresi di browser atau Storage URL)
- `payment_status` (string, enum: `'pending' | 'paid' | 'rejected'`)
- `status` (string, enum: `'waiting_payment' | 'setup' | 'in_progress' | 'completed'`)
- `doc_topic` (string, nullable) — Judul/topik dokumen makalah atau presentasi
- `doc_details` (string, nullable) — Catatan instruksi penulisan dari pemesan
- `doc_file_url` (string, nullable) — URL file deliverable hasil pengerjaan (Makalah / PPT / Script)
- `ppt_file_url` (string, nullable) — URL file slide presentasi (utama atau add-on)
- `ppt_addon_paid` (boolean, default: false) — Status pembelian add-on PPT pada proyek koding
- `github_repo_url` (string, nullable) — Link repository GitHub proyek
- `github_email` (string, nullable) — Email akun GitHub pemesan (opsional untuk tim joki)
- `github_password` (string, nullable) — Password akun GitHub pemesan (opsional, server-only)
- `niche_input` (string, nullable) — Input topik untuk generator ide AI
- `generated_ideas` (array of objects, nullable) — Rekomendasi 3 ide dari AI
- `selected_idea` (object, nullable) — Ide yang dipilih dan dikunci klien
- `readme_content` (string, nullable) — Markdown bahan presentasi README / outline topik
- `created_at` (timestamp, required)
- `updated_at` (timestamp, required)

### B. Skema Data `project_members`
- `id` (string, PK) — ID unik anggota
- `project_id` (string, required, FK $\rightarrow$ `projects.id`)
- `name` (string, required) — Nama lengkap mahasiswa
- `nim` (string, required) — NIM resmi mahasiswa
- `kom` (string, required) — Kelas / KOM (misal: "A", "B", "TI-2")
- `github_username` (string, nullable) — Username akun GitHub (hanya untuk proyek koding)
- `github_email` (string, nullable) — Email author commit
- `github_access_token` (string, nullable — **Server-only / Terisolasi**)
- `is_connected` (boolean, default: false) — Status koneksi OAuth GitHub

### C. Skema Data `commit_schedules` (Khusus Proyek Koding)
- `id` (string, PK)
- `project_id` (string, required, FK $\rightarrow$ `projects.id`)
- `member_id` (string, required, FK $\rightarrow$ `project_members.id`)
- `commit_message` (string, required) — Pesan commit bergaya imperative
- `scheduled_at` (timestamp, required) — Jadwal eksekusi push otomatis
- `status` (string, enum: `'scheduled' | 'pushed' | 'failed'`)
- `commit_hash` (string, nullable) — Hash SHA commit yang berhasil di-push

---

## 6. Batasan MVP & Keputusan Arsitektur
1. **Zero Cloud Storage Cost:** Kompresi bukti bayar dilakukan langsung di client browser sebelum disimpan ke dokumen Firestore, menghindari aktivasi paket berbayar Firebase Storage Blaze.
2. **Deliverable Fleksibel via Direct Cloud Link:** File makalah, slide presentasi, atau repositori diserahkan menggunakan tautan cloud (Google Drive, Dropbox, atau PDF/PPTX publik) yang disimpan pada field `doc_file_url`.
3. **Pemisahan Kebutuhan Input per Layanan:** Layanan berbasis dokumen (`makalah`, `ppt`) tidak pernah meminta kredensial GitHub atau link OAuth, menjaga alur pemesanan tetap intuitif dan bebas friksi.
4. **Verifikasi Pembayaran Manual QRIS Statis:** Verifikasi transaksi dilakukan oleh Admin melalui Workspace Operator, menjaga fleksibilitas tanpa integrasi payment gateway berbiaya tinggi pada tahap awal.
