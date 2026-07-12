import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../services/api";
import "./Login.css";

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim() || !contact.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const res = await API.post("/signup", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        contact: contact.trim(),
        photo: "",
      });

      if (res.data.message !== "Signup successful") {
        setError(res.data.message || "Signup failed.");
        return;
      }

      navigate("/login");
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
        <h1>Sign Up</h1>
        <p>Register with your own details.</p>

        <form className="auth-form" onSubmit={handleSignup}>
          <input
            className="auth-input"
            type="text"
            placeholder="Full name"
            value={name}
            autoComplete="name"
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
          />

          <input
            className="auth-input"
            type="email"
            placeholder="Email address"
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
            placeholder="Create password"
            value={password}
            autoComplete="new-password"
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />

          <input
            className="auth-input"
            type="text"
            placeholder="Contact number"
            value={contact}
            autoComplete="tel"
            onChange={(e) => {
              setContact(e.target.value);
              setError("");
            }}
          />

          {error ? <span className="auth-error">{error}</span> : null}

          <button className="auth-button" type="submit">
            Sign Up
          </button>
        </form>

        <p className="auth-link-row">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;