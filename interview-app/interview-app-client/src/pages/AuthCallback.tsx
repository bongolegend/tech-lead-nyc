import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setStoredToken } from "../auth/token";

/**
 * Handles redirect from backend after Google OAuth: ?token=JWT
 * Stores token and redirects to dashboard.
 */
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("No token received");
      return;
    }
    setStoredToken(token);
    navigate("/dashboard", { replace: true });
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <a href="/login" className="text-black underline">
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent mx-auto mb-4" />
        <p>Signing you in...</p>
      </div>
    </div>
  );
}
