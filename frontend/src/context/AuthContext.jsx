import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('novamart_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('novamart_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const logout = () => {
    localStorage.removeItem('novamart_token');
    localStorage.removeItem('novamart_user');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (token && !user) {
      authAPI.getMe()
        .then(res => {
          if (res?.data) {
            setUser(res.data);
            localStorage.setItem('novamart_user', JSON.stringify(res.data));
          }
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const authData = res.data;
      setToken(authData.token);
      setUser(authData);
      localStorage.setItem('novamart_token', authData.token);
      localStorage.setItem('novamart_user', JSON.stringify(authData));
      return authData;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authAPI.register(userData);
      const authData = res.data;
      setToken(authData.token);
      setUser(authData);
      localStorage.setItem('novamart_token', authData.token);
      localStorage.setItem('novamart_user', JSON.stringify(authData));
      return authData;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (idToken) => {
    setLoading(true);
    try {
      const res = await authAPI.googleAuth(idToken);
      const authData = res.data;

      // Check if secure linking is required for an existing account
      if (authData.linkingRequired) {
        return {
          linkingRequired: true,
          email: authData.existingEmail || authData.email,
          fullName: authData.fullName,
          pictureUrl: authData.pictureUrl,
        };
      }

      setToken(authData.token);
      setUser(authData);
      localStorage.setItem('novamart_token', authData.token);
      localStorage.setItem('novamart_user', JSON.stringify(authData));
      return authData;
    } finally {
      setLoading(false);
    }
  };

  const linkGoogle = async (idToken, password) => {
    setLoading(true);
    try {
      const res = await authAPI.linkGoogle(idToken, password);
      const authData = res.data;
      setToken(authData.token);
      setUser(authData);
      localStorage.setItem('novamart_token', authData.token);
      localStorage.setItem('novamart_user', JSON.stringify(authData));
      return authData;
    } finally {
      setLoading(false);
    }
  };

  const unlinkGoogle = async () => {
    setLoading(true);
    try {
      await authAPI.unlinkGoogle();
      updateUserProfile({ googleId: null, authProvider: 'LOCAL' });
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = (newDetails) => {
    const updated = { ...user, ...newDetails };
    setUser(updated);
    localStorage.setItem('novamart_user', JSON.stringify(updated));
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isDeliveryPartner = user?.role === 'ROLE_DELIVERY_PARTNER';
  const isCustomer = user?.role === 'ROLE_CUSTOMER' || (!isAdmin && !isDeliveryPartner);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated,
        isAdmin,
        isDeliveryPartner,
        isCustomer,
        login,
        register,
        googleLogin,
        linkGoogle,
        unlinkGoogle,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
