import React from "react";
import { Nav } from "react-bootstrap";
import { FaChartBar, FaUser, FaUsersCog, FaLayerGroup, FaBell, FaEnvelope, FaFileAlt, FaExclamationTriangle, FaCommentDots } from "react-icons/fa";
import { MdReport } from "react-icons/md";
import { useNavigate } from "react-router-dom";

function Sidebar() {

    const navigate = useNavigate();

    return (
        <div
            style={{
                background: "#2c3e50",
                color: "white",
                minHeight: "100vh",
                padding: "20px",
            }}
        >
            <h5 className="text-center mb-4">Admin Panel</h5>
            <Nav className="flex-column">
                <Nav.Link
                    className="text-white mb-3 d-flex align-items-center"
                    onClick={() => navigate('/admin')}
                >
                    <FaChartBar className="me-2" /> Dashboard
                </Nav.Link>
                <Nav.Link
                    className="text-white d-flex align-items-center"
                    onClick={() => navigate('/manaAccount')}
                >
                    <FaUsersCog className="me-2" /> Manage Accounts
                </Nav.Link>
                <Nav.Link
                    className="text-white d-flex align-items-center"
                    onClick={() => navigate('/manaProduct')}
                >
                    <FaLayerGroup className="me-2" /> Manage Product
                </Nav.Link>
                <Nav.Link
                    className="text-white d-flex align-items-center"
                    onClick={() => navigate('/manaPost')}
                >
                    <FaFileAlt className="me-2" /> Manage Posts
                </Nav.Link>
                <Nav.Link
                    className="text-white d-flex align-items-center"
                    onClick={() => navigate('/multiProductViewer')}
                >
                    <FaCommentDots className="me-2" />Top 5 products
                </Nav.Link>

               
            </Nav>
        </div>
    );
}

export default Sidebar;
