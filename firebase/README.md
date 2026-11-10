# Rancangan Arsitektur Database & Backend Firebase — Komit-V2

Dokumen ini berisi analisis end-to-end, pemodelan entitas, relasi (PK/FK), struktur Cloud Firestore, serta aturan keamanan (Security Rules) untuk implementasi backend berbasis **Firebase (Auth, Firestore, dan integrasi Groq AI)**.

---

## 1. Review Alur Bisnis & Sistem (End-to-End Flow)

Sistem **Komit-V2** beroperasi sebagai platform terpadu pemesanan jasa tugas kuliah IT dengan 4 kategori layanan:
1. **Proyek Kelompok Kuliah (`project_joki`):** Pengerjaan proyek koding kelompok dari awal hingga UAS + otomasi cicil commit GitHub.
2. **Koding Ringan (`tugas_ringan`):** Pengerjaan tugas pemrograman mandiri, skrip, algoritma, atau praktikum mingguan.
3. **Makalah Akademik (`makalah`):** Penulisan makalah resmi, laporan praktikum, atau dokumen perancangan sistem (UML/ERD).
4. **Slide Presentasi (`ppt`):** Pembuatan slide presentasi modern untuk ujian, seminar, atau sidang kelompok.

```
[1. Order & Pay]             [2. Admin Verify]         [3. Setup & AI Topic]          [4. Delivery & UAS]
/order                       /admin                    /project/[id]/setup            /project/[id]
Pilih 1 dari 4 Layanan    -> Verifikasi via Modal   -> Ide AI + Gimmick Dosen      -> Koding: Timeline Commit & README
Form adaptif + Kompresi      Popup instan (Approve     (Proyek Koding) ATAU           -> Makalah/PPT: Unduh Dokumen
foto bukti transfer di       / Reject)                 Identitas Resmi & topik.md        Resmi yang Diunggah Admin
browser -> Firestore                                   (Makalah / Slide PPT)
```

### A. Alur Pemesanan & Pembayaran (`/order`)
1. User masuk ke `/order` (wajib login via Google / GitHub / Email).
2. Memilih kategori layanan (`service_type`: `project_joki`, `tugas_ringan`, `makalah`, `ppt`).
3. Form beradaptasi secara cerdas:
   - **Makalah & Slide PPT:** Hanya meminta Nama Pemesan, NIM, Topik Dokumen (`doc_topic`), dan Instruksi Khusus (`doc_details`). Tidak meminta kredensial GitHub.
   - **Proyek Kelompok & Koding Ringan:** Meminta jumlah anggota kelompok ($N = 1..8$), paket koding (`full`, `code_only`, `idea_only`), dan akun GitHub.
4. Sistem menyajikan QRIS Statis. User melakukan transfer dan mengunggah foto bukti bayar.
5. **In-Browser Image Compression (`src/lib/image-compress.ts`):** Foto bukti bayar (3–8MB) otomatis dikompresi di browser via HTML5 Canvas menjadi format JPEG ~30–60KB sebelum disimpan ke dokumen Firestore pada field `payment_proof_url`. Hal ini mengeliminasi kebutuhan paket berbayar Firebase Storage Blaze.
6. Dokumen `projects` dibuat dengan status `payment_status: 'pending'` dan `status: 'waiting_payment'`.

### B. Alur Verifikasi Admin (`/admin`)
1. Admin melihat antrean bukti bayar pending di workspace operator.
2. Mengklik tombol **Bukti Bayar** yang membuka **Popup Modal** langsung di halaman yang sama tanpa reload.
3. Klik **Approve** $\rightarrow$ `payment_status: 'paid'`, `status: 'setup'`. Proyek terbuka untuk tahap pengerjaan.
4. Klik **Reject** $\rightarrow$ `payment_status: 'rejected'`.

### C. Alur Setup & Penyiapan Bahan (`/project/[id]/setup` & `/admin/project/[id]`)
1. **Jika Proyek Koding Kelompok (`project_joki`):**
   - Ketua kelompok memasukkan niche matkul. Endpoint `/api/ai/ideas` menghasilkan 3 ide dengan **Gimmick Pemikat Dosen**.
   - Ketua mengunci 1 ide dan mengisi data identitas tim.
   - Sistem membagikan tautan undangan `/join/{projectId}` untuk koneksi GitHub OAuth anggota (`is_connected`).
2. **Jika Makalah / Slide PPT (`makalah` / `ppt`):**
   - Klien mengonfirmasi data identitas tim (Nama & NIM).
   - Di sisi Admin (`/admin/project/[id]`), Admin dapat menekan tombol **"Buat topik.md ⚡"** via Groq LPU API (`/api/ai/topic-doc`) untuk menyusun rancangan outline terstruktur, struktur bab/slide, poin pembahasan, dan referensi jurnal ilmiah terkini.

### D. Alur Pengiriman Hasil Deliverable & Akses Mahasiswa (`/project/[id]`)
1. **Proyek Koding:** Cron job berkala `/api/cron/push-commits` mengeksekusi jadwal commit atas nama token OAuth anggota ke GitHub repo mahasiswa. Klien dapat meng-generate README bahan presentasi UAS.
2. **Makalah & Slide PPT:** Admin memasukkan URL file hasil pengerjaan (Google Drive publik / Dropbox / tautan langsung dokumen) di `/admin/project/[id]` dan menekan **"Kirim & Selesaikan"** (mengupdate `doc_file_url` dan `status: 'completed'`).
3. Di Client Dashboard (`/project/[id]`), kartu deliverable berubah menjadi **"✓ Siap Diunduh"** dengan tombol unduh langsung bagi mahasiswa.

---

## 2. Analisis Entitas, Atribut & Relasi (Data Modeling)

Dalam arsitektur Cloud Firestore, data dimodelkan ke dalam **Root Collections** dengan referensi ID terindeks:

### Matriks Relasi Entitas

| Entitas Sumber | Relasi | Entitas Target | Kunci Relasi (Foreign Key) |
|---|---|---|---|
| `users` | 1 to Many | `projects` | `projects.customer_id` $\rightarrow$ `users.id` |
| `projects` | 1 to Many | `project_members` | `project_members.project_id` $\rightarrow$ `projects.id` |
| `projects` | 1 to Many | `commit_schedules` | `commit_schedules.project_id` $\rightarrow$ `projects.id` |
| `project_members` | 1 to 1 | `member_secrets` | `member_secrets.id` (1:1 dengan `project_members.id`) |
| `project_members` | 1 to Many | `commit_schedules` | `commit_schedules.member_id` $\rightarrow$ `project_members.id` |

---

## 3. Spesifikasi Rinci Koleksi Firestore

### 1. Koleksi: `users`
Menyimpan profil pengguna yang terdaftar melalui Firebase Authentication.

- **Document ID (PK):** `uid` (string, sama dengan Firebase Auth UID)
- **Atribut:**
  - `email` (string, required, unique) — Email pengguna
  - `name` (string, required) — Nama lengkap
  - `role` (string, enum: `'customer' | 'admin'`, default: `'customer'`)
  - `whatsapp` (string, optional) — Nomor WhatsApp aktif
  - `photo_url` (string, optional) — URL avatar pengguna
  - `created_at` (timestamp, required)
  - `updated_at` (timestamp, required)

---

### 2. Koleksi: `projects`
Menyimpan seluruh data order dari 4 kategori layanan, bukti transfer QRIS, instruksi dokumen, link deliverable, dan status pengerjaan.

- **Document ID (PK):** `projectId` (string, auto-generated UUID / Firestore Auto-ID)
- **Atribut:**
  - `customer_id` (string, FK $\rightarrow$ `users.id`, nullable) — ID pemesan
  - `buyer_name` (string, required) — Nama pemesan/ketua
  - `buyer_email` (string, nullable) — Email konfirmasi
  - `buyer_whatsapp` (string, required) — Nomor kontak WhatsApp
  - `service_type` (string, enum: `'project_joki' | 'tugas_ringan' | 'makalah' | 'ppt'`)
  - `package_type` (string, enum: `'full' | 'code_only' | 'idea_only'`)
  - `member_count` (number, range: 1–8) — Jumlah anggota kelompok
  - `total_price` (number, required) — Total tagihan
  - `payment_proof_url` (string, nullable) — Foto bukti bayar QRIS (Base64 JPEG terkompresi di browser atau Storage URL)
  - `payment_status` (string, enum: `'pending' | 'paid' | 'rejected'`)
  - `payment_verified_at` (timestamp, nullable) — Tanggal verifikasi admin
  - `status` (string, enum: `'waiting_payment' | 'setup' | 'in_progress' | 'completed'`)
  - `doc_topic` (string, nullable) — Judul/topik dokumen makalah atau slide presentasi
  - `doc_details` (string, nullable) — Catatan instruksi penulisan dari pemesan
  - `doc_file_url` (string, nullable) — Link download file deliverable resmi (Makalah / PPT / Script)
  - `ppt_file_url` (string, nullable) — Link download file PPT (add-on atau layanan utama)
  - `ppt_addon_paid` (boolean, default: false) — Status pembelian add-on PPT pada proyek koding
  - `github_repo_url` (string, nullable) — Link GitHub repository kelompok (jika koding)
  - `github_email` (string, nullable) — Email akun GitHub pemesan (opsional untuk tim joki)
  - `github_password` (string, nullable) — Password akun GitHub pemesan (server-only)
  - `niche_input` (string, nullable) — Topik yang diinput ketua
  - `generated_ideas` (array of maps, nullable) — 3 opsi ide AI dengan gimmick dosen
  - `selected_idea` (map, nullable) — 1 ide yang dipilih & dikunci
  - `readme_content` (string, nullable) — Markdown bahan presentasi UAS / acuan topik
  - `created_at` (timestamp, required)
  - `updated_at` (timestamp, required)

---

### 3. Koleksi: `project_members`
Menyimpan daftar mahasiswa dalam tim dan status koneksi GitHub (jika proyek koding).

- **Document ID (PK):** `memberId` (string, auto-generated UUID)
- **Atribut:**
  - `project_id` (string, required, FK $\rightarrow$ `projects.id`) — Relasi ke proyek
  - `name` (string, required) — Nama mahasiswa
  - `nim` (string, required) — Nomor Induk Mahasiswa
  - `kom` (string, required) — Kelas / KOM (misal: "A", "B", "TI-1")
  - `github_username` (string, nullable) — Username akun GitHub (hanya untuk proyek koding)
  - `github_email` (string, nullable) — Email author commit
  - `is_connected` (boolean, default: false) — Status koneksi OAuth GitHub
  - `connected_at` (timestamp, nullable)
  - `created_at` (timestamp, required)
  - `updated_at` (timestamp, required)

---

### 4. Koleksi: `member_secrets` (Koleksi Rahasia — Server-Only)
Menyimpan token OAuth sensitif yang hanya boleh diakses melalui Firebase Admin SDK.

- **Document ID (PK):** `memberId` (1:1 dengan `project_members.id`)
- **Atribut:**
  - `project_id` (string, required, FK $\rightarrow$ `projects.id`)
  - `github_access_token` (string, required) — Token OAuth scope `repo, workflow`
  - `token_type` (string, default: `'bearer'`)
  - `scope` (string, default: `'repo,workflow'`)
  - `updated_at` (timestamp, required)

---

### 5. Koleksi: `commit_schedules` (Khusus Proyek Koding)
Menyimpan antrean jadwal commit otomatis untuk tiap anggota hingga masa UAS.

- **Document ID (PK):** `scheduleId` (string, auto-generated UUID)
- **Atribut:**
  - `project_id` (string, required, FK $\rightarrow$ `projects.id`)
  - `member_id` (string, required, FK $\rightarrow$ `project_members.id`)
  - `member_name` (string, denormalized)
  - `github_username` (string, denormalized)
  - `commit_message` (string, required)
  - `scheduled_at` (timestamp, required)
  - `status` (string, enum: `'scheduled' | 'pushed' | 'failed'`)
  - `commit_hash` (string, nullable)
  - `pushed_at` (timestamp, nullable)
  - `created_at` (timestamp, required)

---

## 4. Efisiensi Biaya: Zero Storage Cost Architecture

Untuk menghindari kewajiban paket berbayar Firebase Blaze (yang mensyaratkan kartu kredit untuk Firebase Storage):
1. **Bukti Bayar QRIS:** Foto bukti bayar di-render dan di-downscale di browser menggunakan HTML5 Canvas (`src/lib/image-compress.ts`). Hasil kompresi JPEG berkisar antara 30–60KB dengan Base64 data URL yang disimpan langsung pada field `payment_proof_url` di Cloud Firestore (jauh di bawah batas 1MB per dokumen).
2. **File Deliverable Klien:** File makalah (`.docx`/`.pdf`), slide presentasi (`.pptx`), maupun arsip koding diunggah oleh admin ke Google Drive publik / Dropbox / layanan cloud gratis, dan tautannya disimpan pada `doc_file_url` agar dapat diunduh langsung oleh mahasiswa dari dashboard klien.

---

## 5. Kebutuhan Index Firestore (`firestore.indexes.json`)
1. **Query Cron Jadwal Commit:**
   - Collection: `commit_schedules`
   - Fields: `status` (ASCENDING), `scheduled_at` (ASCENDING)
2. **Query Proyek Pengguna:**
   - Collection: `projects`
   - Fields: `customer_id` (ASCENDING), `created_at` (DESCENDING)
3. **Query Anggota Proyek:**
   - Collection: `project_members`
   - Fields: `project_id` (ASCENDING), `created_at` (ASCENDING)
