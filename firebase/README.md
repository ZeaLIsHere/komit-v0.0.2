# Rancangan Arsitektur Database & Backend Firebase — Komit-V2

Dokumen ini berisi analisis end-to-end, pemodelan entitas, relasi (PK/FK), struktur Cloud Firestore, serta aturan keamanan (Security Rules) untuk migrasi dan implementasi backend berbasis **Firebase (Auth, Firestore, Storage, Cloud Functions)**.

---

## 1. Review Alur Bisnis & Sistem (End-to-End Flow)

Sistem **Komit-V2** memiliki 5 alur proses utama:

```
[1. Order & Pay]       [2. Admin Verify]      [3. Setup & AI Idea]     [4. Member OAuth]       [5. Auto-Commit & UAS]
/order                 /admin                 /project/[id]/setup      /join/[id]              /api/cron/push-commits
User input anggota  -> Admin cek bukti     -> Generate 3 ide AI     -> Tiap anggota hubungkan -> Cron push commit
& upload bukti QRIS    transfer & approve     & input identitas tim    akun GitHub asli          berkala atas nama anggota
```

### A. Alur Pemesanan & Pembayaran (`/order`)
1. User masuk ke `/order` (wajib login via Google / GitHub / Email).
2. Memilih kategori layanan (`service_type`: `project_joki`, `makalah`, `ppt`, `tugas_ringan`) dan paket (`full`, `code_only`, `idea_only`).
3. Menentukan jumlah anggota kelompok ($N = 1..8$). Total harga dihitung: $N \times \text{Rp } 50.000$.
4. Sistem menyajikan QRIS Statis. User transfer dan mengunggah foto bukti bayar ke Firebase Storage: `/proofs/{projectId}/payment.jpg`.
5. Dokumen `projects` dibuat dengan status `payment_status: 'pending'` dan `status: 'waiting_payment'`.

### B. Alur Verifikasi Admin (`/admin`)
1. Admin melihat antrean bukti bayar pending.
2. Admin mengecek gambar bukti di Firebase Storage.
3. Klik **Approve** $\rightarrow$ `payment_status: 'paid'`, `status: 'setup'`. Proyek terbuka untuk tahap setup.
4. Klik **Reject** $\rightarrow$ `payment_status: 'rejected'`.

### C. Alur Setup, Ide AI & Data Anggota (`/project/[id]/setup`)
1. Ketua kelompok memasukkan topik/niche matkul.
2. Endpoint `/api/ai/ideas` menghasilkan 3 rekomendasi ide dengan **Gimmick Pemikat Dosen** (fitur unik untuk demo nilai A).
3. Ketua mengunci 1 ide dan mengisi data identitas tim ($N$ anggota: Nama, NIM, KOM, Username GitHub).
4. Dokumen `project_members` tersimpan, dan sistem otomatis membuat draf jadwal commit mingguan di `commit_schedules`.
5. Sistem menghasilkan link undangan `/join/{projectId}`.

### D. Alur Hubungkan GitHub Anggota (`/join/[id]`)
1. Anggota membuka link undangan.
2. Mengklik **Hubungkan Akun GitHub** (Firebase Auth GitHub / OAuth dengan scope `repo, workflow`).
3. **Penting:** Access Token GitHub yang didapat disimpan secara terisolasi pada koleksi aman (`member_secrets/{memberId}`), bukan di dokumen publik anggota.
4. Flag `is_connected` diubah menjadi `true`. Jika semua anggota sudah terhubung, status proyek berganti menjadi `in_progress`.

### E. Alur Auto-Commit & Bahan Presentasi (`/project/[id]` & `/api/cron/push-commits`)
1. Cron job berkala memicu `/api/cron/push-commits`.
2. Query jadwal commit yang due (`status == 'scheduled'` && `scheduled_at <= now`).
3. Backend membaca `github_access_token` dari `member_secrets`, lalu memanggil GitHub Contents API untuk melakukan commit dan push ke repo mahasiswa atas nama akun mereka.
4. Update `commit_schedules` menjadi `status: 'pushed'` dengan `commit_hash`.
5. Di dashboard, ketua dapat meng-generate **README Bahan Presentasi** via AI atau memesan add-on Slide PPT Jadi.

---

## 2. Analisis Entitas, Atribut & Relasi (Data Modeling)

Dalam arsitektur Cloud Firestore, kita memodelkan data relasional ke dalam **Root Collections** dengan referensi ID terindeks. Ini memastikan efisiensi query scheduler lintas proyek tanpa terkendala batasan collection group.

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
  - `github_username` (string, optional) — Username GitHub tanpa tanda `@`
  - `photo_url` (string, optional) — URL avatar pengguna
  - `created_at` (timestamp, required) — Waktu pendaftaran
  - `updated_at` (timestamp, required) — Waktu modifikasi terakhir

---

### 2. Koleksi: `projects`
Menyimpan seluruh data order, status verifikasi, ide proyek, dan aset presentasi.

- **Document ID (PK):** `projectId` (string, auto-generated UUID / Firestore Auto-ID)
- **Atribut:**
  - `customer_id` (string, FK $\rightarrow$ `users.id`, nullable) — ID pemesan
  - `buyer_name` (string, required) — Nama pemesan/ketua
  - `buyer_email` (string, nullable) — Email konfirmasi
  - `buyer_whatsapp` (string, required) — Nomor kontak WhatsApp
  - `service_type` (string, enum: `'project_joki' | 'makalah' | 'ppt' | 'tugas_ringan'`)
  - `package_type` (string, enum: `'full' | 'code_only' | 'idea_only'`)
  - `member_count` (number, range: 1–8) — Jumlah anggota kelompok
  - `total_price` (number, required) — Formula: $N \times 50.000$
  - `payment_proof_url` (string, nullable) — URL file bukti bayar QRIS di Storage
  - `payment_status` (string, enum: `'pending' | 'paid' | 'rejected'`)
  - `payment_verified_at` (timestamp, nullable) — Tanggal verifikasi admin
  - `payment_verified_by` (string, nullable, FK $\rightarrow$ `users.id`)
  - `niche_input` (string, nullable) — Topik yang diinput ketua
  - `generated_ideas` (array of maps, nullable) — 3 opsi ide AI:
    - `id` (string)
    - `title` (string)
    - `description` (string)
    - `gimmick` (string)
    - `techStack` (array of strings)
  - `selected_idea` (map, nullable) — 1 ide yang dipilih & dikunci
  - `github_repo_url` (string, nullable) — Link GitHub repository kelompok
  - `readme_content` (string, nullable) — Markdown bahan presentasi UAS
  - `ppt_addon_paid` (boolean, default: false) — Status pembelian add-on slide
  - `ppt_proof_url` (string, nullable) — Bukti transfer add-on PPT
  - `ppt_file_url` (string, nullable) — Link download file PPT dari admin
  - `status` (string, enum: `'waiting_payment' | 'setup' | 'in_progress' | 'completed'`)
  - `created_at` (timestamp, required)
  - `updated_at` (timestamp, required)

---

### 3. Koleksi: `project_members`
Menyimpan daftar mahasiswa dalam kelompok dan status koneksi GitHub.

- **Document ID (PK):** `memberId` (string, auto-generated UUID)
- **Atribut:**
  - `project_id` (string, required, FK $\rightarrow$ `projects.id`) — Relasi ke proyek
  - `name` (string, required) — Nama mahasiswa
  - `nim` (string, required) — Nomor Induk Mahasiswa
  - `kom` (string, required) — Kelas / KOM (misal: "A", "B", "C")
  - `github_username` (string, nullable) — Username akun GitHub
  - `github_email` (string, nullable) — Email yang digunakan untuk commit author
  - `is_connected` (boolean, default: false) — Apakah OAuth token sudah aktif
  - `connected_at` (timestamp, nullable)
  - `created_at` (timestamp, required)
  - `updated_at` (timestamp, required)

> **Catatan Keamanan Penting:** `github_access_token` **TIDAK DISIMPAN DI SINI**. Firestore mengembalikan seluruh dokumen saat dibaca client. Menyimpan token di sini akan membocorkannya ke browser anggota lain.

---

### 4. Koleksi: `member_secrets` (Koleksi Rahasia — Server-Only)
Menyimpan kredensial OAuth token sensitif yang hanya boleh dibaca dan ditulis oleh Firebase Admin SDK (Server / Cloud Functions).

- **Document ID (PK):** `memberId` (sama persis dengan `project_members.id`)
- **Atribut:**
  - `project_id` (string, required, FK $\rightarrow$ `projects.id`)
  - `github_access_token` (string, required) — Token OAuth scope `repo, workflow`
  - `token_type` (string, default: `'bearer'`)
  - `scope` (string, default: `'repo,workflow'`)
  - `updated_at` (timestamp, required)
- **Firestore Security Rules:** `allow read, write: if false;` (Client tidak dapat mengakses langsung).

---

### 5. Koleksi: `commit_schedules`
Menyimpan jadwal commit otomatis untuk tiap anggota hingga masa UAS.

- **Document ID (PK):** `scheduleId` (string, auto-generated UUID)
- **Atribut:**
  - `project_id` (string, required, FK $\rightarrow$ `projects.id`)
  - `member_id` (string, required, FK $\rightarrow$ `project_members.id`)
  - `member_name` (string, denormalized) — Cache nama untuk efisiensi UI
  - `github_username` (string, denormalized) — Cache username untuk UI
  - `commit_message` (string, required) — Pesan commit (imperative style)
  - `scheduled_at` (timestamp, required) — Waktu jadwal eksekusi push
  - `status` (string, enum: `'scheduled' | 'pushed' | 'failed'`)
  - `commit_hash` (string, nullable) — 7 karakter SHA commit hash setelah push
  - `error_message` (string, nullable) — Catatan kegagalan bila terjadi error
  - `pushed_at` (timestamp, nullable) — Waktu aktual saat commit berhasil
  - `created_at` (timestamp, required)

---

## 4. Struktur Firebase Storage

Bucket Storage diorganisasi per domain keamanan dan tipe file:

```
gs://<bucket-name>/
├── proofs/                      # Bukti transfer pembayaran
│   └── {projectId}/
│       ├── payment_{timestamp}.jpg
│       └── ppt_payment_{timestamp}.jpg
│
└── presentations/               # File PPT yang diunggah admin
    └── {projectId}/
        └── uas_presentation_{timestamp}.pptx
```

---

## 5. Kebutuhan Index Firestore (`firestore.indexes.json`)

Untuk mendukung query scheduler dan dashboard tanpa error `FAILED_PRECONDITION`:

1. **Query Cron Jadwal Commit:**
   - Collection: `commit_schedules`
   - Fields: `status` (ASCENDING), `scheduled_at` (ASCENDING)
2. **Query Proyek Pengguna:**
   - Collection: `projects`
   - Fields: `customer_id` (ASCENDING), `created_at` (DESCENDING)
3. **Query Anggota Proyek:**
   - Collection: `project_members`
   - Fields: `project_id` (ASCENDING), `created_at` (ASCENDING)
4. **Query Jadwal Proyek:**
   - Collection: `commit_schedules`
   - Fields: `project_id` (ASCENDING), `scheduled_at` (ASCENDING)
