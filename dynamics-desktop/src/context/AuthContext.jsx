import React, { createContext, useState, useEffect } from 'react';
import { authFetch } from '../utils/authFetch'; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [token, setToken] = useState(() => {
  const t = localStorage.getItem('token');
  if (t === 'null' || t === 'undefined') {
    localStorage.removeItem('token');
    return null;
  }
  return t;
});


  const [userId, setUserId] = useState(() => {
    const id = localStorage.getItem('userId');
    //console.log('[AuthContext] Initial userId:', id);
    return id;
  });


  // Fetch user info if token exists
  useEffect(() => {
    if (token) {
      authFetch('http://localhost:3000/api/auth/me')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch user');
          return res.json();
        })
        .then(data => {
          //console.log('[AuthContext] Loaded user info:', data);
          setUser(data);
        })
        .catch(err => {
          console.error('[AuthContext] Failed to load user info:', err);
          logout(); // optional: force logout on failure
        });
    } else {
      setUser(null); // If no token, clear user info
    }
  }, [token]);

  const login = (newToken, newUserId) => {
      if (!newToken || newToken === 'null' || newToken === 'undefined') {
        console.error('Invalid token on login:', newToken);
        logout();
        return;
      }
      localStorage.setItem('token', newToken);
      localStorage.setItem('userId', newUserId);
      setToken(newToken);
      setUserId(newUserId);
    };


  const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      setToken(null);
      setUserId(null);
      setUser(null);
    };


  useEffect(() => {
    //console.log('[AuthContext] token changed:', token);
  }, [token]);

  useEffect(() => {
    //console.log('[AuthContext] userId changed:', userId);
  }, [userId]);

  return (
    <AuthContext.Provider value={{ token, userId, user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
