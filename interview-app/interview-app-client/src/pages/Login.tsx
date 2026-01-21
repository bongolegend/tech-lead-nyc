import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Login() {
  const handleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-2">Tech Lead NYC</h1>
        <p className="text-gray-600 mb-6">Interview Practice Platform</p>

        <button
          onClick={handleLogin}
          className="w-full py-3 bg-black text-white rounded"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
