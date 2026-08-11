# Learner Journey Studio (demo)

A working demo of what an "AI/eLearning tool, done right" could look like —
built to speak directly to this requirement:

- Comfortable with tools like Synthesia and other AI/eLearning tools
- Turns a script into a **well-designed, engaging learning module** — not just a video
- Understands **learning/program design** and structures content into a strong learner journey
- Helps **package and position** the program for market

You paste a raw script in on the left. The FastAPI backend calls the
Anthropic API to restructure it into a multi-module course — with mixed
lesson formats, checkpoint quizzes, and a "ready for market" positioning
summary (value prop, ideal customer, differentiators, tagline, pricing
note). The React frontend renders it as a "journey map" you can click
through.

This is a demo, not a production app: no auth, no database, no persistence
between runs. It's meant to be shown live or screen-recorded.

## Project layout

```
learner-journey-studio/
├── backend/          FastAPI app that calls the Anthropic API
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/          React + Vite UI
    ├── src/
    └── .env.example
```

## Run it

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# edit .env and paste in a real ANTHROPIC_API_KEY
uvicorn main:app --reload --port 8000
```

Check it's alive: open http://localhost:8000/api/health — it should report
`"hasKey": true`.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

### 3. Try it

Paste in any training/video script, set an audience and tone, choose how
many modules you want, and click **Build the learner journey**. Click
through the "stops" on the trail to see each module's lessons and quiz,
and the final "Market" stop for the positioning summary.

## Notes for a live demo

- Have 1–2 scripts ready to paste in ahead of time (a product walkthrough,
  an onboarding talk, a compliance training) so you're not waiting on
  someone to write one live.
- The quiz options are clickable — clicking one reveals the correct
  answer, which is a nice moment to show it's not just static text.
- The "Market" stop is the one that speaks directly to the
  packaging/positioning part of the brief — worth lingering on.
- To swap in a different AI provider or add real Synthesia video
  generation per lesson, that would hook in as an additional call inside
  `backend/main.py`, keyed off each lesson's `format` field.
