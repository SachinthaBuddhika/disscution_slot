import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, get } from 'firebase/database';
import { Card, Spinner } from 'react-bootstrap';

function formatDateTime(dateTimeStr) {
  // Input: "2025.10.02 13:00"
  // Output: "2025-10-02 13:00" and "Oct 2, 2025, 1:00 PM"
  if (!dateTimeStr) return { raw: '', formatted: '' };
  const [date, time] = dateTimeStr.split(' ');
  const [year, month, day] = date.split('.');
  const iso = `${year}-${month}-${day} ${time}`;
  const jsDate = new Date(`${year}-${month}-${day}T${time}`);
  const formatted = jsDate.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
  });
  return { raw: iso, formatted };
}

const AdminStudent = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const studentRef = ref(db, '01/Student');
      const snap = await get(studentRef);
      if (snap.exists()) {
        const data = snap.val();
        const studentList = Object.values(data).map((s) => ({
          username: s.username,
          time: s.time,
          canLogin: s.canLogin
        }));
        setStudents(studentList);
      } else {
        setStudents([]);
      }
      setLoading(false);
    };
    fetchStudents();
  }, []);

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" /> Loading students...</div>;
  }

  return (
    <div className="row g-4">
      {students.map((student, idx) => {
        const { raw, formatted } = formatDateTime(student.time);
        return (
          <div className="col-12 col-md-6 col-lg-4" key={student.username || idx}>
            <Card className="shadow-lg border-0 h-100 student-card position-relative overflow-hidden p-2">
              <div className="d-flex align-items-center mb-3">
                <div style={{ position: 'relative', width: 56, height: 56 }}>
                  <div className="rounded-circle bg-primary bg-gradient text-white d-flex align-items-center justify-content-center" style={{ width: 56, height: 56, fontSize: 26, fontWeight: 600, boxShadow: '0 2px 8px #0d6efd33' }}>
                    {student.username?.slice(-3) || '?'}
                  </div>
                  <button type="button" className="btn btn-light btn-sm p-1 position-absolute top-0 end-0 translate-middle rounded-circle border shadow" style={{ right: '-8px', top: '-8px', zIndex: 2 }} title="Edit Student">
                    <i className="bi bi-pencil-square text-primary" style={{ fontSize: 16 }}></i>
                  </button>
                </div>
                <div className="ms-3 flex-grow-1">
                  <Card.Title className="mb-0 fs-5 fw-bold text-primary">{student.username}</Card.Title>
                  <div className="small text-secondary">Student ID</div>
                </div>
              </div>
              <Card.Body className="pt-2 pb-4 position-relative">
                <div className="mb-2">
                  <span className="fw-semibold text-secondary me-1">Time:</span>
                  <span className="bi bi-calendar-event text-info me-1"></span>
                  <span title={raw}>{formatted}</span>
                </div>
                <div>
                  <span className="fw-semibold text-secondary me-1">Can Login:</span>
                  <span className={`bi ${student.canLogin ? 'bi-unlock text-success' : 'bi-lock text-danger'} me-1`}></span>
                  <span className={student.canLogin ? 'text-success' : 'text-danger'}>{student.canLogin ? 'Yes' : 'No'}</span>
                </div>
                <button type="button" className="btn btn-outline-primary btn-sm position-absolute end-0 bottom-0 m-3 d-flex align-items-center gap-1" title="Edit Student">
                  <i className="bi bi-pencil-square"></i> Edit
                </button>
              </Card.Body>
            </Card>
          </div>
        );
      })}
      {students.length === 0 && (
        <div className="col-12 text-center text-muted">No students found.</div>
      )}
    </div>
  );
};

export default AdminStudent;
