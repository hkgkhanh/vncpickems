"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { useGoogleAuth } from "@/contexts/GoogleAuthContext";

import GoogleLoginCard from "./components/GoogleLoginCard";
import PredictionForm from "@/components/PredictionForm";
import ReadOnlyField from "../../../components/ReadOnlyField";
import { formatDateTime, formatOriginalDate, parseBackendDate } from "@/lib/datetime_utils";
import ParticipantsTab from "./components/ParticipantsTab";
import PredictionResult from "./components/PredictionResults";

export default function CompetitionPage() {
  const { competition_id } = useParams();
  const { loggedIn, user, credential } = useGoogleAuth();
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [predictionResult, setPredictionResult] = useState(null);
  const [checkingResult, setCheckingResult] = useState(false);

  useEffect(() => {
    loadCompetition();
  }, [competition_id]);

  async function loadCompetition() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/prediction_games/client/${competition_id}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load competition.");
      }

      const json = await response.json();

      setCompetition(json);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadPredictionResult() {
    setCheckingResult(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/competition_results/${competition_id}`,
        {
          cache: "no-store",
        }
      );

      if (response.status === 404) {
        setPredictionResult(null);
        return;
      }

      if (!response.ok) throw new Error("Failed to load prediction result.");

      const json = await response.json();
      setPredictionResult(json);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setPredictionResult(null);
    } finally {
      setCheckingResult(false);
    }
  }

  useEffect(() => {
    if (!competition) return;

    const predictionClose = parseBackendDate(competition.prediction_close);

    if (new Date() <= predictionClose) return;

    loadPredictionResult();
  }, [competition]);

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        Loading...
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl p-8 text-red-600">
        {error}
      </main>
    );
  }

  const now = new Date();

  const predictionOpen = parseBackendDate(competition.prediction_open);
  const predictionClose = parseBackendDate(competition.prediction_close);

  const predictionNotStarted = now < predictionOpen;
  const predictionEnded = now > predictionClose;

  return (
    <main className="mx-auto max-w-4xl space-y-8 py-8">

      {/* Competition header */}

      <section>
        <h1 className="text-4xl font-bold px-2">
          {competition.competition_name+ " Pickems"}
        </h1>

        <p className="mt-2 px-2 text-gray-500">
          ID:{" "}
          <a
            href={`https://www.worldcubeassociation.org/competitions/${competition.competition_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {competition.competition_id}
          </a>
        </p>
      </section>

      {/* Competition information */}

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Luật chơi</h2>
        <ul className="list-disc px-6 mb-6">
          <li>Với mỗi nội dung tại giải đấu {competition.competition_name}, người chơi tham gia dự đoán 3 thí sinh giành được podium Việt Nam.</li>
          <li>Với mỗi thí sinh đoán đúng có mặt trong podium, người chơi được cộng <strong>10 điểm</strong>.</li>
          <li>Với mỗi thí sinh đoán đúng thứ hàng trong podium, người chơi được cộng thêm <strong>15 điểm</strong>.</li>
          <li>Các câu dự đoán phụ bao gồm:
            <ul className="list-disc px-6">
              <li>Số lượng NR Việt Nam được thiết lập tại giải đấu.</li>
              <li>Thành tích trung bình cần đạt để vào vòng Chung kết nội dung 3x3x3 (chỉ tính thành tích của thí sinh Việt Nam).</li>
              <li>Thành tích trung bình vô địch nội dung 3x3x3 (chỉ tính thành tích của thí sinh Việt Nam).</li>
            </ul>
          </li>
          <li>Thứ hạng cho các câu dự đoán phụ được xếp hạng dựa trên dự đoán gần đúng với kết quả nhất. Điểm số cộng thêm cho top 1-5 là <strong>40/30/20/10/5</strong>. Từ top 6 trở đi không được cộng điểm. Nếu có kết quả dự đoán trùng nhau, thứ hạng được tính là ngang nhau và là thứ hạng cao nhất khi hòa nhau.</li>
        </ul>
        <p className="mb-6">Mọi thắc mắc vui lòng liên hệ page Facebook {" "}
          <a
            href={`https://www.facebook.com/profile.php?id=61562755012971`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Huster Thích FMC
          </a>.</p>
        <hr className="my-3 text-justify"></hr>
        <ReadOnlyField
          label="Thời gian diễn ra"
          value={`${formatOriginalDate(competition.competition_start_date)} - ${formatOriginalDate(competition.competition_end_date)}`}
        />

        <ReadOnlyField
          label="Thời gian dự đoán"
          value={`${formatDateTime(competition.prediction_open)} - ${formatDateTime(competition.prediction_close)}`}
        />
      </section>

      {/* Prediction */}

      {predictionNotStarted ? (
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-6 text-yellow-800">
          <h2 className="mb-2 text-lg font-semibold">
            Chưa đến thời gian dự đoán
          </h2>

          <p>
            Cổng dự đoán sẽ mở vào thời gian{" "}
            <strong>{formatDateTime(competition.prediction_open)}</strong>.
            Xin vui lòng quay lại sau.
          </p>
        </div>
      ) : predictionEnded ? (
        <>
          {checkingResult ? (
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              Đang tải kết quả...
            </div>
          ) : predictionResult ? (
            <PredictionResult competition={competition} result={predictionResult} />
          ) : (
            <>
              <div className="rounded-xl border border-gray-300 bg-gray-50 p-6 text-gray-700">
                <h2 className="mb-2 text-lg font-semibold">
                  Đã kết thúc thời gian dự đoán
                </h2>

                <p>
                  Cổng dự đoán đã đóng vào thời gian{" "}
                  <strong>{formatDateTime(competition.prediction_close)}</strong>.
                  Bạn có thể xem kết quả ngay khi chúng được xuất bản.
                </p>
              </div>
              <ParticipantsTab
                competitionId={competition_id}
                eventIds={competition.competition_event_ids}
                psychSheets={competition.competition_psych_sheets}
              />
            </>
          )}
        </>
      ) : !loggedIn ? (
        <GoogleLoginCard />
      ) : (
        <PredictionForm competition={competition} />
      )}

    </main>
  );
}