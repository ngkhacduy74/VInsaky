import { useState, useEffect } from "react";
import {
  isAuthenticated,
  getCurrentUser,
  validateToken,
  logout,
} from "../Services/auth.service";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const validateAndSetUser = async () => {
      try {
        setLoading(true);

        // Immediately show cached user for fast UI
        const cachedUser = getCurrentUser();
        if (cachedUser) {
          setUser(cachedUser);
          setLoading(false);
        }

        // Only validate if we actually have a token
        if (!isAuthenticated()) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Validate token in background - but don't clear user on network errors
        try {
          const { isValid, user: validatedUser } = await validateToken();
          if (isValid && validatedUser) {
            setUser(validatedUser);
          } else if (!isValid) {
            // Server explicitly said token is invalid — clear user
            setUser(null);
          }
          // If validateToken threw (network error) — keep cachedUser, do nothing
        } catch (networkErr) {
          // Network error: keep currently cached user, don't log out
        }
      } catch (error) {
        console.error("useAuth - error:", error);
      } finally {
        setLoading(false);
      }
    };

    validateAndSetUser();
  }, []);


  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
  };

  const refreshUser = async () => {
    try {
      const { isValid, user: validatedUser } = await validateToken();
      if (isValid && validatedUser) {
        setUser(validatedUser);
        return true;
      } else {
        handleLogout();
        return false;
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      handleLogout();
      return false;
    }
  };

  return {
    user,
    loading,
    isLoggingOut,
    handleLogout,
    refreshUser,
    isAuthenticated: !!user,
  };
};
