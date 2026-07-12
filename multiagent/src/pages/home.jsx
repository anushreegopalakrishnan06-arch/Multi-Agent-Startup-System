import React from "react";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";

function Home() {
  return (
    <>
      <Navbar />
      <div className="home-layout">
        <Sidebar />
        <main className="home-main">
          <h1>Home Page</h1>
          <p>Welcome back. Use the sidebar to navigate to your validation dashboard and profile.</p>
        </main>
      </div>
    </>
  );
}

export default Home;