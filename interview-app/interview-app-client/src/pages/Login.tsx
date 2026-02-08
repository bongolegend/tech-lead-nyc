import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import { setStoredToken } from "../auth/token";
import { GOOGLE_CLIENT_ID } from "../config/env";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef<((credential: string) => void) | null>(null);
  callbackRef.current = async (credential: string) => {
    try {
      const { user, token } = await authAPI.googleToken(credential);
      setStoredToken(token);
      setUser(user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Google sign-in failed:", err);
      alert("Sign-in failed. Please try again.");
    }
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !buttonRef.current) return;

    const run = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: { credential: string }) => {
          callbackRef.current?.(response.credential);
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        text: "signin_with",
      });
    };

    if (window.google?.accounts?.id) {
      run();
    } else {
      const id = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(id);
          run();
        }
      }, 100);
      return () => clearInterval(id);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-[55%] w-full p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-2">Tech Lead NYC</h1>
        <p className="text-gray-600 mb-6">Interview Practice Platform</p>

        {GOOGLE_CLIENT_ID ? (
          <div ref={buttonRef} className="flex justify-center" />
        ) : (
          <p className="text-amber-700">
            Set VITE_GOOGLE_CLIENT_ID in .env to enable Sign in with Google.
          </p>
        )}
      </div>
    </div>
  );
}
