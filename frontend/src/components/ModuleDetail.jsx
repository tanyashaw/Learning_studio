import { useState } from "react";

const FORMAT_ICONS = {
  video: "▶",
  interactive: "⚡",
  scenario: "💬",
  reading: "📖",
};

export default function ModuleDetail({ module, index }) {
  const [picked, setPicked] = useState({});
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  const pick = (qIdx, optIdx) => {
    if (picked[qIdx] !== undefined) return; // lock after answer
    setPicked((prev) => {
      const next = { ...prev, [qIdx]: optIdx };
      if (Object.keys(next).length === module.quiz.length) setQuizDone(true);
      return next;
    });
  };

  const score = module.quiz.filter(
    (q, i) => picked[i] === q.correctIndex
  ).length;

  return (
    <div className="module-block" id={`module-${index + 1}`}>
      {/* ── Module header ── */}
      <div className="module-header">
        <span className="module-number">MODULE {String(index + 1).padStart(2, "0")}</span>
        <div className="module-meta-right">
          <span className="module-duration">⏱ {module.durationMinutes} min</span>
          <span className="module-lessons-count">{module.lessons.length} lesson{module.lessons.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <h2 className="module-title">{module.title}</h2>

      {/* ── Overview / Introduction ── */}
      <div className="module-overview">
        <div className="overview-label">
          <span className="overview-icon">📋</span> Overview &amp; Introduction
        </div>
        <p className="module-summary-text">{module.summary}</p>
        <p className="module-intro-text">
          In this module you will work through {module.lessons.length} lesson
          {module.lessons.length !== 1 ? "s" : ""} covering the key concepts
          above. Complete all lessons before taking the checkpoint quiz at the
          end.
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
            <div className="lesson-card" key={i}>
              <div className="lesson-step">{String(i + 1).padStart(2, "0")}</div>
              <div className="lesson-card-body">
                <div className="lesson-card-top">
                  <span className="lesson-format-badge">
                    {FORMAT_ICONS[lesson.format] || "◆"} {lesson.format}
                  </span>
                </div>
                <p className="lesson-card-title">{lesson.title}</p>
                <p className="lesson-card-summary">{lesson.summary}</p>
              </div>
            </div>
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
          <span>Checkpoint Quiz &nbsp;·&nbsp; {module.quiz.length} question{module.quiz.length !== 1 ? "s" : ""}</span>
          {quizDone && (
            <span className="quiz-score-badge">
              {score}/{module.quiz.length} correct
            </span>
          )}
          <span className="quiz-chevron">{quizOpen ? "▲" : "▼"}</span>
        </button>

        {quizOpen && (
          <div className="quiz-body">
            {module.quiz.map((q, qIdx) => {
              const chosen = picked[qIdx];
              return (
                <div className="quiz-item" key={qIdx}>
                  <p className="quiz-question">
                    <span className="quiz-q-num">Q{qIdx + 1}</span> {q.question}
                  </p>
                  <div className="quiz-options">
                    {q.options.map((opt, optIdx) => {
                      let cls = "quiz-option";
                      if (chosen !== undefined) {
                        if (optIdx === q.correctIndex) cls += " correct";
                        else if (optIdx === chosen) cls += " incorrect";
                      }
                      return (
                        <button
                          type="button"
                          key={optIdx}
                          className={cls}
                          onClick={() => pick(qIdx, optIdx)}
                          disabled={chosen !== undefined}
                        >
                          <span className="opt-letter">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {quizDone && (
              <div className={`quiz-result ${score === module.quiz.length ? "perfect" : score >= module.quiz.length / 2 ? "pass" : "retry"}`}>
                {score === module.quiz.length
                  ? "🎉 Perfect score! Ready to move on."
                  : score >= module.quiz.length / 2
                  ? `✅ ${score}/${module.quiz.length} — Good work! Review any missed answers above.`
                  : `📖 ${score}/${module.quiz.length} — Review the lessons and try again.`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
