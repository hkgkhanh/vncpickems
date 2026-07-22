"use client";

import { useCallback, useEffect, useState } from "react";
import PredictionCard from "./PredictionCard";
import { getApiUrl } from "@/lib/url_utils";

export default function PredictionGrid() {
  const [games, setGames] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadGames = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        getApiUrl(`${process.env.NEXT_PUBLIC_API_URL}/prediction_games/admin?page=${page}`),
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load prediction games.");
      }

      const json = await response.json();

      setGames(json.data);
      setPagination(json.pagination);
    } catch (err) {
      console.error(err);
      setError("Unable to load prediction games.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  if (loading) {
    return (
      <div className="py-8 text-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No prediction games.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {games.map((game) => (
          <PredictionCard
            key={game.competition_id}
            game={game}
          />
        ))}
      </div>

      {pagination && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="rounded border px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span>
            Page {pagination.page} of {pagination.total_pages}
          </span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === pagination.total_pages}
            className="rounded border px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}