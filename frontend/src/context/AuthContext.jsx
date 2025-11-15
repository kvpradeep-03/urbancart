import React, {
  useState,
  createContext,
  useContext,
  useRef,
  useEffect,
} from "react";
import api from "../components/auth/axios";
import { jwtDecode } from "jwt-decode";
import { useToast } from "../context/ToastContext";

// Context definition MUST be exported if consumed by other files
export const AuthContext = createContext(null);

// Custom Hook MUST be exported
export const useAuth = () => useContext(AuthContext);

// Provider Component MUST be exported
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const toast = useToast();
  //restores the user on page load
  useEffect(() => {
    if (isLoggingOut) return; // skip fetching user when logging out
    const fetchUser = async () => {
      try {
        const response = await api.post(
          "/api/auth/user/",
          {},
          { withCredentials: true }
        );
        setUser(response.data);
      } catch (err) {
        // if /user/ fails (token expired), axios interceptor will handel the refresh
        console.error("Failed to fetch user:", err);
        //TODO: create login page route
        // else window.location.href = "/login";
        toast.error("Something went wrong, Please login again.")
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [isLoggingOut]);
  const signup = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const signupResponse = await api.post("/api/auth/register/", payload);
      // console.log("SIGNUP RESPONSE: ", signupResponse);
      setLoading(false);
      return {
        success: true,
        message: "Registration successful. Please login.",
      };
    } catch (err) {
      setLoading(false);
      // On failure (400, 403, etc.), return the error data from the server
      if (err.response) {
        return { success: false, errors: err.response.data };
      }
      // For network errors
      setError("Network error. Please check your connection.");
      return { success: false, errors: { detail: "Network error." } };
    }
  };

  const login = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const loginResponse = await api.post("api/auth/login/", payload, {
        withCredentials: true,
      });

      // console.log("LOGIN RESPONSE: ", loginResponse);

      const userDetailsResponse = await api.post(
        "api/auth/user/",
        {},
        { withCredentials: true }
      );
      // console.log("User : ", userDetailsResponse);

      setUser(userDetailsResponse.data);
      setLoading(false);
      return {
        success: true,
        message: "Login successfull!",
        // user: userDetailsResponse,
      };
    } catch (err) {
      setLoading(false);
      // console.error("Login error: ", err);
      if (err.response) {
        setError(
          err.response?.data?.detail || "Login failed. Please try again."
        );
        return { success: false, errors: err.response.data };
      }
      // For network errors
      setError("Network error. Please check your connection.");
      return { success: false, errors: { detail: "Network error." } };
    }
  };

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      await api.post(
        "api/auth/logout/",
        {},
        {
          withCredentials: true,
        }
      );
      setUser(null);

      setError(null);
    } catch (err) {
      // console.error("Error during logout: ", err);
      setError("Error during logout. Please try again.");
    }
  };

  const deleteAccount = async () => {
    if (!user) return false;
    try {
      await api.delete(
        "api/auth/delete-account/",
        {},
        {
          withCredentials: true,
        }
      );
      logout();
      return true;
    } catch (error) {
      // console.error("Account deletion failed:", error.response.data);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        deleteAccount,
        loading,
        setLoading,
        error,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
