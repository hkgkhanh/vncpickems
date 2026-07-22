import PredictionGrid from "./components/PredictionGrid";
import CreatePredictionDialog from "./components/CreatePredictionDialog";

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-7xl p-8">

      {/* Top row */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Prediction Games
          </h1>

          <p className="mt-2 text-gray-500">
            Quản lý các Prediction Game.
          </p>
        </div>

        <CreatePredictionDialog />
      </div>

      <PredictionGrid />
    </main>
  );
}