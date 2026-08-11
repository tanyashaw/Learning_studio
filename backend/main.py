"""
Learner Journey Studio — backend

Takes a raw script and turns it into a structured, multi-module learner
journey (modules -> lessons -> quiz) plus a market-positioning summary,
using the Groq API.
"""

import json
import os

import openai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

MODEL = "llama-3.3-70b-versatile"

app = FastAPI(title="Learner Journey Studio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = openai.OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)


class GenerateRequest(BaseModel):
    script: str
    audience: str = "New team members"
    tone: str = "Friendly and practical"
    module_target: int = Field(4, ge=2, le=8, alias="moduleTarget")

    class Config:
        populate_by_name = True


SYSTEM_PROMPT = """You are a senior instructional designer and learning-experience \
architect. You take a raw script (for a video, training talk, or webinar) and turn \
it into a well-structured, engaging learner journey — not just a video, but a real \
course with a clear arc, checks for understanding, and a market-ready positioning \
summary.

Rules:
- Preserve the substance of the original script; do not invent unrelated content.
- Break the material into a logical sequence of modules that build on each other.
- Each module should mix lesson formats (video, interactive, scenario, reading) \
rather than defaulting everything to video.
- Each module ends with 2-3 short quiz questions that check understanding of that \
module's content, each with exactly 4 options and one correct answer.
- The positioning section should help the program be packaged and sold internally \
or externally: a clear value proposition, ideal customer/learner, 3 differentiators, \
a short marketing tagline, and a one-line pricing/packaging note.

Return ONLY valid JSON (no markdown fences, no commentary) matching exactly this \
shape:

{
  "programTitle": string,
  "targetAudience": string,
  "programSummary": string (1-2 sentences),
  "learningObjectives": string[3-5],
  "modules": [
    {
      "title": string,
      "summary": string (1 sentence),
      "durationMinutes": number,
      "lessons": [
        {
          "title": string,
          "format": "video" | "interactive" | "scenario" | "reading",
          "summary": string (1 sentence)
        }
      ],
      "quiz": [
        {
          "question": string,
          "options": string[4],
          "correctIndex": number (0-3)
        }
      ]
    }
  ],
  "positioning": {
    "valueProposition": string (1-2 sentences),
    "idealCustomer": string (1 sentence),
    "differentiators": string[3],
    "suggestedTagline": string (under 12 words),
    "pricingNote": string (1 sentence)
  }
}
"""


def _extract_json(raw_text: str) -> dict:
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        parts = cleaned.split("```")
        cleaned = parts[1] if len(parts) > 1 else cleaned
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:]
    return json.loads(cleaned.strip())


@app.get("/api/health")
def health():
    return {"status": "ok", "hasKey": bool(os.environ.get("GROQ_API_KEY"))}


@app.post("/api/generate-journey")
def generate_journey(req: GenerateRequest):
    if not os.environ.get("GROQ_API_KEY"):
        raise HTTPException(
            500,
            "GROQ_API_KEY is not set on the server. Add it to backend/.env "
            "and restart the server.",
        )
    if not req.script.strip():
        raise HTTPException(400, "Script is required.")

    user_prompt = (
        "Turn the following raw script into a structured learner journey.\n\n"
        f"Target audience: {req.audience}\n"
        f"Tone: {req.tone}\n"
        f"Number of modules: {req.module_target}\n\n"
        f'SCRIPT:\n"""\n{req.script.strip()}\n"""\n'
    )

    try:
        response = client.chat.completions.create(
            model=MODEL,
            max_tokens=4096,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
        )
    except openai.OpenAIError as exc:
        raise HTTPException(502, f"Groq API error: {exc}") from exc

    raw_text = response.choices[0].message.content or ""

    try:
        data = _extract_json(raw_text)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            502, "The model did not return valid JSON. Please try again."
        ) from exc

    return data
