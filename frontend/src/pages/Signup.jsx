import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match");
    try {
      setError("");
      setLoading(true);
      await signup(email, password, name);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to create account.";
      setError(msg);
    }
    setLoading(false);
  }

  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        await loginWithGoogle(tokenResponse.access_token);
        navigate("/dashboard");
      } catch (err) {
        setError(err.response?.data?.detail || "Google sign-up failed.");
        setLoading(false);
      }
    },
    onError: () => { setError("Google Sign up Failed"); setLoading(false); },
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, var(--color-surface) 0%, var(--color-agent-discovery) 50%, var(--color-surface) 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 120, damping: 14 }}
        className="w-full max-w-md p-8 space-y-6 glass-panel rounded-[24px] shadow-xl"
      >
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold" style={{ color: "var(--color-primary)" }}>Create an account</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--color-on-surface-variant)" }}>Start your AI Startup Intelligence journey</p>
        </div>

        {error && (
          <div className="p-3 text-sm rounded-xl" style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)" }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Name</label>
            <input type="text" className="w-full px-4 py-3 rounded-xl border outline-none transition-all" style={{ background: "var(--color-surface-container-low)", borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
              value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Email</label>
            <input type="email" required className="w-full px-4 py-3 rounded-xl border outline-none transition-all" style={{ background: "var(--color-surface-container-low)", borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
              value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Password</label>
            <input type="password" required className="w-full px-4 py-3 rounded-xl border outline-none transition-all" style={{ background: "var(--color-surface-container-low)", borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
              value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Confirm Password</label>
            <input type="password" required className="w-full px-4 py-3 rounded-xl border outline-none transition-all" style={{ background: "var(--color-surface-container-low)", borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-full text-sm font-semibold tracking-wide uppercase transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50"
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: "var(--color-outline-variant)" }} /></div>
          <div className="relative flex justify-center text-xs"><span className="px-3" style={{ background: "rgba(255,255,255,0.6)", color: "var(--color-on-surface-variant)" }}>Or continue with</span></div>
        </div>

        <button onClick={() => handleGoogleSignIn()} disabled={loading}
          className="w-full py-3 rounded-full border text-sm font-medium flex items-center justify-center gap-3 transition-all hover:scale-[1.02] disabled:opacity-50"
          style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface)" }}>
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google
        </button>

        <p className="text-center text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
          Already have an account? <Link to="/login" className="font-semibold hover:underline" style={{ color: "var(--color-primary)" }}>Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}
