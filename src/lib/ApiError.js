// Error dari API. `errors` berisi pesan per kolom, contoh: { title: "Judul wajib diisi" }
export class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}
