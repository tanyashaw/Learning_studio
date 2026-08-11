export default function PositioningCard({ positioning }) {
  return (
    <div className="detail-panel">
      <p className="detail-eyebrow">Final stop</p>
      <h2>Packaging &amp; positioning</h2>
      <p className="detail-summary">
        How this program gets framed and sold — internally or externally.
      </p>

      <div className="positioning-grid">
        <div className="positioning-block">
          <h4>Value proposition</h4>
          <p>{positioning.valueProposition}</p>
        </div>
        <div className="positioning-block">
          <h4>Ideal customer</h4>
          <p>{positioning.idealCustomer}</p>
        </div>
        <div className="positioning-block">
          <h4>Differentiators</h4>
          <ul>
            {positioning.differentiators.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
        <div className="positioning-block">
          <h4>Pricing / packaging note</h4>
          <p>{positioning.pricingNote}</p>
        </div>
        <div className="tagline-banner">“{positioning.suggestedTagline}”</div>
      </div>
    </div>
  );
}
