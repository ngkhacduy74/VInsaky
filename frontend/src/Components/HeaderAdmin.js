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
      className="align-items-center shadow-sm px-4"
      style={{
        background: "#ffffff",
        color: "#0f172a",
        height: "76px",
        borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
        position: "sticky",
        top: 0,
        zIndex: 1000
      }}
    >
      <style>{`
        .admin-header-item {
          display: inline-flex;
          align-items: center;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 500;
          color: #475569;
          transition: all 0.2s;
          background: transparent;
          border: 1px solid transparent;
        }
        .admin-header-item:hover {
          background: #f1f5f9;
          color: #3b82f6;
        }
        .admin-header-logout:hover {
          background: #fee2e2;
          color: #ef4444;
        }
        .admin-profile-menu {
          display: inline-flex;
          align-items: center;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 30px;
          transition: all 0.2s;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }
        .admin-profile-menu:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
      `}</style>
      <Col
        md={4}
        className="d-flex align-items-center"
        style={{
          fontSize: "1.3rem",
          fontWeight: "700",
          letterSpacing: "0.5px",
        }}
      >
        <span className="me-2" style={{ color: "#3b82f6" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        </span>
        Vinsaky <span style={{ color: "#94a3b8", margin: "0 8px", fontWeight: "400" }}>|</span> Admin Space
      </Col>
      <Col md={8} className="text-end d-flex justify-content-end align-items-center gap-2">
        <div className="admin-header-item" onClick={handleHomeClick}>
          <FaHome className="me-2 text-primary" size={18} title="Home" />
          <span>Trang chủ</span>
        </div>

        <div className="admin-header-item">
          <FaBell className="me-2 text-warning" size={18} title="Notifications" />
          <span>Thông báo (3)</span>
        </div>

        <div className="admin-header-item admin-header-logout me-3" onClick={handleLogout}>
          <FaSignOutAlt className="me-2" size={18} title="Logout" />
          <span>Đăng xuất</span>
        </div>

        <div className="admin-profile-menu" onClick={handleProfileClick}>
          <span className="me-3 fw-semibold text-dark">
            {user?.fullname || user?.userName || user?.email || "Admin"}
          </span>
          {user?.avatar ? (
            <img
              src={`../images/${user.avatar}.png`}
              alt="Profile"
              style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", border: "2px solid #fff", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "../images/default-avatar.png";
              }}
            />
          ) : (
            <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
               <FaUserCircle size={24} />
            </div>
          )}
        </div>
      </Col>
    </Row>
  );
}

export default HeaderAdmin;
