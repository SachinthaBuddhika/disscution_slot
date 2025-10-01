import React, { useState } from 'react';

const AdminMain = ({ username, onLogout }) => {
  const [activeTab, setActiveTab] = useState('students');

  return (
    <div className="container mt-4 px-2 px-md-4">
      <div className="row align-items-center mb-4 g-2 flex-column flex-md-row">
        <div className="col text-center text-md-start mb-3 mb-md-0">
          <h1 className="mb-1 fs-3 fs-md-1">Welcome, Admin!</h1>
          <div className="text-muted small">Logged in as <b>{username}</b></div>
        </div>
        <div className="col-auto text-center text-md-end">
          <button className="btn btn-outline-danger fw-bold px-4 py-2 w-100 w-md-auto" onClick={onLogout}>Log Out</button>
        </div>
      </div>
      <ul className="nav nav-tabs mb-4 flex-nowrap overflow-auto">
        <li className="nav-item" style={{ minWidth: 120 }}>
          <button className={`nav-link${activeTab === 'students' ? ' active' : ''}`} onClick={() => setActiveTab('students')}>
            Students
          </button>
        </li>
        <li className="nav-item" style={{ minWidth: 120 }}>
          <button className={`nav-link${activeTab === 'timeslots' ? ' active' : ''}`} onClick={() => setActiveTab('timeslots')}>
            Time Slots
          </button>
        </li>
      </ul>
      <div className="bg-white rounded shadow-sm p-3 p-md-4 mb-4">
        {activeTab === 'students' && (
          <div>
            {/* Students content goes here */}
            <h4 className="fs-5">Students Section</h4>
            <p className="mb-0">Manage or view students here.</p>
          </div>
        )}
        {activeTab === 'timeslots' && (
          <div>
            {/* Time slots content goes here */}
            <h4 className="fs-5">Time Slots Section</h4>
            <p className="mb-0">Manage or view time slots here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMain;
