// Backend palsu untuk pengembangan frontend. Data disimpan di localStorage.
// Aturan di sini meniru yang HARUS ada di backend asli (server-side validation & hak akses).
import { ApiError } from "./ApiError";
import { FORMATS, PLATFORMS, PRIORITIES, ROLES, STAGES } from "./constants";

const DB_KEY = "ccp_mock_db_v2";
const now = () => new Date().toISOString();
const today = () => now().slice(0, 10);
const valuesOf = (list) => list.map((item) => item.value);

// ---------- Database ----------

function createSeedData() {
  const baseContent = { description: null, script_draft: null, priority: "medium", scheduled_date: null, published_date: null, published_url: null, editor_id: null, review_url: null, review_note: null, created_at: now(), updated_at: now() };
  return {
    seq: { users: 3, channels: 2, contents: 3, checklists: 3, metrics: 2, reviews: 0 },
    users: [
      { id: 1, name: "Dina Kreator", email: "creator@demo.id", password: "password123", role: "creator", created_at: now() },
      { id: 2, name: "Raka Editor", email: "editor@demo.id", password: "password123", role: "editor", created_at: now() },
      { id: 3, name: "Admin Demo", email: "admin@demo.id", password: "password123", role: "admin", created_at: now() },
    ],
    channels: [
      { id: 1, user_id: 1, platform: "youtube", handle_name: "@dinabikin", created_at: now() },
      { id: 2, user_id: 1, platform: "tiktok", handle_name: "@dina.bikin", created_at: now() },
    ],
    contents: [
      { ...baseContent, id: 1, user_id: 1, channel_id: 2, title: "5 kesalahan pemula saat editing video", description: "Format cepat, satu kesalahan per 10 detik.", format_type: "short_video", status: "idea" },
      { ...baseContent, id: 2, user_id: 1, channel_id: 1, editor_id: 2, title: "Setup studio rumahan budget 2 juta", description: "Review alat satu per satu dan total biayanya.", script_draft: "Hook: studio ini lebih murah dari satu lensa kamera.", format_type: "long_video", status: "editing", priority: "high", scheduled_date: "2026-10-25" },
      { ...baseContent, id: 3, user_id: 1, channel_id: 1, title: "Cara memilih mikrofon untuk podcast", description: "Perbandingan dynamic vs condenser.", script_draft: "Mulai dari ruangan, bukan dari mikrofon.", format_type: "long_video", status: "published", priority: "low", scheduled_date: "2026-10-05", published_date: "2026-10-05", published_url: "https://youtube.com/watch?v=contoh123" },
    ],
    checklists: [
      { id: 1, content_id: 2, task_name: "Draft hook naskah selesai", is_completed: true, created_at: now() },
      { id: 2, content_id: 2, task_name: "B-roll direkam", is_completed: true, created_at: now() },
      { id: 3, content_id: 2, task_name: "Thumbnail disetujui", is_completed: false, created_at: now() },
    ],
    metrics: [
      { id: 1, content_id: 3, recorded_at: "2026-10-08", views_count: 1200, likes_count: 98, comments_count: 14, shares_count: 7, created_at: now() },
      { id: 2, content_id: 3, recorded_at: "2026-10-15", views_count: 4300, likes_count: 310, comments_count: 41, shares_count: 29, created_at: now() },
    ],
    reviews: [], // riwayat review (tabel content_reviews)
  };
}

function loadDb() {
  const saved = localStorage.getItem(DB_KEY);
  if (saved) return JSON.parse(saved);
  const seed = createSeedData();
  localStorage.setItem(DB_KEY, JSON.stringify(seed));
  return seed;
}

const saveDb = (db) => localStorage.setItem(DB_KEY, JSON.stringify(db));

function insert(db, table, row) {
  db.seq[table] += 1;
  const record = { id: db.seq[table], ...row, created_at: now() };
  db[table].push(record);
  return record;
}

// ---------- Hak akses ----------

const forbidden = () => new ApiError(403, "Kamu tidak punya akses untuk aksi ini");

const isAdmin = (user) => user.role === "admin";

// Admin lihat semua, editor hanya yang ditugaskan, kreator hanya miliknya.
const canSee = (user, content) =>
  isAdmin(user) || (user.role === "editor" ? content.editor_id === user.id : content.user_id === user.id);

// Mengubah/menghapus konten: kreator pemilik atau admin.
const canManage = (user, content) =>
  isAdmin(user) || (user.role === "creator" && content.user_id === user.id);

// Mengirim hasil editing: editor yang ditugaskan, admin, atau kreator pemilik
// jika konten belum punya editor.
const canActAsEditor = (user, content) =>
  isAdmin(user) ||
  (user.role === "editor" && content.editor_id === user.id) ||
  (user.role === "creator" && content.user_id === user.id && !content.editor_id);

// ---------- Validasi ----------

function fail(errors, message = "Data tidak valid") {
  throw new ApiError(422, message, errors);
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateContent(db, content) {
  const errors = {};
  const channel = db.channels.find((c) => c.id === content.channel_id && c.user_id === content.user_id);
  const editor = db.users.find((u) => u.id === content.editor_id);

  if (!content.title?.trim()) errors.title = "Judul wajib diisi";
  if (!channel) errors.channel_id = "Pilih channel tujuan";
  if (!valuesOf(FORMATS).includes(content.format_type)) errors.format_type = "Pilih format konten";
  if (!valuesOf(PRIORITIES).includes(content.priority)) errors.priority = "Prioritas tidak valid";
  if (!valuesOf(STAGES).includes(content.status)) errors.status = "Tahap tidak valid";
  if (content.editor_id && editor?.role !== "editor") errors.editor_id = "Pengguna yang dipilih bukan editor";

  // Aturan publikasi (tiket CCP-05, test case TC-03)
  if (content.status === "published") {
    if (!content.published_url) {
      errors.published_url = "Link postingan wajib diisi sebelum konten ditandai tayang";
    } else if (!isValidUrl(content.published_url)) {
      errors.published_url = "Link postingan harus berupa URL yang valid (diawali http:// atau https://)";
    }
  }

  if (Object.keys(errors).length) fail(errors, errors.published_url || "Periksa kembali isian form");
}

const CONTENT_FIELDS = [
  "channel_id", "editor_id", "title", "description", "script_draft", "format_type",
  "status", "priority", "scheduled_date", "published_url",
];

const pickContentFields = (body) =>
  Object.fromEntries(CONTENT_FIELDS.filter((key) => key in body).map((key) => [key, body[key]]));

// Perpindahan tahap lewat edit biasa. Tahap review/revisi/ACC HANYA lewat endpoint review,
// supaya tidak ada yang bisa melompati proses review.
const MANUAL_TRANSITIONS = { idea: "scripting", scripting: "recording", recording: "editing", ready: "published" };

// ---------- Bentuk response ----------

function publicUser({ id, name, email, role }) {
  return { id, name, email, role };
}

// Konten + info channel & editor (dipakai di list dan detail)
function withRelations(db, content) {
  return {
    ...content,
    channel: db.channels.find((c) => c.id === content.channel_id),
    editor_name: db.users.find((u) => u.id === content.editor_id)?.name ?? null,
  };
}

function detail(db, content) {
  return {
    ...withRelations(db, content),
    checklists: db.checklists.filter((c) => c.content_id === content.id),
    metrics: db.metrics.filter((m) => m.content_id === content.id).sort((a, b) => b.recorded_at.localeCompare(a.recorded_at)),
    reviews: db.reviews
      .filter((r) => r.content_id === content.id)
      .map((r) => ({ ...r, user_name: db.users.find((u) => u.id === r.user_id)?.name }))
      .sort((a, b) => b.id - a.id),
  };
}

// ---------- Router ----------

export async function handleMockRequest(method, path, body = {}, token) {
  const db = loadDb();
  const [pathname, queryString = ""] = path.replace("/api/v1", "").split("?");
  const query = Object.fromEntries(new URLSearchParams(queryString));
  const is = (m, pattern) => method === m && pattern.test(pathname);
  const idIn = (pattern) => Number(pathname.match(pattern)[1]);

  // --- Auth (tanpa token) ---
  if (is("POST", /^\/auth\/register$/)) {
    const errors = {};
    if (!body.name?.trim()) errors.name = "Nama wajib diisi";
    if (!/^\S+@\S+\.\S+$/.test(body.email || "")) errors.email = "Format email tidak valid";
    else if (db.users.some((u) => u.email === body.email)) errors.email = "Email already taken";
    if ((body.password || "").length < 8) errors.password = "Password minimal 8 karakter";
    if (Object.keys(errors).length) fail(errors, errors.email || "Periksa kembali isian form");

    // Daftar mandiri hanya boleh creator/editor. "admin" dari form selalu diabaikan.
    const role = body.role === "editor" ? "editor" : "creator";
    // Backend asli wajib menyimpan password_hash (Bcrypt/Argon2), bukan teks asli.
    const user = insert(db, "users", { name: body.name.trim(), email: body.email, password: body.password, role });
    saveDb(db);
    return { token: `mock-${user.id}`, user: publicUser(user) };
  }

  if (is("POST", /^\/auth\/login$/)) {
    const user = db.users.find((u) => u.email === body.email && u.password === body.password);
    if (!user) throw new ApiError(401, "Email atau password salah");
    return { token: `mock-${user.id}`, user: publicUser(user) };
  }

  // --- Semua endpoint di bawah butuh login ---
  const user = db.users.find((u) => `mock-${u.id}` === token);
  if (!user) throw new ApiError(401, "Sesi berakhir, silakan masuk lagi");

  // Cari konten + cek hak akses. 404 jika tidak boleh melihat, 403 jika boleh lihat tapi tidak boleh aksi.
  const findContent = (id, permission = canSee) => {
    const content = db.contents.find((c) => c.id === id);
    if (!content || !canSee(user, content)) throw new ApiError(404, "Konten tidak ditemukan");
    if (!permission(user, content)) throw forbidden();
    return content;
  };

  // --- Users ---
  if (is("GET", /^\/users$/)) {
    if (query.role) {
      if (user.role === "editor") throw forbidden();
      return db.users.filter((u) => u.role === query.role).map(publicUser);
    }
    if (!isAdmin(user)) throw forbidden();
    return db.users.map(publicUser);
  }

  if (is("PATCH", /^\/users\/(\d+)\/role$/)) {
    if (!isAdmin(user)) throw forbidden();
    const target = db.users.find((u) => u.id === idIn(/^\/users\/(\d+)\/role$/));
    if (!target) throw new ApiError(404, "Pengguna tidak ditemukan");
    if (target.id === user.id) fail({}, "Tidak bisa mengubah role akun sendiri");
    if (!valuesOf(ROLES).includes(body.role)) fail({ role: "Role tidak valid" });
    target.role = body.role;
    saveDb(db);
    return publicUser(target);
  }

  // --- Channels ---
  if (is("GET", /^\/channels$/)) {
    if (user.role === "editor") throw forbidden();
    return db.channels.filter((c) => isAdmin(user) || c.user_id === user.id);
  }

  if (is("POST", /^\/channels$/)) {
    if (user.role === "editor") throw forbidden();
    const errors = {};
    if (!valuesOf(PLATFORMS).includes(body.platform)) errors.platform = "Pilih platform";
    if (!body.handle_name?.trim()) errors.handle_name = "Nama akun wajib diisi";
    if (Object.keys(errors).length) fail(errors);

    const channel = insert(db, "channels", { user_id: user.id, platform: body.platform, handle_name: body.handle_name.trim() });
    saveDb(db);
    return channel;
  }

  // --- Contents ---
  if (is("GET", /^\/contents$/)) {
    return db.contents
      .filter((c) => canSee(user, c))
      .filter((c) => !query.status || c.status === query.status)
      .filter((c) => !query.channel_id || c.channel_id === Number(query.channel_id))
      .map((c) => withRelations(db, c))
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }

  if (is("POST", /^\/contents$/)) {
    if (user.role === "editor") throw forbidden();
    const input = pickContentFields(body);
    // Admin membuat konten atas nama pemilik channel yang dipilih.
    const channelOwner = db.channels.find((c) => c.id === input.channel_id)?.user_id;
    const content = {
      status: "idea", priority: "medium", editor_id: null,
      ...input,
      user_id: isAdmin(user) ? channelOwner ?? user.id : user.id,
      published_date: null, review_url: null, review_note: null,
    };
    validateContent(db, content);
    const saved = insert(db, "contents", { ...content, updated_at: now() });
    saveDb(db);
    return withRelations(db, saved);
  }

  if (is("GET", /^\/contents\/(\d+)$/)) {
    return detail(db, findContent(idIn(/^\/contents\/(\d+)$/)));
  }

  if (is("PATCH", /^\/contents\/(\d+)$/)) {
    const content = findContent(idIn(/^\/contents\/(\d+)$/), canManage);
    const next = { ...content, ...pickContentFields(body) };

    if (next.status !== content.status && MANUAL_TRANSITIONS[content.status] !== next.status) {
      fail({ status: "Perpindahan tahap ini tidak diizinkan. Tahap review dan revisi berjalan lewat alur review." },
        "Perpindahan tahap tidak diizinkan");
    }
    validateContent(db, next);

    if (next.status === "published" && !next.published_date) next.published_date = today();
    Object.assign(content, next, { updated_at: now() });
    saveDb(db);
    return withRelations(db, content);
  }

  if (is("DELETE", /^\/contents\/(\d+)$/)) {
    const content = findContent(idIn(/^\/contents\/(\d+)$/), canManage);
    // Meniru ON DELETE CASCADE: hapus semua data anak milik konten ini
    db.contents = db.contents.filter((c) => c.id !== content.id);
    db.checklists = db.checklists.filter((c) => c.content_id !== content.id);
    db.metrics = db.metrics.filter((m) => m.content_id !== content.id);
    db.reviews = db.reviews.filter((r) => r.content_id !== content.id);
    saveDb(db);
    return null;
  }

  // --- Alur review ---
  if (is("POST", /^\/contents\/(\d+)\/review\/submit$/)) {
    const content = findContent(idIn(/^\/contents\/(\d+)\/review\/submit$/), canActAsEditor);
    if (!["editing", "revision"].includes(content.status)) fail({}, "Konten tidak sedang di tahap editing");
    if (!isValidUrl(body.review_url || "")) fail({ review_url: "Link review wajib berupa URL yang valid" }, "Link review tidak valid");

    Object.assign(content, { status: "in_review", review_url: body.review_url, review_note: null, updated_at: now() });
    insert(db, "reviews", { content_id: content.id, user_id: user.id, action: "submitted", note: null, review_url: body.review_url });
    saveDb(db);
    return detail(db, content);
  }

  if (is("POST", /^\/contents\/(\d+)\/review\/revision$/)) {
    const content = findContent(idIn(/^\/contents\/(\d+)\/review\/revision$/), canManage);
    if (content.status !== "in_review") fail({}, "Konten tidak sedang direview");
    if (!body.note?.trim()) fail({ note: "Catatan revisi wajib diisi" }, "Catatan revisi wajib diisi");

    Object.assign(content, { status: "revision", review_note: body.note.trim(), updated_at: now() });
    insert(db, "reviews", { content_id: content.id, user_id: user.id, action: "revision_requested", note: body.note.trim(), review_url: content.review_url });
    saveDb(db);
    return detail(db, content);
  }

  if (is("POST", /^\/contents\/(\d+)\/review\/approve$/)) {
    const content = findContent(idIn(/^\/contents\/(\d+)\/review\/approve$/), canManage);
    if (content.status !== "in_review") fail({}, "Konten tidak sedang direview");

    Object.assign(content, { status: "ready", review_note: null, updated_at: now() });
    insert(db, "reviews", { content_id: content.id, user_id: user.id, action: "approved", note: null, review_url: content.review_url });
    saveDb(db);
    return detail(db, content);
  }

  // --- Checklists (kreator, editor yang ditugaskan, dan admin boleh) ---
  if (is("POST", /^\/contents\/(\d+)\/checklists$/)) {
    const content = findContent(idIn(/^\/contents\/(\d+)\/checklists$/));
    if (!body.task_name?.trim()) fail({ task_name: "Nama tugas wajib diisi" });
    const item = insert(db, "checklists", { content_id: content.id, task_name: body.task_name.trim(), is_completed: false });
    saveDb(db);
    return item;
  }

  if (is("PATCH", /^\/checklists\/(\d+)\/toggle$/)) {
    const item = findChecklist(db, user, idIn(/^\/checklists\/(\d+)\/toggle$/));
    item.is_completed = !item.is_completed;
    saveDb(db);
    return item;
  }

  if (is("DELETE", /^\/checklists\/(\d+)$/)) {
    const item = findChecklist(db, user, idIn(/^\/checklists\/(\d+)$/));
    db.checklists = db.checklists.filter((c) => c.id !== item.id);
    saveDb(db);
    return null;
  }

  // --- Metrics (kreator & admin) ---
  if (is("POST", /^\/contents\/(\d+)\/metrics$/)) {
    const content = findContent(idIn(/^\/contents\/(\d+)\/metrics$/), canManage);
    if (content.status !== "published") fail({}, "Metrik hanya bisa dicatat untuk konten yang sudah tayang");

    const errors = {};
    if (!body.recorded_at) errors.recorded_at = "Tanggal pencatatan wajib diisi";
    const counts = {};
    for (const key of ["views_count", "likes_count", "comments_count", "shares_count"]) {
      const value = Number(body[key] ?? 0);
      if (!Number.isInteger(value) || value < 0) errors[key] = "Harus bilangan bulat 0 atau lebih";
      counts[key] = value;
    }
    if (Object.keys(errors).length) fail(errors);

    const metric = insert(db, "metrics", { content_id: content.id, recorded_at: body.recorded_at, ...counts });
    saveDb(db);
    return metric;
  }

  throw new ApiError(404, "Endpoint tidak ditemukan");
}

// Checklist boleh diubah siapa pun yang boleh melihat konten induknya.
function findChecklist(db, user, id) {
  const item = db.checklists.find((c) => c.id === id);
  const content = item && db.contents.find((c) => c.id === item.content_id);
  if (!content || !canSee(user, content)) throw new ApiError(404, "Checklist tidak ditemukan");
  return item;
}
