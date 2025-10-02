import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentMain = () => {
  const username = localStorage.getItem('loggedInUser') || '';
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('role');
    navigate('/disscution_slot/');
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
      <div className="shadow-lg p-5 rounded-4 bg-white text-center">
        <h2 className="fw-bold text-primary mb-3">Welcome, {username}!</h2>
        <p className="lead text-secondary">You have successfully signed in to the Discussion Slot system.</p>
        <button className="btn btn-outline-danger mt-4 px-4 py-2 fw-bold" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default StudentMain;
