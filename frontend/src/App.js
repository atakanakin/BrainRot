import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainPage from "./components/MainPage";
import CreatePage from "./components/CreatePage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import DashboardPage from "./components/DashboardPage";
import {LoginPage} from "./components/LoginPage";
import {PrivateRoute} from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import './i18n';

const App = () => {
    return (
        <AuthProvider>
        <Router>
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                <Header />
                <div style={{ flex: "1" }}>
                    <Routes>
                        {/* Define routes for the main page and the create page */}
                        <Route path="/" element={<MainPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/create" element={<PrivateRoute>
                <CreatePage />
              </PrivateRoute>} />
                        <Route path="/dashboard" element={<PrivateRoute>
                <DashboardPage />
              </PrivateRoute>} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
                <Footer />
            </div>
        </Router>
        </AuthProvider>
    );
};

export default App;