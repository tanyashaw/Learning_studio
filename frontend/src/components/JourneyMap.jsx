export default function JourneyMap({ journey, selectedStop, onSelect }) {
  const { modules } = journey;

  return (
    <div className="trail-scroll">
      <div className="trail">
        {modules.map((mod, i) => (
          <div className="trail-stop" key={i}>
            <button
              type="button"
              className={`stop-node${selectedStop === i ? " active" : ""}`}
              onClick={() => onSelect(i)}
              aria-label={`View module ${i + 1}: ${mod.title}`}
            >
              STOP {String(i + 1).padStart(2, "0")}
            </button>
            <div
              className="stop-card"
              role="button"
              tabIndex={0}
              onClick={() => onSelect(i)}
              onKeyDown={(e) => e.key === "Enter" && onSelect(i)}
            >
              <p className="stop-title">{mod.title}</p>
              <p className="stop-meta">
                {mod.lessons.length} lessons · {mod.durationMinutes} min
              </p>
            </div>
          </div>
        ))}

        <div className="trail-stop">
          <button
            type="button"
            className={`stop-node final${selectedStop === "positioning" ? " active" : ""}`}
            onClick={() => onSelect("positioning")}
            aria-label="View market positioning"
          >
            ⚑ MARKET
          </button>
          <div
            className="stop-card final"
            role="button"
            tabIndex={0}
            onClick={() => onSelect("positioning")}
            onKeyDown={(e) => e.key === "Enter" && onSelect("positioning")}
          >
            <p className="stop-title">Ready for market</p>
            <p className="stop-meta">Positioning &amp; packaging</p>
          </div>
        </div>
      </div>
    </div>
  );
}
