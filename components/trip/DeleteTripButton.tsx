"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  tripId: string;
  tripTitle: string;
};

export default function DeleteTripButton({ tripId, tripTitle }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`確定要刪除「${tripTitle}」嗎？\n此操作無法復原。`)) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/trips/${tripId}`, { method: "DELETE" });
        const data = (await res.json().catch(() => null)) as
          | { ok: true }
          | { ok: false; error?: string }
          | null;
        if (!res.ok || !data?.ok) {
          const err = data && data.ok === false ? data.error : undefined;
          alert(`刪除失敗：${err ?? "請稍後再試"}`);
          return;
        }
        router.refresh();
      } catch (err) {
        alert(`刪除失敗：${err instanceof Error ? err.message : "請稍後再試"}`);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-danger hover:bg-danger/10 disabled:opacity-40"
    >
      {pending ? "刪除中…" : "🗑️"}
    </button>
  );
}
