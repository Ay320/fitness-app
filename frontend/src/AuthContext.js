import React, { createContext, useState, useEffect } from 'react';
import { onAuthChange, signIn as firebaseSignIn, signOut as firebaseSignOut } from './firebaseAuth';
import { syncUser } from './api/authApi';



export const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},    // default no-op so destructuring never fails
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth changes
  useEffect(() => {
    onAuthChange(async (authState) => {
      if (authState) {
        setUser(authState.user);
        setToken(authState.token);
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });
  }, []);

  // Our unified login:
  const login = async (email, password) => {
    // 1) Firebase
    const { user, token } = await firebaseSignIn(email, password);
    // 2) Backend
    await syncUser(token);
    // 3) Save into context
    setUser(user);
    setToken(token);
    return token;
  };

  const logout = async () => {
    await firebaseSignOut();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
