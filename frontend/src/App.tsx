import { useState } from "react";
import ChatLayout from "./components/ChatLayout";
import LoginPage from "./components/LoginPage";

export default function App() {
  // login state
  // boolean for if logged in or not
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // username stored, initially empty string
  const [username, setUsername] = useState("");

  // successful login
  // takes the name as parameter
  const handleLoginSuccess = (name: string) => {
    // logs to console for debugging
    console.log("✅ handleLoginSuccess called with:", name);
    // sets the username state to the name passed in
    setUsername(name);
    // sets the logged in state to true
    setIsLoggedIn(true);
  };

  // loged out
  const handleLogout = () => {
    // logs to console for debugging
    console.log("🚪 handleLogout called");
    // sets the logged in state to false
    setIsLoggedIn(false);
    // clears the username
    setUsername("");
  };

  // logs the current state for debugging
  console.log("Rendering App - isLoggedIn:", isLoggedIn, "username:", username);

  // renders either the chat layout if logged in, or the login page if not
  return (
    <>
    {/* conditional rendering based on login state*/}
      {isLoggedIn ? (
        <ChatLayout onLogout={handleLogout} username={username} />
      ) : (

        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}


