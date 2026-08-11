export default function PositioningCard({ positioning }) {
  return (
    <div className="detail-panel" id="positioning">
      <p className="detail-eyebrow">Market Ready</p>
      <h2>Packaging &amp; Positioning</h2>
      <p className="detail-summary">
        Everything your marketing or sales team needs to launch and sell this program.
      </p>

      {/* Tagline banner — top and centre */}
      <div className="tagline-banner">"{positioning.suggestedTagline}"</div>

      <div className="positioning-grid">

        <div className="positioning-block pos-block--highlight">
          <h4>💡 Value Proposition</h4>
          <p>{positioning.valueProposition}</p>
        </div>

        <div className="positioning-block">
          <h4>🎯 Ideal Customer</h4>
          <p>{positioning.idealCustomer}</p>
        </div>

        <div className="positioning-block pos-block--full">
          <h4>✅ Outcome Statement</h4>
          <p className="outcome-statement">{positioning.outcomeStatement}</p>
        </div>

        <div className="positioning-block">
          <h4>⚡ Differentiators</h4>
          <ul>
            {positioning.differentiators.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>

        <div className="positioning-block">
          <h4>📦 Delivery Format</h4>
          <p>{positioning.deliveryFormat}</p>
          <h4 style={{ marginTop: "1rem" }}>💰 Pricing Note</h4>
          <p>{positioning.pricingNote}</p>
        </div>

        {/* Launch checklist — full width */}
        {Array.isArray(positioning.launchChecklist) && positioning.launchChecklist.length > 0 && (
          <div className="positioning-block pos-block--full launch-checklist-block">
            <h4>🚀 Pre-Launch Checklist</h4>
            <ul className="launch-checklist">
              {positioning.launchChecklist.map((item, i) => (
                <li key={i}>
                  <span className="launch-check-num">{String(i + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
