import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Login from './UI/Login';
import AdminMain from './UI/AdminMain';
import { db } from './firebase';
import { ref, get } from 'firebase/database';

function App() {
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('loggedInUser') || '');
  const navigate = useNavigate();

  // Login handler for admin using Realtime Database
  const handleLogin = async (username, password) => {
    setLoading(true);
    setStatusMessage({ text: '', type: '' });
    try {
      if (username && password) {
        // Check admin
        const adminRef = ref(db, '01/admin');
        const adminSnap = await get(adminRef);
        if (adminSnap.exists()) {
          const adminData = adminSnap.val();
          if (
            username === adminData.username &&
            password === adminData.password
          ) {
            setLoggedInUser(username);
            localStorage.setItem('loggedInUser', username);
            localStorage.setItem('role', 'admin');
            setStatusMessage({ text: 'Welcome, Admin!', type: 'success' });
            setLoading(false);
            navigate('/disscution_slot/admin');
            return;
          }
        }
        setStatusMessage({ text: 'Invalid credentials. Please try again.', type: 'error' });
      } else {
        setStatusMessage({ text: 'Please enter both username and password.', type: 'error' });
      }
    } catch (err) {
      setStatusMessage({ text: 'Network/database error. Try again.', type: 'error' });
    }
    setLoading(false);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('role');
    setLoggedInUser('');
    navigate('/');
  };

  return (
    <Routes>
      <Route
        path="/disscution_slot/"
        element={
          !loggedInUser ? (
            <Login onLogin={handleLogin} statusMessage={statusMessage} loading={loading} />
          ) : (
            <Navigate to="/disscution_slot/admin" replace />
          )
        }
      />
      <Route
        path="/disscution_slot/admin"
        element={
          loggedInUser ? (
            <AdminMain username={loggedInUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/disscution_slot/" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
