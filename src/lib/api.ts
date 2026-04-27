import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  withCredentials: false,
});

function getCartSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("lvy_cart_session");
  if (!id) {
    id = "guest-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("lvy_cart_session", id);
  }
  return id;
}

function requestGeo() {
  if (typeof window === "undefined" || !navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition((pos) => {
    localStorage.setItem("lvy_lat", String(pos.coords.latitude));
    localStorage.setItem("lvy_lng", String(pos.coords.longitude));
  });
}
requestGeo();

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("lvy_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers["X-Cart-Session"] = getCartSessionId();
    const lat = localStorage.getItem("lvy_lat");
    const lng = localStorage.getItem("lvy_lng");
    if (lat) config.headers["X-Latitude"]  = lat;
    if (lng) config.headers["X-Longitude"] = lng;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("lvy_token");
      localStorage.removeItem("lvy_user");
      const current = window.location.pathname + window.location.search;
      const isAdmin = current.startsWith("/admin");
      if (isAdmin) {
        window.location.href = "/admin/login";
      } else {
        const skip = ["/", "/login", "/register", "/forgot-password"];
        const dest  = skip.includes(window.location.pathname)
          ? "/login"
          : `/login?redirect=${encodeURIComponent(current)}`;
        window.location.href = dest;
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth helpers ──
export const authApi = {
  register:       (d: unknown) => api.post("/auth/register", d),
  login:          (d: unknown) => api.post("/auth/login", d),
  logout:         ()           => api.post("/auth/logout"),
  me:             ()           => api.get("/auth/me"),
  updateProfile:  (d: unknown) => api.post("/auth/profile", d),
  forgotPassword: (email: string, guard?: string) =>
    api.post("/auth/forgot-password", { email, guard }),
  resetPassword:  (d: unknown) => api.post("/auth/reset-password", d),
};

export const staffAuthApi = {
  login:  (d: unknown) => api.post("/auth/staff/login", d),
  logout: ()           => api.post("/staff/logout"),
  me:     ()           => api.get("/staff/me"),
};

// ── Shop helpers ──
export const shopApi = {
  categories:     ()           => api.get("/shop/categories"),
  products:       (p?: object) => api.get("/shop/products", { params: p }),
  productBySlug:  (slug: string) => api.get(`/shop/products/${slug}`),
  featured:       ()           => api.get("/shop/products/featured"),
};

export const cartApi = {
  get:           ()            => api.get("/cart"),
  add:           (d: unknown)  => api.post("/cart/add", d),
  update:        (id: number, d: unknown) => api.patch(`/cart/items/${id}`, d),
  remove:        (id: number)  => api.delete(`/cart/items/${id}`),
  applyCoupon:   (code: string) => api.post("/cart/coupon", { code }),
  removeCoupon:  ()            => api.delete("/cart/coupon"),
  clear:         ()            => api.delete("/cart/clear"),
};

export const orderApi = {
  list:          ()            => api.get("/orders"),
  get:           (id: number)  => api.get(`/orders/${id}`),
  checkout:      (d: unknown)  => api.post("/orders/checkout", d),
  verifyPayment: (id: number, ref: string) => api.post(`/orders/${id}/verify-payment`, { reference: ref }),
};

// ── Admin helpers ──
export const adminApi = {
  dashboard:    ()            => api.get("/admin/dashboard"),

  products:     (p?: object)  => api.get("/admin/products", { params: p }),
  createProduct:(d: unknown)  => api.post("/admin/products", d),
  updateProduct:(id: number, d: unknown) => api.post(`/admin/products/${id}`, d),
  deleteProduct:(id: number)  => api.delete(`/admin/products/${id}`),

  orders:       (p?: object)  => api.get("/admin/orders", { params: p }),
  orderDetail:  (id: number)  => api.get(`/admin/orders/${id}`),
  updateOrder:  (id: number, d: unknown) => api.patch(`/admin/orders/${id}/status`, d),

  transactions:      (p?: object)  => api.get("/admin/transactions", { params: p }),
  updateTransaction: (id: number, d: unknown) => api.patch(`/admin/transactions/${id}`, d),
  deleteTransaction: (id: number)  => api.delete(`/admin/transactions/${id}`),

  staff:        (p?: object)  => api.get("/admin/staff", { params: p }),
  createStaff:  (d: unknown)  => api.post("/admin/staff", d),
  updateStaff:  (id: number, d: unknown) => api.post(`/admin/staff/${id}`, d),
  deleteStaff:  (id: number)  => api.delete(`/admin/staff/${id}`),
  staffQr:      (id: number)  => api.get(`/admin/staff/${id}/qr-code`),
  staffAttendance:(id: number, p?: object) => api.get(`/admin/staff/${id}/attendance`, { params: p }),

  conversations:(p?: object)  => api.get("/admin/conversations", { params: p }),
  conversation: (id: number)  => api.get(`/admin/conversations/${id}`),
  replyChat:    (id: number, msg: string) => api.post(`/admin/conversations/${id}/reply`, { message: msg }),
  closeChat:    (id: number)  => api.patch(`/admin/conversations/${id}/close`),

  activityLogs: (p?: object)  => api.get("/admin/activity-logs", { params: p }),

  profile:         ()           => api.get("/admin/profile"),
  updateProfile:   (d: FormData | unknown) => api.post("/admin/profile", d),
  changePassword:  (d: unknown) => api.post("/admin/profile/change-password", d),

  posProducts:  (p?: object)  => api.get("/admin/pos/products", { params: p }),
  posSale:      (d: unknown)  => api.post("/admin/pos/sale", d),

  clockIn:      (qr: string)  => api.post("/attendance/clock-in", { qr_code: qr }),
  clockOut:     (qr: string)  => api.post("/attendance/clock-out", { qr_code: qr }),
};
