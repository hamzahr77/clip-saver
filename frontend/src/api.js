const BASE = import.meta.env.VITE_API || "https://clip-saver.onrender.com/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || res.statusText);
  }
  return res.json().catch(() => ({}));
}

export const fetchClips = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${BASE}/clips?${qs}`).then((r) => r.json());
};

export const createClip = (data) =>
  fetch(`${BASE}/clips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const updateClip = (id, data) =>
  fetch(`${BASE}/clips/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const deleteClip = (id) =>
  fetch(`${BASE}/clips/${id}`, {
    method: "DELETE",
  }).then((r) => (r.ok ? true : r.json()));
