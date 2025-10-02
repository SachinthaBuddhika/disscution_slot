import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, get, set, remove } from 'firebase/database';
import { Card, Spinner, Modal, Button, Form } from 'react-bootstrap';

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
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editData, setEditData] = useState({ username: '', date: '', time: '', canLogin: false });
  const [isAddMode, setIsAddMode] = useState(false);

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

  // When modal opens, sync editData with selectedStudent
  useEffect(() => {
    if (showModal) {
      if (isAddMode) {
        setEditData({ username: '', date: '2025-01-01', time: '00:00', canLogin: false });
        setSelectedStudent(null);
      } else if (selectedStudent) {
        // Split time string into date and time fields
        let date = '', time = '';
        if (selectedStudent.time) {
          const [d, t] = selectedStudent.time.split(' ');
          // Convert YYYY.MM.DD to YYYY-MM-DD for input type="date"
          if (d && d.includes('.')) {
            const [y, m, day] = d.split('.');
            date = `${y}-${m.padStart(2, '0')}-${day.padStart(2, '0')}`;
          } else {
            date = d || '';
          }
          time = t || '';
        }
        setEditData({
          username: selectedStudent.username || '',
          date,
          time,
          canLogin: !!selectedStudent.canLogin
        });
      }
    }
  }, [showModal, selectedStudent, isAddMode]);

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" /> Loading students...</div>;
  }

  // Save handler
  // Helper to reload students from DB
  const reloadStudents = async () => {
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

  const handleSave = async () => {
    // Convert date back to YYYY.MM.DD for storage
    let dateForSave = editData.date;
    if (dateForSave && dateForSave.includes('-')) {
      const [y, m, d] = dateForSave.split('-');
      dateForSave = `${y}.${m}.${d}`;
    }
    const combinedTime = `${dateForSave} ${editData.time}`.trim();
    const newData = {
      username: editData.username,
      time: combinedTime,
      canLogin: editData.canLogin
    };
    if (isAddMode) {
      // Add new student
      const newRef = ref(db, `01/Student/${editData.username}`);
      await set(newRef, newData);
    } else {
      if (!selectedStudent) return;
      const oldUsername = selectedStudent.username;
      const newUsername = editData.username;
      if (oldUsername !== newUsername) {
        // Remove old, then set new
        const oldRef = ref(db, `01/Student/${oldUsername}`);
        await remove(oldRef);
        const newRef = ref(db, `01/Student/${newUsername}`);
        await set(newRef, newData);
      } else {
        // Just update
        const refToUpdate = ref(db, `01/Student/${oldUsername}`);
        await set(refToUpdate, newData);
      }
      // --- Time slot student array update logic ---
      // Remove username from all time slot students arrays
      const timeRef = ref(db, '01/time');
      const timeSnap = await get(timeRef);
      if (timeSnap.exists()) {
        const timeData = timeSnap.val();
        for (const [slotKey, slotVal] of Object.entries(timeData)) {
          const studentsArr = Array.isArray(slotVal.students) ? slotVal.students : [];
          if (studentsArr.includes(oldUsername)) {
            // Remove oldUsername from this slot
            const newArr = studentsArr.filter(u => u !== oldUsername);
            await set(ref(db, `01/time/${slotKey}/students`), newArr);
          }
        }
        // Now, add username to the correct slot if it matches
        const matchKey = Object.keys(timeData).find(
          k => {
            // Convert slotKey to time string
            const [y, m, d, h, min] = k.split('_');
            const slotTime = `${y}.${m}.${d} ${h}:${min}`;
            return slotTime === combinedTime;
          }
        );
        if (matchKey) {
          const slot = timeData[matchKey];
          let studentsArr = Array.isArray(slot.students) ? slot.students : [];
          if (!studentsArr.includes(newUsername)) {
            studentsArr = [...studentsArr, newUsername];
            await set(ref(db, `01/time/${matchKey}/students`), studentsArr);
          }
        } else if (combinedTime) {
          // If no slot exists, optionally create a new slot with this student (optional, comment out if not desired)
          // const pad = n => n.toString().padStart(2, '0');
          // const dt = new Date(`${dateForSave.replace(/\./g, '-')}T${editData.time}`);
          // const key = `${dt.getFullYear()}_${pad(dt.getMonth() + 1)}_${pad(dt.getDate())}_${pad(dt.getHours())}_${pad(dt.getMinutes())}`;
          // await set(ref(db, `01/time/${key}`), { limit: 1, reserved: 1, students: [newUsername] });
        }
      }
      // --- End time slot update logic ---
    }
    // Reload from DB to ensure UI is up to date
    await reloadStudents();
    setShowModal(false);
    setSelectedStudent(null);
    setIsAddMode(false);
  };

  return (
    <>
      <div className="d-flex justify-content-end mb-3">
        <Button variant="success" onClick={() => { setShowModal(true); setIsAddMode(true); }}>
          + Add Student
        </Button>
      </div>
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
                    <button type="button" className="btn btn-light btn-sm p-1 position-absolute top-0 end-0 translate-middle rounded-circle border shadow" style={{ right: '-8px', top: '-8px', zIndex: 2 }} title="Edit Student" onClick={() => { setSelectedStudent(student); setShowModal(true); }}>
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
                  <button type="button" className="btn btn-outline-primary btn-sm position-absolute end-0 bottom-0 m-3 d-flex align-items-center gap-1" title="Edit Student" onClick={() => { setSelectedStudent(student); setShowModal(true); }}>
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

      <Modal show={showModal} onHide={() => { setShowModal(false); setIsAddMode(false); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isAddMode ? 'Add Student' : 'Edit Student'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="editUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={editData.username}
                onChange={e => setEditData(ed => ({ ...ed, username: e.target.value }))}
                autoFocus
                disabled={!isAddMode}
              />
            </Form.Group>
            {!isAddMode && (
              <>
                <Form.Group className="mb-3" controlId="editDate">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={editData.date}
                    onChange={e => setEditData(ed => ({ ...ed, date: e.target.value }))}
                    placeholder="YYYY.MM.DD"
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="editTime">
                  <Form.Label>Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={editData.time}
                    onChange={e => setEditData(ed => ({ ...ed, time: e.target.value }))}
                    placeholder="HH:mm"
                  />
                </Form.Group>
              </>
            )}
            <Form.Group className="mb-3" controlId="editCanLogin">
              <Form.Check
                type="checkbox"
                label="Can Login"
                checked={editData.canLogin}
                onChange={e => setEditData(ed => ({ ...ed, canLogin: e.target.checked }))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowModal(false); setIsAddMode(false); }}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!editData.username}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminStudent;
