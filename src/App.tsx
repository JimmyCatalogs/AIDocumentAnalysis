import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PDFAnalysis from "./components/PDFAnalysis";

const App: React.FC = () => {
  return (
    <Router>
      <div className="app flex flex-col min-h-screen">
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<PDFAnalysis />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
