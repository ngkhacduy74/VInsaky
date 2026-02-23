import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Table,
  Form,
  Modal,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Plus, Eye, EyeOff, Check, Package, Trash2, Edit } from "lucide-react";
import Sidebar from "../Components/Sidebar";
import HeaderAdmin from "../Components/HeaderAdmin";
import ErrorPage from "../Components/ErrorPage";
import "./styles/AdminModal.css"; // Import CSS cho admin modal

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL, // Sử dụng trực tiếp biến môi trường mà không cần dấu $ và {}
  timeout: 5000,
});

const ManageProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Token state management - similar to AdminDashboard
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
      return { accessToken: null, refreshToken: null };
    }
  });

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [brands, setBrands] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
        // No need to log here, as the error handling is done in the refreshAccessToken function
      }
    }
  }, [location.state]);

  // Token refresh function
  const refreshAccessToken = async () => {
    if (!tokens.refreshToken) {
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
        // No need to log here, as the error handling is done in the refreshAccessToken function
      }

      setTokens(newTokens);
      return token;
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
      throw err;
    }
  };

  // Function to decode JWT token and get user info
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  };

  // Check if user is admin
  const isUserAdmin = () => {
    if (!tokens.accessToken) return false;
    const decoded = decodeToken(tokens.accessToken);
    return decoded?.user?.role === "Admin";
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

  // Fetch product data and extract unique brands
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch products without authentication since the endpoint doesn't require it (but admin needs all of them to manage)
        const response = await api.get("/product/?limit=10000");

        const productData = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        setProducts(productData);
        setFilteredProducts(productData);

        // Extract unique brands
        const uniqueBrands = [
          ...new Set(
            productData
              .map((p) => p.brand?.trim()) // Trim whitespace
              .filter((brand) => brand && brand.length > 0) // Filter out empty/null brands
          ),
        ].sort(); // Sort alphabetically
        setBrands(uniqueBrands);
      } catch (err) {
        setError(
          err.message || "Failed to fetch products. Please try again later."
        );
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    // Fetch products immediately without waiting for tokens
    fetchProducts();
  }, []); // Remove tokens.accessToken dependency

  // Apply filters whenever searchTerm, statusFilter, selectedBrands, minPrice, or maxPrice change
  useEffect(() => {
    let result = products;

    // Filter by search term
    if (searchTerm) {
      result = result.filter((product) =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "All") {
      result = result.filter((product) => product.status === statusFilter);
    }

    // Filter by brands
    if (selectedBrands.length > 0) {
      result = result.filter((product) =>
        selectedBrands.includes(product.brand?.trim())
      );
    }

    // Filter by price range
    if (minPrice !== "" || maxPrice !== "") {
      result = result.filter((product) => {
        const price = parseFloat(product.price) || 0;
        const min = minPrice !== "" ? parseFloat(minPrice) : -Infinity;
        const max = maxPrice !== "" ? parseFloat(maxPrice) : Infinity;
        return price >= min && price <= max;
      });
    }

    setFilteredProducts(result);
  }, [searchTerm, statusFilter, selectedBrands, minPrice, maxPrice, products]);

  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle status dropdown change
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Handle brand checkbox change
  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Handle price input changes
  const handleMinPriceChange = (e) => {
    setMinPrice(e.target.value);
  };

  const handleMaxPriceChange = (e) => {
    setMaxPrice(e.target.value);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setSelectedBrands([]);
    setMinPrice("");
    setMaxPrice("");
  };

  // Handle view details
  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Handle create product
  const handleCreateProduct = () => {
    navigate("/create-product");
  };

  // Handle toggle status with authentication
  const handleToggleStatus = async (productId, currentStatus) => {
    const newStatus = currentStatus === "New" ? "SecondHand" : "New";
    
    // Check if user is admin
    if (!isUserAdmin()) {
      alert("Bạn không có quyền thực hiện hành động này. Chỉ Admin mới có thể thay đổi trạng thái sản phẩm.");
      return;
    }

    try {
      const response = await makeAuthenticatedRequest({
        method: "PUT",
        url: `/product/update/${productId}`,
        data: {
          status: newStatus,
        },
      });

      // Update local state
      setProducts(
        products.map((product) =>
          product.id === productId ? { ...product, status: newStatus } : product
        )
      );
      
      // Show success message
      alert(`Đã đổi trạng thái sản phẩm thành công: ${currentStatus} → ${newStatus}`);
    } catch (err) {
      if (err.response?.status === 403) {
        alert("Lỗi 403: Bạn không có quyền thực hiện hành động này. Vui lòng đăng nhập với tài khoản Admin.");
      } else {
        setError(err.message || "Failed to update product status.");
      }
    }
  };

  // Handle delete product - show confirmation modal
  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  // Confirm delete product
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    // Check if user is admin
    if (!isUserAdmin()) {
      alert("Bạn không có quyền thực hiện hành động này. Chỉ Admin mới có thể xóa sản phẩm.");
      setShowDeleteModal(false);
      setProductToDelete(null);
      return;
    }

    try {
      setDeleteLoading(true);
      
      await makeAuthenticatedRequest({
        method: "DELETE",
        url: `/product/${productToDelete.id}`,
      });

      // Remove product from local state
      setProducts(
        products.filter((product) => product.id !== productToDelete.id)
      );

      // Close modal and reset state
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      if (err.response?.status === 403) {
        alert("Lỗi 403: Bạn không có quyền thực hiện hành động này. Vui lòng đăng nhập với tài khoản Admin.");
      } else {
        setError(err.message || "Failed to delete product.");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  // Tính toán sản phẩm hiển thị trên trang hiện tại
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const productsToShow = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Khi filter thay đổi thì reset về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, selectedBrands, minPrice, maxPrice]);

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
            <p className="mt-2">Loading products...</p>
          </div>
        </div>
      </Container>
    );
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
            .admin-badge-new {
              background-color: #ecfdf5;
              color: #10b981;
              border: 1px solid rgba(16, 185, 129, 0.2);
              padding: 6px 12px;
              border-radius: 20px;
              font-weight: 600;
              font-size: 0.8rem;
            }
            .admin-badge-used {
              background-color: #fffbeb;
              color: #f59e0b;
              border: 1px solid rgba(245, 158, 11, 0.2);
              padding: 6px 12px;
              border-radius: 20px;
              font-weight: 600;
              font-size: 0.8rem;
            }
            .admin-btn-create {
              background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
              border: none;
              border-radius: 12px;
              padding: 10px 24px;
              font-weight: 600;
              box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
              transition: all 0.2s;
            }
            .admin-btn-create:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 15px rgba(37, 99, 235, 0.3);
              background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
            }
            .admin-action-btn {
              width: 32px;
              height: 32px;
              padding: 0;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              border-radius: 8px;
              transition: all 0.2s;
              border: none;
            }
            .admin-action-btn:hover {
              transform: scale(1.1);
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
          
          <div id="manage-products" className="mb-5">
            {/* Error Alert */}
            {error && !error.includes("Session expired") && (
              <div className="alert alert-warning mb-3" role="alert" style={{ borderRadius: "12px", border: "none" }}>
                <strong>Warning:</strong> {error}
                <button
                  className="btn btn-link btn-sm ms-2"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Header with title and Create button */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="admin-page-title mb-0">Quản Lý Sản Phẩm</h3>
              <Button
                size="lg"
                onClick={handleCreateProduct}
                className="admin-btn-create d-flex align-items-center text-white"
              >
                <Plus size={20} className="me-2" />
                Thêm Sản Phẩm Mới
              </Button>
            </div>

            {/* Filter Controls Area */}
            <div className="admin-card mb-4 admin-filter-container">
              <Row className="g-3 align-items-end">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Tìm kiếm Tên hiển thị</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập tên sản phẩm..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Trạng thái</Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={handleStatusChange}
                    >
                      <option value="All">Tất cả</option>
                      <option value="New">Mới (New)</option>
                      <option value="SecondHand">Cũ (SecondHand)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Khoảng giá (VNĐ)</Form.Label>
                    <Row className="g-2">
                      <Col>
                        <Form.Control
                          type="number"
                          placeholder="Từ..."
                          value={minPrice}
                          onChange={handleMinPriceChange}
                        />
                      </Col>
                      <Col>
                        <Form.Control
                          type="number"
                          placeholder="Đến..."
                          value={maxPrice}
                          onChange={handleMaxPriceChange}
                        />
                      </Col>
                    </Row>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Thương hiệu ({brands.length})</Form.Label>
                    <div style={{ maxHeight: "80px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "8px", background: "#f8fafc" }}>
                      {brands.length > 0 ? (
                        brands.map((brand) => (
                          <Form.Check
                            key={brand}
                            type="checkbox"
                            label={brand}
                            checked={selectedBrands.includes(brand)}
                            onChange={() => handleBrandChange(brand)}
                            className="mb-1"
                            style={{ fontSize: "0.9rem" }}
                          />
                        ))
                      ) : (
                        <p className="text-muted small mb-0">Không có dữ liệu.</p>
                      )}
                    </div>
                  </Form.Group>
                </Col>
                <Col md={1}>
                  <Button variant="light" onClick={handleClearFilters} className="w-100" style={{ borderRadius: "10px", border: "1px solid #e2e8f0", color: "#64748b", fontWeight: "600" }}>
                    Xóa
                  </Button>
                </Col>
              </Row>
            </div>

            {/* Products Summary */}
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <span className="text-muted" style={{ fontSize: "0.95rem" }}>
                Đang hiển thị <strong className="text-dark">{filteredProducts.length}</strong> / {products.length} sản phẩm
              </span>
            </div>

            {/* Table Area */}
            <div className="admin-card p-0" style={{ overflow: "hidden" }}>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-5">
                  <Package size={48} className="text-muted mb-3 opacity-50" />
                  <p className="text-muted" style={{ fontSize: "1.1rem" }}>Không tìm thấy sản phẩm nào.</p>
                  {products.length === 0 && !error && (
                    <Button
                      className="mt-3 admin-btn-create text-white"
                      onClick={handleCreateProduct}
                    >
                      Thêm sản phẩm đầu tiên
                    </Button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: "50px", textAlign: "center" }}>#</th>
                        <th>Tên sản phẩm</th>
                        <th>Thương hiệu</th>
                        <th>Giá tiền</th>
                        <th style={{ textAlign: "center" }}>Kho</th>
                        <th>Liên hệ</th>
                        <th style={{ textAlign: "center" }}>Trạng thái</th>
                        <th style={{ textAlign: "center" }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsToShow.map((product, index) => (
                        <tr key={product.id}>
                          <td style={{ textAlign: "center", color: "#64748b" }}>
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="fw-medium">{product.name || "N/A"}</td>
                          <td>
                            <span style={{ background: "#f8fafc", padding: "4px 8px", borderRadius: "6px", fontSize: "0.85rem", color: "#475569", border: "1px solid #e2e8f0" }}>
                              {product.brand || "N/A"}
                            </span>
                          </td>
                          <td className="fw-semibold text-primary">
                            {product.price ? `${parseFloat(product.price).toLocaleString("vi-VN")} đ` : "N/A"}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {product.quantity}
                          </td>
                          <td style={{ color: "#64748b" }}>
                            {product.business_phone ? product.business_phone : "N/A"}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <span className={product.status === "New" ? "admin-badge-new" : "admin-badge-used"}>
                              {product.status || "N/A"}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex justify-content-center gap-2">
                              <button
                                className="admin-action-btn bg-soft-info"
                                onClick={() => handleViewDetails(product.id)}
                                title="Xem chi tiết"
                              >
                                <Eye size={16} color="#0ea5e9" />
                              </button>
                              <button
                                className="admin-action-btn bg-soft-primary"
                                onClick={() => navigate(`/update-product/${product.id}`)}
                                title="Sửa sản phẩm"
                              >
                                <Edit size={16} color="#2563eb" />
                              </button>
                              <button
                                className={`admin-action-btn ${product.status === "New" ? "bg-soft-warning" : "bg-soft-success"}`}
                                onClick={() => handleToggleStatus(product.id, product.status)}
                                title={product.status === "New" ? "Đổi thành Second Hand" : "Đổi thành New"}
                              >
                                {product.status === "New" ? (
                                  <EyeOff size={16} color="#d97706" />
                                ) : (
                                  <Check size={16} color="#059669" />
                                )}
                              </button>
                              <button
                                className="admin-action-btn"
                                style={{ background: "#fee2e2" }}
                                onClick={() => handleDeleteProduct(product)}
                                title="Xóa Sản Phẩm"
                              >
                                <Trash2 size={16} color="#ef4444" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Modern Pagination */}
                  <div className="d-flex justify-content-between align-items-center p-4 border-top">
                    <span className="text-muted small">Trang {currentPage} / {totalPages || 1}</span>
                    <div className="d-flex gap-2">
                      <Button
                        variant="light"
                        size="sm"
                        style={{ borderRadius: "8px", fontWeight: "600", color: "#475569" }}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Trước
                      </Button>
                      <div className="d-flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={page === currentPage ? "primary" : "light"}
                            size="sm"
                            style={{ 
                              borderRadius: "8px", 
                              width: "32px", 
                              fontWeight: "600",
                              background: page === currentPage ? "#3b82f6" : "",
                              border: page === currentPage ? "none" : "1px solid #e2e8f0"
                            }}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="light"
                        size="sm"
                        style={{ borderRadius: "8px", fontWeight: "600", color: "#475569" }}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={cancelDelete} centered>
        <Modal.Body>
          <div className="text-center">
            <div className="mb-3">
              <Trash2 size={48} className="text-danger" />
            </div>
            <h5>Are you sure you want to delete this product?</h5>
            {productToDelete && (
              <div className="mt-3 p-3 bg-light rounded">
                <strong>{productToDelete.name}</strong>
                <br />
                <small className="text-muted">
                  Brand: {productToDelete.brand} | Price: {productToDelete.price
                    ? `${parseFloat(productToDelete.price).toLocaleString(
                        "vi-VN"
                      )} VND`
                    : "N/A"}
                </small>
              </div>
            )}
            <div className="alert alert-warning mt-3">
              <strong>Warning:</strong> This action cannot be undone. The
              product will be permanently deleted from the system.
            </div>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <Button
                variant="secondary"
                onClick={cancelDelete}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDeleteProduct}
                disabled={deleteLoading}
                className="d-flex align-items-center"
              >
                {deleteLoading ? (
                  <>
                    <div
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} className="me-2" />
                    Delete Product
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ManageProduct;
