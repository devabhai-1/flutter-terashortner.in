import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { handleSignup } from "../utils/auth";
import "../styles/Signup.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await handleSignup(name, email, password);
      alert("Signup successful!");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Create Account 🚀</h2>
        <p>Join and start earning from shortened links</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={onSubmit}>
          <label htmlFor="signupName" className="sr-only">
            Full Name
          </label>
          <input
            type="text"
            id="signupName"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />

          <label htmlFor="signupEmail" className="sr-only">
            Email Address
          </label>
          <input
            type="email"
            id="signupEmail"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="signupPassword" className="sr-only">
            Password
          </label>
          <input
            type="password"
            id="signupPassword"
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />

          <button type="submit" className="btn full" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="footer-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;

