import React, { useState } from 'react';
import Login from './UI/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Dummy login handler for demonstration
  const handleLogin = (studentId, password) => {
    setLoading(true);
    setTimeout(() => {
      if (studentId === 'ADMIN001' && password === 'ANAsgd2025') {
        setIsLoggedIn(true);
        setStatusMessage({ text: 'Welcome, Admin!', type: 'success' });
      } else if (/^247\d{3}$/.test(studentId) && !password) {
        setIsLoggedIn(true);
        setStatusMessage({ text: 'Welcome, Student!', type: 'success' });
      } else {
        setStatusMessage({ text: 'Invalid credentials. Please try again.', type: 'error' });
      }
      setLoading(false);
    }, 1000);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} statusMessage={statusMessage} loading={loading} />;
  }

  return (
    <div className="container mt-5">
      <h1>Welcome to the Discussion Slot App!</h1>
      <p>You are now logged in.</p>
    </div>
  );
}

export default App;
