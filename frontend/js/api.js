// ─────────────────────────────────────────────────────────────
// api.js  — ReWear API client
// IMPORTANT: Update API_BASE to your Render URL before deploying
// ─────────────────────────────────────────────────────────────
const API_BASE = "https://rewear-mehd.onrender.com/api";
// For local dev swap to: "http://localhost:5000/api"

const Api = (() => {
  // ── Token / User helpers ─────────────────────────────────
  const getToken  = ()  => localStorage.getItem("rw_token");
  const setToken  = (t) => localStorage.setItem("rw_token", t);
  const getUser   = ()  => { try { return JSON.parse(localStorage.getItem("rw_user")); } catch { return null; } };
  const setUser   = (u) => localStorage.setItem("rw_user", JSON.stringify(u));
  const isLoggedIn = () => !!getToken();

  const logout = () => {
    localStorage.removeItem("rw_token");
    localStorage.removeItem("rw_user");
    window.location.href = "index.html";
  };

  // ── Core fetch wrapper ────────────────────────────────────
  const req = async (method, path, body = null, isForm = false) => {
    const headers = {};
    if (!isForm) headers["Content-Type"] = "application/json";
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const opts = { method, headers };
    if (body) opts.body = isForm ? body : JSON.stringify(body);

    let res;
    try {
      res = await fetch(`${API_BASE}${path}`, opts);
    } catch (networkErr) {
      throw new Error("Cannot reach server. Check your connection or backend URL.");
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || "Request failed.");
    return data;
  };

  const get      = (p)    => req("GET",    p);
  const post     = (p, b) => req("POST",   p, b);
  const put      = (p, b) => req("PUT",    p, b);
  const patch    = (p, b) => req("PATCH",  p, b);
  const del      = (p)    => req("DELETE", p);
  const postForm = (p, b) => req("POST",   p, b, true);
  const putForm  = (p, b) => req("PUT",    p, b, true);

  // ── Namespaced API calls ──────────────────────────────────
  const auth = {
    register : (d) => post("/auth/register", d),
    login    : (d) => post("/auth/login", d),
    me       : ()  => get("/auth/me"),
  };

  const items = {
    getAll : (p={}) => get(`/items?${new URLSearchParams(p)}`),
    getById: (id)   => get(`/items/${id}`),
    getMine: ()     => get("/items/mine"),
    create : (fd)   => postForm("/items", fd),
    update : (id,d) => put(`/items/${id}`, d),
    delete : (id)   => del(`/items/${id}`),
  };

  const orders = {
    getMine : ()        => get("/orders"),
    request : (itemId, note) => post("/orders", { itemId, note }),
    accept  : (id)      => patch(`/orders/${id}/accept`),
    reject  : (id)      => patch(`/orders/${id}/reject`),
    complete: (id)      => patch(`/orders/${id}/complete`),
  };

  const wishlist = {
    get   : ()     => get("/wishlist"),
    add   : (id)   => post(`/wishlist/${id}`),
    remove: (id)   => del(`/wishlist/${id}`),
  };

  const users = {
    getProfile: (id) => get(`/users/${id}`),
    updateMe  : (fd) => putForm("/users/me", fd),
  };

  const admin = {
    getStats  : ()      => get("/admin/stats"),
    getUsers  : (p={})  => get(`/admin/users?${new URLSearchParams(p)}`),
    updateUser: (id, d) => patch(`/admin/users/${id}`, d),
    getItems  : (p={})  => get(`/admin/items?${new URLSearchParams(p)}`),
    updateItem: (id, s) => patch(`/admin/items/${id}`, { status: s }),
    getOrders : (p={})  => get(`/admin/orders?${new URLSearchParams(p)}`),
  };

  // ── Toast ────────────────────────────────────────────────
  const toast = (msg, type = "success") => {
    document.getElementById("rw-toast")?.remove();
    const el = document.createElement("div");
    el.id = "rw-toast";
    const bg = { success:"#16a34a", error:"#dc2626", info:"#2563eb" }[type] || "#16a34a";
    el.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;padding:14px 22px;border-radius:12px;font-size:14px;font-weight:500;color:#fff;background:${bg};box-shadow:0 8px 24px rgba(0,0,0,.18);animation:slideUp .25s ease;pointer-events:none`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity="0"; el.style.transition="opacity .3s"; setTimeout(()=>el.remove(), 300); }, 3500);
  };
  const toastErr  = (m) => toast(m, "error");
  const toastInfo = (m) => toast(m, "info");

  // ── Helpers ──────────────────────────────────────────────
  const statusColor = (s) => ({ ACTIVE:"#16a34a",ARCHIVED:"#d97706",EXCHANGED:"#6366f1",REQUESTED:"#2563eb",ACCEPTED:"#16a34a",REJECTED:"#dc2626",COMPLETED:"#7c3aed",CANCELLED:"#6b7280" }[s]||"#6b7280");
  const statusBg    = (s) => ({ ACTIVE:"#dcfce7",ARCHIVED:"#fef3c7",EXCHANGED:"#e0e7ff",REQUESTED:"#dbeafe",ACCEPTED:"#dcfce7",REJECTED:"#fee2e2",COMPLETED:"#ede9fe",CANCELLED:"#f3f4f6" }[s]||"#f3f4f6");
  const fmtStatus   = (s) => s?.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase()) || s;
  const timeAgo = (d) => { const m=Math.floor((Date.now()-new Date(d))/60000); return m<60?`${m}m ago`:m<1440?`${Math.floor(m/60)}h ago`:`${Math.floor(m/1440)}d ago`; };

  // ── Nav state ────────────────────────────────────────────
  const updateNav = () => {
    const user = getUser();
    document.querySelectorAll("[data-show-auth]").forEach(el => el.style.display = isLoggedIn() ? "none" : "");
    document.querySelectorAll("[data-show-user]").forEach(el => el.style.display = isLoggedIn() ? "" : "none");
    if (user) {
      document.querySelectorAll("[data-nav-name]").forEach(el => el.textContent = user.firstName);
      document.querySelectorAll("[data-nav-points]").forEach(el => el.textContent = `${user.points} pts`);
      document.querySelectorAll("[data-nav-avatar]").forEach(el => { if (user.avatar) el.src = user.avatar; });
    }
    document.querySelectorAll("[data-logout]").forEach(el => el.addEventListener("click", e => { e.preventDefault(); logout(); }));
    // Admin link visibility
    document.querySelectorAll("[data-admin-only]").forEach(el => el.style.display = user?.role === "ADMIN" ? "" : "none");
  };

  return { getToken, setToken, getUser, setUser, isLoggedIn, logout,
           auth, items, orders, wishlist, users, admin,
           toast, toastErr, toastInfo, updateNav,
           statusColor, statusBg, fmtStatus, timeAgo };
})();

document.addEventListener("DOMContentLoaded", () => {
  Api.updateNav();
  // Inject keyframe for toast
  if (!document.getElementById("rw-anim")) {
    const s = document.createElement("style");
    s.id = "rw-anim";
    s.textContent = `@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`;
    document.head.appendChild(s);
  }
});
