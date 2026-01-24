import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type InterviewQuestion = {
  id: number;
  questionText: string;
  category: string | null;
};

const CATEGORY_ORDER = ["behavioral", "systems-design", "coding"];
const ROUTING_URL = "http://localhost:5173";

export default function Dashboard() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    const start = Date.now();

    fetch("http://localhost:3000/dashboard/questions", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data: InterviewQuestion[]) => {
        const sorted = [...data].sort(
          (a, b) =>
            CATEGORY_ORDER.indexOf(a.category ?? "") -
            CATEGORY_ORDER.indexOf(b.category ?? "")
        );

        const elapsed = Date.now() - start;
        const minDelay = 300;

        setTimeout(() => {
          if (cancelled) return;
          setQuestions(sorted);
          setLoading(false);
        }, Math.max(0, minDelay - elapsed));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    questions: questions.filter((q) => q.category === category),
  })).filter((g) => g.questions.length > 0);

  const handleClickRubricButton = () => {
    window.location.href = `${ROUTING_URL}/rubrics`;
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Interview Questions</h1>

      <div className="space-y-8">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          </div>
        )}
        {grouped.length === 0 && !loading ? (
          <div>No questions have been added yet.</div>
        ) : (
          grouped.map((group) => (
            <div key={group.category} className="border-2 border-black">
              <div className="border-b-2 border-black px-4 py-2 font-bold uppercase bg-gray-100">
                {group.category.toUpperCase()}
              </div>

              <div className="mt-2">
                {group.questions.map((q, index) => (
                  <Link
                    key={q.id}
                    to={`/questions/${q.id}/rubric`}
                    className={`block px-4 py-3 hover:bg-gray-100 cursor-pointer ${
                      index !== group.questions.length - 1
                        ? "border-b border-black"
                        : ""
                    }`}
                  >
                    {q.questionText}
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
        <div className="flex justify-end">
          <button
            className="flex max-w-45 bg-black text-white rounded-xl p-4 cursor-pointer"
            type="button"
            onClick={handleClickRubricButton}
          >
            Grading Rubric &gt;&gt;
          </button>
        </div>
      </div>
    </div>
  );
}
