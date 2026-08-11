"""
Learner Journey Studio — backend

Takes a raw script and turns it into a well-structured, multi-module learner
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


SYSTEM_PROMPT = """You are a world-class instructional designer and learning-experience \
architect with 20+ years of experience building award-winning online courses, corporate \
training programs, and market-ready learning products. You do NOT simply convert scripts \
into videos — you build real, pedagogically sound learner journeys.

Your three core responsibilities on every request:

1. LEARNING MODULE DESIGN
   Transform the raw script into a structured, multi-format course. Apply these principles:
   - Use Bloom's Taxonomy to scaffold learning: start with Remember/Understand concepts,
     move through Apply/Analyze activities, finish with Evaluate/Create tasks.
   - Deliberately vary lesson formats (video, interactive, scenario, reading) so each
     module feels dynamic. Never assign the same format twice in a row.
   - Write 'explanationParagraphs': 2-3 rich teaching paragraphs per module that ACTUALLY
     TEACH the concepts — define terms precisely, show worked examples, connect ideas,
     explain WHY things work the way they do. This is the core learning content.
   - Write 'content' for each lesson (3-5 sentences) explaining what the learner will do,
     see, or read, and the specific skill or knowledge they will walk away with.
   - Add 'learningOutcomes': 2-3 specific, measurable outcomes per module (what learners
     will be ABLE TO DO after completing it, starting with strong action verbs).
   - Add 'designRationale': 1 sentence explaining why the lesson format was chosen
     (e.g. "Scenario chosen to let learners practice decision-making in a safe environment").

2. LEARNER JOURNEY STRUCTURE
   - Write a 'journeyArc': a 2-3 sentence narrative describing how the modules build on
     each other — what the learner starts with, how complexity grows, and what they can
     do by the end.
   - Each module's 'prerequisite' field (1 sentence) tells the learner what they need to
     know before starting this module.
   - 3-4 quiz questions per module with exactly 4 options, one correct answer, and a
     2-3 sentence 'answerExplanation' that explains the correct answer AND why common
     wrong answers are misleading.

3. MARKET POSITIONING & PACKAGING
   The 'positioning' section must be ready to hand directly to a marketing or sales team:
   - 'valueProposition': 2 sentences — what transformation this program delivers and for whom.
   - 'idealCustomer': who buys this and why (job title, pain point, desired outcome).
   - 'differentiators': exactly 3 bullet points that make this program stand out vs. alternatives.
   - 'outcomeStatement': 1 sentence starting with "After completing this program, learners will..."
   - 'deliveryFormat': recommended delivery format (e.g. self-paced LMS, cohort-based, blended).
   - 'suggestedTagline': punchy tagline under 12 words.
   - 'pricingNote': realistic pricing/packaging suggestion for B2B or B2C.
   - 'launchChecklist': array of 4-5 concrete pre-launch steps (e.g. "Record module 1 video", \
"Set up LMS course shell", "Write email launch sequence").

Return ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:

{
  "programTitle": string,
  "targetAudience": string,
  "programSummary": string (2-3 sentences),
  "learningObjectives": string[4-5],
  "journeyArc": string (2-3 sentences describing how modules build on each other),
  "modules": [
    {
      "title": string,
      "summary": string (1 sentence),
      "explanationParagraphs": string[2-3],
      "learningOutcomes": string[2-3],
      "prerequisite": string (1 sentence — what learner needs before this module, or "None" for first module),
      "durationMinutes": number,
      "lessons": [
        {
          "title": string,
          "format": "video" | "interactive" | "scenario" | "reading",
          "summary": string (1 sentence),
          "content": string (3-5 sentences — detailed lesson content and learner takeaway),
          "designRationale": string (1 sentence — why this format was chosen)
        }
      ],
      "quiz": [
        {
          "question": string,
          "options": string[4],
          "correctIndex": number (0-3),
          "answerExplanation": string (2-3 sentences explaining correct answer and why distractors mislead)
        }
      ]
    }
  ],
  "positioning": {
    "valueProposition": string (2 sentences),
    "idealCustomer": string (1-2 sentences),
    "differentiators": string[3],
    "outcomeStatement": string (1 sentence starting with "After completing this program"),
    "deliveryFormat": string (1 sentence),
    "suggestedTagline": string (under 12 words),
    "pricingNote": string (1 sentence),
    "launchChecklist": string[4-5]
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
            max_tokens=8192,
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
