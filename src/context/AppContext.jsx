import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AppContext = createContext();

const API_URL = import.meta.env.PROD 
  ? "https://server-xi-coral-63.vercel.app"
  : "http://localhost:5000";

export function AppProvider({ children }) {
  // State variables for the admin dashboard
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  // Check for saved user on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Functions to manipulate state
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const login = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("user");
  };
  // Values to be provided to consumers
  const contextValue = {
    API_URL,
    // State
    sidebarOpen,
    currentUser,
    darkMode,
    // Functions
    navigate,
    toggleSidebar,
    toggleDarkMode,
    login,
    logout,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

// Custom hook for using the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

export default AppContext;
