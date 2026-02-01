import React from "react";
import "../css/Home.css";

export default function Home() {
  return (
    <div className="home-container">
      <nav className="navbar">
        <h2 className="logo">MediRoster</h2>
        <div className="nav-links">
          <button className="nav-btn">Login</button>
          <button className="nav-btn outline">Register</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1>
            Smart Nurse Duty <span>Roster Management</span>
          </h1>
          <p>
            Easily create, manage, and optimize nurse duty schedules with a
            modern and reliable system.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">Get Started</button>
            <button className="secondary-btn">View Demo</button>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2966/2966327.png"
            alt="Nurse Illustration"
          />
        </div>
      </section>
    </div>
  );
}
