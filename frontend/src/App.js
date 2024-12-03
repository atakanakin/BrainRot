import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainPage from "./components/MainPage";
import CreatePage from "./components/CreatePage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import './i18n';

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
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
                <Footer />
            </div>
        </Router>
    );
};

export default App;