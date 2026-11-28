"use client";

import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, type ReactNode } from "react";
import { useUiStore } from "@/stores/use-ui-store";
import type { NavMenuItem } from "@/types";
import { cn } from "@/utils/cn";

interface RoleShellProps {
  roleLabel: string;
  navItems: NavMenuItem[];
  children: ReactNode;
}

export function RoleShell({ roleLabel, navItems, children }: RoleShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isMobileSidebarOpen, setMobileSidebarOpen, toggleMobileSidebar } =
    useUiStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setMobileSidebarOpen]);

  const displayName = session?.user?.name ?? `Akun ${roleLabel}`;
  const displayIdentity = session?.user?.nipNim ?? "Sesi SSO SACIBIRU";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const handleGlobalLogout = async () => {
    const response = await fetch("/api/auth/sso-logout", { method: "POST" }).catch(
      () => null,
    );
    const payload = (await response?.json().catch(() => null)) as
      | { data?: { logoutUrl?: string } }
      | null;
    await signOut({
      callbackUrl: payload?.data?.logoutUrl ?? "/",
    });
  };

  return (
    <div className="min-h-dvh bg-brand-canvas text-brand-ink">
      <div className="mx-auto flex max-w-[1440px] gap-6 p-4 md:p-6">
        {isMobileSidebarOpen ? (
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        ) : null}

        <aside
          aria-label={`Navigasi ${roleLabel}`}
          className={cn(
            "fixed inset-y-4 left-4 z-50 flex w-[268px] shrink-0 flex-col justify-between rounded-2xl bg-white p-5 shadow-sm transition-transform lg:static lg:translate-x-0",
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-[120%]",
          )}
        >
          <div>
            <div className="mb-8 flex items-center justify-between px-2">
              <div>
                <p className="font-heading text-lg font-bold tracking-tight text-brand-primary">
                  SI RPL UPI
                </p>
                <p className="text-[13px] font-medium tracking-wide text-brand-muted">
                  PORTAL MAGANG
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="cursor-pointer rounded-lg p-1.5 text-brand-muted hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary lg:hidden"
                aria-label="Tutup menu navigasi"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-3 px-3 text-[12px] font-semibold tracking-wider text-brand-muted">
              MENU UTAMA
            </p>
            <nav aria-label="Menu utama" className="space-y-1.5">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/mahasiswa" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary",
                      isActive
                        ? "bg-brand-primary text-white"
                        : "text-brand-ink hover:bg-brand-canvas",
                    )}
                  >
                    <span>{item.label}</span>
                    {typeof item.badgeCount === "number" ? (
                      <span className="rounded-full bg-brand-accent px-2 py-0.5 text-xs font-semibold text-brand-ink">
                        {item.badgeCount}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-3 pt-6">
            <div className="rounded-xl bg-brand-canvas p-3.5">
              <p className="text-sm font-semibold text-brand-ink">
                Terintegrasi SSO
              </p>
              <p className="mt-1 text-[13px] leading-snug text-brand-muted">
                Data akademik tersinkron otomatis dengan Modul Utama.
              </p>
              <div className="mt-2.5 flex items-center gap-1.5 text-[13px] font-medium text-[#065F46]">
                <span className="h-2 w-2 rounded-full bg-[#15803D]" aria-hidden="true" />
                <span>Tersinkron</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGlobalLogout}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-brand-muted transition-colors hover:bg-red-50 hover:text-[#B91C1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white px-5 py-3.5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleMobileSidebar}
                className="cursor-pointer rounded-lg p-2 text-brand-ink hover:bg-brand-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary lg:hidden"
                aria-label="Buka menu navigasi"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="rounded-full bg-brand-canvas px-3.5 py-1 text-[13px] font-semibold text-brand-primary">
                Role: {roleLabel}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white"
                aria-hidden="true"
              >
                {initials || "SI"}
              </div>
              <div className="text-right sm:text-left">
                <p className="text-sm font-semibold text-brand-ink">
                  {displayName}
                </p>
                <p className="text-[13px] text-brand-muted">{displayIdentity}</p>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
