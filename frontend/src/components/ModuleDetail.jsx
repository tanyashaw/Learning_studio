import { useState } from "react";

const FORMAT_ICONS = {
  video: "▶",
  interactive: "⚡",
  scenario: "💬",
  reading: "📖",
};

const FORMAT_COLORS = {
  video:       { color: "#e8a63c", bg: "rgba(232,166,60,0.08)",  border: "rgba(232,166,60,0.25)" },
  interactive: { color: "#4fae91", bg: "rgba(79,174,145,0.08)",  border: "rgba(79,174,145,0.25)" },
  scenario:    { color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.25)" },
  reading:     { color: "#60a5fa", bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.25)" },
};

/* ── Lesson card with expandable full content ── */
function LessonCard({ lesson, index }) {
  const [open, setOpen] = useState(false);
  const fmt = FORMAT_COLORS[lesson.format] || FORMAT_COLORS.video;

  return (
    <div
      className={`lesson-card${open ? " lesson-card--open" : ""}`}
      style={open ? { borderColor: fmt.border, background: fmt.bg } : {}}
    >
      <div className="lesson-step">{String(index + 1).padStart(2, "0")}</div>
      <div className="lesson-card-body">
        <div className="lesson-card-top">
          <span
            className="lesson-format-badge"
            style={{ color: fmt.color, background: fmt.bg, borderColor: fmt.border }}
          >
            {FORMAT_ICONS[lesson.format] || "◆"} {lesson.format}
          </span>
        </div>
        <p className="lesson-card-title">{lesson.title}</p>
        <p className="lesson-card-summary">{lesson.summary}</p>

        {lesson.content && (
          <>
            <button
              type="button"
              className="lesson-expand-btn"
              onClick={() => setOpen((v) => !v)}
              style={open ? { color: fmt.color, background: fmt.bg, borderColor: fmt.border } : {}}
            >
              {open ? "▲ Hide lesson detail" : "▼ Show lesson detail"}
            </button>
            <div className={`lesson-content-body${open ? " lesson-content-body--open" : ""}`}>
              <p className="lesson-content-text">{lesson.content}</p>
              {lesson.designRationale && (
                <p className="lesson-rationale-text">
                  <span className="rationale-label">🎯 Design choice:</span> {lesson.designRationale}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Single quiz question with rich answer feedback ── */
function QuizQuestion({ q, qIdx, picked, onPick }) {
  const chosen = picked[qIdx];
  const answered = chosen !== undefined;
  const isCorrect = chosen === q.correctIndex;

  return (
    <div className="quiz-item">
      <p className="quiz-question">
        <span className="quiz-q-num">Q{qIdx + 1}</span> {q.question}
      </p>
      <div className="quiz-options">
        {q.options.map((opt, optIdx) => {
          let cls = "quiz-option";
          if (answered) {
            if (optIdx === q.correctIndex) cls += " correct";
            else if (optIdx === chosen) cls += " incorrect";
          }
          return (
            <button
              type="button"
              key={optIdx}
              className={cls}
              onClick={() => onPick(qIdx, optIdx)}
              disabled={answered}
            >
              <span className="opt-letter">{String.fromCharCode(65 + optIdx)}</span>
              {opt}
              {answered && optIdx === q.correctIndex && <span className="opt-tick">✓</span>}
              {answered && optIdx === chosen && !isCorrect && <span className="opt-cross">✗</span>}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={`answer-feedback ${isCorrect ? "answer-feedback--correct" : "answer-feedback--wrong"}`}>
          <div className="answer-feedback-header">
            {isCorrect ? (
              <><span className="feedback-icon">🎉</span><span className="feedback-verdict">Correct!</span></>
            ) : (
              <><span className="feedback-icon">❌</span>
                <span className="feedback-verdict">
                  Incorrect — the right answer is&nbsp;
                  <strong>{String.fromCharCode(65 + q.correctIndex)}. {q.options[q.correctIndex]}</strong>
                </span>
              </>
            )}
          </div>
          {q.answerExplanation && (
            <p className="feedback-explanation">{q.answerExplanation}</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main module block ── */
export default function ModuleDetail({ module, index }) {
  const [picked, setPicked] = useState({});
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  const pick = (qIdx, optIdx) => {
    if (picked[qIdx] !== undefined) return;
    setPicked((prev) => {
      const next = { ...prev, [qIdx]: optIdx };
      if (Object.keys(next).length === module.quiz.length) setQuizDone(true);
      return next;
    });
  };

  const score = module.quiz.filter((q, i) => picked[i] === q.correctIndex).length;

  const paragraphs = Array.isArray(module.explanationParagraphs)
    ? module.explanationParagraphs
    : module.explanation
    ? [module.explanation]
    : [];

  return (
    <div className="module-block" id={`module-${index + 1}`}>

      {/* ── Module header ── */}
      <div className="module-header">
        <span className="module-number">MODULE {String(index + 1).padStart(2, "0")}</span>
        <div className="module-meta-right">
          <span className="module-duration">⏱ {module.durationMinutes} min</span>
          <span className="module-lessons-count">
            {module.lessons.length} lesson{module.lessons.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <h2 className="module-title">{module.title}</h2>

      {/* ── Prerequisite pill ── */}
      {module.prerequisite && module.prerequisite.toLowerCase() !== "none" && (
        <div className="prereq-pill">
          <span className="prereq-icon">⚠</span>
          <span><strong>Prerequisite:</strong> {module.prerequisite}</span>
        </div>
      )}

      {/* ── Overview / Introduction ── */}
      <div className="module-overview">
        <div className="overview-label">
          <span className="overview-icon">📋</span> Overview &amp; Introduction
        </div>
        <p className="module-summary-text">{module.summary}</p>

        {paragraphs.length > 0 && (
          <div className="module-explanation-paragraphs">
            {paragraphs.map((para, i) => (
              <p key={i} className="module-explanation-text">{para}</p>
            ))}
          </div>
        )}

        {/* Learning outcomes */}
        {Array.isArray(module.learningOutcomes) && module.learningOutcomes.length > 0 && (
          <div className="learning-outcomes">
            <div className="outcomes-label">
              <span>🏆</span> After this module you will be able to:
            </div>
            <ul className="outcomes-list">
              {module.learningOutcomes.map((outcome, i) => (
                <li key={i}>{outcome}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="module-intro-text">
          Complete all {module.lessons.length} lesson{module.lessons.length !== 1 ? "s" : ""} below,
          then take the checkpoint quiz to confirm your understanding.
        </p>
      </div>

      {/* ── Lessons ── */}
      <div className="module-section">
        <div className="section-heading">
          <span className="section-icon">📚</span>
          <span>Lessons</span>
        </div>
        <div className="lessons-list">
          {module.lessons.map((lesson, i) => (
            <LessonCard key={i} lesson={lesson} index={i} />
          ))}
        </div>
      </div>

      {/* ── Quiz ── */}
      <div className="module-section quiz-section">
        <button
          className={`quiz-toggle-btn${quizOpen ? " open" : ""}`}
          onClick={() => setQuizOpen((v) => !v)}
          type="button"
        >
          <span className="section-icon">✏️</span>
          <span>
            Checkpoint Quiz &nbsp;·&nbsp; {module.quiz.length} question
            {module.quiz.length !== 1 ? "s" : ""}
          </span>
          {quizDone && (
            <span className="quiz-score-badge">
              {score}/{module.quiz.length} correct
            </span>
          )}
          <span className="quiz-chevron">{quizOpen ? "▲" : "▼"}</span>
        </button>

        {quizOpen && (
          <div className="quiz-body">
            {module.quiz.map((q, qIdx) => (
              <QuizQuestion key={qIdx} q={q} qIdx={qIdx} picked={picked} onPick={pick} />
            ))}

            {quizDone && (
              <div className={`quiz-result ${
                score === module.quiz.length ? "perfect"
                : score >= module.quiz.length / 2 ? "pass"
                : "retry"
              }`}>
                {score === module.quiz.length
                  ? "🎉 Perfect score! Ready to move on."
                  : score >= module.quiz.length / 2
                  ? `✅ ${score}/${module.quiz.length} — Good work! Review the explanations above.`
                  : `📖 ${score}/${module.quiz.length} — Re-read the module content and try again.`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
