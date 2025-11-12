import { useState } from "react";

// blueprint for the props that the LoginPage component will receive
interface LoginPageProps {
  // function to call when login is successful, takes the username as parameter
  onLoginSuccess: (username: string) => void;
}

// main component function for the login page
// destructures the onLoginSuccess function from the props
export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  // state for the username, password, and any error messages
  // initially empty strings
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // function to handle the login form submission
  const handleLogin = async (e: React.FormEvent) => {
    // prevent the default form submission behavior
    e.preventDefault();

    // Mock credentials for now
    const validUsername = "flowerlover";
    const validPassword = "petal123";

    // Simple mock check (later replace with backend fetch)
    if (username === validUsername && password === validPassword) {
      setError("");
      onLoginSuccess(username); // pass username to App
    } else {
      setError("Invalid username or password");
    }

    // Later replace this section for backend authentication:
    /*
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

      if (data.success) {
        setError("");
        onLoginSuccess(username);
      } else {
        setError("Invalid username or password");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("Unable to connect to the server");
    }
    */
  };

  // JSX to render the login form
  return (
    // flexbox container centering the form, full screen height and width, purple background
    <div className="flex items-center justify-center h-screen w-screen bg-purple">
      {/* the login form */}
      <form
        // handles submission with the handleLogin function
        onSubmit={handleLogin}
        // blue background, padding, rounded corners, shadow, fixed width, flex column layout, centered items
        className="bg-blue p-10 rounded-3xl shadow-2xl w-96 flex flex-col items-center"
      >
        {/* title of the login form */}
        {/* calistoga font, large text, margin bottom, black text, centered */}
        <h1 className="text-lg font-calistoga mb-6 text-black text-center">
          Welcome to FlowerChat!
        </h1>
        {/* username input field */}
        <input
          //type is text
          type="text"
          placeholder="Username"
          // binds the value to the username state
          value={username}
          // updates the username state on change
          onChange={(e) => setUsername(e.target.value)}
          // full width, margin bottom, padding, rounded corners, gray border
          className="w-full mb-3 p-2 rounded border border-gray-300"
          required
        />
        {/* password input field */}
        <input
          // type is password
          type="password"
          placeholder="Password"
          // binds the value to the password state
          value={password}
          // updates the password state on change
          onChange={(e) => setPassword(e.target.value)}
          // full width, margin bottom, padding, rounded corners, gray border
          className="w-full mb-3 p-2 rounded border border-gray-300"
          required
        />
        {/* displays error message if any */}
        {error && (
          // red text, small size, margin bottom, calistoga font
          <p className="text-red-500 text-sm mb-3 font-calistoga">{error}</p>
        )}

        {/* submit button */}
        <button
          // type is submit
          type="submit"
          // full width, padding, light blue background, rounded corners, calistoga font, black text, hover effect
          className="w-full py-2 bg-lightBlue rounded-lg font-calistoga text-black hover:bg-blue transition"
        >
          Log In
        </button>
      </form>
    </div>
  );
}