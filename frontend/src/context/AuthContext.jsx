import React, { useState, createContext, useContext } from "react";

// Context definition MUST be exported if consumed by other files
export const AuthContext = createContext(null);

// Custom Hook MUST be exported
export const useAuth = () => useContext(AuthContext);

// Provider Component MUST be exported
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(sessionStorage.getItem("user")) || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveAuthData = (userData) => {
    setUser(userData);
    sessionStorage.setItem("user", JSON.stringify(userData));
    setError(null);
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
    
  };

  return (
    <AuthContext.Provider
      value={{
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
