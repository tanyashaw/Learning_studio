import { useState } from "react";
import { generateJourney } from "./api";
import ModuleDetail from "./components/ModuleDetail";
import PositioningCard from "./components/PositioningCard";
import ScriptInput from "./components/ScriptInput";

const DEFAULT_FORM = {
  script: "",
  audience: "New team members",
  tone: "Friendly and practical",
  moduleTarget: 4,
};

export default function App() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await generateJourney({
        ...form,
        moduleTarget: Number(form.moduleTarget),
      });
      setJourney(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="wordmark">
          Learner Journey <span>Studio</span>
        </div>
        <div className="tagline">Script → structured course → market-ready</div>
      </header>

      <div className="layout">
        <ScriptInput
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />

        <main className="journey-panel">
          {loading && (
            <div className="loading-row">
              <span className="spinner" />
              Designing the learner journey…
            </div>
          )}

          {!journey && !loading && (
            <div className="journey-empty">
              <div className="compass">🧭</div>
              Paste a script on the left and build it into a full learner
              journey — modules, lessons, quizzes, and a positioning summary
              you could hand to marketing.
            </div>
          )}

          {journey && !loading && (
            <>
              {/* ── Program overview ── */}
              <div className="journey-header">
                <h1 className="program-title">{journey.programTitle}</h1>
                <p className="program-summary">{journey.programSummary}</p>
                <div className="objective-pills">
                  {journey.learningObjectives.map((obj, i) => (
                    <span className="objective-pill" key={i}>
                      {obj}
                    </span>
                  ))}
                </div>

                {/* Module navigation quick-jump */}
                <div className="module-nav">
                  {journey.modules.map((mod, i) => (
                    <a
                      key={i}
                      href={`#module-${i + 1}`}
                      className="module-nav-chip"
                    >
                      <span className="module-nav-num">{i + 1}</span>
                      {mod.title}
                    </a>
                  ))}
                  <a href="#positioning" className="module-nav-chip final">
                    <span className="module-nav-num">⚑</span>
                    Positioning
                  </a>
                </div>
              </div>

              {/* ── All modules stacked ── */}
              <div className="modules-stack">
                {journey.modules.map((mod, i) => (
                  <ModuleDetail key={i} module={mod} index={i} />
                ))}
              </div>

              {/* ── Positioning card ── */}
              <div id="positioning">
                <PositioningCard positioning={journey.positioning} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
