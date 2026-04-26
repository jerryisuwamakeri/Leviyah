import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Staff } from "@/types";

interface AuthState {
  user: User | null;
  staff: Staff | null;
  token: string | null;
  isAuthenticated: boolean;
  isStaff: boolean;
  permissions: string[];
  roles: string[];
  setUser:  (user: User,  token: string) => void;
  setStaff: (staff: Staff, token: string, roles: string[], perms: string[]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      staff: null,
      token: null,
      isAuthenticated: false,
      isStaff: false,
      permissions: [],
      roles: [],

      setUser: (user, token) => {
        localStorage.setItem("lvy_token", token);
        set({ user, token, isAuthenticated: true, isStaff: false, staff: null });
      },

      setStaff: (staff, token, roles, permissions) => {
        localStorage.setItem("lvy_token", token);
        set({ staff, token, isAuthenticated: true, isStaff: true, user: null, roles, permissions });
      },

      logout: () => {
        localStorage.removeItem("lvy_token");
        set({ user: null, staff: null, token: null, isAuthenticated: false, isStaff: false, permissions: [], roles: [] });
      },
    }),
    {
      name: "lvy_auth",
      partialize: (s) => ({ user: s.user, staff: s.staff, token: s.token, isAuthenticated: s.isAuthenticated, isStaff: s.isStaff, roles: s.roles, permissions: s.permissions }),
    }
  )
);
