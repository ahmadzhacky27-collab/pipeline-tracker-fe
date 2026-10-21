# Pipeline Konten (Frontend)

Frontend untuk **Creator Content & Pipeline Tracker**: React (JavaScript) + Vite + Tailwind CSS 3 + shadcn/ui.

## Menjalankan di lokal

```bash
npm install
cp .env.example .env     # biarkan VITE_API_URL kosong untuk memakai mock server
npm run dev
```

Buka alamat yang tampil di terminal.
Akun contoh (password semuanya `password123`):

  | Email             | Role    |
  |---                |---      |
  | `creator@demo.id` | Kreator |
  | `editor@demo.id`  | Editor  |
  | `admin@demo.id`   | Admin   |

Untuk mencoba alur review: masuk sebagai editor, buka konten "Setup studio rumahan", kirim link review.
Lalu masuk sebagai kreator untuk menyetujui atau meminta revisi.

## Mock server vs backend asli

- `VITE_API_URL` **kosong** → data disimpan di `localStorage` lewat `src/lib/mockServer.js`.
  Untuk mengulang data dari awal: hapus key `ccp_mock_db_v2` di DevTools > Application > Local Storage.
- `VITE_API_URL=http://localhost:8000` → semua request dikirim ke backend asli
  (`/api/v1/...` sesuai kontrak endpoint di spesifikasi). Tidak ada kode yang perlu diubah.

Backend asli perlu memperhatikan:
- `GET /contents` dan `GET /contents/:id` menyertakan objek `channel` (`platform`, `handle_name`) dan `editor_name`.
  `GET /contents/:id` juga menyertakan `checklists`, `metrics`, dan `reviews` (dengan `user_name`).
- `PATCH /contents/:id` mengembalikan konten terbaru (lengkap dengan `channel` dan `editor_name`).
- Error validasi: status `422` dengan body `{ "message": "...", "errors": { "kolom": "pesan" } }`.
- Token dikirim lewat header `Authorization: Bearer <token>`.
- Tiket CCP-04 meminta hapus checklist: tambahkan `DELETE /api/v1/checklists/:id`.

## Struktur folder

```
src/
  lib/
    api.js            satu fungsi per endpoint
    mockServer.js     backend palsu + aturan bisnis (publish butuh URL valid, cascade delete)
    constants.js      tahap, platform, format, prioritas (value + label)
    utils.js          cn(), format tanggal/angka
  hooks/useAuth.jsx   sesi login
  components/
    ui/               button, input/select/textarea, label (gaya shadcn)
    ContentFields.jsx kolom form konten (dipakai di halaman baru & detail)
    Checklist.jsx     checklist tanpa reload halaman
    MetricsPanel.jsx  catat & lihat riwayat metrik
    ReviewPanel.jsx   kirim review / ACC / minta revisi, sesuai role & tahap
    StageBar.jsx      indikator tahap di daftar
  pages/              satu file per halaman (UsersPage khusus admin)
```


## Role dan alur review

Tiga role: `creator`, `editor`, `admin`.

```
idea > scripting > recording > editing > in_review > ready > published
                                  ^           |
                                  +-- revision +   (kreator minta revisi)
```

| Aksi | Kreator | Editor | Admin |
|---|---|---|---|
| Lihat konten | miliknya | yang ditugaskan | semua |
| Buat / edit / hapus konten, kelola channel & metrik | ya | tidak | ya |
| idea > scripting > recording > editing | ya | tidak | ya |
| Kirim review (editing/revision > in_review) | hanya jika belum ada editor | ya (miliknya) | ya |
| ACC atau minta revisi | ya    | tidak | ya                                                     |
| ready > published     | ya    | tidak | ya                                                     |
| Checklist             | ya    | ya | ya                                                        |
| Ubah role pengguna    | tidak | tidak | ya  |

Aturan di `src/lib/constants.js` (`canTransition`) hanya mengatur tombol yang tampil.
**Backend wajib memeriksa ulang semuanya.**

Endpoint tambahan untuk backend asli:

```
GET   /api/v1/users?role=editor              kreator/admin: daftar editor
GET   /api/v1/users                          admin: semua pengguna
PATCH /api/v1/users/:id/role                 admin: ubah role  { role }
POST  /api/v1/contents/:id/review/submit     { review_url }   -> status in_review
POST  /api/v1/contents/:id/review/approve                     -> status ready
POST  /api/v1/contents/:id/review/revision   { note }         -> status revision
```

Kolom/tabel baru di database:
- `contents.editor_id` (FK ke users, nullable), `contents.review_url`, `contents.review_note`
- tabel `content_reviews`: `content_id` (cascade delete), `user_id`, `action`
  (`submitted` / `approved` / `revision_requested`), `note`, `review_url`, `created_at`
- status baru: `in_review`, `revision`

Catatan penting backend:
- `PATCH /contents/:id` tidak boleh dipakai melompati review: hanya izinkan
  idea>scripting>recording>editing dan ready>published.
- `GET /contents` harus disaring di server sesuai role.
- Register tidak boleh menerima `role: "admin"`.
