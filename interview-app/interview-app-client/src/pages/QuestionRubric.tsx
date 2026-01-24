import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { InterviewQuestion, RubricTemplate } from "../types/types";

const API_BASE = "http://localhost:3000";

export default function QuestionRubric() {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<InterviewQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!questionId) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/dashboard/questions/${questionId}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("Question not found");
          throw new Error("Failed to load question");
        }
        return res.json();
      })
      .then((data: InterviewQuestion) => {
        if (!cancelled) {
          setQuestion(data);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Something went wrong");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [questionId]);

  const handleBack = () => navigate("/dashboard");

  const rubrics: RubricTemplate[] = question?.rubricTemplates ?? [];

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

      {rubrics.length === 0 ? (
        <p className="text-gray-600">No rubric has been assigned to this question yet.</p>
      ) : (
        <div className="border-2 border-black overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-left">Criteria</th>
                <th className="border border-black p-2 text-left">Developing</th>
                <th className="border border-black p-2 text-left">Proficient</th>
                <th className="border border-black p-2 text-left">Exceptional</th>
                <th className="border border-black p-2 text-left">Max</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer"
        onClick={handleBack}
      >
        ← Back to Questions
      </button>
    </div>
  );
}
