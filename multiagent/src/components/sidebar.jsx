import React, { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaHome, FaChartBar } from "react-icons/fa";
import "./sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch {
      return null;
    }
  }, []);

  const links = [
    {
      to: "/home",
      label: "Home",
      icon: <FaHome />,
    },
    {
      to: "/validation",
      label: "Validation Dashboard",
      icon: <FaChartBar />,
    },
  ];

  const userName = user?.name || user?.email || "Profile";
  const profileImage = user?.profileImage || "";

  return (
    <aside className="sidebar">

      <nav className="sidebar-nav">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div
        className="sidebar-footer"
        onClick={() => navigate("/profile")}
      >
        <div className="sidebar-avatar">
          {profileImage ? (
            <img src={profileImage} alt="Profile" />
          ) : (
            userName.charAt(0).toUpperCase()
          )}
        </div>

        <div className="sidebar-footer-text">
          <strong>{userName}</strong>
          <span>View Profile</span>
        </div>
      </div>

    </aside>
  );
}

export default Sidebar;