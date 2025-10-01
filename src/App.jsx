import React, { useState } from 'react';
import Login from './UI/Login';
import AdminMain from './UI/AdminMain';
import { db } from './firebase';
import { ref, get } from 'firebase/database';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('loggedInUser') || '');

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
            setIsLoggedIn(true);
            setLoggedInUser(username);
            localStorage.setItem('loggedInUser', username);
            setStatusMessage({ text: 'Welcome, Admin!', type: 'success' });
            setLoading(false);
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

  if ((!isLoggedIn && !loggedInUser)) {
    return <Login onLogin={handleLogin} statusMessage={statusMessage} loading={loading} />;
  }

  // Welcome page for admin
  return <AdminMain username={loggedInUser} />;
}

export default App;
