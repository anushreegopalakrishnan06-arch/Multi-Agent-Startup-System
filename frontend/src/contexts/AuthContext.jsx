import React, { createContext, useContext, useEffect, useState } from "react";
import { authLogin, authSignup, authGoogle, authMe, updateProfile as apiUpdateProfile } from "../services/api";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  async function signup(email, password, name) {
    const data = await authSignup(email, password, name);
    localStorage.setItem("jwt_token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setCurrentUser(data.user);
    return data.user;
  }

  async function login(email, password) {
    const data = await authLogin(email, password);
    localStorage.setItem("jwt_token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setCurrentUser(data.user);
    return data.user;
  }

  async function loginWithGoogle(googleAccessToken) {
    // Send the raw Google access token to our backend for server-side verification
    const data = await authGoogle(googleAccessToken);
    localStorage.setItem("jwt_token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setCurrentUser(data.user);
    return data.user;
  }

  async function logout() {
    setCurrentUser(null);
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user");
  }

  async function resetPassword(email) {
    // TODO: Implement password reset endpoint on backend
    // For now, this is a stub — flagged as not yet implemented
    console.warn("Password reset is not yet implemented on the backend.");
    throw new Error("Password reset is not yet available. Please contact support.");
  }

  async function updateProfile(formData) {
    const data = await apiUpdateProfile(formData);
    localStorage.setItem("user", JSON.stringify(data.user));
    setCurrentUser(data.user);
    return data.user;
  }

  const value = {
    currentUser,
    login,
    signup,
    loginWithGoogle,
    logout,
    resetPassword,
    updateProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
