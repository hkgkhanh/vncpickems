"use client";

import { useState, useEffect } from "react";
import PredictionTable from "@/components/PredictionTable";
import ResultInput from "@/components//ResultInput";
import { getApiUrl } from "@/lib/url_utils";

export default function PredictionForm({ competition }) {
  const [saving, setSaving] = useState(false);
  const [podiumPrediction, setPodiumPrediction] = useState({});
  const [predictionNumberOfNr, setPredictionNumberOfNr] = useState(0);
  const [predictionAvgToQualifyFor333Final, setPredictionAvgToQualifyFor333Final] = useState(null);
  const [predictionAvgToWin333Final, setPredictionAvgToWin333Final] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadPrediction();
  }, [competition.competition_id]);

  async function loadPrediction() {
    try {
      const response = await fetch(getApiUrl(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/competition_results/${competition.competition_id}`),
        {
          cache: "no-store",
        }
      );

      if (response.status === 404) return;

      if (!response.ok) throw new Error("Failed to load competition result.");

      const participant = await response.json();

      setPredictionNumberOfNr(participant.additional_result_number_of_nr);
      setPredictionAvgToQualifyFor333Final(participant.additional_result_avg_to_qualify_for_333_final);
      setPredictionAvgToWin333Final(participant.additional_result_avg_to_win_333_final);

      const predictionMap = {};

      participant.podium.podium.forEach((prediction) => {
        predictionMap[prediction.event_id] = {
          first_place: prediction.first_place,
          second_place: prediction.second_place,
          third_place: prediction.third_place,
        };
      });

      setPodiumPrediction(predictionMap);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setMessage(null);
    }
  }

  async function savePrediction() {
    if (!confirm("Bạn có chắc chắn muốn lưu kết quả? Điều này đồng nghĩa với việc người tham gia sẽ có thể thấy kết quả cũng như dự đoán của những người khác.")) return;

    setSaving(true);

    try {
      const payload = {
        competition_id: competition.competition_id,
        podium: {
          "podium": Object.entries(podiumPrediction).map(
            ([event_id, places]) => ({
              event_id,
              ...places,
            })
          )
        },
        additional_result_number_of_nr: predictionNumberOfNr,
        additional_result_avg_to_qualify_for_333_final: predictionAvgToQualifyFor333Final,
        additional_result_avg_to_win_333_final: predictionAvgToWin333Final
      };

      const response = await fetch(
        getApiUrl(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/competition_results/admin`),
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to save competition result.");

      const json = await response.json();

      console.log(json);
      setError(null);
      setMessage("Lưu thành công.");
    } catch (err) {
      console.error(err);
      setError(err.message);
      setMessage(null);
    } finally {
      setSaving(false);
    }
  }

  async function deletePrediction() {
    if (!confirm("Bạn có chắc chắn muốn xóa kết quả? Người tham gia sẽ không thấy kết quả dự đoán nữa và hành động này sẽ không thể được hoàn tác.")) return;

    setSaving(true);

    try {
      const response = await fetch(
        getApiUrl(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/competition_results/admin${competition.competition_id}`),
        {
          method: "DELETE",
          credentials: "include"
        }
      );

      if (!response.ok) throw new Error("Failed to delete competition result.");

      setPodiumPrediction({});
      setPredictionNumberOfNr(0);
      setPredictionAvgToQualifyFor333Final(null);
      setPredictionAvgToWin333Final(null);

      setError(null);
      setMessage("Xóa thành công.");
    } catch (err) {
      console.error(err);
      setError(err.message);
      setMessage(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      
      <div className="space-y-6">
        <label className="text-lg font-bold">
          Kết quả podium
        </label>
        <div className="my-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-900">
          Nhấp vào tên thí sinh để chọn kết quả. Các lựa chọn sẽ tự động được gán theo thứ tự <strong>Hạng 1, Hạng 2, Hạng 3</strong>. Nhấp lại vào một thí sinh đã chọn để xóa khỏi kết quả.
        </div>
        <div>
          {competition.competition_psych_sheets.map((event) => (
            <PredictionTable
              key={event.event_id}
              eventId={event.event_id}
              psychSheet={event.psych_sheet}
              prediction={podiumPrediction[event.event_id]}
              setPrediction={(value) =>
                setPodiumPrediction((prev) => ({
                  ...prev,
                  [event.event_id]: value,
                }))
              }
            />
          ))}
        </div>

        <label className="text-lg font-bold">
          Kết quả phụ
        </label>
        <div className="my-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-900">
          Nhập kết quả dưới dạng các chữ số liên tiếp (ví dụ: <strong>1234 = 12.34</strong>, <strong>6100 = 1:01.00</strong>). Hệ thống sẽ tự động định dạng theo chuẩn WCA.
        </div>

        <div className="flex items-center gap-4 my-2">
          <label className="w-29 shrink-0 font-medium">
            Số lượng NR
          </label>
          <input
            value={predictionNumberOfNr}
            inputMode="numeric"
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              setPredictionNumberOfNr(digits === "" ? 0 : Number(digits));
            }}
            className="flex-1 rounded border bg-gray-100 px-3 py-2"
          />
        </div>

        <div className="flex items-center gap-4 my-2">
          <label className="w-29 shrink-0 font-medium">
            Thành tích vào Chung kết 3x3
          </label>
          <ResultInput
            value={predictionAvgToQualifyFor333Final}
            onChange={setPredictionAvgToQualifyFor333Final}
          />
        </div>

        <div className="flex items-center gap-4 my-2">
          <label className="w-29 shrink-0 font-medium">
            Thành tích vô địch 3x3
          </label>
          <ResultInput
            value={predictionAvgToWin333Final}
            onChange={setPredictionAvgToWin333Final}
          />
        </div>

        <hr className="my-8"></hr>

        <div className="flex justify-between">
          <button
            onClick={deletePrediction}
            disabled={saving}
            className={`rounded-lg bg-red-600 px-4 py-2 mr-2 text-white transition hover:bg-red-700 ${saving ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            {saving ? "Đang xóa..." : "Xóa kết quả"}
          </button>
          <button
            onClick={savePrediction}
            disabled={saving}
            className={`rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50 ${saving ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            {saving ? "Đang lưu.." : "Lưu thay đổi"}
          </button>
        </div>
        {error && 
          <p className="text-red-500 text-right">{error}</p>
        }
        {message && 
          <p className="text-blue-500 text-right">{message}</p>
        }
      </div>

    </section>
  );
}