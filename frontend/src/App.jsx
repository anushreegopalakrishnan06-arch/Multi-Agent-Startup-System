import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import { ThemeProvider } from "./contexts/ThemeContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NewAnalysis from "./pages/NewAnalysis";
import AgentWorkflow from "./pages/AgentWorkflow";
import Report from "./pages/Report";
import ProfileSettings from "./pages/ProfileSettings";
import RunHistory from "./pages/RunHistory";
import LiveConsole from "./pages/LiveConsole";

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="new" element={<NewAnalysis />} />
                  <Route path="workflow" element={<AgentWorkflow />} />
                  <Route path="report/:id" element={<Report />} />
                  <Route path="settings" element={<ProfileSettings />} />
                  <Route path="history" element={<RunHistory />} />
                  <Route path="console" element={<LiveConsole />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </ThemeProvider>
  );
}
