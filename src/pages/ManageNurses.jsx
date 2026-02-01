import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/ManageNurses.css";

export default function ManageNurses({ nurses, onRemoveNurse }) {
  const navigate = useNavigate();

  const getInitials = (firstName, lastName) => {
    return (firstName[0] + lastName[0]).toUpperCase();
  };

  // Cycle through a palette of accent colors based on index
  const accentColors = [
    { bg: "#e3f2fd", accent: "#1976d2", shadow: "rgba(25,118,210,0.18)" },
    { bg: "#fce4ec", accent: "#e91e63", shadow: "rgba(233,30,99,0.18)" },
    { bg: "#e8f5e9", accent: "#4caf50", shadow: "rgba(76,175,80,0.18)" },
    { bg: "#fff3e0", accent: "#ff9800", shadow: "rgba(255,152,0,0.18)" },
    { bg: "#ede7f6", accent: "#673ab7", shadow: "rgba(103,58,183,0.18)" },
    { bg: "#e0f7fa", accent: "#00bcd4", shadow: "rgba(0,188,212,0.18)" },
  ];

  return (
    <div className="manage-container">
      {/* Header */}
      <div className="manage-header">
        <div className="manage-header-left">
          <button className="btn-back" onClick={() => navigate("/")}>
            ← Back to Roster
          </button>
          <h2>Manage Nurses</h2>
          <span className="nurse-count">{nurses.length} nurse{nurses.length !== 1 ? "s" : ""} on roster</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="cards-grid">
        {nurses.map((nurse, index) => {
          const color = accentColors[index % accentColors.length];
          return (
            <div
              key={index}
              className="nurse-card"
              style={{ "--card-shadow": color.shadow }}
            >
              {/* Avatar */}
              <div
                className="card-avatar"
                style={{ background: color.bg, color: color.accent }}
              >
                {getInitials(nurse.firstName, nurse.lastName)}
              </div>

              {/* Info */}
              <div className="card-info">
                <h3 className="card-name" style={{ color: color.accent }}>
                  {nurse.firstName} {nurse.lastName}
                </h3>
                <p className="card-id">ID #{String(index + 1).padStart(4, "0")}</p>
                <div className="card-status">
                  <span className="status-dot"></span>
                  Active
                </div>
              </div>

              {/* Actions */}
              <div className="card-actions">
                <button
                  className="btn-card btn-card-remove"
                  onClick={() => onRemoveNurse(index)}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {nurses.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>No nurses on the roster yet.</p>
            <span>Go back to the roster and add nurses using the "+ Add Nurse" button.</span>
          </div>
        )}
      </div>
    </div>
  );
}