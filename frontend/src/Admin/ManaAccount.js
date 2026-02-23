import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Form,
  Badge,
  Modal,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../Components/Sidebar";
import HeaderAdmin from "../Components/HeaderAdmin";
import ErrorPage from "../Components/ErrorPage";
import "./styles/AdminModal.css";

function ManaAccount() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const skip = (currentPage - 1) * pageSize;
        console.log("Frontend: Fetching users with params:", {
          currentPage,
          pageSize,
          skip,
          searchTerm,
          statusFilter,
          roleFilter,
        });
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/users/all`,
          {
            params: {
              skip,
              limit: pageSize,
              searchTerm,
              statusFilter,
              roleFilter,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        let userData = [];
        if (response.data.success) {
          if (response.data.data && Array.isArray(response.data.data.items)) {
            userData = response.data.data.items;
            setTotalUsers(response.data.data.total || 0);
          } else if (Array.isArray(response.data.data)) {
            userData = response.data.data;
            setTotalUsers(response.data.total || userData.length);
          } else if (response.data.data) {
            userData = [response.data.data];
            setTotalUsers(1);
          }
        }
        setUsers(userData);
        setFilteredUsers(userData);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Failed to fetch users. Please try again.");
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentPage, pageSize, searchTerm, statusFilter, roleFilter]);

  // Apply filters
  useEffect(() => {
    // The filtering logic on the frontend is now redundant as it's handled by the backend.
    // We will remove this, but keep `setFilteredUsers` call to display fetched users.
    setFilteredUsers(users);
  }, [users]); // Only re-run when users data changes

  // Debounce search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== searchInput) {
        setSearchTerm(searchInput);
        setCurrentPage(1);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput, searchTerm]);

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on status change
  };

  const handleRoleChange = (e) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on role change
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setStatusFilter("All");
    setRoleFilter("All");
    setCurrentPage(1); // Reset to first page on clearing filters
  };



  const handleToggleActive = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = !(currentStatus === "true" || currentStatus === true);
      
      const response = await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/users/${userId}`,
        { is_active: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, is_active: newStatus } : user
          )
        );
        setFilteredUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, is_active: newStatus } : user
          )
        );
      }
    } catch (err) {
      console.error("Failed to update user status", err);
      alert("Cập nhật trạng thái thất bại. Vui lòng thử lại.");
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/users/${userToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setFilteredUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      alert("Failed to delete user.");
    }
    setDeleteLoading(false);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // Pagination UI
  const totalPages = Math.ceil(totalUsers / pageSize);
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const renderPaginationItems = () => {
    let items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <Button
            key={i}
            variant={currentPage === i ? "primary" : "light"}
            size="sm"
            style={{
              borderRadius: "8px",
              fontWeight: "600",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: currentPage === i ? "#fff" : "#475569",
              border: currentPage === i ? "none" : "1px solid #e2e8f0",
              backgroundColor: currentPage === i ? "#3b82f6" : "#ffffff",
            }}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </Button>
        );
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      if (startPage > 1) {
        items.push(
          <Button
            key={1}
            variant={currentPage === 1 ? "primary" : "light"}
            size="sm"
            style={{ borderRadius: "8px", fontWeight: "600", width: "36px", height: "36px", color: currentPage === 1 ? "#fff" : "#475569", border: currentPage === 1 ? "none" : "1px solid #e2e8f0", backgroundColor: currentPage === 1 ? "#3b82f6" : "#ffffff" }}
            onClick={() => handlePageChange(1)}
          >
            1
          </Button>
        );
        if (startPage > 2) {
          items.push(<span key="ellipsis1" className="px-2 d-flex align-items-end flex-column justify-content-end pb-1" style={{ color: "#94a3b8", fontWeight: "bold" }}>...</span>);
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <Button
            key={i}
            variant={currentPage === i ? "primary" : "light"}
            size="sm"
            style={{
              borderRadius: "8px",
              fontWeight: "600",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: currentPage === i ? "#fff" : "#475569",
              border: currentPage === i ? "none" : "1px solid #e2e8f0",
              backgroundColor: currentPage === i ? "#3b82f6" : "#ffffff",
            }}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </Button>
        );
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          items.push(<span key="ellipsis2" className="px-2 d-flex align-items-end flex-column justify-content-end pb-1" style={{ color: "#94a3b8", fontWeight: "bold" }}>...</span>);
        }
        items.push(
          <Button
            key={totalPages}
            variant={currentPage === totalPages ? "primary" : "light"}
            size="sm"
            style={{ borderRadius: "8px", fontWeight: "600", width: "36px", height: "36px", color: currentPage === totalPages ? "#fff" : "#475569", border: currentPage === totalPages ? "none" : "1px solid #e2e8f0", backgroundColor: currentPage === totalPages ? "#3b82f6" : "#ffffff" }}
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </Button>
        );
      }
    }
    return items;
  };

  if (loading) {
    return <Container fluid>Loading users...</Container>;
  }

  if (error) {
    return <ErrorPage message={error} />;
  }

  return (
    <Container fluid className="admin-page" style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: 0 }}>
      <HeaderAdmin />
      <Row className="g-0">
        <Col
          md="auto"
          style={{ width: "250px", background: "#ffffff", padding: 0 }}
        >
          <Sidebar />
        </Col>
        <Col className="p-4" style={{ height: "calc(100vh - 76px)", overflowY: "auto" }}>
          
          <style>{`
            .admin-page-title {
              font-size: 1.5rem;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: -0.5px;
            }
            .admin-card {
              background: #ffffff;
              border-radius: 16px;
              padding: 24px;
              border: 1px solid rgba(226, 232, 240, 0.8);
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
            }
            .admin-table {
              border-collapse: separate;
              border-spacing: 0;
              width: 100%;
            }
            .admin-table th {
              background: #f8fafc;
              color: #475569;
              font-weight: 600;
              text-transform: uppercase;
              font-size: 0.8rem;
              letter-spacing: 0.5px;
              padding: 16px;
              border-bottom: 2px solid #e2e8f0;
            }
            .admin-table td {
              padding: 16px;
              vertical-align: middle;
              border-bottom: 1px solid #f1f5f9;
              color: #1e293b;
              font-size: 0.95rem;
            }
            .admin-table tr:hover td {
              background: #f8fafc;
            }
            .admin-badge-active {
              background-color: #ecfdf5;
              color: #10b981;
              border: 1px solid rgba(16, 185, 129, 0.2);
              padding: 6px 12px;
              border-radius: 20px;
              font-weight: 600;
              font-size: 0.8rem;
              display: inline-block;
            }
            .admin-badge-inactive {
              background-color: #fef2f2;
              color: #ef4444;
              border: 1px solid rgba(239, 68, 68, 0.2);
              padding: 6px 12px;
              border-radius: 20px;
              font-weight: 600;
              font-size: 0.8rem;
              display: inline-block;
            }
            .admin-badge-role-admin {
              background-color: #eff6ff;
              color: #3b82f6;
              padding: 4px 10px;
              border-radius: 6px;
              font-weight: 600;
              font-size: 0.8rem;
              border: 1px solid rgba(59, 130, 246, 0.2);
            }
            .admin-badge-role-user {
              background-color: #f8fafc;
              color: #64748b;
              padding: 4px 10px;
              border-radius: 6px;
              font-weight: 500;
              font-size: 0.8rem;
              border: 1px solid #e2e8f0;
            }
            .admin-action-btn {
              padding: 6px 12px;
              font-size: 0.85rem;
              font-weight: 600;
              border-radius: 8px;
              transition: all 0.2s;
              border: none;
            }
            .admin-action-btn:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            }
            .admin-filter-container .form-label {
              font-size: 0.85rem;
              font-weight: 600;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .admin-filter-container .form-control, .admin-filter-container .form-select {
              border-radius: 10px;
              border: 1px solid #e2e8f0;
              padding: 10px 14px;
              font-size: 0.95rem;
              transition: all 0.2s;
            }
            .admin-filter-container .form-control:focus, .admin-filter-container .form-select:focus {
              border-color: #3b82f6;
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
          `}</style>
          
          <div id="manage-users" className="mb-5">
            <h3 className="admin-page-title mb-4">Quản Lý Người Dùng</h3>

            {/* Filter Controls Area */}
            <div className="admin-card mb-4 admin-filter-container">
              <Row className="g-3 align-items-end">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Tìm kiếm Tên</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập tên người dùng..."
                      value={searchInput}
                      onChange={handleSearch}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Trạng thái</Form.Label>
                    <Form.Select value={statusFilter} onChange={handleStatusChange}>
                      <option value="All">Tất cả</option>
                      <option value="Active">Đang hoạt động (Active)</option>
                      <option value="Inactive">Bị khóa (Inactive)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Vai trò (Role)</Form.Label>
                    <Form.Select value={roleFilter} onChange={handleRoleChange}>
                      <option value="All">Tất cả</option>
                      <option value="Admin">Quản trị viên (Admin)</option>
                      <option value="User">Người dùng (User)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Button variant="light" onClick={handleClearFilters} className="w-100" style={{ borderRadius: "10px", border: "1px solid #e2e8f0", color: "#64748b", fontWeight: "600" }}>
                    Xóa Bộ Lọc
                  </Button>
                </Col>
              </Row>
            </div>

            <div className="mb-3 d-flex justify-content-between align-items-center">
              <span className="text-muted" style={{ fontSize: "0.95rem" }}>
                Tổng cộng <strong className="text-dark">{totalUsers}</strong> người dùng
              </span>
            </div>

            <div className="admin-card p-0" style={{ overflow: "hidden" }}>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-5">
                  <div className="text-muted mb-3 opacity-50 fs-1">👥</div>
                  <p className="text-muted" style={{ fontSize: "1.1rem" }}>Không tìm thấy người dùng nào.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: "50px", textAlign: "center" }}>#</th>
                        <th>Họ tên</th>
                        <th>Thông tin liên hệ</th>
                        <th>Vai trò</th>
                        <th style={{ textAlign: "center" }}>Trạng thái</th>
                        <th style={{ textAlign: "center" }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, index) => (
                        <tr key={user.id}>
                          <td style={{ textAlign: "center", color: "#64748b" }}>
                            {(currentPage - 1) * pageSize + index + 1}
                          </td>
                          <td className="fw-medium">
                            <div className="d-flex align-items-center">
                              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontWeight: "bold", fontSize: "0.9rem", marginRight: "12px" }}>
                                {user.fullname ? user.fullname.charAt(0).toUpperCase() : "U"}
                              </div>
                              {user.fullname || "N/A"}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex flex-column">
                              <span style={{ color: "#3b82f6", fontSize: "0.9rem", marginBottom: "4px" }}>✉️ {user.email}</span>
                              <span style={{ color: "#64748b", fontSize: "0.85rem" }}>📞 {user.phone || "Không xác định"}</span>
                            </div>
                          </td>
                          <td>
                            <span className={user.role?.toLowerCase() === "admin" ? "admin-badge-role-admin" : "admin-badge-role-user"}>
                              {user.role || "User"}
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span className={user.is_active === "true" || user.is_active === true ? "admin-badge-active" : "admin-badge-inactive"}>
                              {user.is_active === "true" || user.is_active === true ? "Đang hoạt động" : "Bị khóa"}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex justify-content-center gap-2">

                              
                              <button
                                className="admin-action-btn text-white"
                                style={{ background: user.is_active === "true" || user.is_active === true ? "#f59e0b" : "#10b981" }}
                                onClick={() => handleToggleActive(user.id, user.is_active)}
                              >
                                {user.is_active === "true" || user.is_active === true ? "Khóa" : "Mở khóa"}
                              </button>
                              
                              <button
                                className="admin-action-btn"
                                style={{ background: "#fee2e2", color: "#ef4444" }}
                                onClick={() => handleDeleteUser(user)}
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modern Pagination Controls */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center mt-4">
                <div className="d-flex gap-2">
                  <Button
                    variant="light"
                    size="sm"
                    style={{ borderRadius: "8px", fontWeight: "600", color: "#475569", padding: "6px 16px" }}
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Trước
                  </Button>
                  <div className="d-flex gap-1 mx-2">
                    {renderPaginationItems()}
                  </div>
                  <Button
                    variant="light"
                    size="sm"
                    style={{ borderRadius: "8px", fontWeight: "600", color: "#475569", padding: "6px 16px" }}
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
            
          </div>
        </Col>
      </Row>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={cancelDelete} centered>
        <Modal.Body className="p-4 text-center">
          <div className="mb-4">
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", fontSize: "2rem" }}>
              ⚠️
            </div>
          </div>
          <h4 className="mb-3" style={{ fontWeight: "700", color: "#0f172a" }}>Xác nhận xóa</h4>
          {userToDelete && (
            <div className="mb-4 text-start">
              <p className="text-muted mb-2">Bạn có chắc chắn muốn xóa người dùng này? Thao tác này không thể hoàn tác.</p>
              <div className="p-3 bg-light rounded" style={{ border: "1px solid #e2e8f0" }}>
                <strong className="d-block text-dark">{userToDelete.fullname}</strong>
                <span className="text-muted small">{userToDelete.email}</span>
              </div>
            </div>
          )}
          <div className="d-flex justify-content-center gap-3">
            <Button
              variant="light"
              onClick={cancelDelete}
              disabled={deleteLoading}
              style={{ padding: "10px 24px", fontWeight: "600", color: "#475569" }}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteUser}
              disabled={deleteLoading}
              style={{ padding: "10px 24px", fontWeight: "600" }}
            >
              {deleteLoading ? "Đang xóa..." : "Xóa vĩnh viễn"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default ManaAccount;
