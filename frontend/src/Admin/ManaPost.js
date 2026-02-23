import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  Table,
  Form,
  InputGroup,
  Modal,
  Spinner,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Plus,
  Eye,
  FileText,
  Edit,
  PlusCircle,
  Trash2,
  Search,
  RefreshCw,
  Filter,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Sidebar from "../Components/Sidebar";
import HeaderAdmin from "../Components/HeaderAdmin";
import ErrorPage from "../Components/ErrorPage";
import "./styles/AdminModal.css"; // Import CSS cho admin modal

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  timeout: 5000,
});

const ManagePost = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Token state management - similar to ManageProduct
  const [tokens, setTokens] = useState(() => {
    // First try to get from location state
    const locationToken = location.state?.token;
    const locationRefreshToken = location.state?.refresh_token;

    if (locationToken && locationRefreshToken) {
      return {
        accessToken: locationToken,
        refreshToken: locationRefreshToken,
      };
    }

    // Fallback to localStorage
    try {
      const accessToken = localStorage.getItem("token");
      const refreshToken =
        localStorage.getItem("refreshToken") ||
        localStorage.getItem("refresh_token");
      return {
        accessToken: accessToken || null,
        refreshToken: refreshToken || null,
      };
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return { accessToken: null, refreshToken: null };
    }
  });

  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPosts, setTotalPosts] = useState(0);
  
  const [toggleLoading, setToggleLoading] = useState({}); // Track loading state for individual posts

  // Effect to update tokens when location state changes
  useEffect(() => {
    const locationToken = location.state?.token;
    const locationRefreshToken = location.state?.refresh_token;

    if (locationToken && locationRefreshToken) {
      setTokens({
        accessToken: locationToken,
        refreshToken: locationRefreshToken,
      });

      // Optionally save to localStorage for persistence
      try {
        localStorage.setItem("token", locationToken);
        localStorage.setItem("refreshToken", locationRefreshToken);
      } catch (error) {
        console.error("Error saving tokens to localStorage:", error);
      }
    } else if (!tokens.accessToken || !tokens.refreshToken) {
      console.warn("⚠️ No token data passed via location state");
    }
  }, [location.state]);

  // Token refresh function
  const refreshAccessToken = async () => {
    if (!tokens.refreshToken) {
      console.error("No refresh token available");
      throw new Error("No refresh token available");
    }

    try {
      const response = await api.post("/auth/refresh-token", {
        refresh_token: tokens.refreshToken,
      });

      const { token, refresh_token } = response.data;
      if (!token || !refresh_token) {
        throw new Error("Invalid refresh token response");
      }

      const newTokens = {
        accessToken: token,
        refreshToken: refresh_token,
      };

      // Update localStorage
      try {
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refresh_token);
      } catch (error) {
        console.error("Error saving refreshed tokens:", error);
      }

      setTokens(newTokens);
      return token;
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("refresh_token"); // Clean up old key too
      window.location.href = "/login";
      throw err;
    }
  };

  // API call with token refresh logic
  const makeAuthenticatedRequest = async (config, retryCount = 0) => {
    try {
      if (!tokens.accessToken) {
        throw new Error("No access token available");
      }

      const requestConfig = {
        ...config,
        headers: {
          ...config.headers,
          token: tokens.accessToken,
        },
      };

      const response = await api.request(requestConfig);
      return response;
    } catch (err) {
      if (
        err.response?.status === 401 &&
        retryCount === 0 &&
        tokens.refreshToken
      ) {
        try {
          await refreshAccessToken();
          return makeAuthenticatedRequest(config, 1); // Retry once
        } catch (refreshErr) {
          throw new Error("Session expired. Please log in again.");
        }
      } else if (err.response?.status === 429) {
        throw new Error("Too many requests. Please try again later.");
      } else if (!err.response) {
        throw new Error(
          "Server connection error. Please check your connection."
        );
      }
      throw err;
    }
  };

  // Fetch post data
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const skip = (currentPage - 1) * pageSize;
        const params = {
          skip,
          limit: pageSize,
          ...(searchTerm && { keyword: searchTerm }),
          ...(statusFilter !== "All" && { status: statusFilter }),
          ...(conditionFilter !== "All" && { condition: conditionFilter }),
          // Note: multiple categories might need special handling, but we send the first selected one if needed
          ...(selectedCategories.length > 0 && { category: selectedCategories[0] }),
        };

        const response = await api.get("/post/", { params });

        let postData = [];
        if (response.data.success) {
          if (response.data.data && Array.isArray(response.data.data.items)) {
            postData = response.data.data.items;
            setTotalPosts(response.data.data.total || 0);
          } else if (Array.isArray(response.data.data)) {
            postData = response.data.data;
            setTotalPosts(response.data.total || postData.length);
          } else if (response.data.data) {
            postData = [response.data.data];
            setTotalPosts(1);
          }
        }

        setPosts(postData);
        setFilteredPosts(postData);

        // Fetch all categories and conditions once for filters if not set
        if (conditions.length === 0 || categories.length === 0) {
           const allResponse = await api.get("/post/?limit=1000"); // Temporarily fetch a batch to get unique conditions
           const allData = Array.isArray(allResponse.data.data?.items) ? allResponse.data.data.items : [];
           const uniqueConditions = [...new Set(allData.map((p) => p.condition).filter(Boolean))];
           const uniqueCategories = [...new Set(allData.map((p) => p.category).filter(Boolean))];
           if(uniqueConditions.length > 0) setConditions(uniqueConditions);
           if(uniqueCategories.length > 0) setCategories(uniqueCategories);
        }

      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Failed to fetch posts. Please try again later.");
        setPosts([]);
        setFilteredPosts([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce to avoid rapid fetching while typing search terms
    const delayDebounceFn = setTimeout(() => {
      fetchPosts();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, pageSize, searchTerm, statusFilter, conditionFilter, selectedCategories]);

  // Remove the duplicate filtering effect since the API handles it now.
  useEffect(() => {
    setFilteredPosts(posts);
  }, [posts]);


  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle status dropdown change
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle condition dropdown change
  const handleConditionChange = (e) => {
    setConditionFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle category checkbox change
  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setConditionFilter("All");
    setSelectedCategories([]);
  };

  // Handle view details
  const handleViewDetails = (postId) => {
    navigate(`/post/${postId}`);
  };

  // Handle create post
  const handleCreatePost = () => {
    navigate("/create-post", {
      state: {
        token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      },
    });
  };

  // Handle edit post
  const handleEditPost = (postId) => {
    navigate(`/admin/edit-post/${postId}`);
  };

  // Handle toggle condition status with checkbox
  const handleToggleCondition = async (postId, currentCondition) => {
    setToggleLoading((prev) => ({ ...prev, [postId]: true }));

    const newCondition = currentCondition === "Active" ? "Inactive" : "Active";

    try {
      const response = await makeAuthenticatedRequest({
        method: "PUT",
        url: `/post/change-condition/${newCondition}/${postId}`,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId ? { ...post, condition: newCondition } : post
          )
        );
        setFilteredPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId ? { ...post, condition: newCondition } : post
          )
        );
      } else {
        throw new Error(response.data.message || "Failed to update condition");
      }
    } catch (err) {
      console.error("Error updating post condition:", err);
      console.error("Full error details:", {
        postId,
        currentCondition,
        newCondition,
        error: err.response?.data || err.message,
      });
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update post condition."
      );
      setTimeout(() => setError(null), 5000);
    } finally {
      setToggleLoading((prev) => {
        const newState = { ...prev };
        delete newState[postId];
        return newState;
      });
    }
  };

  // Thêm hàm xử lý xóa bài viết
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
    try {
      await makeAuthenticatedRequest({
        method: "DELETE",
        url: `/post/deletePost/${postId}`,
        headers: { "Content-Type": "application/json" },
      });
      setPosts((prev) => prev.filter((p) => p._id !== postId && p.id !== postId));
      setFilteredPosts((prev) => prev.filter((p) => p._id !== postId && p.id !== postId));
      alert("Đã xóa bài viết!");
    } catch (err) {
      alert("Xóa bài viết thất bại!");
    }
  };

  // Pagination UI
  const totalPages = Math.ceil(totalPosts / pageSize);
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

  if (error && error.includes("Session expired")) {
    return <ErrorPage message={error} />;
  }

  if (loading) {
    return (
      <Container fluid className="bg-light admin-page" style={{ minHeight: "100vh" }}>
        <HeaderAdmin />
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "50vh" }}
        >
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading posts...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="bg-light admin-page" style={{ minHeight: "100vh" }}>
      <HeaderAdmin />
      <Row>
        <Col
          md="auto"
          style={{
            width: "250px",
            background: "#2c3e50",
            color: "white",
            padding: 0,
          }}
        >
          <Sidebar />
        </Col>
        <Col style={{ marginLeft: "10px" }} className="p-4">
          <div id="manage-posts" className="mb-5">
            {/* Error Alert */}
            {error && !error.includes("Session expired") && (
              <div className="alert alert-warning mb-3" role="alert">
                <strong>Warning:</strong> {error}
                <button
                  className="btn btn-link btn-sm ms-2"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Header with title and Create button */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">
                <FileText className="me-2" style={{ color: "#007bff" }} />
                Quản lý bài viết
              </h2>
              <Button 
                variant="success" 
                onClick={handleCreatePost}
                className="d-flex align-items-center"
                style={{ 
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  borderRadius: "8px"
                }}
              >
                <PlusCircle className="me-2" size={18} />
                Tạo bài viết mới
              </Button>
            </div>

            {/* Filter Controls */}
            <Row className="mb-4">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Search by Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter post title"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Filter by Status</Form.Label>
                  <Form.Select
                    value={statusFilter}
                    onChange={handleStatusChange}
                  >
                    <option value="All">All</option>
                    <option value="New">New</option>
                    <option value="Denied">Denied</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Filter by Condition</Form.Label>
                  <Form.Select
                    value={conditionFilter}
                    onChange={handleConditionChange}
                  >
                    <option value="All">All</option>
                    {conditions.map((condition) => (
                      <option key={condition} value={condition}>
                        {condition}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Filter by Category</Form.Label>
                  <Form.Select
                    value={selectedCategories.length > 0 ? selectedCategories[0] : "All"}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedCategories(value === "All" ? [] : [value]);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="All">All</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button variant="secondary" onClick={handleClearFilters}>
                  Clear
                </Button>
              </Col>
            </Row>

            {/* Posts Summary */}
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Showing {filteredPosts.length} posts on this page (Total: {totalPosts})
              </small>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted" style={{ fontSize: "0.9rem" }}>Items per page:</span>
                <Form.Select 
                  size="sm" 
                  value={pageSize} 
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{ width: "80px", borderRadius: "8px" }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </Form.Select>
              </div>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-5">
                <FileText size={48} className="text-muted mb-3" />
                <p className="text-muted">No posts found.</p>
                {posts.length === 0 && !error && (
                  <Button
                    variant="success"
                    onClick={handleCreatePost}
                    className="mt-2 d-flex align-items-center mx-auto"
                  >
                    <PlusCircle className="me-2" size={18} />
                    Create your first post
                  </Button>
                )}
              </div>
            ) : (
              <Table
                striped
                bordered
                hover
                className="shadow-sm"
                style={{ borderRadius: "15px", overflow: "hidden" }}
              >
                <thead className="bg-primary text-white">
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Condition</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post, index) => (
                    <tr key={post._id}>
                      <td>{index + 1}</td>
                      <td>{post.title || "N/A"}</td>
                      <td>{post.category || "N/A"}</td>
                      <td>
                        <span
                          className={`badge ${
                            post.status === "New" ? "bg-success" : "bg-danger"
                          }`}
                        >
                          {post.status || "N/A"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            post.condition === "Active"
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {post.condition || "N/A"}
                        </span>
                      </td>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={post.condition === "Active"}
                          onChange={() =>
                            handleToggleCondition(post._id, post.condition)
                          }
                          disabled={toggleLoading[post._id]}
                          title={`Toggle to ${
                            post.condition === "Active" ? "Inactive" : "Active"
                          }`}
                        />
                        {toggleLoading[post._id] && (
                          <div
                            className="spinner-border spinner-border-sm ms-2"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => handleViewDetails(post.id)}
                            title="Xem chi tiết"
                            style={{ borderRadius: "6px" }}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => handleEditPost(post.id || post._id)}
                            title="Sửa bài viết"
                            style={{ borderRadius: "6px" }}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeletePost(post._id || post.id)}
                            title="Xóa bài viết"
                            style={{ borderRadius: "6px" }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}

            {/* Pagination UI */}
            {!loading && !error && filteredPosts.length > 0 && totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-4 p-3 bg-white shadow-sm" style={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div className="text-muted" style={{ fontSize: "0.9rem", fontWeight: "500", color: "#64748b" }}>
                  Showing <span style={{ color: "#0f172a", fontWeight: "600" }}>{(currentPage - 1) * pageSize + 1}</span> to <span style={{ color: "#0f172a", fontWeight: "600" }}>{Math.min(currentPage * pageSize, totalPosts)}</span> of <span style={{ color: "#0f172a", fontWeight: "600" }}>{totalPosts}</span> posts
                </div>
                
                <div className="d-flex gap-2 align-items-center">
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{ borderRadius: "8px", fontWeight: "600", color: "#475569", border: "1px solid #e2e8f0", padding: "0.25rem 0.75rem" }}
                  >
                    Previous
                  </Button>
                  
                  <div className="d-flex gap-1">
                    {renderPaginationItems()}
                  </div>

                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{ borderRadius: "8px", fontWeight: "600", color: "#475569", border: "1px solid #e2e8f0", padding: "0.25rem 0.75rem" }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ManagePost;