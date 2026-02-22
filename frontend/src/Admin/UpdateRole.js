import React, { useState, useEffect } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import "./styles/AdminModal.css"; // Import CSS cho admin modal

function UpdateRole({ show, handleClose, userId, users, roles, onRoleUpdate }) {
  const [user, setUser] = useState({});

  // Initialize user state based on userId
  useEffect(() => {
    const selectedUser = users.find((u) => u.id === userId) || {};
    setUser(selectedUser);
  }, [userId, users]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: name === "roleId" ? parseInt(value) : value,
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    // Call the parent callback to update the user's role
    onRoleUpdate(userId, user.roleId);
    alert("Role updated successfully");
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Update Role</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          <strong>Name:</strong> {user.fullname || user.userName || "N/A"}
        </p>

        <Form onSubmit={handleUpdate}>
          <Form.Group className="mb-3" controlId="formRole">
            <Form.Label>Role</Form.Label>
            <Form.Control
              as="select"
              name="roleId"
              value={user.roleId ?? ""}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select a role
              </option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.roleName}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Save changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default UpdateRole;
