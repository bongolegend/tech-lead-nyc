import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { GradingRubric as Rubric } from "../types/types";

type DraftState = {
  interviewerEmail: string;
  intervieweeEmail: string;
  rows: {
    [templateId: number]: {
      q1Points: number | null;
      q2Points: number | null;
    };
  };
};

const STORAGE_KEY = "rubric-draft";
const ROUTING_URL = "http://localhost:5173";

export default function GradingRubric() {
  const { sessionId } = useParams<{ sessionId?: string }>();

  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [draft, setDraft] = useState<DraftState>({
    interviewerEmail: "",
    intervieweeEmail: "",
    rows: {},
  });
  const [loading, setLoading] = useState(true);

  /* load draft */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setDraft(JSON.parse(saved));
  }, []);

  /* persist draft */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  /* fetch templates only */
  useEffect(() => {
    const run = async () => {
      const res = await api.get("/rubrics/templates");

      setRubrics(res.data);

      setDraft((d) => {
        const rows = { ...d.rows };
        res.data.forEach((t: any) => {
          if (!rows[t.id]) {
            rows[t.id] = { q1Points: null, q2Points: null };
          }
        });
        return { ...d, rows };
      });

      setLoading(false);
    };

    run();
  }, []);

  const updateScore = (
    templateId: number,
    field: "q1Points" | "q2Points",
    value: number
  ) => {
    setDraft((d) => ({
      ...d,
      rows: {
        ...d.rows,
        [templateId]: {
          ...d.rows[templateId],
          [field]: value,
        },
      },
    }));
  };

  const submit = async () => {
    await api.post("/rubrics", {
      sessionId: sessionId ? Number(sessionId) : null,
      interviewerEmail: draft.interviewerEmail || null,
      intervieweeEmail: draft.intervieweeEmail || null,
      rubricData: draft.rows,
      completed: true,
    });

    localStorage.removeItem(STORAGE_KEY);
    alert("Rubric submitted");
  };

  const handleBackNav = () => {
    window.location.href = `${ROUTING_URL}/dashboard`;
  };

  if (loading) return <div className="p-8">Loading…</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Grading Rubric</h1>

      <div className="flex gap-4">
        <input
          className="border p-2 flex-1"
          placeholder="Interviewer email"
          value={draft.interviewerEmail}
          onChange={(e) =>
            setDraft((d) => ({ ...d, interviewerEmail: e.target.value }))
          }
        />
        <input
          className="border p-2 flex-1"
          placeholder="Interviewee email"
          value={draft.intervieweeEmail}
          onChange={(e) =>
            setDraft((d) => ({ ...d, intervieweeEmail: e.target.value }))
          }
        />
      </div>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Criteria</th>
            <th className="border p-2">Developing</th>
            <th className="border p-2">Proficient</th>
            <th className="border p-2">Exceptional</th>
            <th className="border p-2">Q1</th>
            <th className="border p-2">Q2</th>
          </tr>
        </thead>
        <tbody>
          {rubrics.map((r: any) => (
            <tr key={r.id}>
              <td className="border p-2">{r.criteria}</td>
              <td className="border p-2">{r.developing}</td>
              <td className="border p-2">{r.proficient}</td>
              <td className="border p-2">{r.exceptional}</td>
              <td className="border p-2 text-center">
                <select
                  value={draft.rows[r.id]?.q1Points ?? ""}
                  onChange={(e) =>
                    updateScore(r.id, "q1Points", Number(e.target.value))
                  }
                >
                  <option value="">—</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </td>
              <td className="border p-2 text-center">
                <select
                  value={draft.rows[r.id]?.q2Points ?? ""}
                  onChange={(e) =>
                    updateScore(r.id, "q2Points", Number(e.target.value))
                  }
                >
                  <option value="">—</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between">
        <button
          className="bg-black text-white px-4 py-2 cursor-pointer rounded-lg"
          onClick={handleBackNav}
        >
          &lt;&lt; Back to Questions
        </button>

        <button
          className="bg-black text-white px-4 py-2 cursor-pointer rounded-lg"
          onClick={submit}
        >
          Submit rubric
        </button>
      </div>
    </div>
  );
}
