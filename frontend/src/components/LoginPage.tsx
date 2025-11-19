import { useState } from "react";

// blueprint for the props that the LoginPage component will receive
interface LoginPageProps {
  // function to call when login is successful, takes the username as parameter
  onLoginSuccess: (username: string) => void;
  onGoToRegister: () => void
}

// main component function for the login page
// destructures the onLoginSuccess function from the props
export default function LoginPage({ onLoginSuccess, onGoToRegister }: LoginPageProps) {
  // state for the username, password, and any error messages
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // function to handle the login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const API_BASE =
        window.location.hostname === "localhost"
          ? "http://localhost:5001"
          : "http://backend:5001";

      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        onLoginSuccess(username);
      } else {
        setError("Invalid login");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  // JSX to render the login form
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-purple">
      <form
        onSubmit={handleLogin}
        className="bg-blue p-10 rounded-3xl shadow-2xl w-96 flex flex-col items-center"
      >
        <h1 className="text-lg font-calistoga mb-6 text-black text-center">
          Welcome to FlowerChat!
        </h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-3 p-2 rounded border border-gray-300"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 p-2 rounded border border-gray-300"
          required
        />

        {error && (
          <p className="text-red-500 text-sm mb-3 font-calistoga">{error}</p>
        )}

        <button
          type="submit"
          className="w-full py-2 bg-lightBlue rounded-lg font-calistoga text-black hover:bg-blue transition"
        >
          Log In
        </button>
        <button
          type="button"
          onClick={onGoToRegister}
          className="w-full py-2 mt-3 bg-lightBlue rounded-lg font-calistoga text-black hover:bg-blue transition"
        >
          Create an Account
        </button>
      </form>
    </div>
  );
}