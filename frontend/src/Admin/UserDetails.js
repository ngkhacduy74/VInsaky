import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Nav,
  Tab,
  Button,
  Form,
  Badge,
  Alert,
  Table,
  Modal,
  Spinner,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import HeaderAdmin from "../Components/HeaderAdmin";
import Sidebar from "../Components/Sidebar";
import ErrorPage from "../Components/ErrorPage";
import UpdateRole from "./UpdateRole";
import "./styles/AdminModal.css";
import {
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
} from "lucide-react";
import "./styles/UserDetails.css";

export default function UserDetails() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError("User ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/user/${userId}`
        );

        // Handle different response structures
        if (
          response.data?.success === false ||
          response.data?.message === "Route not found"
        ) {
          setUser(null);
          setError(null);
          setLoading(false);
          return;
        }
        const userData =
          response.data?.user?.[0] || response.data?.user || response.data;
        setUser(userData);
        setError(null);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err.response?.data?.message || "Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle file upload logic here
      console.log("Selected file:", file);
    }
  };

  if (loading) {
    return (
      <Container
        fluid
        className="bg-light d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading user details...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        fluid
        className="bg-light d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <Card className="text-center">
          <Card.Body>
            <Card.Title className="text-danger">Error</Card.Title>
            <Card.Text>{error}</Card.Text>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (!user || (Array.isArray(user) && user.length === 0)) {
    return (
      <Container
        fluid
        className="bg-light d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <Card className="text-center">
          <Card.Body>
            <Card.Title>User Not Found</Card.Title>
            <Card.Text>The requested user could not be found.</Card.Text>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="bg-light admin-page" style={{ minHeight: "100vh" }}>
      <HeaderAdmin />
      <Row className="h-100">
        <Col
          md="auto"
          className="p-0"
          style={{
            width: "250px",
            background: "#2c3e50",
            color: "white",
          }}
        >
          <Sidebar />
        </Col>

        <Col className="py-4">
          <div className="container emp-profile">
            <Card className="shadow-sm">
              <Card.Body>
                <Row className="mb-4">
                  {/* Profile Image Section */}
                  <Col md={4} className="text-center">
                    <div className="profile-img mb-3">
                      <img
                        src={
                          user.profileImage ||
                          "https://res.cloudinary.com/dtdwjplew/image/upload/v1737903159/9_gnxlmk.jpg"
                        }
                        alt="Profile"
                        className="rounded-circle"
                        style={{
                          width: "150px",
                          height: "150px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <Form.Group>
                      <Form.Label className="btn btn-primary btn-sm">
                        Change Photo
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          style={{ display: "none" }}
                        />
                      </Form.Label>
                    </Form.Group>
                  </Col>

                  {/* Profile Header */}
                  <Col md={6}>
                    <div className="profile-head">
                      <h3 className="mb-3">
                        {user.fullname || user.name || "User Name"}
                      </h3>
                      <p className="text-muted mb-3">
                        {user.profession || "Web Developer and Designer"}
                      </p>
                    </div>
                  </Col>

                  {/* Edit Button */}
                  <Col md={2} className="text-end">
                    <Button variant="outline-primary" size="sm">
                      Edit Profile
                    </Button>
                  </Col>
                </Row>

                {/* Navigation Tabs */}
                <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
                  <Row>
                    <Col md={4}>
                      {/* Sidebar Info */}
                      <Card className="mb-3">
                        <Card.Header>
                          <h6 className="mb-0">Work Links</h6>
                        </Card.Header>
                        <Card.Body>
                          <div className="mb-2">
                            <a
                              href={user.website || "#"}
                              className="text-decoration-none"
                            >
                              Website Link
                            </a>
                          </div>
                          <div className="mb-2">
                            <a
                              href={user.portfolio || "#"}
                              className="text-decoration-none"
                            >
                              Portfolio
                            </a>
                          </div>
                          <div>
                            <a
                              href={user.linkedin || "#"}
                              className="text-decoration-none"
                            >
                              LinkedIn Profile
                            </a>
                          </div>
                        </Card.Body>
                      </Card>

                      <Card>
                        <Card.Header>
                          <h6 className="mb-0">Skills</h6>
                        </Card.Header>
                        <Card.Body>
                          {user.skills ? (
                            user.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="badge bg-secondary me-1 mb-1"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <>
                              <span className="badge bg-secondary me-1 mb-1">
                                Web Designer
                              </span>
                              <span className="badge bg-secondary me-1 mb-1">
                                Web Developer
                              </span>
                              <span className="badge bg-secondary me-1 mb-1">
                                WordPress
                              </span>
                              <span className="badge bg-secondary me-1 mb-1">
                                React
                              </span>
                              <span className="badge bg-secondary me-1 mb-1">
                                PHP
                              </span>
                            </>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={8}>
                      <Nav variant="tabs" className="mb-3">
                        <Nav.Item>
                          <Nav.Link eventKey="about">About</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link eventKey="timeline">Timeline</Nav.Link>
                        </Nav.Item>
                      </Nav>

                      <Tab.Content>
                        <Tab.Pane eventKey="about">
                          <Row className="mb-3">
                            <Col md={3}>
                              <strong>Full Name:</strong>
                            </Col>
                            <Col md={9}>
                              <p className="mb-0">
                                {user.fullname || user.name || "Not provided"}
                              </p>
                            </Col>
                          </Row>

                          <Row className="mb-3">
                            <Col md={3}>
                              <strong>Email:</strong>
                            </Col>
                            <Col md={9}>
                              <p className="mb-0">
                                {user.email || "Not provided"}
                              </p>
                            </Col>
                          </Row>

                          <Row className="mb-3">
                            <Col md={3}>
                              <strong>Phone:</strong>
                            </Col>
                            <Col md={9}>
                              <p className="mb-0">
                                {user.phone || "Not provided"}
                              </p>
                            </Col>
                          </Row>

                          <Row className="mb-3">
                            <Col md={3}>
                              <strong>Address:</strong>
                            </Col>
                            <Col md={9}>
                              <p className="mb-0">
                                {user.address || "Not provided"}
                              </p>
                            </Col>
                          </Row>

                          <Row className="mb-3">
                            <Col md={3}>
                              <strong>Profession:</strong>
                            </Col>
                            <Col md={9}>
                              <p className="mb-0">
                                {user.profession ||
                                  "Web Developer and Designer"}
                              </p>
                            </Col>
                          </Row>

                          <Row className="mb-3">
                            <Col md={3}>
                              <strong>Bio:</strong>
                            </Col>
                            <Col md={9}>
                              <p className="mb-0">
                                {user.bio || "No bio available"}
                              </p>
                            </Col>
                          </Row>
                        </Tab.Pane>

                        <Tab.Pane eventKey="timeline">
                          <Row className="mb-3">
                            <Col md={4}>
                              <strong>Experience:</strong>
                            </Col>
                            <Col md={8}>
                              <p className="mb-0">
                                {user.experience || "Expert"}
                              </p>
                            </Col>
                          </Row>

                          <Row className="mb-3">
                            <Col md={4}>
                              <strong>Hourly Rate:</strong>
                            </Col>
                            <Col md={8}>
                              <p className="mb-0">
                                {user.hourlyRate || "$10/hr"}
                              </p>
                            </Col>
                          </Row>

                          <Row className="mb-3">
                            <Col md={4}>
                              <strong>Total Projects:</strong>
                            </Col>
                            <Col md={8}>
                              <p className="mb-0">
                                {user.totalProjects || "230"}
                              </p>
                            </Col>
                          </Row>

                          <Row className="mb-3">
                            <Col md={4}>
                              <strong>English Level:</strong>
                            </Col>
                            <Col md={8}>
                              <p className="mb-0">
                                {user.englishLevel || "Expert"}
                              </p>
                            </Col>
                          </Row>

                          <Row className="mb-3">
                            <Col md={4}>
                              <strong>Availability:</strong>
                            </Col>
                            <Col md={8}>
                              <p className="mb-0">
                                {user.availability || "6 months"}
                              </p>
                            </Col>
                          </Row>

                          <Row className="mb-3">
                            <Col md={12}>
                              <strong>Professional Summary:</strong>
                              <p className="mt-2">
                                {user.summary ||
                                  "Experienced web developer with expertise in modern technologies and frameworks."}
                              </p>
                            </Col>
                          </Row>
                        </Tab.Pane>
                      </Tab.Content>
                    </Col>
                  </Row>
                </Tab.Container>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
