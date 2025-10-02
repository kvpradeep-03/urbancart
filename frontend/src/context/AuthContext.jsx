import React, { useState, createContext, useContext } from "react";

// Context definition MUST be exported if consumed by other files
export const AuthContext = createContext(null);

// Custom Hook MUST be exported
export const useAuth = () => useContext(AuthContext);

// Provider Component MUST be exported
export const AuthProvider = ({ children }) => {
  // Try to load token/user data from local storage on load
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveAuthData = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem("authToken", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setError(null);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    // NOTE: In a real app, you would also hit the Django /api/auth/logout/ endpoint here.
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        saveAuthData,
        logout,
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
