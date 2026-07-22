import Link from "next/link";

export default function PredictionCard({ game }) {
  return (
    <Link
      href={`/admin/prediction-games/${game.competition_id}`}
      className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md"
    >
      <h2 className="text-lg font-semibold">
        {game.competition_name}
      </h2>

      <p className="mt-3 text-sm text-gray-500">
        Chi tiết →
      </p>
    </Link>
  );
}