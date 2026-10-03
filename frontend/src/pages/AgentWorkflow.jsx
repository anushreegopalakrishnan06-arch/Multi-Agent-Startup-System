import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { runTrendAgent, runBusinessDiscovery, runFinancialAgent, runValidationAgent, saveReport, getWsUrl } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";

export default function AgentWorkflow() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const inputs = location.state?.inputs || { industry: "Technology", budget: "100000" };

  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState({});
  const logsEndRef = useRef(null);

  // WebSocket for live logs
  useEffect(() => {
    if (!currentUser?.is_admin) return;
    const ws = new WebSocket(getWsUrl("/api/ws/logs"));
    ws.onmessage = (event) => setLogs((prev) => [...prev, event.data]);
    return () => ws.close();
  }, [currentUser]);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Execute pipeline
  const hasRun = useRef(false);
  
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    async function runPipeline() {
      try {
        setCurrentStep(1);
        const trend = await runTrendAgent();
        setResults((r) => ({ ...r, trend: trend.data }));

        setCurrentStep(2);
        const disc = await runBusinessDiscovery(inputs);
        setResults((r) => ({ ...r, discovery: disc.data }));

        setCurrentStep(3);
        const fin = await runFinancialAgent(disc);
        setResults((r) => ({ ...r, financial: fin.data }));

        setCurrentStep(4);
        const val = await runValidationAgent(fin);
        setResults((r) => ({ ...r, validation: val.data }));

        setCurrentStep(5); // Complete

        // Save report to MongoDB
        const saveRes = await saveReport({
          industry: inputs.industry,
          budget: inputs.budget,
          trend_data: trend.data,
          discovery_data: disc.data,
          financial_data: fin.data,
          validation_data: val.data,
        });

        // Navigate to real report
        if (saveRes.report_id) {
          setTimeout(() => navigate(`/dashboard/report/${saveRes.report_id}`), 1000);
        }

      } catch (err) {
        setLogs((prev) => [...prev, `\n\nERROR: ${err.message}`]);
        setCurrentStep(-1);
      }
    }
    runPipeline();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const steps = ["Initializing", "Trend Analysis", "Business Discovery", "Financial Forecast", "Validation", "Complete"];

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6">
      {/* Pipeline Status */}
      <div className="w-64 shrink-0 flex flex-col gap-4">
        {steps.map((s, i) => (
          <div key={i} className={`p-4 rounded-xl flex items-center gap-3 transition-all ${
            currentStep === i ? "bg-primary-container text-primary font-bold shadow-md" :
            currentStep > i ? "bg-surface-container text-emerald-600" :
            "bg-surface-container-low text-on-surface-variant opacity-50"
          }`}>
            <span className="material-symbols-outlined">
              {currentStep > i ? "check_circle" : currentStep === i ? "progress_activity" : "radio_button_unchecked"}
            </span>
            <span className="text-sm">{s}</span>
          </div>
        ))}
      </div>

      {/* Live Logs or Waiting Screen */}
      {currentUser?.is_admin ? (
        <div className="flex-1 glass-panel rounded-[24px] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-outline-variant bg-surface-container flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">terminal</span>
            <span className="font-semibold text-sm">Agent Live Console</span>
          </div>
          <div className="flex-1 p-6 overflow-y-auto bg-[#1c1b1c] text-[#a9b1d6] font-mono text-xs whitespace-pre-wrap">
            {logs.length === 0 ? "Connecting to agent execution core...\n" : logs.join("")}
            <div ref={logsEndRef} />
          </div>
        </div>
      ) : (
        <div className="flex-1 glass-panel rounded-[24px] flex flex-col items-center justify-center p-8 text-center">
          <span className="material-symbols-outlined text-6xl text-primary animate-spin mb-6">memory</span>
          <h3 className="text-2xl font-display font-bold text-on-surface mb-2">AI Agents at Work</h3>
          <p className="text-on-surface-variant max-w-md">
            Our multi-agent system is currently researching and analyzing your startup idea in the background. Please wait while the comprehensive report is generated...
          </p>
        </div>
      )}
    </div>
  );
}
