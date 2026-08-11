import { useState } from "react";
import heroBg from "../assets/hero_bg.png";

export default function LandingPage({ onLogin }) {
  const [email, setEmail] = useState("demo@learnerjourney.com");
  const [password, setPassword] = useState("demo123");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleSignIn = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setLoginError("Please enter valid credentials.");
      return;
    }
    // Grant access with demo credentials or any valid input
    onLogin();
  };

  const handleQuickDemo = () => {
    setEmail("demo@learnerjourney.com");
    setPassword("demo123");
    onLogin();
  };

  return (
    <div
      className="landing-container"
      style={{ backgroundImage: `linear-gradient(to right, rgba(9, 14, 16, 0.88), rgba(9, 14, 16, 0.78)), url(${heroBg})` }}
    >
      {/* Top Header Logo */}
      <header className="landing-topbar">
        <div className="landing-brand">
          <div className="brand-icon">🎓</div>
          <div>
            <div className="brand-name">Learner Journey <span>Studio</span></div>
            <div className="brand-sub">AI-Powered Learning Experience System</div>
          </div>
        </div>
      </header>

      {/* Main Content split into Hero & Sign In Card */}
      <div className="landing-content">
        {/* Left Hero Section */}
        <div className="hero-section">
          <div className="hero-eyebrow">SMARTER DIGITAL CLASSROOMS</div>
          <h1 className="hero-title">
            Transform Scripts into <br />
            <span>AI-Powered Learning</span>
          </h1>
          <p className="hero-subtitle">
            Bring tutoring, multi-module course design, smart assessments, and market-ready positioning into one focused learning studio experience.
          </p>

          <ul className="hero-features">
            <li>
              <span className="feature-check">✓</span>
              <span>Turn raw scripts into structured learner journeys</span>
            </li>
            <li>
              <span className="feature-check">✓</span>
              <span>Multi-format lessons (Video, Interactive, Scenario, Reading)</span>
            </li>
            <li>
              <span className="feature-check">✓</span>
              <span>Smart quizzes &amp; immediate answer explanations</span>
            </li>
            <li>
              <span className="feature-check">✓</span>
              <span>Market packaging &amp; pre-launch positioning</span>
            </li>
          </ul>
        </div>

        {/* Right Sign-In Card */}
        <div className="signin-card">
          <div className="card-header">
            <span className="card-eyebrow">WELCOME BACK</span>
            <h2>Welcome Back</h2>
            <p>Sign in to continue your learning journey</p>
          </div>

          <form onSubmit={handleSignIn} className="signin-form">
            {loginError && <div className="form-error">{loginError}</div>}

            <div className="form-field">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <span className="input-icon">✉</span>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-pwd-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a href="#forgot" className="forgot-link" onClick={(e) => e.preventDefault()}>
                Forgot your password?
              </a>
            </div>

            <button type="submit" className="signin-btn">
              → Sign In
            </button>

            <div className="demo-credentials-box">
              <div className="demo-badge">DEMO ACCESS</div>
              <p>Email: <code>demo@learnerjourney.com</code></p>
              <p>Password: <code>demo123</code></p>
              <button type="button" className="quick-demo-btn" onClick={handleQuickDemo}>
                ⚡ Auto-fill &amp; Login with Demo ID
              </button>
            </div>

            <div className="signup-prompt">
              Don't have an account?{" "}
              <button type="button" className="signup-link-btn" onClick={handleQuickDemo}>
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="landing-footer">
        © 2026 Learner Journey Studio. All rights reserved.
      </footer>
    </div>
  );
}
