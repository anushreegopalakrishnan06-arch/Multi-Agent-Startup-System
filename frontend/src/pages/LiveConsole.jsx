import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function LiveConsole() {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  if (!currentUser?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    const ws = new WebSocket(`ws://localhost:8000/api/ws/logs?token=${token}`);
    ws.onmessage = (event) => setLogs((prev) => [...prev, event.data]);
    return () => ws.close();
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="h-full flex flex-col p-6 max-w-6xl mx-auto w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-on-surface">Live Console</h2>
          <p className="text-on-surface-variant mt-2">
            Secure global terminal view for active Agent operations. Admin access only.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Connected
        </div>
      </div>

      <div className="flex-1 rounded-[24px] overflow-hidden flex flex-col bg-[#0d0d0d] border border-white/10 shadow-2xl">
        <div className="p-3 bg-[#1a1a1a] border-b border-white/10 flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
          </div>
          <span className="text-xs font-mono text-gray-500">root@nova-venture-ai:~</span>
        </div>
        <div className="flex-1 p-6 overflow-y-auto text-[#00ff00] font-mono text-sm whitespace-pre-wrap">
          {logs.length === 0 ? "Listening for backend activity...\n" : logs.join("")}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
