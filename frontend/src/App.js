import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./components/MainPage"; // Main page with video sections
import CreatePage from "./components/CreatePage"; // Simple "CREATE" page
import Header from "./components/Header"; // Header component
import Footer from "./components/Footer"; // Footer component
import './i18n'; // Import the i18n configuration

const App = () => {
  return (
    <Router>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <div style={{ flex: "1" }}>
          <Routes>
            {/* Define routes for the main page and the create page */}
            <Route path="/" element={<MainPage />} />
            <Route path="/create" element={<CreatePage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;