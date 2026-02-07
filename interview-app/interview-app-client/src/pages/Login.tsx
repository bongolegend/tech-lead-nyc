import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/env";

export default function Login() {
  const handleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-[55%] w-full p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-2">Tech Lead NYC</h1>
        <p className="text-gray-600 mb-6">Interview Practice Platform</p>

        <button
          onClick={handleLogin}
          className="max-w-45 bg-black text-white rounded-xl p-4 cursor-pointer"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
