import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";
import CloseIcon from "@mui/icons-material/Close";
import { AuthContext } from "../../context/AuthContext";
import { useAuth } from "../../context/AuthContext";
import { Button, CircularProgress } from "@mui/material";

const Auth = ({ setShowLogin }) => {
  const [currentState, setCurrentState] = useState("Login");
  const [responseMessage, setResponseMessage] = useState(null);
  const { login, signup, setLoading, loading, error, setError, user } =
    useAuth();
  // State to hold all form data, including custom fields for signup
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    agreeTerms: false,
  });

  // checkbox in the form validation
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  //submit button handeling which hits auth endpoints
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResponseMessage(null);

    if (currentState === "Login") {
      const payload = {
        email: formData.email,
        password: formData.password,
      };
      const response = await login(payload);
      // console.log("AuthResponse: ", response);

      if (response.success) {
        setResponseMessage(response.message);
        // Close the popup after successful auth
        setTimeout(() => setShowLogin(false), 1000);
      } else {
        // Error is already set by the context login function
        setResponseMessage(null);
      }
    } else {
      // Sign up
      // Prepare the payload, ensuring all required fields for CustomUser are sent
      const payload = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      };

      const response = await signup(payload);
      if (response.success) {
        setResponseMessage(response.message);
        switchState("Login");
      } else {
        // Handle signup API errors (e.g., email already exists)
        const errorData = response.errors;
        if (errorData) {
          const [firstField, firstMessage] = Object.entries(errorData)[0];

          const formattedError = Array.isArray(firstMessage)
            ? firstMessage[0] // First message only
            : firstMessage;

          setError(formattedError);
        } else {
          setError("An unknown error occurred during registration.");
        }
      }
    }

    setLoading(false); // setLoading is handled inside context functions, but this is a safeguard
  };

  //switch the login/signup forms
  const switchState = (newState) => {
    setCurrentState(newState);
    setError(null);
    setResponseMessage(null);
    // Resetting forms state here
    setFormData({
      username: "",
      email: "",
      password: "",
      phone: "",
      agreeTerms: false,
    });
  };
  return (
    <div className="login-popup">
      <form className="login-popup-container" onSubmit={handleSubmit}>
        <div className="login-popup-title">
          <h2>{currentState}</h2>
          <CloseIcon
            sx={{ cursor: "pointer" }}
            onClick={() => {
              setError(null), setResponseMessage(null), setShowLogin(false);
            }}
          />
        </div>

        {/* Status Messages */}
        {loading && <p>Processing...</p>}
        {error && <p>{error}</p>}
        {responseMessage && <p>{responseMessage}</p>}

        <div className="login-popup-inputs">
          {currentState === "Sign up" && (
            <input
              type="text"
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="email"
            placeholder="Your email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {currentState === "Sign up" && (
            <>
              {/* Additional Custom Fields for Signup */}
              <input
                type="text"
                placeholder="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </>
          )}

          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {currentState === "Login" && (
            <>
              <div className="login-popup-forgot-password">
                <a href="/forgot-password">Forgot Password?</a>
              </div>
            </>
          )}
        </div>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            py: 1.2,
            borderRadius: "8px",
            fontWeight: 600,
            textTransform: "none",
            fontSize: "15px",
            backgroundColor: loading
              ? "#9ca3af" // gray-400
              : "#000000", // black for create account
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={22} sx={{ color: "white", mr: 1 }} />
              Loading...
            </>
          ) : currentState === "Login" ? (
            "Login"
          ) : (
            "Create Account"
          )}
        </Button>

        {currentState === "Sign up" && (
          <div className="login-popup-condition">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              required={currentState === "Sign up"}
            />
            <p>By continuing, i agree terms of use & privacy policy.</p>
          </div>
        )}

        {currentState === "Login" ? (
          <p>
            Create a new account?{" "}
            <span onClick={() => switchState("Sign up")}>Click here</span>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <span onClick={() => switchState("Login")}>Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default Auth;
