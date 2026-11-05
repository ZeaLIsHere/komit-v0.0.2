# AGENTS.md — Komit-V2 Engineering & Design Rules

Aturan wajib untuk setiap AI agent yang menulis kode di repositori ini.

## 0. Urutan Eksekusi Wajib (Execution Chain)
Sebelum menulis, membangun, atau melanjutkan fitur apa pun, AI Agent **WAJIB** mengikuti urutan ini:
1. **Baca [`AGENTS.md`](./AGENTS.md)** — Pahami aturan disiplin kode, keamanan, dan daftar skill.
2. **Jalankan Skill `understand-*` (Understand-Anything)** — Jika codebase sudah memiliki kode/file:
   - Gunakan `understand` / `understand-chat` / `understand-explain` untuk membaca peta arsitektur (`.ua/knowledge-graph.json`) agar tidak buta konteks saat melanjutkan fitur.
   - Gunakan `understand-domain` untuk memastikan alur bisnis baru selaras dengan domain yang sudah ada.
   - Gunakan `understand-diff` setelah selesai mengubah kode untuk mengecek dampak perubahan (*ripple effect*) sebelum selesai/commit.
   - Setelah fondasi aplikasi (Tahap 1) terbangun, jalankan `understand` untuk menginisialisasi graph `.ua/knowledge-graph.json` dan update secara inkremental setiap ada fitur baru.
3. **Aktifkan Skills UI/Visual yang Relevan** — Panggil skill sesuai tugas (`impeccable`, `design-taste-frontend`, `unslop`, `anatomy`).
4. **Baca [`PRD.md`](./PRD.md)** — Pastikan fitur, alur bisnis, formula harga (`N x Rp 50.000`), dan skema database sesuai spesifikasi.
5. **Baca [`DESIGN.md`](./DESIGN.md)** — Terapkan sistem desain Dala (*Dark Void `#000000`*, *Electric Iris `#8052ff`*, *Saffron Spark `#ffb829`*, tipografi *PPNeueMontreal / Inter* weight 400 display & weight 200 body, base spacing `6px`, tanpa card border/shadow).

> **Aturan Prioritas Visual:** Jika ada aturan umum di skill yang berbeda dengan spesifikasi eksplisit di [`DESIGN.md`](./DESIGN.md) (seperti penggunaan aksen `#8052ff` Electric Iris, base unit `6px`, atau label uppercase `14px` `#ffb829`), **`DESIGN.md` selalu menang (The Brief Wins).**

---

## 1. Konteks Produk
**Komit-V2** adalah platform Productized Service & SaaS untuk mahasiswa IT (detail lengkap di [`PRD.md`](./PRD.md)):
- Layanan utama: Joki Proyek Kuliah Berkelompok (cicil commit GitHub terjadwal atas nama akun GitHub masing-masing anggota kelompok hingga UAS), Makalah, PPT, dan Tugas Ringan.
- Alur utama:
  1. `/order` — Pilih layanan, paket (`full`, `code_only`, `idea_only`), jumlah anggota (`N x Rp 50.000`), lalu bayar via QRIS Statis + upload bukti bayar.
  2. `/project/[id]/setup` — Terbuka setelah pembayaran di-approve. Input niche -> AI generate 3 rekomendasi ide + gimmick pemikat dosen -> kunci ide -> isi data anggota (Nama, NIM, KOM) -> bagikan link undangan anggota untuk **Connect GitHub (OAuth)**.
  3. `/project/[id]` — Client Dashboard: pantau progress aplikasi, riwayat & jadwal commit per anggota, generate README (bahan presentasi gratis), atau beli add-on PPT jadi.
  4. `/admin` — Panel tim joki/admin: verifikasi bukti QRIS, kelola proyek, jadwalkan *auto-commit* menggunakan token OAuth anggota, dan upload file PPT.

---

## 2. Daftar Skill & Kapan Menggunakannya
Gunakan tool `skill` sesuai kebutuhan tugas:
- **`impeccable` & `design-taste-frontend`:** Saat merancang layout halaman baru, mengatur tipografi, komposisi two-column asymmetric, dan membedakan mode *Persuade* (`/`) vs *Operate* (`/order`, `/project/*`, `/admin`).
- **`unslop`:** Saat melakukan audit visual agar UI bersih dari ornamen AI murahan (tanpa glowing card borders, tanpa emoji, tanpa angka statistik palsu).
- **`anatomy`:** Saat membangun visual utama (Hero / Explainer) berupa instrumen isometrik interaktif maupun visualisasi partikel konstelasi di atas kanvas hitam `#000000`.
- **`understand` / `understand-domain` / `understand-diff` / `understand-explain` / `understand-chat`:**
  - **Saat mulai sesi / lanjut fitur:** Baca `.ua/knowledge-graph.json` atau panggil `understand-chat` / `understand-explain` untuk langsung tahu hubungan antar file tanpa meraba-raba.
  - **Saat selesai bangun fitur baru:** Jalankan `understand` (incremental update) dan `understand-diff` agar knowledge graph selalu sinkron dengan kode terbaru.

---

## 3. Tech Stack Utama
- **Framework:** Next.js (App Router, Fullstack TypeScript)
- **Styling:** Tailwind CSS v4 (menggunakan token `@theme` dari [`DESIGN.md`](./DESIGN.md))
- **Database & Storage:** Supabase (PostgreSQL + Supabase Storage untuk bukti QRIS & file PPT)
- **GitHub Integration:** GitHub OAuth App (`scope: repo, workflow`) untuk push commit menggunakan token asli anggota kelompok
- **Visual Engine:** `anatomy` (`kit/iso-kit.ts` + `kit/react/`) & Canvas/SVG Constellation sesuai [`DESIGN.md`](./DESIGN.md)

---

## 4. Prinsip Penulisan Kode (Lazy Senior Discipline)
1. **YAGNI:** Jangan buat abstraksi, factory, interface tunggal, atau konfigurasi untuk fitur yang belum diminta di [`PRD.md`](./PRD.md).
2. **Stdlib & Native First:** Gunakan `fetch` bawaan, Web APIs, form action standar, CSS native sebelum menambah package npm baru.
3. **Fewest Files Possible:** Satu fitur cukup di file yang relevan. Hindari memecah komponen kecil menjadi puluhan file.
4. **Ponytail Comments:** Jika membuat penyederhanaan yang disengaja (misal: mock state sebelum koneksi API live), tandai dengan `// ponytail: <batas saat ini> -> <jalur upgrade>`.
5. **Keamanan Wajib:** Validasi semua input di batas API/Server Action, jangan pernah mengekspos `github_access_token` ke response client/browser, dan simpan kredensial hanya di environment variables (`.env.local`).

---

## 5. Aturan UI & Desain (Mengacu pada [`DESIGN.md`](./DESIGN.md))
- **Kanvas & Warna:**
  - Background wajib Pure Black Void (`#000000` / `--color-void`), bukan abu-abu gelap.
  - Teks utama `#ffffff` (`--color-bone-white`), sekunder `#9a9a9a` (`--color-ash-gray`), tersier `#bdbdbd` (`--color-silver-mist`).
  - Tombol CTA utama tunggal menggunakan pill `#8052ff` (`--color-electric-iris`), radius `24px` / pill. Jangan pernah menaruh dua tombol `#8052ff` berdekatan.
  - Highlight & aksen perhatian menggunakan `#ffb829` (`--color-saffron-spark`), tint sekunder `#15846e` (`--color-deep-verdant`).
- **Tipografi:**
  - Satu keluarga font (`PPNeueMontreal` dengan fallback `Inter`).
  - Semua Headline menggunakan **weight 400** (bukan bold) dengan ukuran besar (`42px`–`113px`) dan negative letter-spacing (`-0.04em`).
  - Semua Body copy (`18px`) menggunakan **weight 200 (extra-light)**.
  - Gunakan `tabular-nums` untuk semua harga, NIM, tanggal, dan hash commit.
- **Spacing & Komposisi:**
  - Base spacing unit `6px` (`6, 12, 18, 24, 30, 36, 60, 96, 120px`), max-width `1280px`.
  - Elemen melayang di atas kanvas hitam `#000000` dengan pemisah whitespace — **dilarang membuat kotak kartu dengan border tebal, drop shadow, atau background abu-abu**.
  - Hanya pada tabel/form operasional (`/order`, `/project/*`, `/admin`) diperbolehkan garis bantu sangat halus seperlunya agar input tetap jelas digunakan.
- **Anti-Slop:** Dilarang menggunakan emoji sebagai ikon UI, dilarang menggunakan `#0000ee` (link biru default), dan dilarang mengarang testimoni/angka statistik palsu.

---

## 6. Skema Inti Database (3 Tabel — Detail di [`PRD.md`](./PRD.md))
Jangan menambah tabel baru kecuali benar-benar dibutuhkan:
1. `projects` — Menyimpan status order, paket, jumlah anggota, bukti QRIS, ide AI, URL repo, README, dan add-on PPT.
2. `project_members` — Menyimpan Nama, NIM, KOM, `github_username`, `github_email`, dan `github_access_token` (server-only).
3. `commit_schedules` — Menyimpan antrean jadwal push commit (`member_id`, `commit_message`, `scheduled_at`, `status`, `commit_hash`).

---

## 7. Aturan Git & Commit
- Subject commit maksimal 50 karakter, huruf kapital di awal, kalimat perintah (imperative), tanpa titik di akhir.
- Kosongkan body commit jika subject sudah cukup jelas.
