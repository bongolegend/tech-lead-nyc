import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import type { InterviewQuestion, RubricTemplate } from "../types/types";

type DraftState = {
  interviewerEmail: string;
  intervieweeEmail: string;
  rows: {
    [templateId: number]: { points: number | null };
  };
};

export default function QuestionRubric() {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<InterviewQuestion | null>(null);
  const [draft, setDraft] = useState<DraftState>({
    interviewerEmail: "",
    intervieweeEmail: "",
    rows: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const storageKey = questionId ? `rubric-draft-question-${questionId}` : null;
  const isFirstPersist = useRef(true);

  /* load draft from localStorage */
  useEffect(() => {
    if (!storageKey) return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setDraft(JSON.parse(saved));
      } catch (_) {}
    }
  }, [storageKey]);

  /* persist draft to localStorage (skip first run to avoid overwriting with empty on mount) */
  useEffect(() => {
    if (!storageKey) return;
    if (isFirstPersist.current) {
      isFirstPersist.current = false;
      return;
    }
    localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [storageKey, draft]);

  /* fetch question with rubric templates */
  useEffect(() => {
    if (!questionId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get<InterviewQuestion>(`/dashboard/questions/${questionId}`)
      .then(({ data }) => {
        if (cancelled) return;
        setQuestion(data);
        setDraft((prev) => {
          const rows = { ...prev.rows };
          (data.rubricTemplates ?? []).forEach((t) => {
            if (!(t.id in rows)) rows[t.id] = { points: null };
          });
          return { ...prev, rows };
        });
      })
      .catch((e) => {
        if (!cancelled) setError(e.response?.status === 404 ? "Question not found" : "Failed to load question");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [questionId]);

  const updateScore = (templateId: number, value: number) => {
    setDraft((d) => ({
      ...d,
      rows: {
        ...d.rows,
        [templateId]: { ...d.rows[templateId], points: value },
      },
    }));
  };

  const submit = async () => {
    setSubmitError(null);
    try {
      await api.post("/rubrics", {
        sessionId: null,
        interviewerEmail: draft.interviewerEmail || null,
        intervieweeEmail: draft.intervieweeEmail || null,
        rubricData: draft.rows,
        completed: true,
      });

      if (storageKey) localStorage.removeItem(storageKey);
      alert("Rubric submitted");
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { error?: string }; status?: number } })?.response?.data?.error
        ?? "Failed to submit rubric";
      setSubmitError(msg);
    }
  };

  const handleBack = () => navigate("/dashboard");

  const rubrics: RubricTemplate[] = question?.rubricTemplates ?? [];
  const canGrade = rubrics.length > 0;

  if (loading) {
    return (
      <div className="p-8 flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="p-8 space-y-4">
        <p className="text-red-600">{error || "Question not found"}</p>
        <button
          className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer"
          onClick={handleBack}
        >
          ← Back to Questions
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Rubric for Question</h1>

      <div className="border-2 border-black p-4 bg-gray-50">
        <p className="text-sm uppercase text-gray-600">
          {question.category || "Uncategorized"}
        </p>
        <p className="mt-1">{question.questionText}</p>
      </div>

      {submitError && (
        <p className="text-red-600" role="alert">{submitError}</p>
      )}

      {canGrade && (
        <div className="flex flex-col gap-4 md:flex-row">
          <input
            className="border p-2 flex-1 min-w-0"
            placeholder="Interviewer email"
            value={draft.interviewerEmail}
            onChange={(e) =>
              setDraft((d) => ({ ...d, interviewerEmail: e.target.value }))
            }
          />
          <input
            className="border p-2 flex-1 min-w-0"
            placeholder="Interviewee email"
            value={draft.intervieweeEmail}
            onChange={(e) =>
              setDraft((d) => ({ ...d, intervieweeEmail: e.target.value }))
            }
          />
        </div>
      )}

      {!canGrade ? (
        <p className="text-gray-600">No rubric has been assigned to this question yet.</p>
      ) : (
        <div className="border-2 border-black overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-left">Criteria</th>
                <th className="border border-black p-2 text-left">Developing</th>
                <th className="border border-black p-2 text-left">Proficient</th>
                <th className="border border-black p-2 text-left">Exceptional</th>
                <th className="border border-black p-2 text-left">Max</th>
                <th className="border border-black p-2 text-left">Score</th>
              </tr>
            </thead>
            <tbody>
              {rubrics.map((r) => (
                <tr key={r.id}>
                  <td className="border border-black p-2">{r.criteria}</td>
                  <td className="border border-black p-2">{r.developing}</td>
                  <td className="border border-black p-2">{r.proficient}</td>
                  <td className="border border-black p-2">{r.exceptional}</td>
                  <td className="border border-black p-2">{r.maxPoints}</td>
                  <td className="border border-black p-2 text-center">
                    <select
                      value={draft.rows[r.id]?.points ?? ""}
                      onChange={(e) =>
                        updateScore(r.id, Number(e.target.value))
                      }
                    >
                      <option value="">—</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between">
        <button
          className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer"
          onClick={handleBack}
        >
          ← Back to Questions
        </button>
        {canGrade && (
          <button
            className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer"
            onClick={submit}
          >
            Submit rubric
          </button>
        )}
      </div>
    </div>
  );
}
