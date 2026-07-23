import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: "dashboard" },
  { name: "New Analysis", path: "/dashboard/new", icon: "add_circle" },
  { name: "Run History", path: "/dashboard/history", icon: "history" },
  { name: "Settings", path: "/dashboard/settings", icon: "settings" },
];

const bottomItems = [
  { name: "Think Logs", path: "/dashboard/console", icon: "terminal", adminOnly: true },
];

export default function DashboardLayout({ children }) {
  const { logout, currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Failed to log out", err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--color-surface)" }}>
      {/* Sidebar — Desktop */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="hidden lg:flex w-64 flex-col justify-between glass-panel border-r border-white/20 z-40"
      >
        <div>
          {/* Brand */}
          <div className="h-16 flex items-center px-6 border-b border-white/20">
            <h1 className="font-display text-xl font-bold text-gradient">NovaVenture AI</h1>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1 p-4 mt-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive(item.path)
                    ? "bg-primary-container/80 text-on-primary-container font-bold shadow-[0_0_15px_rgba(25,22,35,0.1)]"
                    : "text-on-surface-variant hover:bg-surface-container-high/50 hover:translate-x-1"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="text-sm tracking-wide uppercase font-semibold">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-2 p-4 border-t border-white/20">
          {/* New Analysis CTA */}
          <button
            onClick={() => navigate("/dashboard/new")}
            className="w-full py-3 rounded-xl text-sm font-semibold tracking-wide uppercase transition-all duration-300 hover:opacity-90"
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
          >
            New Analysis
          </button>

          {bottomItems.map((item) => {
            if (item.adminOnly && !currentUser?.is_admin) return null;
            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span className="text-xs tracking-widest uppercase font-semibold">{item.name}</span>
              </Link>
            );
          })}

          {/* User info */}
          <div className="flex items-center gap-3 px-4 py-3 mt-2 rounded-xl" style={{ background: "var(--color-surface-container-high)" }}>
            {currentUser?.picture ? (
              <img src={currentUser.picture} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-white/20" />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: "var(--color-primary-fixed-dim)", color: "var(--color-primary)" }}
              >
                {currentUser?.name?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--color-on-surface)" }}>
                {currentUser?.name || currentUser?.email || "User"}
              </p>
              {currentUser?.designation && (
                <p className="text-xs opacity-70 truncate">{currentUser.designation}</p>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-2 px-2">
            <div className="flex items-center gap-3 px-2 py-2">
              <span className="text-xs tracking-widest uppercase font-semibold text-on-surface-variant">Theme</span>
              <button
                onClick={toggleTheme}
                className={`flex items-center w-14 h-7 p-1 rounded-full transition-colors border border-white/10 ${
                  theme === "dark" ? "bg-primary-container justify-end" : "bg-surface-container-highest justify-start"
                }`}
              >
                <motion.div
                  layout
                  className="w-5 h-5 rounded-full flex items-center justify-center bg-primary shadow-sm"
                >
                  <span className="material-symbols-outlined text-[12px] text-on-primary">
                    {theme === "dark" ? "dark_mode" : "light_mode"}
                  </span>
                </motion.div>
              </button>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-2 py-2 text-on-surface-variant hover:text-error transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span className="text-xs tracking-widest uppercase font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Top Bar */}
        <header className="lg:hidden h-16 flex items-center justify-between px-4 glass-panel border-b border-white/20 z-30">
          <h1 className="font-display text-lg font-bold text-gradient">NovaVenture AI</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`flex items-center w-12 h-6 p-1 mr-2 rounded-full transition-colors border border-white/10 ${
                theme === "dark" ? "bg-primary-container justify-end" : "bg-surface-container-highest justify-start"
              }`}
            >
              <motion.div
                layout
                className="w-4 h-4 rounded-full flex items-center justify-center bg-primary shadow-sm"
              >
                <span className="material-symbols-outlined text-[10px] text-on-primary">
                  {theme === "dark" ? "dark_mode" : "light_mode"}
                </span>
              </motion.div>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="material-symbols-outlined text-on-surface-variant p-2"
            >
              {mobileMenuOpen ? "close" : "menu"}
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden absolute top-16 left-0 right-0 z-50 glass-panel-high border-b border-white/20 p-4"
            >
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                    isActive(item.path) ? "bg-primary-container/60 text-primary font-bold" : "text-on-surface-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className="text-sm">{item.name}</span>
                </Link>
              ))}
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 text-error w-full mt-2"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                <span className="text-sm">Logout</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
