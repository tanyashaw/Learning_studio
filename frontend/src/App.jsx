import { useState, useRef, useEffect } from "react";
import { generateJourney } from "./api";
import ModuleDetail from "./components/ModuleDetail";
import PositioningCard from "./components/PositioningCard";
import ScriptInput from "./components/ScriptInput";
import LandingPage from "./components/LandingPage";

const DEFAULT_FORM = {
  script: "",
  audience: "New team members",
  tone: "Friendly and practical",
  moduleTarget: 4,
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [form, setForm]           = useState(DEFAULT_FORM);
  const [journey, setJourney]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [page, setPage]           = useState(0);
  const [direction, setDirection] = useState("forward"); // "forward" | "backward"
  const [animKey, setAnimKey]     = useState(0);          // forces re-mount for animation
  const panelRef                  = useRef(null);

  // scroll to top of the journey panel each time we change page
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await generateJourney({
        ...form,
        moduleTarget: Number(form.moduleTarget),
      });
      setJourney(data);
      setPage(0);
      setDirection("forward");
      setAnimKey((k) => k + 1);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const navigate = (targetPage, dir) => {
    setDirection(dir);
    setAnimKey((k) => k + 1);
    setPage(targetPage);
  };

  const goNext = (max) => navigate(Math.min(page + 1, max), "forward");
  const goPrev = ()      => navigate(Math.max(page - 1, 0), "backward");
  const goTo   = (idx)   => navigate(idx, idx > page ? "forward" : "backward");

  if (!isAuthenticated) {
    return <LandingPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="wordmark">
          Learner Journey <span>Studio</span>
        </div>
        <div className="topbar-right">
          <button
            type="button"
            className="logout-btn"
            onClick={() => setIsAuthenticated(false)}
            title="Sign Out"
          >
            Sign Out 🚪
          </button>
        </div>
      </header>

      <div className="layout">
        <ScriptInput
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />

        <main className="journey-panel" ref={panelRef}>

          {/* ── Loading ── */}
          {loading && (
            <div className="loading-row">
              <span className="spinner" />
              Designing the learner journey…
            </div>
          )}

          {/* ── Empty state ── */}
          {!journey && !loading && (
            <div className="journey-empty">
              <div className="compass">🧭</div>
              Paste a script on the left and build it into a full learner
              journey — modules, lessons, quizzes, and a positioning summary
              you could hand to marketing.
            </div>
          )}

          {journey && !loading && (() => {
            const modules      = journey.modules;
            const lastPage     = modules.length;           // positioning page
            const isPositioning = page === lastPage;
            const isFirst      = page === 0;
            const isLastModule = page === lastPage - 1;

            return (
              <>
                {/* ── Program header ── */}
                <div className="journey-header">
                  <h1 className="program-title">{journey.programTitle}</h1>
                  <p className="program-summary">{journey.programSummary}</p>

                  {journey.journeyArc && (
                    <div className="journey-arc-banner">
                      <span className="journey-arc-label">🗺 Learner Journey Arc</span>
                      <p className="journey-arc-text">{journey.journeyArc}</p>
                    </div>
                  )}

                </div>

                {/* ── Animated page content ── */}
                <div
                  key={animKey}
                  className={`page-view page-view--${direction}`}
                >
                  {/* Module page */}
                  {!isPositioning && (
                    <ModuleDetail
                      module={modules[page]}
                      index={page}
                    />
                  )}

                  {/* Positioning page */}
                  {isPositioning && (
                    <PositioningCard positioning={journey.positioning} />
                  )}

                  {/* ── Bottom nav bar ── */}
                  <div className="page-nav">

                    {/* LEFT — previous */}
                    <button
                      type="button"
                      className="page-nav-btn page-nav-btn--prev"
                      onClick={goPrev}
                      disabled={isFirst}
                    >
                      <span className="pnb-arrow">←</span>
                      <span className="pnb-inner">
                        <span className="pnb-hint">Previous</span>
                        <span className="pnb-title">
                          {isFirst
                            ? "Start"
                            : isPositioning
                            ? `Module ${modules.length}: ${modules[modules.length - 1].title}`
                            : `Module ${page}: ${modules[page - 1].title}`}
                        </span>
                      </span>
                    </button>

                    {/* CENTRE — dots */}
                    <div className="page-nav-indicator">
                      {modules.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          className={`page-dot${page === i ? " page-dot--active" : page > i ? " page-dot--done" : ""}`}
                          onClick={() => goTo(i)}
                          title={`Module ${i + 1}`}
                        />
                      ))}
                      <button
                        type="button"
                        className={`page-dot page-dot--final${isPositioning ? " page-dot--active" : ""}`}
                        onClick={() => goTo(lastPage)}
                        title="Positioning"
                      />
                    </div>

                    {/* RIGHT — next / finish / restart */}
                    {isPositioning ? (
                      <button
                        type="button"
                        className="page-nav-btn page-nav-btn--restart"
                        onClick={() => goTo(0)}
                      >
                        <span className="pnb-inner">
                          <span className="pnb-hint">Restart</span>
                          <span className="pnb-title">Back to Module 1</span>
                        </span>
                        <span className="pnb-arrow">↺</span>
                      </button>
                    ) : isLastModule ? (
                      <button
                        type="button"
                        className="page-nav-btn page-nav-btn--finish"
                        onClick={() => goNext(lastPage)}
                      >
                        <span className="pnb-inner">
                          <span className="pnb-hint">Final step</span>
                          <span className="pnb-title">View Market Positioning</span>
                        </span>
                        <span className="pnb-arrow">⚑</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="page-nav-btn page-nav-btn--next"
                        onClick={() => goNext(lastPage)}
                      >
                        <span className="pnb-inner">
                          <span className="pnb-hint">Up next</span>
                          <span className="pnb-title">Module {page + 2}: {modules[page + 1].title}</span>
                        </span>
                        <span className="pnb-arrow">→</span>
                      </button>
                    )}

                  </div>
                </div>
              </>
            );
          })()}
        </main>
      </div>
    </div>
  );
}
