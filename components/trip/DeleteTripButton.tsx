"use client";

import { useTransition } from "react";
import { deleteTripFromList } from "@/app/trips/actions";

type Props = {
  tripId: string;
  tripTitle: string;
};

export default function DeleteTripButton({ tripId, tripTitle }: Props) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`確定要刪除「${tripTitle}」嗎？\n此操作無法復原。`)) return;

    startTransition(async () => {
      const result = await deleteTripFromList(tripId);
      if (!result.ok) alert(`刪除失敗：${result.error}`);
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
