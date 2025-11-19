import { useState } from "react";

interface RegisterPageProps {
  onBackToLogin: () => void;  // so you can go back after registering
}

export default function RegisterPage({ onBackToLogin }: RegisterPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const API_BASE =
      window.location.hostname === "localhost"
        ? "http://localhost:5001"
        : "http://backend:5001";

    const response = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    console.log("Register response:", data);

    if (response.ok) {
      // Registration succeeded
      alert("Registration successful! You can now log in.");
      setError("");
      onBackToLogin();   // 👈 sends user back to login page
    } else {
      setError(data.error || "Registration failed");
    }
  } catch (err) {
    console.error("Register error:", err);
    setError("Server error");
  }
};

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-purple">
      <form
        onSubmit={handleRegister}
        className="bg-blue p-10 rounded-3xl shadow-2xl w-96 flex flex-col items-center"
      >
        <h1 className="text-lg font-calistoga mb-6 text-black text-center">
          Create Your Account
        </h1>

        <input
          type="text"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-3 p-2 rounded border border-gray-300"
          required
        />

        <input
          type="password"
          placeholder="Choose a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 p-2 rounded border border-gray-300"
          required
        />

        {error && (
          <p className="text-red-500 text-sm mb-3 font-calistoga">{error}</p>
        )}

        {success && (
          <p className="text-green-600 text-sm mb-3 font-calistoga">{success}</p>
        )}

        <button
          type="submit"
          className="w-full py-2 bg-lightBlue rounded-lg font-calistoga text-black hover:bg-blue transition"
        >
          Register
        </button>

        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full py-2 mt-3 bg-lightBlue rounded-lg font-calistoga text-black hover:bg-blue transitio"
        >
          Back to Login
        </button>
      </form>
    </div>
  );
}