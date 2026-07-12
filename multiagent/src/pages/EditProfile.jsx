import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";

function EditProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    contact: "",
    photo: "",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser") || "null");

    if (!storedUser) {
      navigate("/");
      return;
    }

    setProfile({
      name: storedUser.name || "",
      email: storedUser.email || "",
      contact: storedUser.contact || "",
      photo: storedUser.photo || "",
    });
  }, [navigate]);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfile((prev) => ({
        ...prev,
        photo: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    const currentUser =
      JSON.parse(localStorage.getItem("currentUser")) || {};

    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const updatedUser = {
      ...currentUser,
      name: profile.name,
      email: profile.email,
      contact: profile.contact,
      photo: profile.photo,
    };

    const updatedUsers = users.map((user) =>
      user.email === currentUser.email ? updatedUser : user
    );

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    alert("Profile Updated Successfully!");
    navigate("/profile");
  };

  return (
    <div className="edit-page">
      <div className="edit-card">
        <h2>Edit Profile</h2>
        <p>Update your profile details.</p>

        <form className="edit-form" onSubmit={handleUpdate}>
          <div className="photo-upload">
            <label>Profile Photo</label>

            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </div>

          {profile.photo && (
            <div className="image-preview">
              <img src={profile.photo} alt="Preview" />
            </div>
          )}

          <input
            type="text"
            name="name"
            placeholder="Name"
            value={profile.name}
            onChange={handleChange}
            className="edit-input"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={profile.email}
            onChange={handleChange}
            className="edit-input"
          />

          <input
            type="text"
            name="contact"
            placeholder="Contact"
            value={profile.contact}
            onChange={handleChange}
            className="edit-input"
          />

          <button className="edit-button" type="submit">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;