# PRD.md — Product Requirements Document (Komit-V2)

> **Rantai Dokumen Wajib (Execution Chain):**
> 1. Baca [`AGENTS.md`](./AGENTS.md) untuk aturan engineering, keamanan, dan daftar skill.
> 2. Gunakan skill **`understand-*` (Understand-Anything)** saat membangun atau melanjutkan fitur untuk membaca peta arsitektur (`.ua/knowledge-graph.json`), menganalisis domain (`understand-domain`), dan mengecek dampak perubahan (`understand-diff`).
> 3. Aktifkan skill UI/Visual (`impeccable`, `design-taste-frontend`, `unslop`, `anatomy`).
> 4. Gunakan **`PRD.md`** ini sebagai sumber kebenaran fitur, alur bisnis, dan skema data.
> 5. Terapkan [`DESIGN.md`](./DESIGN.md) untuk seluruh implementasi UI, warna, tipografi, spacing, dan komponen.

## 1. Ringkasan Produk
**Komit-V2** adalah web platform *Productized Service & SaaS* untuk mahasiswa Ilmu Komputer/IT yang membutuhkan bantuan pengerjaan proyek kuliah berkelompok berbasis GitHub, makalah, presentasi (PPT), dan tugas koding ringan.

Fitur unggulan utama adalah **Joki Proyek Kuliah Berkelompok + Cicil Commit GitHub**: proyek dikerjakan oleh tim/sistem, lalu kode di-push secara bertahap (terjadwal tiap minggu hingga UAS) menggunakan **akun GitHub asli masing-masing anggota kelompok** via GitHub OAuth, sehingga grafik kontribusi (`Insights > Contributors` & `git blame`) terlihat natural di mata dosen.

---

## 2. Target Pengguna
1. **Ketua Kelompok (Buyer):** Mahasiswa yang memesan layanan, membayar tagihan kelompok via QRIS, memilih ide aplikasi, mengisi data kelompok, dan memantau progress di dashboard.
2. **Anggota Kelompok (Contributor):** Teman sekelompok yang menerima link undangan dari ketua untuk menghubungkan akun GitHub mereka (`Connect GitHub`).
3. **Admin / Tim Joki (Operator):** Tim internal yang memverifikasi bukti bayar QRIS, mengerjakan kode proyek, mengatur jadwal *auto-commit* per anggota, dan mengunggah file PPT.

---

## 3. Struktur Layanan & Harga

### A. Kategori Layanan (`service_type`)
1. `project_joki` — Joki Proyek Kuliah Berkelompok (Fokus Utama MVP)
2. `makalah` — Pembuatan Makalah / Laporan Akademik
3. `ppt` — Pembuatan Slide Presentasi
4. `tugas_ringan` — Tugas Koding Harian / Praktikum

### B. Paket Joki Proyek (`package_type`)
1. **Paket Full (`full`):** Ide aplikasi + Gimmick Dosen + Koding Full + Cicil Commit GitHub + Gratis Bahan Presentasi (README).
2. **Paket Koding Saja (`code_only`):** Ide dari mahasiswa, tim mengerjakan koding + Cicil Commit GitHub.
3. **Paket Ide & Blueprint (`idea_only`):** Rekomendasi ide AI + Arsitektur + Panduan pengerjaan mandiri.

### C. Formula Harga Utama & Add-on
- **Harga Dasar Proyek Kelompok:** `Rp 50.000 x Jumlah Anggota Kelompok` (Contoh: 4 anggota = Rp 200.000).
- **Add-on Slide Presentasi (PPT Jadi):** Biaya tambahan opsional di dashboard jika kelompok tidak ingin membuat PPT sendiri dari README.

---

## 4. Alur Pengguna End-to-End (User Flow)

### Langkah 1: Pemesanan & Pembayaran (`/order`)
1. User memilih jenis layanan dan paket (`full`, `code_only`, `idea_only`).
2. User mengatur jumlah anggota kelompok (1–8 orang). Sistem otomatis menghitung total tagihan (`N x Rp 50.000`).
3. Sistem menampilkan **QRIS Statis** beserta nominal tagihan tepat.
4. User mengunggah foto bukti pembayaran.
5. Status proyek menjadi `waiting_payment` hingga Admin melakukan verifikasi.

### Langkah 2: Setup Proyek, Ide AI & Data Anggota (`/project/[id]/setup`)
*(Halaman ini terkunci sampai `payment_status === 'paid'`)*
1. **Generator Ide & Gimmick Dosen (Khusus Paket `full` / `idea_only`):**
   - User memasukkan *niche* atau topik mata kuliah (misal: *"Manajemen Keuangan Mahasiswa"* untuk matkul Pemrograman Mobile).
   - AI menghasilkan **3 opsi ide aplikasi**, masing-masing dilengkapi:
     - Nama Aplikasi & Deskripsi Singkat
     - **Gimmick Pemikat Dosen** (fitur unik yang membuat proyek terlihat niat saat demo UAS, misal: *Scan Struk Otomatis via OCR* atau *Simulasi Prediksi Saldo Akhir Bulan*)
     - Tech Stack yang disarankan
   - User memilih dan mengunci 1 ide.
2. **Input Data Anggota Kelompok:**
   - User mengisi form sejumlah `member_count`: **Nama Lengkap, NIM, Kelas/KOM, dan Username GitHub**.
3. **Koneksi GitHub Anggota (`/join/[project_id]`):**
   - Sistem menghasilkan link undangan kelompok.
   - Setiap anggota membuka link tersebut dan klik tombol **"Hubungkan Akun GitHub"** (GitHub OAuth `scope: repo, workflow`).
   - Status anggota berubah menjadi `Connected` saat token tersimpan di server.
   - Setelah semua data lengkap, status proyek berubah menjadi `in_progress`.

### Langkah 3: Client Dashboard (`/project/[id]`)
1. **Status & Progress Aplikasi:** Menampilkan ide yang dipilih, link repository GitHub, dan persentase tahapan pengerjaan.
2. **Timeline & Riwayat Commit Anggota:**
   - Menampilkan tabel jadwal commit mingguan: siapa yang melakukan commit (`member`), pesan commit, tanggal jadwal, status (`scheduled` / `pushed`), dan link bukti commit hash.
3. **Fitur Presentasi (UAS Readiness):**
   - **Opsi Gratis:** Tombol **"Generate Bahan Presentasi (README)"** — AI menyusun dokumen struktur presentasi, penjelasan arsitektur, pembagian tugas per anggota, dan panduan menjawab pertanyaan dosen.
   - **Opsi Berbayar (Add-on):** Tombol **"Pesan Slide PPT Jadi"** — Bayar via QRIS statis -> Admin unggah file `.pptx` / `.pdf` -> User unduh langsung dari dashboard.

### Langkah 4: Admin & Joki Panel (`/admin`)
1. **Tab Verifikasi Pembayaran:** Lihat bukti transfer QRIS proyek maupun add-on PPT, tombol `Approve` atau `Reject`.
2. **Tab Manajemen Proyek & Auto-Commit Scheduler:**
   - Input URL Repository GitHub kelompok.
   - Lihat status koneksi OAuth tiap anggota kelompok.
   - Tambah jadwal commit (`member_id`, `commit_message`, `scheduled_at`, perubahan file/branch) dan tombol eksekusi push ke GitHub API atas nama anggota tersebut.
3. **Tab Upload PPT:** Unggah file presentasi untuk proyek yang membeli add-on PPT.

---

## 5. Spesifikasi Teknis & Integrasi

### A. Skema Database (Supabase)
1. **`projects`**
   - `id` (uuid, PK), `created_at` (timestamptz)
   - `buyer_name` (text), `buyer_whatsapp` (text)
   - `service_type` (text), `package_type` (text)
   - `member_count` (int), `total_price` (int)
   - `payment_proof_url` (text), `payment_status` (`pending` | `paid` | `rejected`)
   - `niche_input` (text), `generated_ideas` (jsonb), `selected_idea` (jsonb)
   - `github_repo_url` (text), `readme_content` (text)
   - `ppt_addon_paid` (boolean), `ppt_proof_url` (text), `ppt_file_url` (text)
   - `status` (`waiting_payment` | `setup` | `in_progress` | `completed`)
2. **`project_members`**
   - `id` (uuid, PK), `project_id` (uuid, FK)
   - `name` (text), `nim` (text), `kom` (text)
   - `github_username` (text), `github_email` (text)
   - `github_access_token` (text — **Server-only, tidak pernah dikirim ke client**)
   - `is_connected` (boolean)
3. **`commit_schedules`**
   - `id` (uuid, PK), `project_id` (uuid, FK), `member_id` (uuid, FK)
   - `commit_message` (text), `scheduled_at` (timestamptz)
   - `status` (`scheduled` | `pushed` | `failed`), `commit_hash` (text)

### B. Integrasi Pihak Ketiga
- **GitHub OAuth & REST API:** Digunakan untuk autentikasi anggota kelompok dan melakukan commit/push ke repository menggunakan endpoint GitHub Contents/Git Data API dengan header `Authorization: Bearer <member_token>`.
- **AI LLM API (OpenAI / Gemini / Groq):**
  1. Endpoint `/api/ai/ideas`: Menerima `niche` + `service_type`, mengembalikan JSON 3 ide + gimmick dosen.
  2. Endpoint `/api/ai/readme`: Menerima `selected_idea` + daftar `project_members`, menghasilkan Markdown README & bahan presentasi per anggota.

---

## 6. Batasan MVP (Out of Scope Fase 1)
- **Payment Gateway Otomatis:** Fase 1 menggunakan QRIS Statis + verifikasi manual oleh Admin.
- **Full AI Code Generation (Hermes Agent):** Fase 1 pengerjaan koding dilakukan oleh tim joki manusia dan di-push terjadwal lewat Admin Panel. Otomatisasi koding penuh masuk ke Fase 2.
- **Login Rumit:** Mahasiswa mengakses proyek via Unique Project Link (`/project/[id]`) tanpa wajib registrasi email/password berlapis.
