import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/MonthlyRoster.css";

const SHIFTS = [
  { key: "M",  label: "Morning",  icon: "🌅", color: "#fff3cd", text: "#856404" },
  { key: "E",  label: "Evening",  icon: "🌆", color: "#d1ecf1", text: "#0c5460" },
  { key: "N",  label: "Night",    icon: "🌙", color: "#cce5ff", text: "#004085" },
  { key: "DO", label: "Day Off",  icon: "✓",  color: "#d4edda", text: "#155724" },
];

function isWeekend(dayIndex) {
  const dow = (dayIndex + 4) % 7;
  return dow === 0 || dow === 6;
}

export default function MonthlyRoster({ nurses, setNurses }) {
  const daysInMonth = 31;
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [shifts, setShifts] = useState({});
  const [popup, setPopup] = useState(null); // { nIdx, dIdx, top, left }

  const popupRef = useRef(null);
  const cellRefs = useRef({});

  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setPopup(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const key = (n, d) => `${n}-${d}`;
  const getShift = (n, d) => shifts[key(n, d)] || null;
  const getMeta = (k) => SHIFTS.find((s) => s.key === k) || null;

  const openPopup = (nIdx, dIdx) => {
    const cell = cellRefs.current[key(nIdx, dIdx)];
    if (!cell) return;
    const r = cell.getBoundingClientRect();
    setPopup({
      nIdx,
      dIdx,
      top: r.bottom + 8,
      left: r.left + r.width / 2,
    });
  };

  const assignShift = (nIdx, dIdx, shiftKey) => {
    setShifts((prev) => ({ ...prev, [key(nIdx, dIdx)]: shiftKey }));
    setPopup(null);
  };

  const clearShift = (nIdx, dIdx) => {
    setShifts((prev) => {
      const next = { ...prev };
      delete next[key(nIdx, dIdx)];
      return next;
    });
    setPopup(null);
  };

  const addNurse = () => {
    if (!firstName || !lastName) return;
    setNurses([...nurses, { firstName, lastName }]);
    setFirstName("");
    setLastName("");
    setShowModal(false);
  };

  return (
    <div className="roster-container">
        
      <div className="roster-header">
        <h2>Monthly Duty Roster – January 2026</h2>
        <div className="roster-actions">
          <button className="btn primary" onClick={() => setShowModal(true)}>+ Add Nurse</button>
          <button className="btn secondary" onClick={() => navigate("/manage")}>Manage Nurses</button>
        </div>
      </div>

      <div className="legend">
        {SHIFTS.map((s) => (
          <div key={s.key} className="legend-item">
            <span className="legend-badge" style={{ background: s.color, color: s.text }}>{s.key}</span>
            <span className="legend-label">{s.label}</span>
          </div>
        ))}
        <div className="legend-item">
          <span className="legend-badge legend-empty">+</span>
          <span className="legend-label">Unassigned</span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="roster-table">
          <thead>
            <tr>
              <th className="sticky-col">Nurse Name</th>
              {[...Array(daysInMonth)].map((_, i) => (
                <th key={i} className={isWeekend(i) ? "weekend-header" : ""}>{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nurses.map((nurse, nIdx) => (
              <tr key={nIdx}>
                <td className="sticky-col nurse-name-cell">
                  {nurse.firstName} {nurse.lastName}
                </td>
                {[...Array(daysInMonth)].map((_, dIdx) => {
                  const shiftKey = getShift(nIdx, dIdx);
                  const meta = getMeta(shiftKey);
                  const isActive = popup && popup.nIdx === nIdx && popup.dIdx === dIdx;
                  return (
                    <td
                      key={dIdx}
                      ref={(el) => (cellRefs.current[key(nIdx, dIdx)] = el)}
                      className={[
                        "shift-cell",
                        isWeekend(dIdx) ? "weekend-cell" : "",
                        isActive ? "cell-active" : "",
                      ].join(" ")}
                      onClick={() => openPopup(nIdx, dIdx)}
                    >
                      {meta ? (
                        <span className="shift-badge" style={{ background: meta.color, color: meta.text }}>
                          {meta.key}
                        </span>
                      ) : (
                        <span className="shift-empty">+</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {popup && (
        <div
          ref={popupRef}
          className="shift-popup"
          style={{ top: popup.top, left: popup.left }}
        >
          <div className="popup-arrow"></div>

          <div className="popup-header">
            <span className="popup-nurse">
              {nurses[popup.nIdx]?.firstName} {nurses[popup.nIdx]?.lastName}
            </span>
            <span className="popup-day">· Day {popup.dIdx + 1}</span>
          </div>

          <div className="popup-list">
            {SHIFTS.map((s) => {
              const current = getShift(popup.nIdx, popup.dIdx);
              const selected = current === s.key;
              return (
                <button
                  key={s.key}
                  className={`popup-btn ${selected ? "selected" : ""}`}
                  style={selected ? { background: s.color, borderColor: s.text } : {}}
                  onClick={() => assignShift(popup.nIdx, popup.dIdx, s.key)}
                >
                  <span className="popup-btn-icon">{s.icon}</span>
                  <span className="popup-btn-text" style={selected ? { color: s.text } : {}}>{s.label}</span>
                  <span className="popup-btn-code" style={{ background: s.color, color: s.text }}>{s.key}</span>
                </button>
              );
            })}
          </div>

          {getShift(popup.nIdx, popup.dIdx) && (
            <button className="popup-clear" onClick={() => clearShift(popup.nIdx, popup.dIdx)}>
              Clear shift
            </button>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Nurse</h3>
            <div className="form-group">
              <label>First Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn primary" onClick={addNurse}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}