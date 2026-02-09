import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import RequireAuth from "./components/RequireAuth";
import Dashboard from "./pages/Dashboard";
import QuestionRubric from "./pages/QuestionRubric";
import { setStoredToken } from "./auth/token";
export default function App() {
  const hash = window.location.hash;

  if (hash.startsWith("#token=")) {
    const token = hash.slice("#token=".length);
    setStoredToken(token);
    window.history.replaceState(null, "", "/");
  }
  
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route
        path="/dashboard/*"
        element={
          <RequireAuth>
            <Dashboard />
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
