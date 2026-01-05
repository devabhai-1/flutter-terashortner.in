import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { initializeFirebase } from "./utils/firebase";
import { watchAuth } from "./utils/auth";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Shorten from "./pages/Shorten";
import Withdraw from "./pages/Withdraw";
import Telegram from "./pages/Telegram";
import Support from "./pages/Support";
import Profile from "./pages/Profile";
import InstallPrompt from "./components/InstallPrompt";
import "./App.css";

function App() {
  useEffect(() => {
    console.log("App component mounted");
    // Initialize Firebase on app load (gracefully handle if not configured)
    try {
      const result = initializeFirebase();
      if (result) {
        // Watch auth state changes only if Firebase is initialized
        watchAuth((user) => {
          if (user) {
            console.log("User logged in:", user.email);
          } else {
            console.log("User logged out");
          }
        });
      }
    } catch (error) {
      console.error("Failed to initialize Firebase:", error);
      // App continues to work even if Firebase fails
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/shorten" element={<Shorten />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/telegram" element={<Telegram />} />
        <Route path="/support" element={<Support />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <InstallPrompt />
    </BrowserRouter>
  );
}

export default App;
