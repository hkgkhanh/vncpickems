"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

import Tab from "./components/Tab";
import ReadOnlyField from "./components/ReadOnlyField";
import EditableDateTime from "./components/EditableDateTime";
import ParticipantsTab from "./components/ParticipantsTab";
import CompetitionResultForm from "./components/CompetitionResultForm";
import { formatDateTime, parseBackendDate, formatOriginalDate } from "@/lib/datetime_utils";
import { formatResult } from "@/lib/wca_result_utils";
import config from "@/data/config.json";
import { getApiUrl } from "@/lib/url_utils";

const TABS = {
  GENERAL: "general",
  PARTICIPANTS: "participants",
  RESULTS: "results",
};

export default function PredictionGamePage() {
  const { competition_id } = useParams();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(TABS.GENERAL);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const configEvents = config.events;
  const configCountryIso2 = config.country_iso2;

  useEffect(() => {
    loadGame();
  }, [competition_id]);

  async function loadGame() {
    setLoading(true);

    try {
      const response = await fetch(
        getApiUrl(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/prediction_games/admin/${competition_id}`),
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load prediction game.");
      }

      const json = await response.json();
      setGame(json);
      if (json.competition_event_ids.length > 0) setSelectedEvent(json.competition_event_ids[0]);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveChanges() {
    if (!game) return;

    setSaving(true);

    try {
      const response = await fetch(
        getApiUrl(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/prediction_games/admin/${competition_id}`),
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            published: game.published,
            prediction_open: game.prediction_open,
            prediction_close: game.prediction_close,
          }),
        }
      );

      if (!response.ok) {
        console.log(await response.json());
        throw new Error("Failed to save changes.");
      }

      const updatedGame = await response.json();
      setGame(updatedGame);
      if (updatedGame.competition_event_ids.length > 0) setSelectedEvent(updatedGame.competition_event_ids[0]);

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  function updateField(field, value) {
    setGame((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  if (loading) return <main className="p-8">Đang tải...</main>;
  if (saving) return <main className="p-8">Đang lưu...</main>;
  if (error) return <main className="p-8 text-red-500">{error}</main>;

  const now = new Date();
  const registrationOpen = parseBackendDate(game.competition_registration_open);
  const registrationClose = parseBackendDate(game.competition_registration_close);
  const registrationOpenNow = now >= registrationOpen && now <= registrationClose;

  const currentPsychSheet = game.competition_psych_sheets.find((sheet) => sheet.event_id === selectedEvent)?.psych_sheet ?? [];

  return (
    <main className="mx-auto max-w-7xl p-8">

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{game.competition_name}</h1>
        <p className="mt-2 text-gray-500">
          ID:{" "}
          <a
            href={`https://www.worldcubeassociation.org/competitions/${game.competition_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {game.competition_id}
          </a>
        </p>
      </div>

      <div className="mb-6 flex border-b">
        <Tab
          active={activeTab === TABS.GENERAL}
          onClick={() => setActiveTab(TABS.GENERAL)}
        >
          Tổng quan
        </Tab>

        <Tab
          active={activeTab === TABS.PARTICIPANTS}
          onClick={() => setActiveTab(TABS.PARTICIPANTS)}
        >
          Người dự đoán
        </Tab>

        <Tab
          active={activeTab === TABS.RESULTS}
          onClick={() => setActiveTab(TABS.RESULTS)}
        >
          Kết quả
        </Tab>
      </div>

      {activeTab === TABS.GENERAL && (
        <div className="rounded-xl border bg-white p-8 shadow-sm">

          {registrationOpenNow && (
            <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
              <p className="text-sm text-amber-900">
                <strong>⚠️ Vẫn đang trong thời gian đăng ký cho giải đấu.</strong>{" "}
                Hãy thường xuyên ấn <strong>Lưu thay đổi</strong> để giữ Psych sheets luôn được cập nhật.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-10 gap-y-4">

            <ReadOnlyField
              label="Thời gian diễn ra"
              value={`${formatOriginalDate(game.competition_start_date)} - ${formatOriginalDate(game.competition_end_date)}`}
            />

            <ReadOnlyField
              label="Thời gian đăng ký"
              value={`${formatDateTime(game.competition_registration_open)} - ${formatDateTime(game.competition_registration_close)}`}
            />

            <ReadOnlyField
              label="Đại diện"
              value={configCountryIso2[game.competition_country_iso2].name}
            />

            <div className="flex items-center gap-4">
              <Tippy content={"Khi đã xuất bản, mọi người có thể xem và đặt dự đoán cho giải đấu."}>
                <label className="w-40 cursor-help font-medium">
                  Xuất bản
                </label>
              </Tippy>

              <input
                type="checkbox"
                checked={game.published}
                onChange={(e) =>
                  updateField("published", e.target.checked)
                }
                className="h-5 w-5 cursor-pointer"
              />
            </div>

            <EditableDateTime
              label="Mở dự đoán"
              value={game.prediction_open}
              onChange={(v) => updateField("prediction_open", v)}
              tooltip={"Thời gian bắt đầu mở dự đoán."}
            />

            <EditableDateTime
              label="Đóng dự đoán"
              value={game.prediction_close}
              onChange={(v) => updateField("prediction_close", v)}
              tooltip={"Thời gian kết thúc dự đoán."}
            />

          </div>

          <div className="mt-8">

              <label className="mb-2 block font-edium">
                Nội dung
              </label>

              <div className="flex flex-wrap gap-2">

                {game.competition_event_ids.map((eventId) => (

                  <button
                    key={eventId}
                    onClick={() => setSelectedEvent(eventId)}
                    className={`rounded-md border px-3 py-1 transition cursor-pointer ${
                      selectedEvent === eventId
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    {configEvents[eventId]?.name ?? eventId}
                  </button>

                ))}

              </div>

          </div>

          <div className="mt-6">

            <label className="mb-2 block font-medium">
              Psych Sheet cho nội dung <strong>{" " + configEvents[selectedEvent]?.name ?? eventId}</strong>
            </label>

            <div className="max-h-[400px] overflow-y-auto border">
              <table className="min-w-full border-collapse">

                <thead className="sticky top-0 bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Thí sinh</th>
                    <th className="px-4 py-3 text-left">Đại diện</th>
                    <th className="px-4 py-3 text-right">Thành tích đơn</th>
                    <th className="px-4 py-3 text-right">Thành tích trung bình</th>
                  </tr>
                </thead>

                <tbody>
                  {currentPsychSheet.map((competitor) => (
                    <tr
                      key={competitor.user_id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">{competitor.pos}</td>
                      <td className="px-4 py-2">{competitor.name}</td>
                      <td className="px-4 py-2">{configCountryIso2[competitor.country_iso2].name}</td>
                      <td className="px-4 py-2 text-right">
                        {formatResult(competitor.single_best, selectedEvent, false)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {formatResult(competitor.average_best, selectedEvent, true)}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

          </div>

          <div className="mt-8 flex justify-end">

            <button
              onClick={saveChanges}
              disabled={saving}
              className={`rounded-lg px-6 py-2 text-white disabled:opacity-50 transition ${
                saving
                  ? "cursor-not-allowed"
                  : "cursor-pointer bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>

          </div>

        </div>
      )}

      {activeTab === TABS.PARTICIPANTS && (
        <ParticipantsTab competitionId={competition_id} eventIds={game.competition_event_ids} psychSheets={game.competition_psych_sheets} />
      )}

      {activeTab === TABS.RESULTS && (
        // <div className="rounded-xl border bg-white p-8 shadow-sm">
        //   Results tab
        // </div>
        <CompetitionResultForm competition={game} />
      )}
    </main>
  );
}