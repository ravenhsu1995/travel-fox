"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  detectInAppBrowser,
  IN_APP_BROWSER_LABEL,
  type InAppBrowserKind,
} from "@/lib/inAppBrowser";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/trips";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [inAppKind, setInAppKind] = useState<InAppBrowserKind>(null);
  const [copied, setCopied] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(redirectTo);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
          },
        });
        if (error) throw error;
        setInfo("確認信已寄出，請收信完成註冊。");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "登入失敗");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    const kind = detectInAppBrowser();
    if (kind) {
      setInAppKind(kind);
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
    }
  }

  function openExternalLine() {
    const url = new URL(window.location.href);
    url.searchParams.set("openExternalBrowser", "1");
    window.location.href = url.toString();
  }

  async function copyCurrentUrl() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function useEmailInstead() {
    setInAppKind(null);
    setTimeout(() => emailInputRef.current?.focus(), 50);
  }

  return (
    <main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col px-5 pt-12">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-navy">
          {mode === "signin" ? "登入" : "註冊"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {mode === "signin"
            ? "登入以管理你的行程"
            : "建立帳號開始記錄你的旅程"}
        </p>
      </header>

      <button
        onClick={handleGoogle}
        disabled={busy}
        className="mb-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-line-2 bg-card-pure text-sm font-semibold text-ink shadow-sm transition hover:bg-card disabled:opacity-50"
      >
        <GoogleIcon /> 使用 Google {mode === "signin" ? "登入" : "註冊"}
      </button>

      <div className="mb-6 flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-line-2" />
        <span>或</span>
        <div className="h-px flex-1 bg-line-2" />
      </div>

      <form onSubmit={handleEmail} className="space-y-3">
        <input
          ref={emailInputRef}
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 w-full rounded-lg border border-line-2 bg-card-pure px-3 text-sm text-ink outline-none focus:border-gold"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="密碼（至少 6 字元）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 w-full rounded-lg border border-line-2 bg-card-pure px-3 text-sm text-ink outline-none focus:border-gold"
        />
        <button
          type="submit"
          disabled={busy}
          className="h-12 w-full rounded-lg bg-navy text-sm font-semibold text-white shadow-md transition hover:bg-navy-lt disabled:opacity-50"
        >
          {busy ? "處理中…" : mode === "signin" ? "登入" : "註冊"}
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      {info && (
        <p className="mt-4 rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          {info}
        </p>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        {mode === "signin" ? (
          <>
            還沒有帳號？{" "}
            <button
              onClick={() => setMode("signup")}
              className="font-semibold text-navy hover:underline"
            >
              註冊
            </button>
          </>
        ) : (
          <>
            已經有帳號？{" "}
            <button
              onClick={() => setMode("signin")}
              className="font-semibold text-navy hover:underline"
            >
              登入
            </button>
          </>
        )}
      </p>

      <p className="mt-8 text-center text-xs text-muted">
        <Link href="/" className="hover:underline">
          ← 回首頁看公開範例
        </Link>
      </p>

      {inAppKind && (
        <InAppBrowserNotice
          kind={inAppKind}
          copied={copied}
          onCopy={copyCurrentUrl}
          onOpenLine={openExternalLine}
          onUseEmail={useEmailInstead}
          onClose={() => setInAppKind(null)}
        />
      )}
    </main>
  );
}

function InAppBrowserNotice({
  kind,
  copied,
  onCopy,
  onOpenLine,
  onUseEmail,
  onClose,
}: {
  kind: NonNullable<InAppBrowserKind>;
  copied: boolean;
  onCopy: () => void;
  onOpenLine: () => void;
  onUseEmail: () => void;
  onClose: () => void;
}) {
  const appName = IN_APP_BROWSER_LABEL[kind];
  return (
    <div className="fixed inset-0 z-50">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 animate-[fadeIn_180ms_ease-out]"
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="請改用瀏覽器登入"
        className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[480px] rounded-t-2xl bg-card p-5 pb-7 shadow-lg animate-[slideUp_220ms_ease-out]"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line-2" />
        <h2 className="mb-2 text-base font-bold text-navy">
          請改用瀏覽器登入
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-muted">
          Google 不允許在 {appName} 的內建瀏覽器中登入。請在外部瀏覽器（Safari / Chrome）開啟此頁。
        </p>

        {kind === "line" ? (
          <button
            onClick={onOpenLine}
            className="mb-2 h-11 w-full rounded-lg bg-navy text-sm font-semibold text-white shadow-sm transition hover:bg-navy-lt"
          >
            在外部瀏覽器開啟
          </button>
        ) : (
          <div className="mb-3 rounded-lg border border-line-2 bg-card-pure p-3 text-xs leading-relaxed text-ink">
            點右上角 <span className="font-semibold">⋯</span> →{" "}
            <span className="font-semibold">在瀏覽器開啟</span>（或「Open in Safari」/「Open in Chrome」）
          </div>
        )}

        <button
          onClick={onCopy}
          className="mb-2 h-11 w-full rounded-lg border border-line-2 bg-card-pure text-sm font-semibold text-ink transition hover:bg-card"
        >
          {copied ? "✓ 已複製連結" : "複製連結"}
        </button>

        <button
          onClick={onUseEmail}
          className="mb-1 h-11 w-full rounded-lg border border-line-2 bg-card-pure text-sm font-semibold text-ink transition hover:bg-card"
        >
          改用 Email 登入
        </button>

        <button
          onClick={onClose}
          className="mt-2 h-9 w-full text-xs text-muted hover:underline"
        >
          取消
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.72v2.26h2.9c1.7-1.56 2.69-3.86 2.69-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.36 0-4.36-1.6-5.07-3.74H.96v2.34A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.93 10.68A5.4 5.4 0 0 1 3.64 9c0-.58.1-1.15.29-1.68V4.98H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.02l2.97-2.34z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58A9 9 0 0 0 .96 4.98l2.97 2.34C4.64 5.18 6.64 3.58 9 3.58z"
      />
    </svg>
  );
}
