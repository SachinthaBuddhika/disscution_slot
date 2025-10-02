import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, get } from 'firebase/database';

function formatTimeKey(key) {
  // Convert 2025_01_01_00_00 to 2025.01.01 00:00
  const [year, month, day, hour, minute] = key.split('_');
  return `${year}.${month}.${day} ${hour}:${minute}`;
}

function formatTimeDisplay(dateObj) {
  // e.g. Oct 2, 2025, 1:00 PM
  return dateObj.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
  });
}

const StudentMain = () => {
  const username = localStorage.getItem('loggedInUser') || '';
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const timeRef = ref(db, '01/time');
      const snapshot = await get(timeRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const now = new Date();
        const slots = Object.entries(data)
          .map(([key, value]) => {
            // Parse slot time
            const [y, m, d, h, min] = key.split('_');
            const slotDate = new Date(`${y}-${m}-${d}T${h}:${min}`);
            return {
              key,
              ...value,
              slotDate,
              slotTimeStr: formatTimeKey(key),
            };
          })
          .filter(slot => slot.slotDate > now) // Only future slots
          .sort((a, b) => a.slotDate - b.slotDate);
        setTimeSlots(slots);
      }
    };
    fetchData();
  }, []);

  // Check if the user has already picked a time slot
  const pickedSlotKey = timeSlots.find(slot => slot.students && slot.students.includes(username))?.key;

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('role');
    window.location.href = '/disscution_slot/';
  };

  return (
    <div className="container-fluid min-vh-100 bg-light py-5">
      <div className="d-flex flex-column align-items-center mb-4">
        <h2 className="fw-bold text-primary mb-2">Welcome, {username}!</h2>
        <button className="btn btn-outline-danger px-4 py-2 fw-bold" onClick={handleLogout}>
          Logout
        </button>
      </div>
      {timeSlots.length === 0 ? (
        <div className="text-center text-muted">No upcoming discussion slots.</div>
      ) : (
        <div className="row justify-content-center g-3 g-md-4">
          {timeSlots.map(slot => {
            const isPicked = pickedSlotKey === slot.key;
            return (
              <div className="col-12 col-md-10 col-lg-8 mb-4" key={slot.key}>
                <div className="card shadow-lg border-0 w-100 position-relative" style={{ borderRadius: 28, background: 'linear-gradient(120deg, #e0e7ff 60%, #f8fafc 100%)', boxShadow: '0 6px 32px #6366f122', overflow: 'hidden', border: '2px solid #6366f1', minWidth: 0 }}>
                  <div className="card-body d-flex flex-column flex-md-row align-items-center justify-content-between p-3 p-md-4 gap-3 flex-wrap w-100" style={{ minHeight: 140, minWidth: 0 }}>
                    <div className="mb-3 mb-md-0 flex-shrink-0 w-100 w-md-auto text-center text-md-start" style={{ minWidth: 0 }}>
                      <div className="fs-4 fw-bold text-primary mb-1 text-break" style={{ wordBreak: 'break-word' }}>
                        <i className="bi bi-calendar-event me-2" style={{ fontSize: 22, color: '#6366f1' }}></i>
                        {formatTimeDisplay(slot.slotDate)}
                      </div>
                      <div className="text-secondary" style={{ fontSize: 15 }}>
                        Discussion Date & Time
                      </div>
                    </div>
                    <div className="d-flex flex-column flex-sm-row flex-wrap gap-2 align-items-center justify-content-center w-100 w-md-auto" style={{ minWidth: 0 }}>
                      <span className="badge bg-success bg-opacity-75 text-wrap" style={{ fontSize: 16, borderRadius: 20, padding: '10px 22px', fontWeight: 600, minWidth: 120 }}>
                        Student Limit: {slot.limit}
                      </span>
                      <span className="badge bg-info bg-opacity-75 text-wrap" style={{ fontSize: 16, borderRadius: 20, padding: '10px 22px', fontWeight: 600, minWidth: 120 }}>
                        Reserved: {slot.students ? slot.students.length : 0}
                      </span>
                      <span className="badge bg-warning bg-opacity-75 text-wrap" style={{ fontSize: 16, borderRadius: 20, padding: '10px 22px', fontWeight: 600, minWidth: 120 }}>
                        Remaining: {slot.limit - (slot.students ? slot.students.length : 0)}
                      </span>
                      {pickedSlotKey ? (
                        isPicked ? (
                          <span className="btn btn-success fw-bold px-5 py-3 shadow pick-time-btn w-100 w-sm-auto mt-2 mt-sm-0" style={{ borderRadius: 24, fontSize: 20, pointerEvents: 'none', opacity: 0.95 }}>
                            <i className="bi bi-check-circle me-2"></i>Your Selected Time
                          </span>
                        ) : null
                      ) : (
                        <button className="btn btn-lg fw-bold px-5 py-3 shadow pick-time-btn w-100 w-sm-auto mt-2 mt-sm-0" style={{ borderRadius: 24, fontSize: 20, background: 'linear-gradient(90deg, #6366f1 60%, #818cf8 100%)', color: '#fff', border: 'none', boxShadow: '0 2px 12px #6366f155', letterSpacing: 1, transition: 'background 0.2s', minWidth: 160, whiteSpace: 'nowrap' }}>
                          <i className="bi bi-check-circle me-2"></i>Pick Time
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <style>{`
        .pick-time-btn:hover {
          background: linear-gradient(90deg, #818cf8 60%, #6366f1 100%);
          color: #fff;
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 6px 24px #6366f144;
        }
      `}</style>
    </div>
  );
};

export default StudentMain;
