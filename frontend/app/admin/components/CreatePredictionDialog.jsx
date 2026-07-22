"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/url_utils";

export default function CreatePredictionDialog() {
  const dialogRef = useRef();
  const router = useRouter();

  const [compId, setCompId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createGame() {
    if (!compId.trim()) {
      setError("Competition ID từ website WCA là bắt buộc");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        getApiUrl(`${process.env.NEXT_PUBLIC_API_URL}/prediction_games/admin`),
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            competition_id: compId.trim(),
          }),
        }
      );

      if (!response.ok) {
        let message = "Lỗi không xác định";

        try {
          const body = await response.json();
          message = body.detail ?? message;
        } catch {}

        throw new Error(message);
      }

      const game = await response.json();

      dialogRef.current.close();
      setCompId("");

      router.push(`/admin/prediction-games/${game.competition_id}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err.message ?? "Lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => dialogRef.current.showModal()}
        className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        + Tạo mới
      </button>

      <dialog
        ref={dialogRef}
        className="fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 shadow-xl backdrop:bg-black/40"
      >
        <h2 className="mb-4 text-xl font-semibold">
          Tạo Prediction Game mới
        </h2>

        <input
          value={compId}
          onChange={(e) => setCompId(e.target.value)}
          placeholder="Nhập ID của competition trên WCA"
          readOnly={loading}
          className={`mb-2 w-full rounded-lg border p-3 disabled:opacity-50 ${loading ? "cursor-not-allowed" : ""}`}
        />

        {error && (
          <p className="mb-4 text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={() => dialogRef.current.close()}
            disabled={loading}
            className={`rounded border px-4 py-2 disabled:opacity-50 ${loading ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            Hủy
          </button>

          <button
            onClick={createGame}
            disabled={loading}
            className={`rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50 ${loading ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            {loading ? "Đang tạo..." : "Tạo"}
          </button>
        </div>
      </dialog>
    </>
  );
}