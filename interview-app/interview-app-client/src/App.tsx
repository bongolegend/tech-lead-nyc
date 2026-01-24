import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RequireAuth from "./components/RequireAuth";
import Dashboard from "./pages/Dashboard";
import GradingRubric from "./pages/GradingRubric";
import QuestionRubric from "./pages/QuestionRubric";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard/*"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/rubrics"
        element={
          <RequireAuth>
            <GradingRubric />
          </RequireAuth>
        }
      />

      <Route
        path="/rubrics/:sessionId"
        element={
          <RequireAuth>
            <GradingRubric />
          </RequireAuth>
        }
      />
      <Route
        path="/questions/:questionId/rubric"
        element={
          <RequireAuth>
            <QuestionRubric />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
