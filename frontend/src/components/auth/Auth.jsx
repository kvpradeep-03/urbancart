import React, { useState } from "react";
import "./Auth.css";
import CloseIcon from "@mui/icons-material/Close";
import {AuthContext} from "../../context/AuthContext"

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

  const BASE_URL = 'http://127.0.0.1:8000/api/auth'; // Adjust if your Django server is different

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateLogin = () => {
    if (!formData.username || !formData.password) {
      setError("Please fill in both username and password.");
      return false;
    }
    return true;
  };

  const validateSignup = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.agreeTerms) {
        setError("Please fill all required fields and agree to the terms.");
        return false;
    }
    // Basic password strength/match checks would go here
    return true;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponseMessage(null);
    
    let apiUrl = '';
    let validationPassed = false;
    let payload = {};

    if (currentState === "Login") {
      validationPassed = validateLogin();
      apiUrl = `${BASE_URL}/login/`;
      payload = {
        username: formData.username,
        password: formData.password
      };
    } else { // Sign up
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
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Successful Login or Signup
        const { token, user_id, message } = data;
        
        // 1. Fetch the user's details using the token
        const userDetails = await fetchUserDetails(token);
        
        // 2. Save the token and user data to global state/localStorage
        saveAuthData(token, userDetails);
        
        setResponseMessage(message || "Operation successful!");
        // Close the popup after successful auth
        setTimeout(() => setShowLogin(false), 1000); 

      } else {
        // API returned an error (e.g., 400, 401)
        if (data.error) {
            setError(data.error);
        } else if (data.username || data.email) {
            // Handle serializer validation errors (e.g., username already taken)
            const errorMsg = Object.entries(data).map(([key, value]) => `${key}: ${value}`).join(' | ');
            setError(errorMsg);
        } else {
            setError(data.message || 'An unknown API error occurred.');
        }
      }
    } catch (err) {
      setError("Network error. Check your server connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper to fetch full user details after token is received
  const fetchUserDetails = async (token) => {
    try {
        const response = await fetch(`${BASE_URL}/user/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}` // This is the crucial line!
            }
        });
        if (response.ok) {
            return response.json();
        } else {
            console.error("Failed to fetch user details.");
            return { id: 'unknown' };
        }
    } catch (e) {
        console.error("Error fetching user details:", e);
        return { id: 'unknown' };
    }
  }


  const switchState = (newState) => {
    setCurrentState(newState);
    setError(null);
    setResponseMessage(null);
    // Resetting forms state might be good here
    setFormData({
        username: "", email: "", password: "", city: "", state: "", 
        address: "", phone: "", is_seller: false, agreeTerms: false,
    });
  }
  return (
      <div className="login-popup">
        <form className="login-popup-container" onSubmit={handleSubmit}>
          <div className="login-popup-title">
            <h2>{currentState}</h2>
            <CloseIcon sx={{cursor: 'pointer'}} onClick={() => setShowLogin(false)} />
          </div>
          
          {/* Status Messages */}
          {loading && <p className="text-blue-500">Processing...</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {responseMessage && <p className="text-green-500 text-sm">{responseMessage}</p>}


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
                        <label htmlFor="is_seller" className="text-sm">I want to register as a seller</label>
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

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-2 rounded-md font-medium text-white 
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
            `}
          >
            {loading ? "Loading..." : (currentState === "Login" ? "Login" : "Create Account")}
          </button>
          
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
              <span onClick={() => switchState("Sign up")} className="cursor-pointer text-green-600 font-medium">Click here</span>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <span onClick={() => switchState("Login")} className="cursor-pointer text-green-600 font-medium">Login here</span>
            </p>
          )}
        </form>
      </div>
  );
};

export default Auth;
