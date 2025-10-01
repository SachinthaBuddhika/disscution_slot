import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';

const Login = ({ onLogin, statusMessage, loading }) => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(studentId, password);
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Card style={{ minWidth: 380, maxWidth: 420 }} className="shadow-lg p-4 rounded-4">
        <Card.Body>
          <h2 className="text-center mb-4 fw-bold text-primary">Discussion Sign-In</h2>
          <p className="text-center text-muted mb-4">Enter your <b>Student ID</b> and password (if admin) to access the view.</p>
          {statusMessage?.text && (
            <Alert variant={statusMessage.type === 'error' ? 'danger' : statusMessage.type === 'success' ? 'success' : 'info'} className="text-center">
              {statusMessage.text}
            </Alert>
          )}
          <Form onSubmit={handleSubmit} autoComplete="off">
            <Form.Group className="mb-3" controlId="studentId">
              <Form.Control
                type="text"
                placeholder="STUDENT ID (E.G., 247001)"
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                className=" fw-semibold py-3"
                required
                disabled={loading}
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-4" controlId="password">
              <Form.Control
                type="password"
                placeholder="Password (required for Admin)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="fw-semibold py-3"
                disabled={loading}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 fw-bold py-2 rounded-3" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Form>
          <div className="text-center text-secondary mt-3" style={{ fontSize: 13 }}>
            Note: The password field is required for Administrators only.
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
