// Nilai (value) harus sama persis dengan yang dipakai di database/API.
// Label hanya untuk tampilan.

// Urutan tahap = urutan siklus hidup konten. Warna makin pekat seiring progres.
// "revision" bukan tahap maju: konten kembali ke editor (warna oranye sebagai penanda).
export const STAGES = [
  { value: "idea", label: "Ide", color: "#C5D3D6" },
  { value: "scripting", label: "Naskah", color: "#9DBCC0" },
  { value: "recording", label: "Rekaman", color: "#78A8AD" },
  { value: "editing", label: "Editing", color: "#4F8F94" },
  { value: "in_review", label: "Review", color: "#2F7A80" },
  { value: "revision", label: "Revisi", color: "#C77A2E" },
  { value: "ready", label: "Siap tayang", color: "#1B6368" },
  { value: "published", label: "Tayang", color: "#0C4A4D" },
];

export const PLATFORMS = [
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
];

export const FORMATS = [
  { value: "short_video", label: "Video pendek" },
  { value: "long_video", label: "Video panjang" },
  { value: "carousel", label: "Carousel" },
  { value: "single_post", label: "Posting tunggal" },
];

export const PRIORITIES = [
  { value: "low", label: "Rendah" },
  { value: "medium", label: "Sedang" },
  { value: "high", label: "Tinggi" },
];

export const ROLES = [
  { value: "creator", label: "Kreator" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
];

// Cari label dari sebuah value. Contoh: labelOf(STAGES, "idea") -> "Ide"
export function labelOf(list, value) {
  return list.find((item) => item.value === value)?.label ?? value;
}

// ---------- Hak akses perpindahan tahap ----------
// Kunci "dari>ke" -> peran yang boleh melakukannya.
// Ini HANYA untuk menampilkan/menyembunyikan tombol. Yang menolak sungguhan adalah backend.
const TRANSITIONS = {
  "idea>scripting": ["creator"],
  "scripting>recording": ["creator"],
  "recording>editing": ["creator"],
  "editing>in_review": ["editor"],
  "revision>in_review": ["editor"],
  "in_review>revision": ["creator"],
  "in_review>ready": ["creator"],
  "ready>published": ["creator"],
};

export function canTransition(user, content, to) {
  const allowed = TRANSITIONS[`${content.status}>${to}`];
  if (!allowed) return false;

  if (user.role === "admin") return true;
  if (user.role === "editor") return allowed.includes("editor") && content.editor_id === user.id;

  // Kreator: boleh semua tahap miliknya. Tugas editor pun boleh dikerjakan
  // sendiri selama belum ada editor yang ditugaskan.
  return allowed.includes("creator") || !content.editor_id;
}
