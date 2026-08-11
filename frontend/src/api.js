const API_BASE="https://learning-studio-5neg.onrender.com" || "https://localhost:8000"


export async function generateJourney({ script, audience, tone, moduleTarget }) {
  const res = await fetch(`${API_BASE}/api/generate-journey`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      script,
      audience,
      tone,
      moduleTarget,
    }),
  });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.detail) detail = body.detail;
    } catch {
      // ignore parse errors, use default message
    }
    throw new Error(detail);
  }

  return res.json();
}
