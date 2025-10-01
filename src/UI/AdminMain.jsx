import React from 'react';

const AdminMain = ({ username }) => {
  return (
    <div className="container mt-5">
      <h1>Welcome, Admin!</h1>
      <p>You are now logged in as <b>{username}</b>.</p>
    </div>
  );
};

export default AdminMain;
