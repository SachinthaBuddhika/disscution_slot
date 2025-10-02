import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, get } from "firebase/database";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { PencilSquare, Trash } from "react-bootstrap-icons";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

function formatTimeKey(key) {
  // Convert 2025_01_01_00_00 to 2025.01.01 00:00
  const [year, month, day, hour, minute] = key.split("_");
  return `${year}.${month}.${day} ${hour}:${minute}`;
}

const AdminTime = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editSlot, setEditSlot] = useState(null);
  const [editLimit, setEditLimit] = useState(0);
  const [addMode, setAddMode] = useState(false);
  const [addDateTime, setAddDateTime] = useState("");
  const [addLimit, setAddLimit] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const timeRef = ref(db, "01/time");
      const snapshot = await get(timeRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const slots = Object.entries(data).map(([key, value]) => ({
          key,
          ...value,
        }));
        setTimeSlots(slots);
      }
    };
    fetchData();
  }, []);

  const handleEditClick = (slot) => {
    setAddMode(false);
    setEditSlot(slot);
    setEditLimit(slot.limit);
    setShowModal(true);
  };

  const handleAddClick = () => {
    setAddMode(true);
    setAddDateTime("");
    setAddLimit(0);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditSlot(null);
    setAddMode(false);
  };

  const handleLimitChange = (e) => {
    setEditLimit(e.target.value);
  };
  const handleAddDateTimeChange = (e) => {
    setAddDateTime(e.target.value);
  };
  const handleAddLimitChange = (e) => {
    setAddLimit(e.target.value);
  };

  const handleSave = async () => {
    if (addMode) {
      // Add new time slot to Firebase
      if (!addDateTime || !addLimit) return;
      // Convert date/time to key format: 2025_01_01_00_00
      const dt = new Date(addDateTime);
      const pad = (n) => n.toString().padStart(2, "0");
      const key = `${dt.getFullYear()}_${pad(dt.getMonth() + 1)}_${pad(
        dt.getDate()
      )}_${pad(dt.getHours())}_${pad(dt.getMinutes())}`;
      const slotRef = ref(db, `01/time/${key}`);
      await import("firebase/database").then(({ set }) =>
        set(slotRef, { limit: Number(addLimit), reserved: 0, students: [] })
      );
      // Refresh local state from DB
      const timeRef = ref(db, "01/time");
      const snapshot = await get(timeRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const slots = Object.entries(data).map(([key, value]) => ({
          key,
          ...value,
        }));
        setTimeSlots(slots);
      }
      setShowModal(false);
      setAddMode(false);
      return;
    }
    if (editSlot) {
      // Update in Firebase
      const slotRef = ref(db, `01/time/${editSlot.key}/limit`);
      await import("firebase/database").then(({ set }) =>
        set(slotRef, Number(editLimit))
      );
      // Refresh local state from DB
      const timeRef = ref(db, "01/time");
      const snapshot = await get(timeRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const slots = Object.entries(data).map(([key, value]) => ({
          key,
          ...value,
        }));
        setTimeSlots(slots);
      }
    }
    setShowModal(false);
    setEditSlot(null);
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-end align-items-center mb-3">
        <Button
          variant="primary"
          style={{ borderRadius: 20, fontWeight: 600, padding: "8px 28px" }}
          onClick={handleAddClick}
        >
          + Add Time
        </Button>
      </div>
      <Row>
        {timeSlots.map((slot) => (
          <Col xs={12} key={slot.key} className="mb-4">
            <Card
              className="w-100 shadow-lg position-relative border-0"
              style={{
                borderRadius: 18,
                background:
                  "linear-gradient(135deg, #f8fafc 70%, #e0e7ff 100%)",
              }}
            >
              {/* Card header with time and icons */}
              <div
                style={{
                  background:
                    "linear-gradient(90deg, #6366f1 60%, #818cf8 100%)",
                  color: "white",
                  borderTopLeftRadius: 18,
                  borderTopRightRadius: 18,
                  padding: "16px 24px 12px 24px",
                  position: "relative",
                  minHeight: 56,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{ fontWeight: 600, fontSize: 20, letterSpacing: 1 }}
                >
                  Time: {formatTimeKey(slot.key)}
                </span>
                <span
                  style={{ display: "flex", flexDirection: "row", gap: 40 }}
                >
                  <PencilSquare
                    style={{ cursor: "pointer" }}
                    size={22}
                    title="Edit"
                    onClick={() => handleEditClick(slot)}
                  />
                  <Trash
                    style={{ cursor: "pointer" }}
                    size={22}
                    title="Delete"
                  />
                </span>
                {/* Add/Edit Modal (global, not inside card loop) */}
                <Modal show={showModal} onHide={handleModalClose} centered>
                  <Modal.Header closeButton>
                    <Modal.Title>
                      {addMode ? "Add Time Slot" : "Edit Time Slot"}
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    {addMode ? (
                      <form>
                        <div className="mb-3">
                          <label className="form-label">Date & Time</label>
                          <input
                            type="datetime-local"
                            className="form-control"
                            value={addDateTime}
                            onChange={handleAddDateTimeChange}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Limit</label>
                          <input
                            type="number"
                            className="form-control"
                            value={addLimit}
                            onChange={handleAddLimitChange}
                            min={0}
                          />
                        </div>
                      </form>
                    ) : (
                      editSlot && (
                        <form>
                          <div className="mb-3">
                            <label className="form-label">Time</label>
                            <input
                              type="text"
                              className="form-control"
                              value={formatTimeKey(editSlot.key)}
                              disabled
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Limit</label>
                            <input
                              type="number"
                              className="form-control"
                              value={editLimit}
                              onChange={handleLimitChange}
                              min={0}
                            />
                          </div>
                        </form>
                      )
                    )}
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                      Save
                    </Button>
                  </Modal.Footer>
                </Modal>
              </div>
              <Card.Body style={{ padding: "20px 24px 16px 24px" }}>
                <div
                  className="d-flex align-items-center mb-3"
                  style={{ gap: 18 }}
                >
                  <span
                    className="badge bg-success bg-opacity-75 d-flex align-items-center"
                    style={{
                      fontSize: 15,
                      borderRadius: 20,
                      padding: "8px 18px",
                      fontWeight: 600,
                      letterSpacing: 0.5,
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      fill="currentColor"
                      className="bi bi-people-fill me-2"
                      viewBox="0 0 16 16"
                    >
                      <path d="M13 7c0 1.105-1.12 2-2.5 2S8 8.105 8 7s1.12-2 2.5-2S13 5.895 13 7Zm-7 0c0 1.105-1.12 2-2.5 2S1 8.105 1 7s1.12-2 2.5-2S6 5.895 6 7Zm7.784 2.668A2.5 2.5 0 0 1 16 12.5V14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-1.5a2.5 2.5 0 0 1 2.216-2.482A5.985 5.985 0 0 1 8 10c1.306 0 2.518.418 3.784 1.168ZM15 14v-1.5a1.5 1.5 0 0 0-1.332-1.482A4.985 4.985 0 0 0 8 11c-1.306 0-2.518.418-3.784 1.168A1.5 1.5 0 0 0 1 12.5V14h14Z" />
                    </svg>
                    Limit: {slot.limit}
                  </span>
                  <span
                    className="badge bg-info bg-opacity-75 d-flex align-items-center"
                    style={{
                      fontSize: 15,
                      borderRadius: 20,
                      padding: "8px 18px",
                      fontWeight: 600,
                      letterSpacing: 0.5,
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      fill="currentColor"
                      className="bi bi-person-check-fill me-2"
                      viewBox="0 0 16 16"
                    >
                      <path d="M15.854 5.146a.5.5 0 0 0-.708 0l-3 3a.5.5 0 0 0 .708.708l2.646-2.647 2.646 2.647a.5.5 0 0 0 .708-.708l-3-3z" />
                      <path d="M1 14s-1 0-1-1 1-4 7-4 7 3 7 4-1 1-1 1H1zm7-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                    </svg>
                    Reserved: {slot.reserved}
                  </span>
                </div>
                <div
                  className="d-flex flex-row flex-nowrap overflow-auto"
                  style={{ gap: 12 }}
                >
                  {slot.students && slot.students.length > 0 ? (
                    slot.students.map((student) => (
                      <span
                        key={student}
                        className="badge bg-primary bg-opacity-75 text-white px-3 py-2"
                        style={{
                          fontSize: 15,
                          borderRadius: 12,
                          boxShadow: "0 1px 4px #6366f133",
                        }}
                      >
                        {student}
                      </span>
                    ))
                  ) : (
                    <span
                      className="badge bg-secondary bg-opacity-50 px-3 py-2"
                      style={{ fontSize: 15, borderRadius: 12 }}
                    >
                      No students
                    </span>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default AdminTime;
