import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { saveAuth } from "../utils/storage";

// Mirrors your login -> OTP UX and signup tab. API endpoints per docs. 
export default function Login() {
  const [mode, setMode] = useState("login");           // 'login' | 'signup'
  const [step, setStep] = useState("credentials");     // 'credentials' | 'otp'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const startOtp = async () => {
    setLoading(true);
    try {
      await api.post("/auth/login", { email, password }); // sends OTP
      setStep("otp");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitCreds = async (e) => {
    e.preventDefault();
    if (mode === "signup") {
      setLoading(true);
      try {
        await api.post("/auth/signup", { username, email, password, fullName }); // create user
        await startOtp(); // then send OTP using login flow
      } finally {
        setLoading(false);
      }
    } else {
      await startOtp();
    }
  };

  const onVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      saveAuth(res.data.token, res.data.user);
      navigate("/", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!email || !password) return;
    await startOtp();
  };

  return (
    <div id="login-page" className="page active">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <div className="logo-icon">
                <svg className="leaf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                </svg>
              </div>
              <span className="login-logo-text">EcoFinds</span>
            </div>
            <p className="login-subtitle">Your sustainable marketplace</p>
          </div>

          {step === "credentials" ? (
            <>
              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab ${mode === "login" ? "active" : ""}`}
                  onClick={() => setMode("login")}
                >Sign In</button>
                <button
                  type="button"
                  className={`auth-tab ${mode === "signup" ? "active" : ""}`}
                  onClick={() => setMode("signup")}
                >Sign Up</button>
              </div>

              {mode === "login" ? (
                <form className="auth-form active" onSubmit={onSubmitCreds}>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
                  </div>
                  <button className="login-button" type="submit" disabled={loading}>
                    {loading ? "Sending OTP..." : "Continue with OTP"}
                  </button>
                </form>
              ) : (
                <form className="auth-form active" onSubmit={onSubmitCreds}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={fullName} onChange={(e)=>setFullName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Username</label>
                    <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
                  </div>
                  <button className="login-button" type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Account with OTP"}
                  </button>
                </form>
              )}

              <div className="login-footer">
                <p className="disclaimer">By continuing, you agree to our eco-friendly community guidelines</p>
              </div>
            </>
          ) : (
            <>
              <div className="otp-header">
                <div className="shield-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
                  </svg>
                </div>
                <h3>Verify Your Email</h3>
                <p>We sent a 6-digit code to <b>{email}</b></p>
              </div>

              <form className="otp-form" onSubmit={onVerifyOtp}>
                <div className="form-group">
                  <label>Enter Verification Code</label>
                  <input value={otp} onChange={(e)=>setOtp(e.target.value)} maxLength={6} placeholder="000000" required />
                  <p className="input-hint">Please enter the 6-digit code sent to your email</p>
                </div>
                <button className="login-button" type="submit" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>
              </form>

              <div className="otp-actions">
                <button type="button" className="link-button" onClick={resendOtp}>
                  Resend OTP
                </button>
                <button type="button" className="link-button back-button" onClick={()=>setStep("credentials")}>
                  <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                  Back to Sign In
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
