"use client";

import { formatResult } from "@/lib/wca_result_utils";
import config from "@/data/config.json";

export default function PredictionTable({
  eventId,
  psychSheet,
  prediction,
  setPrediction,
}) {
  prediction ??= {
    first_place: 0,
    second_place: 0,
    third_place: 0,
  };

  const configEvents = config.events;

  function addPrediction(userId) {
    if (prediction.first_place === 0) {
      setPrediction({
        ...prediction,
        first_place: userId,
      });
      return;
    }

    if (prediction.second_place === 0) {
      setPrediction({
        ...prediction,
        second_place: userId,
      });
      return;
    }

    if (prediction.third_place === 0) {
      setPrediction({
        ...prediction,
        third_place: userId,
      });
    }
  }

  function removePrediction(userId) {
    if (prediction.first_place === userId) {
      setPrediction({
        ...prediction,
        first_place: 0,
      });
      return;
    }

    if (prediction.second_place === userId) {
      setPrediction({
        ...prediction,
        second_place: 0,
      });
      return;
    }

    if (prediction.third_place === userId) {
      setPrediction({
        ...prediction,
        third_place: 0,
      });
    }
  }

  const podiumFull =
    prediction.first_place &&
    prediction.second_place &&
    prediction.third_place;

  return (
    <div className="border mt-8 bg-gray-50">

      <div className="border-b bg-gray-50 px-4 py-3 text-lg font-semibold">
        {configEvents[eventId]?.name ?? eventId}
      </div>

      <div className="max-h-96 overflow-y-auto">

        <table className="min-w-full">
          <thead className="sticky top-0 bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Thí sinh</th>
              <th className="px-3 py-2 text-right">Đơn</th>
              <th className="px-3 py-2 text-right">Trung bình</th>
            </tr>
          </thead>
          <tbody>
            {psychSheet.map((competitor) => {
              const selected =
                prediction.first_place === competitor.user_id ||
                prediction.second_place === competitor.user_id ||
                prediction.third_place === competitor.user_id;

              const podiumBadge =
                prediction.first_place === competitor.user_id ? {
                      text: "1st",
                      className: "bg-yellow-300 text-black border-black",
                    }
                  : prediction.second_place === competitor.user_id ? {
                      text: "2nd",
                      className: "bg-gray-300 text-black border-black",
                    }
                  : prediction.third_place === competitor.user_id ? {
                      text: "3rd",
                      className: "bg-amber-600 text-white border-black",
                    }
                  : null;

              return (
                <tr
                  key={competitor.user_id}
                  onClick={() => {
                    if (selected) {
                      removePrediction(competitor.user_id);
                    } else if (!podiumFull) {
                      addPrediction(competitor.user_id);
                    }
                  }}
                  className={`
                    border-t transition-colors
                    ${selected
                      ? "bg-yellow-100 hover:bg-yellow-200 cursor-pointer"
                      : podiumFull
                      ? "cursor-default"
                      : "hover:bg-gray-100 cursor-pointer"}
                  `}
                >
                  <td className="px-3 py-2">
                    {competitor.pos}
                  </td>

                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span>{competitor.name}</span>

                      {podiumBadge && (
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${podiumBadge.className}`}>
                          {podiumBadge.text}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-2 text-right">
                    {formatResult(
                      competitor.single_best,
                      eventId,
                      "single"
                    )}
                  </td>

                  <td className="px-3 py-2 text-right">
                    {formatResult(
                      competitor.average_best,
                      eventId,
                      "average"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}