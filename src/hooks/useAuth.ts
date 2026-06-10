import { useSelector, useDispatch } from "react-redux";

import { login, logout, clearError } from "../store/slices/authSlice";
import type { LoginCredentials } from "../types/auth.ts";
import type { AppDispatch, RootState } from "../store";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { admin, token, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth,
  );

  const handleLogin = (credentials: LoginCredentials) => {
    dispatch(login(credentials));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    admin,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    clearError: handleClearError,
  };
};
