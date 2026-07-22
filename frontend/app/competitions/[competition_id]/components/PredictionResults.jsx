"use client";

import { useEffect, useState, useMemo } from "react";
import config from "@/data/config.json";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { formatResult } from "@/lib/wca_result_utils";

export default function PredictionResult({ competition, result }) {
  const [mode, setMode] = useState("result"); // "result" | "prediction"
  const [predictionResults, setPredictionResults] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");

  const configEvents = config.events;

  // user_id -> competitor
  const competitorMap = useMemo(() => {
    const map = new Map();

    for (const sheet of competition.competition_psych_sheets) {
      for (const competitor of sheet.psych_sheet) {
        map.set(competitor.user_id, competitor);
      }
    }

    return map;
  }, [competition]);

  // event_id -> official result
  const resultMap = useMemo(() => {
    const map = new Map();

    for (const podium of result.podium.podium) {
      map.set(podium.event_id, podium);
    }

    return map;
  }, [result]);

  useEffect(() => {
    loadPredictionResults(page);
  }, [page, result.competition_id]);

  async function loadPredictionResults(pageNumber, emailFilter = email) {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: pageNumber,
      });

      if (emailFilter.trim()) {
        params.set("email", emailFilter.trim());
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/prediction_results/all/${result.competition_id}?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load prediction results.");
      }

      const json = await response.json();

      setPredictionResults(json.data);
      setPagination(json.pagination);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function competitorName(id) {
    if (id == null) return "-";
    return competitorMap.get(id)?.name ?? `#${id}`;
  }

  function predictionMap(user) {
    return new Map(
      user.prediction_podium.predictions.map((p) => [p.event_id, p])
    );
  }

  function pointMap(user) {
    return new Map(
      user.point_podium.podium.map((p) => [p.event_id, p.point])
    );
  }

  if (loading) {
    return (
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        Đang tải kết quả...
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-xl border bg-white p-6 text-red-500 shadow-sm">
        {error}
      </section>
    );
  }

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-bold">
        Kết quả {competition.competition_name} Pickems
      </h2>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPage(1);
              loadPredictionResults(1, e.target.value);
            }
          }}
          placeholder="Tìm kiếm bằng email"
          className="w-full flex-1 rounded border px-3 py-2"
        />

        <div className="flex gap-2 sm:flex-none">
          <button
            onClick={() => {
              setPage(1);
              loadPredictionResults(1);
            }}
            className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 sm:flex-none"
          >
            Tìm kiếm
          </button>

          <button
            onClick={() => {
              setEmail("");
              setPage(1);
              loadPredictionResults(1, "");
            }}
            className="flex-1 rounded border px-4 py-2 hover:bg-gray-100 sm:flex-none"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      <div className="mb-4 flex justify-end">
        <div className="flex rounded-lg border overflow-hidden">
          <button
            onClick={() => setMode("result")}
            className={`px-4 py-2 cursor-pointer ${
              mode === "result"
                ? "bg-blue-600 text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            Kết quả
          </button>

          <button
            onClick={() => setMode("prediction")}
            className={`px-4 py-2 cursor-pointer ${
              mode === "prediction"
                ? "bg-blue-600 text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            Dự đoán
          </button>
        </div>
      </div>

      <div className="pb-2">
        Hiển thị <strong>{predictionResults.length}</strong> trong tổng số <strong>{pagination.total}</strong> lượt dự đoán.
      </div>

      <div className="w-0 min-w-full overflow-x-auto">
        <table className="table-auto w-max border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="sticky left-0 z-20 border bg-gray-100 px-3 py-2">
                #
              </th>

              <th className="sticky left-[31px] z-20 border bg-gray-100 px-3 py-2 min-w-[180px] text-left">
                Người tham gia
              </th>

              <th className="border px-3 py-2">
                Tổng điểm
              </th>

              {competition.competition_event_ids.map((eventId) => (
                <th
                  key={eventId}
                  className="border px-3 py-2 whitespace-nowrap min-w-[150px]"
                >
                  {configEvents[eventId]?.name ?? eventId}
                </th>
              ))}

              <th className="border px-3 py-2 whitespace-nowrap">
                NR
              </th>

              <th className="border px-3 py-2 whitespace-nowrap">
                3x3x3 Final
              </th>

              <th className="border px-3 py-2 whitespace-nowrap">
                3x3x3 Winner
              </th>
            </tr>
          </thead>

          <tbody>
            {predictionResults.map((user) => {
              const predictions = predictionMap(user);
              const points = pointMap(user);

              return (
                <tr key={user.email} className="hover:bg-gray-50">
                  <td className="sticky left-0 border bg-white px-3 py-2 text-center">
                    {user.pos}
                  </td>

                  <td className="sticky left-[31px] border bg-white px-3 py-2">
                    <strong>{user.display_name}</strong> <br />
                      <span className="text-sm">{user.email}</span> <br />
                      {user.facebook_url ? (
                        <a
                          href={user.facebook_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Link FB
                        </a>
                      ) : ( "" )}
                  </td>

                  <td className="border px-3 py-2 text-center font-semibold">
                    {user.total_point}
                  </td>

                  {competition.competition_event_ids.map((eventId) => {
                    const prediction = predictions.get(eventId);
                    const official = resultMap.get(eventId);

                    return (
                      <td
                        key={eventId}
                        className="border px-3 py-2 align-center whitespace-pre-line"
                      >
                        {mode === "result" ? (
                          <div className="text-center">
                            {points.get(eventId) ?? 0}
                          </div>
                        ) : prediction ? (
                          <Tippy
                            content={
                              <div>
                                <div>Kết quả chính thức:</div>
                                <div>🥇 {competitorName(official.first_place)}</div>
                                <div>🥈 {competitorName(official.second_place)}</div>
                                <div>🥉 {competitorName(official.third_place)}</div>
                              </div>
                            }
                          >
                            <div className="space-y-1">
                              <div>
                                🥇 {competitorName(prediction.first_place)}
                              </div>

                              <div>
                                🥈 {competitorName(prediction.second_place)}
                              </div>

                              <div>
                                🥉 {competitorName(prediction.third_place)}
                              </div>
                            </div>
                          </Tippy>
                        ) : (
                          "-"
                        )}
                      </td>
                    );
                  })}

                  <td className="border px-3 py-2 align-center whitespace-pre-line">
                    {mode === "result"
                      ? user.point_number_of_nr
                      : (
                        <Tippy
                          content={
                              <div>
                                Kết quả chính thức: {result.additional_result_number_of_nr}
                              </div>
                            }
                        >
                          <div className="text-center">
                            {user.prediction_number_of_nr}
                          </div>
                        </Tippy>
                      )}
                  </td>

                  <td className="border px-3 py-2 text-center">
                    {mode === "result"
                      ? user.point_avg_to_qualify_for_333_final
                      : (
                        <Tippy
                          content={
                              <div>
                                Kết quả chính thức: {formatResult(
                                  result.additional_result_avg_to_qualify_for_333_final,
                                  "333",
                                  "single"
                                )}
                              </div>
                            }
                        >
                          <div className="text-center">
                            {formatResult(
                              user.prediction_avg_to_qualify_for_333_final,
                              "333",
                              "single"
                            )}
                          </div>
                        </Tippy>
                      )}
                  </td>

                  <td className="border px-3 py-2 text-center">
                    {mode === "result"
                      ? user.point_avg_to_win_333_final
                      : (
                        <Tippy
                          content={
                              <div>
                                Kết quả chính thức: {formatResult(
                                  result.additional_result_avg_to_win_333_final,
                                  "333",
                                  "single"
                                )}
                              </div>
                            }
                        >
                          <div className="text-center">
                            {formatResult(
                                  user.prediction_avg_to_win_333_final,
                                  "333",
                                  "single"
                                )}
                          </div>
                        </Tippy>
                      )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="mt-6 flex items-center justify-between">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border px-4 py-2 disabled:opacity-50"
          >
            Trước
          </button>

          <span>
            Trang {pagination.page} / {pagination.total_pages}
          </span>

          <button
            disabled={page >= pagination.total_pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border px-4 py-2 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </section>
  );
}