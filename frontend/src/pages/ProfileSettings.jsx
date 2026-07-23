import React, { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";

export default function ProfileSettings() {
  const { currentUser, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    mobile: currentUser?.mobile || "",
    company: currentUser?.company || "",
    designation: currentUser?.designation || "",
    country: currentUser?.country || "",
    timezone: currentUser?.timezone || "",
  });

  const [picture, setPicture] = useState(null);
  const [preview, setPreview] = useState(currentUser?.picture || null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPicture(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      if (picture) {
        data.append("picture", picture);
      }

      await updateProfile(data);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 rounded-2xl border border-white/10"
        style={{ background: "var(--color-surface-container)" }}
      >
        <h2 className="text-2xl font-display font-bold mb-6 text-on-surface">Profile Settings</h2>
        
        {message && (
          <div className={`p-4 mb-6 rounded-xl ${message.type === "success" ? "bg-green-500/20 text-green-200 border border-green-500/30" : "bg-red-500/20 text-red-200 border border-red-500/30"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/10">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
              {preview ? (
                <img src={preview} alt="Profile Preview" className="w-24 h-24 rounded-full object-cover border-2 border-primary/50 shadow-lg" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center border-2 border-dashed border-white/20 group-hover:border-primary/50 transition-colors">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant">add_a_photo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="material-symbols-outlined text-white">edit</span>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold text-on-surface">Profile Picture</h3>
              <p className="text-sm text-on-surface-variant mb-2">JPG, GIF or PNG. Max size of 5MB</p>
              <button type="button" onClick={() => fileInputRef.current.click()} className="text-sm text-primary font-medium hover:underline">
                Upload new picture
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-highest border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-on-surface transition-all"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 rounded-xl bg-surface-container-highest/50 border border-white/5 text-on-surface-variant cursor-not-allowed"
                placeholder="john@example.com"
              />
              <p className="text-xs text-on-surface-variant mt-1">Email cannot be changed.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-highest border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-on-surface transition-all"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Company / Startup Name</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-highest border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-on-surface transition-all"
                placeholder="NovaVenture AI"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Designation</label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-surface-container-highest border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-on-surface transition-all"
              placeholder="Founder, Student, Entrepreneur..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-highest border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-on-surface transition-all"
                placeholder="United States"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Time Zone</label>
              <input
                type="text"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-highest border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-on-surface transition-all"
                placeholder="EST (UTC-5)"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-primary text-on-primary font-bold tracking-wide shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
