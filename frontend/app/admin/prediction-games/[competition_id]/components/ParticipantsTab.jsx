"use client";

import { useEffect, useState } from "react";

import { formatResult } from "@/lib/wca_result_utils";
import config from "@/data/config.json";
import { getApiUrl } from "@/lib/url_utils";

export default function ParticipantsTab({ competitionId, eventIds, psychSheets }) {
  const [participants, setParticipants] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
    const configEvents = config.events;

  useEffect(() => {
    loadParticipants(page);
  }, [page, competitionId]);

  async function loadParticipants(pageNumber) {
    setLoading(true);

    try {
      const response = await fetch(
        getApiUrl(`${process.env.NEXT_PUBLIC_API_URL}/participants/admin/all/${competitionId}?page=${pageNumber}`),
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) throw new Error("Failed to load participants.");

      const json = await response.json();

      setParticipants(json.data);
      setPagination(json.pagination);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function getPrediction(predictions, eventId) {
    return predictions.find((p) => p.event_id === eventId);
  }

  function userName(userId, eventId) {
    if (!userId) return "-";
    const sheet = psychSheets.find((e) => e.event_id === eventId)?.psych_sheet ?? [];
    return (sheet.find((c) => c.user_id === userId)?.name ?? userId);
  }

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-8 shadow-sm">
        Đang tải...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-white p-8 text-red-500 shadow-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="min-w-0 rounded-xl border bg-white p-6 shadow-sm">
      <div className="pb-2">
        Hiển thị <strong>{participants.length}</strong> trong tổng số <strong>{pagination.total}</strong> lượt dự đoán.
      </div>

      <div className="w-0 min-w-full overflow-x-auto">
        <table className="table-auto w-max border-separate border-spacing-0">
          <thead className="sticky top-0 bg-gray-100">
            <tr>
              <th className="sticky left-0 z-1 border-r border-b px-3 py-2 text-left bg-gray-100">
                Người tham gia
              </th>

              {eventIds.map((eventId) => (
                <th
                  key={eventId}
                  className="border-r border-b px-3 py-2"
                >
                  {configEvents[eventId]?.name ?? eventId}
                </th>
              ))}

              <th className="border-r border-b px-3 py-2">
                NR
              </th>
              <th className="border-r border-b px-3 py-2">
                3x3 Final
              </th>
              <th className="border-r border-b px-3 py-2">
                3x3 Champion
              </th>
            </tr>
          </thead>
          <tbody>

            {participants.map((participant) => (

              <tr key={participant.email} className="border-t hover:bg-gray-50">
                <td className="sticky left-0 z-1 border-r border-b px-3 py-2 bg-white hover:bg-gray-50">
                  {participant.display_name} <br />
                  <span className="text-sm">{participant.email}</span> <br />
                  {participant.facebook_url ? (
                    <a
                      href={participant.facebook_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Link FB
                    </a>
                  ) : ( "" )}
                </td>

                {eventIds.map((eventId) => {
                  const prediction = getPrediction(participant.podium_prediction.predictions, eventId);

                  return (
                    <td key={eventId} className="border-r border-b px-3 py-2 text-sm whitespace-nowrap">
                      {!prediction ? (
                        "-"
                      ) : (
                        <>
                          1. {userName(prediction.first_place, eventId)}<br />
                          2. {userName(prediction.second_place, eventId)}<br />
                          3. {userName(prediction.third_place, eventId)}
                        </>
                      )}
                    </td>
                  );
                })}

                <td className="border-r border-b px-3 py-2 text-center">
                  {participant.additional_prediction_number_of_nr}
                </td>
                <td className="border-r border-b px-3 py-2 text-right">
                  {formatResult(participant.additional_prediction_avg_to_qualify_for_333_final, "333", true)}
                </td>
                <td className="border-r border-b px-3 py-2 text-right">
                  {formatResult(participant.additional_prediction_avg_to_win_333_final, "333", true)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (

        <div className="mt-6 flex items-center justify-between">

          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="rounded border px-4 py-2 disabled:opacity-50"
          >
            Trước
          </button>

          <span>
            Trang {pagination.page} / {pagination.total_pages}
          </span>

          <button
            disabled={page >= pagination.total_pages}
            onClick={() => setPage(page + 1)}
            className="rounded border px-4 py-2 disabled:opacity-50"
          >
            Sau
          </button>

        </div>

      )}

    </div>
  );
}