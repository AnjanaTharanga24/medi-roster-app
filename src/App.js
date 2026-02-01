import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MonthlyRoster from "./components/MonthlyRoaster";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<MonthlyRoster />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
