"use client";

import { useAuthStore } from "@/store/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Package, ShoppingCart, Users, CreditCard,
  MessageSquare, Activity, MonitorSmartphone, LogOut, Menu, X, Tag,
  ChevronDown, UserCircle,
} from "lucide-react";
import { staffAuthApi } from "@/lib/api";

/* ── Role definitions ──────────────────────────────────── */
type RoleName = "super_admin" | "admin" | "manager" | "cashier" | "support";

const ROLE_META: Record<RoleName, { label: string; color: string; desc: string }> = {
  super_admin: { label: "Super Admin",  color: "bg-[#C9A880] text-[#111111]",        desc: "Full system access"   },
  admin:       { label: "Admin",        color: "bg-white/10 text-white",              desc: "Admin access"         },
  manager:     { label: "Manager",      color: "bg-[#C9A880]/20 text-[#C9A880]",     desc: "Store manager"        },
  cashier:     { label: "Cashier",      color: "bg-white/5 text-white/60",            desc: "POS & sales"          },
  support:     { label: "Support",      color: "bg-[#C9A880]/10 text-[#C9A880]/70",  desc: "Customer support"     },
};

const ALL_NAV = [
  { icon: LayoutDashboard,  label: "Dashboard",     href: "/admin/dashboard",      roles: ["super_admin","admin","manager","cashier","support"] },
  { icon: Package,           label: "Products",      href: "/admin/products",       roles: ["super_admin","admin","manager"] },
  { icon: ShoppingCart,      label: "Orders",        href: "/admin/orders",         roles: ["super_admin","admin","manager","cashier"] },
  { icon: CreditCard,        label: "Transactions",  href: "/admin/transactions",   roles: ["super_admin","admin","manager"] },
  { icon: Users,             label: "Staff",         href: "/admin/staff",          roles: ["super_admin","admin"] },
  { icon: MessageSquare,     label: "Chats",         href: "/admin/chat",           roles: ["super_admin","admin","manager","support"] },
  { icon: MonitorSmartphone, label: "POS",           href: "/admin/pos",            roles: ["super_admin","admin","manager","cashier"] },
  { icon: Tag,               label: "Promotions",    href: "/admin/promotions",     roles: ["super_admin","admin","manager"] },
  { icon: Activity,          label: "Activity Logs", href: "/admin/activity-logs",  roles: ["super_admin","admin"] },
  { icon: UserCircle,        label: "My Profile",    href: "/admin/profile",        roles: ["super_admin","admin","manager","cashier","support"] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isStaff, isAuthenticated, staff, roles, logout } = useAuthStore();
  const router    = useRouter();
  const pathname  = usePathname();
  const [open,    setOpen]    = useState(false);
  const [mounted, setMounted] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || !isStaff)) {
      router.replace("/admin/login");
    }
  }, [mounted, isAuthenticated, isStaff]);

  const handleLogout = async () => {
    await staffAuthApi.logout().catch(() => {});
    logout();
    router.replace("/admin/login");
  };

  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/forgot-password";
  if (!mounted) return isAuthPage ? <>{children}</> : null;
  if (isAuthPage) return <>{children}</>;
  if (!isStaff) return null;

  // Determine current highest role
  const currentRole = (
    roles.includes("super_admin") ? "super_admin" :
    roles.includes("admin")       ? "admin"       :
    roles.includes("manager")     ? "manager"     :
    roles.includes("cashier")     ? "cashier"     :
    roles.includes("support")     ? "support"     : null
  ) as RoleName | null;

  const roleMeta = currentRole ? ROLE_META[currentRole] : null;

  // Filter nav items by role
  const navItems = ALL_NAV.filter((item) =>
    !currentRole || item.roles.includes(currentRole)
  );

  const breadcrumb = pathname.split("/").filter(Boolean).slice(1).join(" › ");

  return (
    <div className="flex h-screen bg-[#0E0C0A] text-white overflow-hidden">

      {/* ── Sidebar ────────────────────────────────────── */}
      <aside className={`${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-40 w-60 h-full bg-[#111111] border-r border-[#2A2520] flex flex-col transition-transform duration-200`}>

        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-[#2A2520]">
          <Link href="/admin/dashboard" className="text-lg font-black tracking-widest uppercase text-[#C9A880]">
            Leviyah
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <X className="w-4 h-4 text-[#7A6050]" />
          </button>
        </div>

        {/* Role badge */}
        {roleMeta && (
          <div className="px-4 pt-4">
            <div className="relative">
              <button
                onClick={() => setRoleOpen(!roleOpen)}
                className="w-full flex items-center justify-between bg-[#0E0C0A] border border-[#2A2520] hover:border-[#C9A880]/30 px-3 py-2.5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`text-[8px] font-black tracking-widest uppercase px-2 py-0.5 ${roleMeta.color}`}>
                    {roleMeta.label}
                  </span>
                  <span className="text-[9px] text-[#7A6050]">{staff?.name?.split(" ")[0]}</span>
                </div>
                <ChevronDown className={`w-3 h-3 text-[#7A6050] transition-transform ${roleOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Role info dropdown */}
              {roleOpen && (
                <div className="absolute top-full left-0 right-0 z-20 bg-[#0E0C0A] border border-[#2A2520] border-t-0">
                  <div className="px-3 py-3 space-y-2.5">
                    <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#7A6050]">All Roles</p>
                    {(Object.entries(ROLE_META) as [RoleName, typeof ROLE_META[RoleName]][]).map(([key, meta]) => (
                      <div key={key} className={`flex items-center gap-2.5 ${key === currentRole ? "opacity-100" : "opacity-30"}`}>
                        <span className={`text-[8px] font-black tracking-widest uppercase px-2 py-0.5 shrink-0 ${meta.color}`}>
                          {meta.label}
                        </span>
                        <span className="text-[9px] text-[#7A6050]">{meta.desc}</span>
                        {key === currentRole && (
                          <span className="ml-auto text-[#C9A880] text-[8px]">● You</span>
                        )}
                      </div>
                    ))}
                    <div className="border-t border-[#2A2520] pt-2">
                      <p className="text-[9px] text-[#3A3530] leading-relaxed">
                        Your role determines which pages and features you can access.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto" onClick={() => setRoleOpen(false)}>
          {/* Group label */}
          <p className="text-[8px] font-bold tracking-[0.3em] uppercase text-[#3A3530] px-3 py-2">Navigation</p>
          {navItems.map(({ icon: Icon, label, href }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold tracking-wider uppercase transition-all ${
                  active
                    ? "bg-[#C9A880] text-[#111111]"
                    : "text-[#7A6050] hover:bg-[#1E1A17] hover:text-white"
                }`}>
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Staff info / logout */}
        <div className="px-4 py-4 border-t border-[#2A2520]" onClick={() => setRoleOpen(false)}>
          <Link href="/admin/profile" className="flex items-center gap-3 mb-3 group">
            <div className="w-8 h-8 bg-[#C9A880] flex items-center justify-center text-[#111111] text-sm font-black shrink-0 group-hover:bg-white transition-colors">
              {staff?.name?.[0] ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate group-hover:text-[#C9A880] transition-colors">{staff?.name}</p>
              <p className="text-[9px] text-[#7A6050] truncate">{staff?.position ?? currentRole?.replace("_", " ")}</p>
            </div>
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase text-[#7A6050] hover:text-[#C9A880] transition-colors py-1">
            <LogOut className="w-3 h-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-[#111111] border-b border-[#2A2520] flex items-center px-4 lg:px-6 gap-4 shrink-0">
          <button className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="w-4 h-4 text-[#7A6050]" />
          </button>

          <div className="flex items-center gap-2">
            <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#7A6050] capitalize">
              {breadcrumb.replace(/-/g, " ") || "Admin"}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-4">
            {/* Current role pill in topbar */}
            {roleMeta && (
              <span className={`hidden sm:inline-flex text-[8px] font-black tracking-widest uppercase px-2.5 py-1 ${roleMeta.color}`}>
                {roleMeta.label}
              </span>
            )}
            <Link href="/" target="_blank"
              className="text-[9px] font-bold tracking-widest uppercase text-[#7A6050] hover:text-[#C9A880] transition-colors">
              Store ↗
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#0E0C0A] p-4 lg:p-6" onClick={() => setRoleOpen(false)}>
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
