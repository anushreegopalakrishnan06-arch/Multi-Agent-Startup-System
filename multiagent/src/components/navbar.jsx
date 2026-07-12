import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  return (
    <nav className="navbar">

      <div className="logo">
        🚀 Startup Intelligence
      </div>

      <ul className="nav-links">
        <li>
          <NavLink
            to="/home"
            className={({ isActive }) => isActive ? "active" : ""}
          >
            Home
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/validation"
            className={({ isActive }) => isActive ? "active" : ""}
          >
            Validation Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/profile"
            className={({ isActive }) => isActive ? "active" : ""}
          >
            Profile
          </NavLink>
        </li>
      </ul>

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>

    </nav>
  );
}

export default Navbar;