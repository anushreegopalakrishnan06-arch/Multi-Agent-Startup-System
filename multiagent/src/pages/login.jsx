import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import API from "../services/api";
import "./Login.css";

const DEFAULT_GOOGLE_CLIENT_ID = "515200155407-rikmhg884io1ekr1k7p64346bcfoelqm.apps.googleusercontent.com";

const decodeGoogleJwtPayload = (credential) => {
  const payload = credential.split(".")[1];
  if (!payload) {
    throw new Error("Google credential payload is missing.");
  }

  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const decoded = decodeURIComponent(
    atob(padded)
      .split("")
      .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join("")
  );

  return JSON.parse(decoded);
};

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID).trim();

  const handleGoogleSuccess = (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError("Google sign-in was canceled.");
      return;
    }

    try {
      const tokenPayload = decodeGoogleJwtPayload(credentialResponse.credential);
      const googleUser = {
        id: tokenPayload.sub,
        name: tokenPayload.name || tokenPayload.given_name || "Google User",
        email: tokenPayload.email,
        photo: tokenPayload.picture || "",
        contact: "",
      };

      localStorage.setItem("currentUser", JSON.stringify(googleUser));
      navigate("/home");
    } catch (error) {
      console.error("Google sign-in payload decode failed", error);
      setError("Google sign-in failed while parsing the response.");
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in failed. Please try again.");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      const res = await API.post("/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.data.message !== "Login successful") {
        setError(res.data.message || "Login failed.");
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(res.data.user));
      navigate("/home");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message || "Unable to connect to the server."
        : "Unable to connect to the server.";
      setError(message);
      console.error(err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <h1>Welcome Back</h1>
        <p>Sign in to manage your profile.</p>

        <form className="auth-form" onSubmit={handleLogin}>
          <input
            className="auth-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            autoComplete="email"
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Enter your password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />

          {error ? <span className="auth-error">{error}</span> : null}

          <button className="auth-button" type="submit">
            Login
          </button>

          <GoogleOAuthProvider clientId={googleClientId}>
            <div className="auth-google-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                text="continue_with"
                shape="rectangular"
                size="large"
                locale="en"
              />
            </div>
          </GoogleOAuthProvider>
        </form>

        <p className="auth-link-row">
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;