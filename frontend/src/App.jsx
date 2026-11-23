import { useEffect, useState } from "react";
import PredictForm from "./components/PredictForm.jsx";
import ResultCard from "./components/ResultCard.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import FarmerGuide from "./components/FarmerGuide.jsx";
import { getHealth } from "./lib/api.js";

export default function App() {
  const [out, setOut] = useState(null); // { result, inputs }
  const [online, setOnline] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    getHealth()
      .then((h) => setOnline(h?.model_ready ?? h?.ok ?? false))
      .catch(() => setOnline(false));
  }, []);

  const context = out
    ? {
        inputs: out.result.inputs ?? out.inputs,
        prediction: out.result.prediction ?? out.result,
        weather: out.result.weather,
      }
    : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-field sm:text-4xl">What should I plant?</h1>
          <p className="mt-1 max-w-prose text-soil/70">
            Enter your soil test and we'll match it with local weather to suggest a crop.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setShowGuide((shown) => !shown)}
            className="rounded-lg border border-field/25 bg-paper px-4 py-2 text-sm font-bold text-field transition hover:bg-white">
            {showGuide ? "Back to recommendations" : "Farmer soil & crop guide"}
          </button>
          <span className={`rounded-full px-3 py-1 text-sm ${
            online === false ? "bg-warn/15 text-warn" : online ? "bg-leaf/15 text-field" : "bg-soil/10 text-soil/60"
          }`}>
            {online === false ? "Server offline" : online ? "Model ready" : "Checking server…"}
          </span>
        </div>
      </header>

      {showGuide ? <FarmerGuide /> : (
        <main className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <PredictForm onResult={setOut} />
          <div className="space-y-6">
            <ResultCard result={out?.result} inputs={out?.inputs} />
            <ChatPanel context={context} />
          </div>
        </main>
      )}
    </div>
  );
}
