import React, { useState } from "react";
import "../css/MonthlyRoster.css";

export default function MonthlyRoster() {
  const daysInMonth = 31;

  const [showModal, setShowModal] = useState(false);
  const [nurses, setNurses] = useState([
    { firstName: "Nurse", lastName: "A" },
    { firstName: "Nurse", lastName: "B" },
  ]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const addNurse = () => {
    if (!firstName || !lastName) return;

    setNurses([...nurses, { firstName, lastName }]);
    setFirstName("");
    setLastName("");
    setShowModal(false);
  };

  return (
    <div className="roster-container">
      {/* Header */}
      <div className="roster-header">
        <h2>Monthly Duty Roster – January 2026</h2>

        <div className="roster-actions">
          <button className="btn primary" onClick={() => setShowModal(true)}>
            + Add Nurse
          </button>
          <button className="btn secondary">Manage Nurses</button>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="roster-table">
          <thead>
            <tr>
              <th className="sticky-col">Nurse Name</th>
              {[...Array(daysInMonth)].map((_, i) => (
                <th key={i}>{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nurses.map((nurse, index) => (
              <tr key={index}>
                <td className="sticky-col">
                  {nurse.firstName} {nurse.lastName}
                </td>
                {[...Array(daysInMonth)].map((_, i) => (
                  <td key={i} className="shift-cell">OFF</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Nurse</h3>

            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn primary" onClick={addNurse}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
