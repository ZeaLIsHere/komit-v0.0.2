# AGENTS.md — Komit-V2 Engineering & Design Rules

Aturan wajib untuk setiap AI agent yang menulis kode di repositori ini.

## 0. Urutan Eksekusi Wajib (Execution Chain)
Sebelum menulis, membangun, atau melanjutkan fitur apa pun, AI Agent **WAJIB** mengikuti urutan ini:
1. **Baca [`AGENTS.md`](./AGENTS.md)** — Pahami aturan disiplin kode, keamanan, dan daftar skill.
2. **Jalankan Skill `understand-*` (Understand-Anything)** — Jika codebase sudah memiliki kode/file:
   - Gunakan `understand` / `understand-chat` / `understand-explain` untuk membaca peta arsitektur (`.ua/knowledge-graph.json`) agar tidak buta konteks saat melanjutkan fitur.
   - Gunakan `understand-domain` untuk memastikan alur bisnis baru selaras dengan domain yang sudah ada.
   - Gunakan `understand-diff` setelah selesai mengubah kode untuk mengecek dampak perubahan (*ripple effect*) sebelum selesai/commit.
   - Jalankan `understand` secara inkremental setiap ada penambahan atau perubahan fitur signifikan.
3. **Aktifkan Skills UI/Visual yang Relevan** — Panggil skill sesuai tugas (`impeccable`, `design-taste-frontend`, `unslop`, `anatomy`).
4. **Baca [`PRD.md`](./PRD.md)** — Pastikan fitur, alur bisnis 4 kategori layanan, formula harga, dan skema data sesuai spesifikasi resmi.
5. **Baca [`DESIGN.md`](./DESIGN.md)** — Terapkan sistem desain Dimension (*Dusk-lit frosted glass pada kanvas void `#000000` / `#0a0a0a`*, *frosted glass `bg-white/[0.04]`*, *aksen putih salju `#ffffff` & warm bone `#ededed`*, tipografi medium 500 display, rounded-full pill buttons, border hairline `1px solid rgba(255,255,255,0.12)`*).

> **Aturan Prioritas Visual:** Jika ada aturan umum di skill yang berbeda dengan spesifikasi eksplisit di [`DESIGN.md`](./DESIGN.md) atau aturan proyek, **`DESIGN.md` selalu menang (The Brief Wins).**

---

## 1. Konteks Produk
**Komit-V2** adalah platform *Productized Service & SaaS* terpadu untuk mahasiswa IT yang menyediakan jasa pengerjaan berbagai jenis tugas kuliah (detail lengkap di [`PRD.md`](./PRD.md)):
- **4 Kategori Layanan:**
  1. **Proyek Kelompok Kuliah (`project_joki`):** Pengerjaan proyek koding kelompok dari awal hingga UAS. Dilengkapi otomasi *Cicil Commit GitHub Terjadwal* atas nama akun GitHub asli tiap anggota kelompok, AI generator ide + gimmick pemikat dosen, README panduan presentasi, dan add-on PPT.
  2. **Koding Ringan (`tugas_ringan`):** Tugas pemrograman harian, algoritma, script, praktikum mandiri, atau perbaikan bug dengan turnaround cepat dan kode bersih.
  3. **Makalah Akademik (`makalah`):** Penulisan makalah resmi, laporan praktikum, review jurnal, dan diagram sistem (UML/ERD) terstruktur, bebas plagiasi, standar sitasi IEEE/APA, didukung AI topic outline builder (`topik.md`).
  4. **Slide Presentasi (`ppt`):** Pembuatan slide presentasi modern dan persuasif (PPTX/PDF) untuk seminar, sidang, atau ujian kelompok.

- **Alur Utama:**
  1. `/order` — Pilih dari 4 layanan. Form beradaptasi secara cerdas:
     - Makalah & PPT: **NOL kredensial GitHub**. Hanya minta Nama, NIM, `doc_topic` (Judul), dan `doc_details` (Instruksi pengerjaan).
     - Proyek Kelompok & Koding: Minta jumlah anggota, paket koding, dan akun GitHub.
     - Pembayaran: QRIS Statis. Foto bukti bayar (3–8MB) otomatis dikompresi di browser via HTML5 Canvas menjadi ~30–60KB JPEG (`src/lib/image-compress.ts`) lalu disimpan ke Cloud Firestore (tanpa biaya Firebase Storage Blaze).
  2. `/admin` — Workspace operator: antrean bukti bayar pending, verifikasi cepat via **Popup Modal** tanpa reload/buka tab baru.
  3. `/admin/project/[id]` — POV Inspeksi Proyek oleh Admin: data kontak WhatsApp klien, kredensial GitHub (jika koding), AI generator acuan penulisan `topik.md` via Groq LPU, dan form pengiriman link hasil pengerjaan (Google Drive/PDF/PPTX) langsung ke dashboard klien.
  4. `/project/[id]/setup` — Setup proyek pasca pembayaran: ide AI + gimmick dosen + OAuth GitHub (jika koding kelompok), atau konfirmasi data tim (jika makalah/PPT).
  5. `/project/[id]` — Client Dashboard: pantau timeline koding & commit (proyek koding) atau unduh file deliverable resmi dari tim joki (makalah & PPT).

---

## 2. Daftar Skill & Kapan Menggunakannya
Gunakan tool `skill` sesuai kebutuhan tugas:
- **`impeccable` & `design-taste-frontend`:** Saat merancang layout halaman baru, mengatur tipografi, komposisi two-column asymmetric, dan membedakan mode *Persuade* (`/`) vs *Operate* (`/order`, `/project/*`, `/admin`).
- **`unslop`:** Saat melakukan audit visual agar UI bersih dari ornamen AI murahan (tanpa emoji sebagai ikon UI, tanpa glowing neon norak, tanpa angka statistik palsu).
- **`anatomy`:** Saat membangun visual instrumen interaktif maupun visualisasi partikel konstelasi di atas kanvas hitam.
- **`understand` / `understand-domain` / `understand-diff` / `understand-explain` / `understand-chat`:**
  - **Saat mulai sesi / lanjut fitur:** Baca `.ua/knowledge-graph.json` atau panggil `understand-chat` / `understand-explain` untuk langsung tahu arsitektur tanpa meraba-raba.
  - **Saat selesai bangun fitur baru:** Jalankan `understand-diff` untuk validasi ripple effect dan sinkronkan knowledge graph.

---

## 3. Tech Stack Utama
- **Framework:** Next.js 15 (App Router, Fullstack TypeScript)
- **Styling:** Tailwind CSS v4 (menggunakan token frosted glass dari [`DESIGN.md`](./DESIGN.md))
- **Database & Auth:** Firebase (Cloud Firestore untuk database utama, Firebase Auth untuk Google + Email/Password + GitHub OAuth)
- **AI Engine:** Groq LPU API (`llama-3.3-70b-versatile`) untuk generator ide, README UAS, dan dokumen acuan `topik.md`
- **In-Browser Image Engine:** HTML5 Canvas (`src/lib/image-compress.ts`) untuk kompresi foto bukti transfer sebelum persistensi
- **Visual Engine:** Three.js / Canvas 20k particle vortex (`HeroConstellation.tsx`) dengan singularity collapse trigger

---

## 4. Prinsip Penulisan Kode (Lazy Senior Discipline)
1. **YAGNI:** Jangan buat abstraksi, factory, interface tunggal, atau konfigurasi untuk fitur yang belum diminta di [`PRD.md`](./PRD.md).
2. **Stdlib & Native First:** Gunakan `fetch` bawaan, Web APIs, form action standar, CSS native sebelum menambah package npm baru.
3. **Fewest Files Possible:** Satu fitur cukup di file yang relevan. Hindari memecah komponen kecil menjadi puluhan file.
4. **Ponytail Comments:** Jika membuat penyederhanaan yang disengaja, tandai dengan `// ponytail: <batas saat ini> -> <jalur upgrade>`.
5. **Keamanan Wajib:** Validasi semua input di batas API/Server Action, jangan pernah mengekspos token OAuth atau password GitHub ke browser pengguna lain, simpan kredensial hanya di environment variables (`.env.local`).

---

## 5. Aturan UI & Desain (Mengacu pada [`DESIGN.md`](./DESIGN.md))
- **Kanvas & Warna:**
  - Background kanvas utama `#000000` / `#0a0a0a` (`--color-void-canvas`).
  - Panel mengambang menggunakan frosted glass `bg-white/[0.04]` dengan `backdrop-blur-xl` dan border hairline `border-white/10`.
  - Teks utama `#ffffff` / `#ededed`, teks sekunder `#c2c2c2` / `white/80`, label pembantu `white/70`.
  - Tombol CTA utama menggunakan pill putih salju `btn-white-pill` (`bg-white text-[#161616] rounded-full`).
  - Highlight status menggunakan warna semantik terukur: Amber `#ffb829` (pending/perhatian), Hijau `#59d499` (sukses/terverifikasi), Merah (rejected).
- **Tipografi & Spacing:**
  - Font keluarga `Inter` / `DM Sans` / `Geist` dengan headline medium weight (bukan bold berat) dan letter-spacing rapat (`-0.035em`).
  - Wajib `tabular-nums` dan `whitespace-nowrap` untuk harga, NIM, tanggal, kode hash, dan tombol aksi tabel.
  - Lebar kontainer utama `max-w-[1280px]` untuk tabel dan form operasional agar muat tanpa terpotong.
- **Anti-Slop:**
  - Dilarang keras memakai emoji sebagai ikon UI (gunakan SVG Lucide atau inline SVG stroke native).
  - Dilarang membuat link biru `#0000ee` default.
  - Dilarang scrollbar hitam pekat (wajib gunakan frosted scrollbar transparan).

---

## 6. Skema Inti Database (Cloud Firestore)
1. `projects` — Menyimpan seluruh data pesanan: status verifikasi, kategori layanan (4 jenis), bukti QRIS (Base64 terkompresi), ide AI, URL repo, instruksi dokumen (`doc_topic`, `doc_details`), link deliverable (`doc_file_url`, `ppt_file_url`), dan status pengerjaan.
2. `project_members` — Menyimpan data identitas mahasiswa (Nama, NIM, KOM) dan relasi akun GitHub (jika koding).
3. `commit_schedules` — Menyimpan antrean jadwal commit mingguan (khusus proyek koding).

---

## 7. Aturan Git & Commit
- Subject commit maksimal 50 karakter, huruf kapital di awal, kalimat perintah (imperative), tanpa titik di akhir.
- Kosongkan body commit jika subject sudah cukup jelas.
