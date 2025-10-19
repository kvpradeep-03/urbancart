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
  const { saveAuthData, setLoading, loading, error, setError } = useAuth();
  // State to hold all form data, including custom fields for signup
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const BASE_URL = "http://127.0.0.1:8000/api/auth"; // Adjust if your Django server is different

  // checkbox in the form validation
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  //login form validation
  const validateLogin = () => {
    if (!formData.username || !formData.password) {
      setError("Please fill in both username and password.");
      return false;
    }
    return true;
  };

  //signup form validation
  const validateSignup = () => {
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.agreeTerms
    ) {
      setError("Please fill all required fields and agree to the terms.");
      return false;
    }
    // Basic password strength/match checks would go here
    return true;
  };

  //submit button handeling which hits auth endpoints
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponseMessage(null);

    let apiUrl = "";
    let validationPassed = false;
    let payload = {};

    if (currentState === "Login") {
      validationPassed = validateLogin();
      apiUrl = `${BASE_URL}/login/`;
      //here payload is the actual data you are sending to the backend API
      payload = {
        username: formData.username,
        password: formData.password,
      };
    } else {
      // Sign up
      validationPassed = validateSignup();
      apiUrl = `${BASE_URL}/register/`;

      // Prepare the payload, ensuring all required fields for CustomUser are sent
      payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        city: formData.city,
        state: formData.state,
        address: formData.address,
        phone: formData.phone,
        is_seller: formData.is_seller,
      };
    }

    if (!validationPassed) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(apiUrl, payload, {
        withCredentials: true, //allows cookies to be stored
      });

      if (response.status === 200 || response.status == 201) {
        // Successful Login or Signup
        const { user_id, message } = response.data;
        console.log(response.data);
        //Fetch the user's details using the token
        // Fetch user details using the stored cookie (no token required)
        // ...existing code...
        const userDetails = await axios.post(
          "http://127.0.0.1:8000/api/auth/user/",
          {}, // <-- empty body
          { withCredentials: true } // <-- options object
        );
        // ...existing code...
        console.log(userDetails);
        // Save user details (no need to store token in localStorage)
        saveAuthData(userDetails.data);

        setResponseMessage(message || "Operation successful!");
        // Close the popup after successful auth
        setTimeout(() => setShowLogin(false), 1000);
      }
    } catch (err) {
      //When a request fails with a response from the server (like 400, 401, 500), Axios attaches the full HTTP response to err.response.
      // For example:
      // err.response = {
      // data: { error: "Invalid credentials" },  // the JSON returned by your API
      // status: 401,
      // ...
      // }
      if (err.response) {
        const data = err.response.data;
        console.log(data);
        if (data.error) setError(data.error);
        else if (data.username || data.email) {
          const errorMsg = Object.entries(data)
            .map(([key, value]) => `${key}: ${value}`)
            .join(" | ");
          setError(errorMsg);
        } else setError(data.message || "An unknown API error occurred.");
      } else {
        setError("Network error. Check your server connection.");
      }
    } finally {
      setLoading(false);
    }
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
      city: "",
      state: "",
      address: "",
      phone: "",
      is_seller: false,
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
            onClick={() => setShowLogin(false)}
          />
        </div>

        {/* Status Messages */}
        {loading && <p>Processing...</p>}
        {error && <p>{error}</p>}
        {responseMessage && <p>{responseMessage}</p>}

        <div className="login-popup-inputs">
          {/* Username/Name is mandatory for both */}
          <input
            type="text"
            placeholder="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          {currentState === "Sign up" && (
            <>
              {/* Email for Signup */}
              <input
                type="email"
                placeholder="Your email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              {/* Additional Custom Fields for Signup */}
              <input
                type="text"
                placeholder="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_seller"
                  name="is_seller"
                  checked={formData.is_seller}
                  onChange={handleChange}
                />
                <label htmlFor="is_seller" className="text-sm">
                  I want to register as a seller
                </label>
              </div>
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

        {/* Terms & Conditions only required for Sign up */}
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
