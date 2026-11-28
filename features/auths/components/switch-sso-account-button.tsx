"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export function SwitchSsoAccountButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSwitchAccount = async () => {
    setIsLoading(true);
    const response = await fetch("/api/auth/sso-logout?relogin=1", {
      method: "POST",
    }).catch(() => null);

    const payload = (await response?.json().catch(() => null)) as
      | { data?: { logoutUrl?: string } }
      | null;

    await signOut({
      callbackUrl: payload?.data?.logoutUrl ?? "/sso/login",
    });
  };

  return (
    <button
      type="button"
      onClick={handleSwitchAccount}
      disabled={isLoading}
      className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? "Mengalihkan ke SSO..." : "Ganti Akun di SSO SACIBIRU"}
    </button>
  );
}
