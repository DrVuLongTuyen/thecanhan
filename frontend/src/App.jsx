
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';

import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

export const AuthContext = React.createContext();

function App() {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
  });

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      try {
        const res = await axios.get(${import.meta.env.VITE_API_URL}/api/users/me);
        setAuthState({
          token,
          isAuthenticated: true,
          loading: false,
          user: res.data,
        });
      } catch (err) {
        localStorage.removeItem('token');
        setAuthState({
          token: null,
          isAuthenticated: false,
          loading: false,
          user: null,
        });
      }
    } else {
      setAuthState({ ...authState, loading: false });
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (token, user) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['x-auth-token'] = token;
    setAuthState({
      token,
      isAuthenticated: true,
      loading: false,
      user,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setAuthState({
      token: null,
      isAuthenticated: false,
      loading: false,
      user: null,
    });
  };

  if (authState.loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ authState, login, logout, loadUser }}>
      <Router>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<PrivateRoute component={Profile} />} />
            <Route path="/admin" element={<PrivateRoute component={AdminDashboard} roles={['admin']} />} />
            <Route path="/" element={<Login />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
