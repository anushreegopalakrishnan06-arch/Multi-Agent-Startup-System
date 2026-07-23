import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to log in. Please check your credentials.";
      setError(msg);
    }
    setLoading(false);
  }

  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError("");
        // Send the raw access token to our backend for server-side verification
        await loginWithGoogle(tokenResponse.access_token);
        navigate("/dashboard");
      } catch (err) {
        const msg = err.response?.data?.detail || "Google sign-in failed.";
        setError(msg);
        setLoading(false);
      }
    },
    onError: () => {
      setError("Google Login Failed");
      setLoading(false);
    },
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, var(--color-surface) 0%, var(--color-primary-fixed) 50%, var(--color-surface) 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 120, damping: 14 }}
        className="w-full max-w-md p-8 space-y-8 glass-panel rounded-[24px] shadow-xl"
      >
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-gradient mb-2">NovaVenture AI</h1>
          <h2 className="text-xl font-display font-semibold" style={{ color: "var(--color-primary)" }}>
            Welcome back
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
            Sign in to your Startup Intelligence Dashboard
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm rounded-xl" style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--color-on-surface-variant)" }}>
              Email address
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border transition-all duration-300 outline-none focus:shadow-[0_0_15px_rgba(25,22,35,0.1)]"
              style={{ background: "var(--color-surface-container-low)", borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--color-on-surface-variant)" }}>
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border transition-all duration-300 outline-none focus:shadow-[0_0_15px_rgba(25,22,35,0.1)]"
              style={{ background: "var(--color-surface-container-low)", borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer" style={{ color: "var(--color-on-surface-variant)" }}>
              <input type="checkbox" className="rounded" /> Remember me
            </label>
            <Link to="/forgot-password" className="font-medium hover:underline" style={{ color: "var(--color-surface-tint)" }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full text-sm font-semibold tracking-wide uppercase transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50"
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: "var(--color-outline-variant)" }} />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3" style={{ background: "rgba(255,255,255,0.6)", color: "var(--color-on-surface-variant)" }}>
              Or continue with
            </span>
          </div>
        </div>

        {/* Google */}
        <button
          onClick={() => handleGoogleSignIn()}
          disabled={loading}
          className="w-full py-3 rounded-full border text-sm font-medium flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
          style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <p className="text-center text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
