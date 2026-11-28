"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense, useEffect, useRef } from "react";
import { safeReturnPath } from "@/utils/safe-return";

function SsoAutoRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasTriggeredRef = useRef(false);

  const errorParam = searchParams.get("error");
  const callbackUrl = safeReturnPath(searchParams.get("callbackUrl"), "/");

  useEffect(() => {
    if (hasTriggeredRef.current) {
      return;
    }
    hasTriggeredRef.current = true;

    if (errorParam) {
      router.replace(`/akses-ditolak?error=${encodeURIComponent(errorParam)}`);
      return;
    }

    void signIn("sacibiru", { callbackUrl });
  }, [callbackUrl, errorParam, router]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-brand-canvas px-4">
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-sm"
      >
        <div
          className="h-7 w-7 animate-spin rounded-full border-[3px] border-brand-secondary border-t-brand-primary"
          aria-hidden="true"
        />
        <p className="font-heading text-sm font-semibold text-brand-ink">
          Mengalihkan ke SSO SACIBIRU...
        </p>
      </div>
    </main>
  );
}

export default function SsoLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center bg-brand-canvas px-4">
          <p className="font-heading text-sm font-semibold text-brand-ink">
            Mengalihkan ke SSO SACIBIRU...
          </p>
        </main>
      }
    >
      <SsoAutoRedirectContent />
    </Suspense>
  );
}
