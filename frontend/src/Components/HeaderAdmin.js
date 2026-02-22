import React, { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import { FaUserCircle, FaBell, FaHome, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";

function HeaderAdmin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = () => {
      if (isLoggingOut) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        navigate("/login", { replace: true });
        return;
      }

      const userData = localStorage.getItem("user");

      try {
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } else {
          handleLogout();
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, [navigate, isLoggingOut]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login", { replace: true });
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isLoggingOut || !user) {
    return null;
  }

  const isCreateProductPage = window.location.pathname === "/create-product";
  const isAdmin = user?.role && user.role.toLowerCase() === "admin";
  if (!isAdmin && !isCreateProductPage) {
    notification.error({
      message: "Quyền truy cập hạn chế",
      description: "Người dùng không được phép truy cập trang này",
    });
    navigate("/", { replace: true });
    return null;
  }

  return (
    <Row
      className="align-items-center shadow-sm px-3"
      style={{
        background: "#2c3e50",
        color: "white",
        height: "70px",
      }}
    >
      <Col
        md={6}
        className="d-flex align-items-center"
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          letterSpacing: "1px",
        }}
      >
        <span className="me-3" style={{ color: "#f39c12" }}>
          •
        </span>
        Admin Dashboard
      </Col>
      <Col md={6} className="text-end">
        <div
          className="d-inline-flex align-items-center me-4"
          style={{
            cursor: "pointer",
            background: "#34495e",
            padding: "5px 10px",
            borderRadius: "20px",
            fontSize: "0.9rem",
          }}
        >
          <FaBell className="me-2" size={18} title="Notifications" />
          <span>3 New</span>
        </div>

        <div
          onClick={handleHomeClick}
          className="d-inline-flex align-items-center me-4"
          style={{
            cursor: "pointer",
            background: "#34495e",
            padding: "5px 10px",
            borderRadius: "20px",
            fontSize: "0.9rem",
          }}
        >
          <FaHome className="me-2" size={18} title="Home" />
          <span>Home</span>
        </div>

        <div
          onClick={handleLogout}
          className="d-inline-flex align-items-center me-4"
          style={{
            cursor: "pointer",
            background: "#e74c3c",
            padding: "5px 10px",
            borderRadius: "20px",
            fontSize: "0.9rem",
          }}
        >
          <FaSignOutAlt className="me-2" size={18} title="Logout" />
          <span>Logout</span>
        </div>

        <div
          className="d-inline-flex align-items-center"
          onClick={handleProfileClick}
          style={{ cursor: "pointer" }}
        >
          <span className="me-2">
            {user?.fullname || user?.userName || user?.email || "User"}
          </span>
          {user?.avatar ? (
            <img
              src={`../images/${user.avatar}.png`}
              alt="Profile"
              style={{ width: "60px", height: "60px", borderRadius: "50%" }}
              title="Profile"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "../images/default-avatar.png";
              }}
            />
          ) : (
            <FaUserCircle size={30} />
          )}
        </div>
      </Col>
    </Row>
  );
}

export default HeaderAdmin;
