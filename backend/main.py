"""
Learner Journey Studio — backend

Takes a raw script and turns it into a well-structured, multi-module learner
journey (modules -> lessons -> quiz) plus a market-positioning summary,
using the OpenAI API.
"""

import json
import os

import openai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

# Check for API Key (OpenAI preferred, Groq fallback)
OPENAI_KEY = os.environ.get("OPENAI_API_KEY")
GROQ_KEY = os.environ.get("GROQ_API_KEY")

API_KEY = OPENAI_KEY or GROQ_KEY

if OPENAI_KEY:
    MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o")
    client = openai.OpenAI(api_key=OPENAI_KEY)
elif GROQ_KEY:
    MODEL = "llama-3.3-70b-versatile"
    client = openai.OpenAI(
        api_key=GROQ_KEY,
        base_url="https://api.groq.com/openai/v1",
    )
else:
    MODEL = "gpt-4o"
    client = openai.OpenAI(api_key="missing")

app = FastAPI(title="Learner Journey Studio API")

# Allow all Cross-Origin (CORS) origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    script: str
    audience: str = "New team members"
    tone: str = "Friendly and practical"
    module_target: int = Field(4, ge=2, le=8, alias="moduleTarget")

    class Config:
        populate_by_name = True


SYSTEM_PROMPT = """You are a world-class instructional designer and learning-experience \
architect with 20+ years of experience building award-winning online courses, corporate \
training programs, and market-ready learning products.

IMPORTANT: You MUST produce ALL modules requested. Do not stop early. Complete the ENTIRE \
JSON structure including every requested module before finishing your response.

Content depth per module (balanced for completeness across all modules):

Your three core responsibilities on every request:

1. LEARNING MODULE DESIGN — DEEP DETAIL REQUIRED
   Transform the raw script into a structured, multi-format course:

- explanationParagraphs: 3 paragraphs per module (Context & WHY, Core Concept Deep Dive with
  precise definitions and analogies, Worked Example with a concrete step-by-step case study).
- lessons: 3-4 per module, deliberately cycling through video/interactive/scenario/reading formats.
  Each lesson 'content': 4-6 rich sentences covering what learners do, the concept taught,
  a concrete example, and the key takeaway.
  Each lesson 'practiceActivity': 2-3 sentences describing a hands-on activity.
- learningOutcomes: 3-4 measurable outcomes starting with Bloom's action verbs.
- keyTakeaways: 3-4 concise memorable bullet strings.
- conceptMap: 3-5 key term → 1-sentence definition pairs (module mini-glossary).
- quiz: 4-5 questions per module, 4 options each, varied types (recall/application/scenario).
  'answerExplanation': 2-3 sentences explaining correct answer and why distractors are wrong.

LEARNER JOURNEY:
- 'journeyArc': 2-3 sentences on the cognitive/emotional arc across all modules.
- Each module's 'prerequisite': 1 sentence.

MARKET POSITIONING:
- valueProposition (2 sentences), idealCustomer (1-2 sentences), differentiators (3 items),
  outcomeStatement, deliveryFormat (1 sentence), suggestedTagline, pricingNote, launchChecklist (4-5 items).

Return ONLY valid JSON matching exactly this shape:

{
  "programTitle": string,
  "targetAudience": string,
  "programSummary": string,
  "learningObjectives": string[],
  "journeyArc": string,
  "modules": [
    {
      "title": string,
      "summary": string,
      "explanationParagraphs": string[],
      "learningOutcomes": string[],
      "keyTakeaways": string[],
      "conceptMap": {},
      "prerequisite": string,
      "durationMinutes": number,
      "lessons": [
        {
          "title": string,
          "format": "video" | "interactive" | "scenario" | "reading",
          "summary": string,
          "content": string,
          "practiceActivity": string,
          "designRationale": string
        }
      ],
      "quiz": [
        {
          "question": string,
          "options": string[4],
          "correctIndex": number,
          "answerExplanation": string
        }
      ]
    }
  ],
  "positioning": {
    "valueProposition": string,
    "idealCustomer": string,
    "differentiators": string[],
    "outcomeStatement": string,
    "deliveryFormat": string,
    "suggestedTagline": string,
    "pricingNote": string,
    "launchChecklist": string[]
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
    return {
        "status": "ok",
        "hasKey": bool(API_KEY),
        "model": MODEL,
        "provider": "OpenAI" if OPENAI_KEY else ("Groq" if GROQ_KEY else "None"),
    }


@app.post("/api/generate-journey")
def generate_journey(req: GenerateRequest):
    if not API_KEY:
        raise HTTPException(
            500,
            "Neither OPENAI_API_KEY nor GROQ_API_KEY is set on the server. "
            "Add OPENAI_API_KEY to backend/.env and restart the server.",
        )
    if not req.script.strip():
        raise HTTPException(400, "Script is required.")

    user_prompt = (
        "Turn the following raw script into a DEEPLY DETAILED structured learner journey. "
        "Every module must have rich, textbook-quality content. Do not produce thin or short content.\n\n"
        f"Target audience: {req.audience}\n"
        f"Tone: {req.tone}\n"
        f"Number of modules: {req.module_target}\n\n"
        f'SCRIPT:\n"""\n{req.script.strip()}\n"""\n'
    )

    try:
        response = client.chat.completions.create(
            model=MODEL,
            max_tokens=16384,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
        )
    except openai.OpenAIError as exc:
        raise HTTPException(502, f"OpenAI API error: {exc}") from exc

    # Guard: if the model stopped because it hit max_tokens the JSON will be
    # incomplete — surface a clear error instead of a cryptic parse failure.
    finish_reason = response.choices[0].finish_reason
    if finish_reason == "length":
        raise HTTPException(
            502,
            "The model ran out of tokens before finishing all modules. "
            "Try fewer modules (2-3) or a shorter script.",
        )

    raw_text = response.choices[0].message.content or ""

    try:
        data = _extract_json(raw_text)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            502, "The model did not return valid JSON. Please try again."
        ) from exc

    return data

