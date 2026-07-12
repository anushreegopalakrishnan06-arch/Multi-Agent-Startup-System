import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(storedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <img
            src={
              user.profileImage ||
              user.photo ||
            "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            }
            alt="Profile"
            className="avatar"
          />
          <div className="profile-meta">
            <span className="profile-badge">Profile</span>
            <h2>{user.name || "Your Name"}</h2>
            <p>Manage your account details here.</p>
          </div>
        </div>

        <div className="profile-info">
          <div className="info-item">
            <span>Name</span>
            <strong>{user.name || "N/A"}</strong>
          </div>
          <div className="info-item">
            <span>Email</span>
            <strong>{user.email || "N/A"}</strong>
          </div>
          <div className="info-item">
            <span>Contact</span>
            <strong>{user.contact || "N/A"}</strong>
          </div>
        </div>

        <div className="button-row">
          <button className="action-btn edit-btn" onClick={() => navigate("/edit-profile")}>
            Edit Profile
          </button>
          <button className="action-btn" onClick={() => navigate("/home")}>
            Back to Home
          </button>
          <button className="action-btn logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;