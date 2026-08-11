export default function ScriptInput({ form, setForm, onSubmit, loading, error }) {
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <form
      className="input-panel"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <div className="panel-eyebrow">Step 01 — Bring the script</div>
        <h1>
          Turn a script into a <em style={{ color: "var(--amber)" }}>learner journey</em>
        </h1>
      </div>

      <div className="field">
        <label htmlFor="script">Raw script</label>
        <textarea
          id="script"
          placeholder="Paste the video or training script here…"
          value={form.script}
          onChange={update("script")}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="audience">Target audience</label>
        <input
          id="audience"
          type="text"
          value={form.audience}
          onChange={update("audience")}
          placeholder="e.g. New sales hires"
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="tone">Tone</label>
          <select id="tone" value={form.tone} onChange={update("tone")}>
            <option>Friendly and practical</option>
            <option>Formal and precise</option>
            <option>Energetic and motivational</option>
            <option>Calm and reassuring</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="moduleTarget">Modules</label>
          <select
            id="moduleTarget"
            value={form.moduleTarget}
            onChange={update("moduleTarget")}
          >
            {[2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="error-note">{error}</div>}

      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? "Building the journey…" : "Build the learner journey"}
      </button>

      <p className="helper-note">
        This calls your own backend at <code>/api/generate-journey</code>, which
        uses the Anthropic API with your <code>ANTHROPIC_API_KEY</code> to
        structure the script into modules, lessons, quizzes, and a positioning
        summary.
      </p>
    </form>
  );
}
