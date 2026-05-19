"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Cpu,
  GitBranch,
  LogOut,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/gejala", label: "Gejala", icon: BookOpen },
  { href: "/admin/kerusakan", label: "Kerusakan", icon: Wrench },
  { href: "/admin/rules", label: "Rules / CF", icon: GitBranch },
  { href: "/admin/history", label: "Riwayat", icon: Clock },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!token || !user?.is_admin) {
      router.replace("/login");
    }
  }, [token, user, router]);

  if (!token || !user?.is_admin) return null;

  function handleLogout() {
    clearAuth();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="h-16 flex items-center gap-2 px-6 border-b">
          <Cpu className="w-6 h-6 text-primary" />
          <span className="font-bold">Admin Panel</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground mb-3">
            Login sebagai <span className="font-semibold text-foreground">{user.username}</span>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
