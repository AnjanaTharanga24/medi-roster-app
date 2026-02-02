import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../css/MonthlyRoster.css";

const SHIFTS = [
  { key: "M",  label: "Morning",  icon: "🌅", color: "#fff3cd", text: "#856404", pdfColor: [255, 243, 205], pdfText: [133, 100, 4] },
  { key: "E",  label: "Evening",  icon: "🌆", color: "#d1ecf1", text: "#0c5460", pdfColor: [209, 236, 241], pdfText: [12, 84, 96] },
  { key: "N",  label: "Night",    icon: "🌙", color: "#cce5ff", text: "#004085", pdfColor: [204, 229, 255], pdfText: [0, 64, 133] },
  { key: "DO", label: "Day Off",  icon: "✓",  color: "#d4edda", text: "#155724", pdfColor: [212, 237, 218], pdfText: [21, 87, 36] },
];

const MONTHS = [
  { value: 0,  label: "January",   days: 31 },
  { value: 1,  label: "February",  days: 28 },
  { value: 2,  label: "March",     days: 31 },
  { value: 3,  label: "April",     days: 30 },
  { value: 4,  label: "May",       days: 31 },
  { value: 5,  label: "June",      days: 30 },
  { value: 6,  label: "July",      days: 31 },
  { value: 7,  label: "August",    days: 31 },
  { value: 8,  label: "September", days: 30 },
  { value: 9,  label: "October",   days: 31 },
  { value: 10, label: "November",  days: 30 },
  { value: 11, label: "December",  days: 31 },
];

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getDaysInMonth(month, year) {
  if (month === 1) {
    return isLeapYear(year) ? 29 : 28;
  }
  return MONTHS[month].days;
}

function isWeekend(year, month, day) {
  const date = new Date(year, month, day + 1);
  const dow = date.getDay();
  return dow === 0 || dow === 6;
}

export default function MonthlyRoster({ nurses, setNurses }) {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [shifts, setShifts] = useState({});
  const [popup, setPopup] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const popupRef = useRef(null);
  const cellRefs = useRef({});

  const daysInMonth = getDaysInMonth(selectedMonth, currentYear);

  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setPopup(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const key = (n, d) => `${currentYear}-${selectedMonth}-${n}-${d}`;
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

  const downloadPDF = () => {
    setIsGeneratingPDF(true);
    
    try {
      // Create PDF in landscape A4
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // A4 landscape dimensions: 297mm x 210mm
      const pageWidth = 297;
      const leftMargin = 5;
      const rightMargin = 5;
      const availableWidth = pageWidth - leftMargin - rightMargin;

      // Title
      doc.setFontSize(14);
      doc.setTextColor(13, 71, 161);
      doc.text(`Monthly Duty Roster - ${MONTHS[selectedMonth].label} ${currentYear}`, pageWidth / 2, 12, { align: 'center' });

      // Build table data
      const headers = [['Nurse Name', ...Array.from({ length: daysInMonth }, (_, i) => String(i + 1))]];
      
      const bodyData = nurses.map((nurse, nIdx) => {
        const row = [`${nurse.firstName} ${nurse.lastName}`];
        for (let dIdx = 0; dIdx < daysInMonth; dIdx++) {
          const shiftKey = getShift(nIdx, dIdx);
          row.push(shiftKey || '');
        }
        return row;
      });

      // Calculate column widths to fit perfectly on A4
      const nameColWidth = 35; // Nurse name column
      const remainingWidth = availableWidth - nameColWidth;
      const dayColWidth = remainingWidth / daysInMonth;
      
      const columnStyles = { 
        0: { 
          cellWidth: nameColWidth, 
          fontStyle: 'bold', 
          halign: 'left',
          fontSize: 7
        } 
      };
      
      for (let i = 1; i <= daysInMonth; i++) {
        columnStyles[i] = { 
          cellWidth: dayColWidth, 
          halign: 'center', 
          valign: 'middle',
          fontSize: 6.5
        };
      }

      // Generate table using autoTable
      autoTable(doc, {
        head: headers,
        body: bodyData,
        startY: 18,
        theme: 'grid',
        styles: {
          fontSize: 6.5,
          cellPadding: 1.5,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
          minCellHeight: 7,
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [227, 242, 253],
          textColor: [26, 35, 126],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 6,
          cellPadding: 1.5,
        },
        columnStyles: columnStyles,
        margin: { left: leftMargin, right: rightMargin },
        tableWidth: availableWidth,
        didParseCell: function(data) {
          // Highlight weekend columns
          if (data.section === 'head' && data.column.index > 0) {
            const dayIndex = data.column.index - 1;
            if (isWeekend(currentYear, selectedMonth, dayIndex)) {
              data.cell.styles.fillColor = [236, 239, 241];
            }
          }
          if (data.section === 'body' && data.column.index > 0) {
            const dayIndex = data.column.index - 1;
            if (isWeekend(currentYear, selectedMonth, dayIndex)) {
              data.cell.styles.fillColor = [245, 245, 245];
            }
            
            // Apply shift badge colors
            const shiftKey = data.cell.raw;
            if (shiftKey) {
              const shiftMeta = SHIFTS.find(s => s.key === shiftKey);
              if (shiftMeta) {
                data.cell.styles.fillColor = shiftMeta.pdfColor;
                data.cell.styles.textColor = shiftMeta.pdfText;
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fontSize = 7;
              }
            }
          }
        },
      });

      // Save PDF
      doc.save(`Roster_${MONTHS[selectedMonth].label}_${currentYear}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="roster-container">
      {/* Header */}
      <div className="roster-header">
        <div className="roster-header-left">
          <h2>Monthly Duty Roster</h2>
          <select
            className="month-dropdown"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label} {currentYear}</option>
            ))}
          </select>
        </div>
        <div className="roster-actions">
          <button 
            className="btn download" 
            onClick={downloadPDF}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? "Generating..." : "📥 Download PDF"}
          </button>
          <button className="btn primary" onClick={() => setShowModal(true)}>+ Add Nurse</button>
          <button className="btn secondary" onClick={() => navigate("/manage")}>Manage Nurses</button>
        </div>
      </div>

      {/* Legend */}
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

      {/* Table */}
      <div className="table-wrapper">
        <table className="roster-table">
          <thead>
            <tr>
              <th className="sticky-col">Nurse Name</th>
              {[...Array(daysInMonth)].map((_, i) => (
                <th key={i} className={isWeekend(currentYear, selectedMonth, i) ? "weekend-header" : ""}>
                  {i + 1}
                </th>
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
                        isWeekend(currentYear, selectedMonth, dIdx) ? "weekend-cell" : "",
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

      {/* Shift Picker Popup */}
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

      {/* Add Nurse Modal */}
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