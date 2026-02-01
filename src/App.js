import React, { useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MonthlyRoster from "./components/MonthlyRoaster";
import ManageNurses from "./pages/ManageNurses";


function App() {
  const [nurses, setNurses] = useState([
    { firstName: "Nurse", lastName: "A" },
    { firstName: "Nurse", lastName: "B" },
  ]);

  const removeNurse = (index) => {
    setNurses(nurses.filter((_, i) => i !== index));
  };

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route
            path="/"
            element={<MonthlyRoster nurses={nurses} setNurses={setNurses} />}
          />
          <Route
            path="/manage"
            element={
              <ManageNurses nurses={nurses} onRemoveNurse={removeNurse} />
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
