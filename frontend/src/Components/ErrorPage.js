import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";

function ErrorPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    message = "Oops! Page Not Found",
    code = 404,
    actionText = "Back to Home",
    redirectTo = "/admin",
  } = state || {};

  const handleButtonClick = () => {
    navigate(redirectTo, { replace: true });
  };

  return (
    <Container
      fluid
      className="text-center bg-light vh-100 d-flex flex-column justify-content-center align-items-center"
    >
      <Row>
        <Col>
          <h1 className="display-1 text-danger fw-bold">{code}</h1>
          <h2 className="mb-4 text-secondary">{message}</h2>
          <p className="mb-4 text-muted">
            {code === 404
              ? "The page you're looking for doesn't exist or has been moved."
              : "Please try again or return to the homepage."}
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={handleButtonClick}
            className="px-5 rounded-pill shadow"
          >
            {actionText}
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default ErrorPage;