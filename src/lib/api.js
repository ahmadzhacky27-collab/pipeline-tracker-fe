import { ApiError } from "./ApiError";
import { handleMockRequest } from "./mockServer";

// Jika VITE_API_URL kosong, aplikasi memakai mock server (localStorage).
// Jika diisi, semua request dikirim ke backend asli.
const BASE_URL = import.meta.env.VITE_API_URL;
const API = "/api/v1";

export const TOKEN_KEY = "ccp_token";

async function request(method, path, body) {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!BASE_URL) {
    return handleMockRequest(method, `${API}${path}`, body, token);
  }

  const response = await fetch(`${BASE_URL}${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(response.status, data.message || "Terjadi kesalahan", data.errors || {});
  }
  return data;
}

// Satu fungsi per endpoint di spesifikasi (bagian 5).
export const api = {
  register: (body) => request("POST", "/auth/register", body),
  login: (body) => request("POST", "/auth/login", body),

  getChannels: () => request("GET", "/channels"),
  createChannel: (body) => request("POST", "/channels", body),

  getContents: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value) // buang filter kosong
    ).toString();
    return request("GET", `/contents${query ? `?${query}` : ""}`);
  },
  getContent: (id) => request("GET", `/contents/${id}`),
  createContent: (body) => request("POST", "/contents", body),
  updateContent: (id, body) => request("PATCH", `/contents/${id}`, body),
  deleteContent: (id) => request("DELETE", `/contents/${id}`),

  addChecklist: (contentId, body) => request("POST", `/contents/${contentId}/checklists`, body),
  toggleChecklist: (id) => request("PATCH", `/checklists/${id}/toggle`),
  // Catatan: endpoint ini belum ada di kontrak, tapi diminta di tiket CCP-04.
  deleteChecklist: (id) => request("DELETE", `/checklists/${id}`),

  addMetric: (contentId, body) => request("POST", `/contents/${contentId}/metrics`, body),

  // Pengguna & role
  getUsers: (role) => request("GET", `/users${role ? `?role=${role}` : ""}`),
  updateUserRole: (id, role) => request("PATCH", `/users/${id}/role`, { role }),

  // Alur review: editor kirim link -> kreator ACC atau minta revisi
  submitReview: (id, body) => request("POST", `/contents/${id}/review/submit`, body),
  approveReview: (id) => request("POST", `/contents/${id}/review/approve`),
  requestRevision: (id, body) => request("POST", `/contents/${id}/review/revision`, body),
};
