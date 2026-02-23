import React from "react";
import { Nav } from "react-bootstrap";
import { FaChartBar, FaUser, FaUsersCog, FaLayerGroup, FaBell, FaEnvelope, FaFileAlt, FaExclamationTriangle, FaCommentDots } from "react-icons/fa";
import { MdReport } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    // Helper to check active path
    const isActive = (path) => {
      // Check if current pathname starts with the nav path for sub-routes
      if (path === '/admin') return location.pathname === '/admin' || location.pathname === '/Admin';
      return location.pathname.startsWith(path);
    };

    return (
        <div
            style={{
                background: "#ffffff",
                minHeight: "100vh",
                padding: "24px 16px",
                borderRight: "1px solid rgba(226, 232, 240, 0.8)",
                boxShadow: "4px 0 15px rgba(0,0,0,0.01)",
                position: "sticky",
                top: "76px", // Below header
                height: "calc(100vh - 76px)",
                overflowY: "auto"
            }}
        >
            <style>{`
              .admin-nav-link {
                 display: flex;
                 align-items: center;
                 padding: 14px 20px;
                 border-radius: 12px;
                 color: #475569 !important;
                 font-weight: 500;
                 margin-bottom: 8px;
                 transition: all 0.2s ease;
                 font-size: 0.95rem;
                 border: 1px solid transparent;
              }
              .admin-nav-link:hover {
                 background: #f8fafc;
                 color: #3b82f6 !important;
                 transform: translateX(4px);
              }
              .admin-nav-link.active {
                 background: linear-gradient(135deg, #eff6ff, #dbeafe);
                 color: #2563eb !important;
                 font-weight: 600;
                 border-color: rgba(191, 219, 254, 0.5);
                 box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.05);
              }
              .admin-nav-link svg {
                 margin-right: 12px;
                 font-size: 1.15rem;
                 transition: all 0.2s;
              }
              .admin-nav-link.active svg {
                 color: #3b82f6;
                 transform: scale(1.1);
              }
              .admin-sidebar-header {
                 color: #94a3b8;
                 font-size: 0.75rem;
                 text-transform: uppercase;
                 letter-spacing: 1px;
                 font-weight: 700;
                 margin: 24px 0 12px 16px;
              }
            `}</style>

            <div className="admin-sidebar-header mt-0">Menu Chính</div>
            <Nav className="flex-column">
                <Nav.Link
                    className={`admin-nav-link ${isActive('/admin') ? 'active' : ''}`}
                    onClick={() => navigate('/admin')}
                >
                    <FaChartBar /> Tổng Quan
                </Nav.Link>
                <Nav.Link
                    className={`admin-nav-link ${isActive('/manaAccount') ? 'active' : ''}`}
                    onClick={() => navigate('/manaAccount')}
                >
                    <FaUsersCog /> Quản Lý Tài Khoản
                </Nav.Link>
                <Nav.Link
                    className={`admin-nav-link ${isActive('/manaProduct') || isActive('/create-product') || isActive('/update-product') ? 'active' : ''}`}
                    onClick={() => navigate('/manaProduct')}
                >
                    <FaLayerGroup /> Quản Lý Sản Phẩm
                </Nav.Link>
                <Nav.Link
                    className={`admin-nav-link ${isActive('/manaPost') ? 'active' : ''}`}
                    onClick={() => navigate('/manaPost')}
                >
                    <FaFileAlt /> Quản Lý Bài Viết
                </Nav.Link>

                <div className="admin-sidebar-header">Phân Tích</div>
                <Nav.Link
                    className={`admin-nav-link ${isActive('/multiProductViewer') ? 'active' : ''}`}
                    onClick={() => navigate('/multiProductViewer')}
                >
                    <FaCommentDots /> Xếp Hạng SP
                </Nav.Link>
            </Nav>
        </div>
    );
}

export default Sidebar;
