import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../services/api";

type InterviewQuestion = {
  id: number;
  questionText: string;
  category: string | null;
};

const CATEGORY_ORDER = ["behavioral", "systems-design", "coding"];
const AUTH_URL = "https://interview-app-server-831130136724.us-east1.run.app";

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // Onboarding form state
  const [professionalLevel, setProfessionalLevel] = useState<string>("");
  const [hasBeenHiringManager, setHasBeenHiringManager] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    const start = Date.now();

    fetch(`${AUTH_URL}/dashboard/questions`, {
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

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !professionalLevel || hasBeenHiringManager === null) return;

    setSubmitting(true);
    try {
      const updatedUser = await userAPI.updateProfile(user.email, {
        professionalLevel,
        hasBeenHiringManager,
      });
      setUser(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    questions: questions.filter((q) => q.category === category),
  })).filter((g) => g.questions.length > 0);

  return (
    <div className="p-8">
      {user && !user.profileCompleted && (
        <div className="p-8 max-w-2xl mx-auto mb-8">
          <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
  
          <form onSubmit={handleOnboardingSubmit} className="space-y-6 border-2 border-black p-6">
            <div>
              <label className="block text-lg font-semibold mb-2">
                What is your experience level?
              </label>
              <select
                value={professionalLevel}
                onChange={(e) => setProfessionalLevel(e.target.value)}
                required
                className="w-full border-2 border-black p-2 text-lg"
              >
                <option value="">Select your experience level</option>
                <option value="Student">Student</option>
                <option value="Junior">Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
              </select>
            </div>
  
            <div>
              <label className="block text-lg font-semibold mb-2">
                Have you been a hiring manager?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hiringManager"
                    checked={hasBeenHiringManager === true}
                    onChange={() => setHasBeenHiringManager(true)}
                    className="w-4 h-4"
                  />
                  <span className="text-lg">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hiringManager"
                    checked={hasBeenHiringManager === false}
                    onChange={() => setHasBeenHiringManager(false)}
                    className="w-4 h-4"
                  />
                  <span className="text-lg">No</span>
                </label>
              </div>
            </div>
  
            <button
              type="submit"
              disabled={submitting || !professionalLevel || hasBeenHiringManager === null}
              className="bg-black text-white px-6 py-3 rounded-lg cursor-pointer text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      )}
  
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
  
              <div>
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
      </div>
    </div>
  );
}  
