import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const logout = () => {
    dispatch(logoutUser());
    window.location.href = "/";
  };

  const value = {
    user,
    loading,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};