import { useState } from "react";
import ChatLayout from "./components/ChatLayout";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  // NEW: control showing login or register screen
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLoginSuccess = (name: string) => {
    setUsername(name);
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    localStorage.removeItem("token");
    setShowLogin(true); // go back to login page
  };

  // 🌼 Show Register Page
  if (showRegister) {
    return (
      <RegisterPage
        onBackToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    );
  }

  // 🌼 Show Login Page
  if (showLogin) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onGoToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />
    );
  }

  // 🌼 Default → Show ChatLayout
  return (
    <ChatLayout
      username={username}
      onLogout={handleLogout}
      onGoToLogin={() => setShowLogin(true)} 
    />
  );
}

