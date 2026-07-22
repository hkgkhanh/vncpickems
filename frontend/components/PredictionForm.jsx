"use client";

import { useState, useEffect } from "react";
import TextInput from "./TextInput";
import { useGoogleAuth } from "@/contexts/GoogleAuthContext";
import ReadOnlyField from "./ReadOnlyField";
import PredictionTable from "./PredictionTable";
import ResultInput from "./ResultInput";
import { parseBackendDate } from "@/lib/datetime_utils";

export default function PredictionForm({ competition }) {
  const { user, credential, logout } = useGoogleAuth();
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState(user.email);
  const [displayName, setDisplayName] = useState(user.name);
  const [facebookUrl, setFacebookUrl] = useState("");
  const [podiumPrediction, setPodiumPrediction] = useState({});
  const [predictionNumberOfNr, setPredictionNumberOfNr] = useState(0);
  const [predictionAvgToQualifyFor333Final, setPredictionAvgToQualifyFor333Final] = useState(null);
  const [predictionAvgToWin333Final, setPredictionAvgToWin333Final] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (credential) loadPrediction();
  }, [credential, competition.competition_id]);

  async function loadPrediction() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/participants/client/${competition.competition_id}`,
        {
          headers: {
            Authorization: `Bearer ${credential}`,
          },
          cache: "no-store",
        }
      );

      if (response.status === 404) return; // Participant has never submitted before

      if (!response.ok) throw new Error("Failed to load prediction.");

      const participant = await response.json();

      setDisplayName(participant.display_name);
      setFacebookUrl(participant.facebook_url ?? "");

      setPredictionNumberOfNr(participant.additional_prediction_number_of_nr);
      setPredictionAvgToQualifyFor333Final(participant.additional_prediction_avg_to_qualify_for_333_final);
      setPredictionAvgToWin333Final(participant.additional_prediction_avg_to_win_333_final);

      const predictionMap = {};

      participant.podium_prediction.predictions.forEach((prediction) => {
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
    setSaving(true);

    try {
      if (displayName == "") throw new Error("Display name must not be empty.");

      const payload = {
        display_name: displayName,
        facebook_url: facebookUrl,
        participates_in: competition.competition_id,
        podium_prediction: {
          "predictions": Object.entries(podiumPrediction).map(
            ([event_id, places]) => ({
              event_id,
              ...places,
            })
          )
        },
        additional_prediction_number_of_nr: predictionNumberOfNr,
        additional_prediction_avg_to_qualify_for_333_final: predictionAvgToQualifyFor333Final,
        additional_prediction_avg_to_win_333_final: predictionAvgToWin333Final
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/participants/client`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${credential}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to save prediction.");

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
    if (!confirm("Bạn có chắc chắn muốn xóa dự đoán của bạn? Hành động này sẽ không thể được hoàn tác.")) return;

    setSaving(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/participants/client`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${credential}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ participates_in: competition.competition_id })
        }
      );

      if (!response.ok) throw new Error("Failed to delete prediction.");

      setFacebookUrl("");
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

  const now = new Date();
  const registrationOpen = parseBackendDate(competition.competition_registration_open);
  const registrationClose = parseBackendDate(competition.competition_registration_close);
  const registrationOpenNow = now >= registrationOpen && now <= registrationClose;

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">

      {registrationOpenNow && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-amber-900">
            <strong>⚠️ Vẫn đang trong thời gian đăng ký cho giải đấu.</strong>{" "}
            Điều này có thể dẫn đến mất dữ liệu dự đoán nếu đơn đăng ký giải đấu có sự thay đổi. Hãy thường xuyên kiểm tra dự đoán của bạn.
          </p>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex flex-col items-center gap-4">
          <ReadOnlyField label="Email" value={email} />
        </div>

        <button onClick={logout} className="rounded-md bg-red-600 px-4 py-2 text-white transition cursor-pointer hover:bg-red-700">
          Đăng xuất
        </button>

      </div>
      
      <TextInput label="Display name" value={displayName} onChange={setDisplayName} placeholder="Nguyen Van A" required={true} />
      <TextInput label="Facebook" value={facebookUrl} onChange={setFacebookUrl} placeholder={"https://www.facebook.com/profile.php?id=..."} required={false} />

      <div className="space-y-6">
        <label className="text-lg font-bold">
          Dự đoán podium
        </label>
        <div className="my-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-900">
          Nhấp vào tên thí sinh để chọn dự đoán. Các lựa chọn sẽ tự động được gán theo thứ tự <strong>Hạng 1, Hạng 2, Hạng 3</strong>. Nhấp lại vào một thí sinh đã chọn để xóa khỏi dự đoán.
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
          Dự đoán phụ
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
            {saving ? "Đang xóa..." : "Xóa dự đoán"}
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