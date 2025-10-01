import React, { useState, createContext} from "react";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
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
    // NOTE: In Django should use this /api/auth/logout/ endpoint here.
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
