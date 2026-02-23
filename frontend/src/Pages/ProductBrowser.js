import React, { useState, useEffect } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import "./styles/style.css";
import "./styles/vendor.css";
import Footer from "../Components/Footer";
import Canvas from "../Components/Canvas";
import ChatWidget from "../Components/WidgetChat";
import Header from "../Components/Header";
import FavoriteButton from "../Components/FavoriteButton";
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  ShoppingCart,
  Eye,
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  Sliders,
} from "lucide-react";
import { authApiClient } from "../Services/auth.service";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Alert,
  Form,
  Button,
} from "react-bootstrap";
import SearchWithAutocomplete from "../Components/SearchWithAutocomplete";
import axios from "axios";

const ProductBrowser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    brand: searchParams.get("brand") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    status: searchParams.get("status") || "",
  });
  const [filterDraft, setFilterDraft] = useState({ ...filters });
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Backup image path
  const backUpImg = "/images/frigde.png";

  // Danh sách các danh mục sản phẩm (copy từ Header)
  const fixedCategories = [
    "Máy Làm Đá",
    "Bếp á công nghiệp",
    "Bàn inox",
    "Bếp âu công nghiệp",
    "Tủ đông công nghiệp",
    "Tủ lạnh công nghiệp",
    "Tủ mát công nghiệp",
    "Tủ nấu cơm",
    "Máy Pha Cafe",
    "Bàn Đông",
    "Bếp Từ Công Nghiệp",
    "Máy Làm Kem",
  ];

  // Get product image (handle array format) - Same as BrandCarousel
  const getProductImage = (product) => {
    if (product.image) {
      if (Array.isArray(product.image) && product.image.length > 0) {
        const firstImage = product.image[0];

        // Check if URL is valid
        if (firstImage && firstImage.trim() !== "") {
          // If it's a relative URL, make it absolute
          if (firstImage.startsWith("/") || firstImage.startsWith("./")) {
            const baseUrl = `${process.env.REACT_APP_BACKEND_URL}`;
            const fullUrl = firstImage.startsWith("/")
              ? `${baseUrl}${firstImage}`
              : `${baseUrl}/${firstImage.replace("./", "")}`;
            return fullUrl;
          }

          // If it's already a full URL (http/https), use it directly
          if (
            firstImage.startsWith("http://") ||
            firstImage.startsWith("https://")
          ) {
            return firstImage;
          }

          // If it's a Cloudinary URL or other image service, use it directly
          if (
            firstImage.includes("cloudinary.com") ||
            firstImage.includes("res.cloudinary.com") ||
            firstImage.includes("imgur.com") ||
            firstImage.includes("unsplash.com")
          ) {
            return firstImage;
          }

          return firstImage;
        }
      } else if (typeof product.image === "string") {
        if (product.image.trim() !== "") {
          // If it's a relative URL, make it absolute
          if (product.image.startsWith("/") || product.image.startsWith("./")) {
            const baseUrl = `${process.env.REACT_APP_BACKEND_URL}`;
            const fullUrl = product.image.startsWith("/")
              ? `${baseUrl}${product.image}`
              : `${baseUrl}/${product.image.replace("./", "")}`;
            return fullUrl;
          }

          // If it's already a full URL (http/https), use it directly
          if (
            product.image.startsWith("http://") ||
            product.image.startsWith("https://")
          ) {
            return product.image;
          }

          // If it's a Cloudinary URL or other image service, use it directly
          if (
            product.image.includes("cloudinary.com") ||
            product.image.includes("res.cloudinary.com") ||
            product.image.includes("imgur.com") ||
            product.image.includes("unsplash.com")
          ) {
            return product.image;
          }

          return product.image;
        }
      }
    }
    // Fallback image
    return backUpImg;
  };

  // Handle image load error
  const handleImageError = (e) => {
    // Prevent infinite loop
    if (e.target.src === backUpImg) {
      return;
    }

    e.target.src = backUpImg;
    e.target.alt = "product placeholder";
    e.target.onerror = null; // Prevent infinite loop
  };

  // Fetch products from API
  const fetchProducts = async (searchFilters = filters, page = currentPage) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });
      // Add pagination params to query
      const skip = (page - 1) * productsPerPage;
      queryParams.append("skip", skip);
      queryParams.append("limit", productsPerPage);

      const response = await authApiClient.get(
        `/product?${queryParams.toString()}`
      );
      
      let productData = [];
      let totalItems = 0;
      
      if (response.data && response.data.data) {
        if (Array.isArray(response.data.data)) {
          productData = response.data.data;
          totalItems = productData.length;
        } else if (response.data.data.items && Array.isArray(response.data.data.items)) {
          productData = response.data.data.items;
          totalItems = response.data.data.total || productData.length;
        }
      }
      
      setProducts(productData);
      setPagination({
        totalItems: totalItems,
        currentPage: currentPage,
        totalPages: Math.ceil(totalItems / productsPerPage) || 1,
      });
      // Danh mục cố định
      setCategories(fixedCategories);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Lấy tất cả thương hiệu một lần khi load trang
  useEffect(() => {
    const fetchAllBrands = async () => {
      try {
        const response = await authApiClient.get("/product/brands");
        if (response.data && response.data.data) {
          setBrands(response.data.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách thương hiệu:", err);
      }
    };
    fetchAllBrands();
  }, []);

  // Khi searchParams thay đổi, đồng bộ filters và filterDraft
  useEffect(() => {
    const newFilters = {
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
      brand: searchParams.get("brand") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      status: searchParams.get("status") || "",
    };
    setFilters(newFilters);
    setFilterDraft(newFilters);
    setCurrentPage(1);
    fetchProducts(newFilters, 1);
  }, [searchParams]);

  // Handle search from SearchWithAutocomplete
  const handleSearch = (searchQuery) => {
    // Update filters
    const newFilters = {
      ...filters,
      search: searchQuery,
    };
    setFilters(newFilters);

    // Update URL
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    setSearchParams(params);
  };

  // Server-side pagination is now used, so currentProducts is just the fetched array
  const currentProducts = products;
  const totalPages = pagination.totalPages || 1;

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Cuộn lên đẩu grid sản phẩm khi chuyển trang
    window.scrollTo({ top: 300, behavior: "smooth" });
    fetchProducts(filters, newPage);
  };

  // Thay đổi filterDraft khi input filter thay đổi
  const handleFilterDraftChange = (key, value) => {
    setFilterDraft((prev) => ({ ...prev, [key]: value }));
  };

  // Khi bấm nút Lọc, cập nhật filters, searchParams và fetch
  const handleApplyFilters = () => {
    setFilters(filterDraft);
    // Update URL
    const params = new URLSearchParams();
    Object.entries(filterDraft).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
    // fetchProducts sẽ tự động gọi qua useEffect
  };

  // Khi search trong filter sidebar, đồng bộ lên header (update searchParams)
  const handleSidebarSearch = (searchQuery) => {
    handleFilterDraftChange("search", searchQuery);
    // Update searchParams để header cũng nhận được
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    setSearchParams(params);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      status: "",
    });
    setFilterDraft({
      search: "",
      category: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      status: "",
    });
    setSearchParams({});
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Render star rating
  const renderStars = (rating) => {
    if (!rating) return <span className="text-muted small">Chưa đánh giá</span>;

    return (
      <div className="d-flex align-items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={12}
            fill={i < Math.floor(rating) ? "currentColor" : "none"}
            className="text-warning"
          />
        ))}
        <span className="ms-1 small text-muted">({rating})</span>
      </div>
    );
  };

  // Get stock status
  const getStockStatus = (quantity) => {
    if (quantity === undefined || quantity === null)
      return { variant: "secondary", text: "Liên hệ" };
    if (quantity === 0) return { variant: "danger", text: "Hết hàng" };
    if (quantity < 10) return { variant: "warning", text: "Sắp hết hàng" };
    return { variant: "success", text: "Còn hàng" };
  };

  // Handle product click
  const handleProductClick = (productId) => {
    navigate(`/productView/${productId}`);
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    // Implement add to cart functionality
    console.log("Add to cart:", product);
  };

  // Handle add to wishlist
  const handleAddToWishlist = (product) => {
    // Implement add to wishlist functionality
    console.log("Add to wishlist:", product);
  };

  if (loading) {
    return (
      <HelmetProvider>
        <div className="content-wrapper">
          <Header />
          <div >
            <div className="container mt-5">
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Đang tải sản phẩm...</p>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </HelmetProvider>
    );
  }

  if (error) {
    return (
      <HelmetProvider>
        <div>
          <Header />
          <div className="content-wrapper">
            <div className="container mt-5">
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <div className="page-wrapper">
        <Helmet>
          <title>Sản phẩm - Vinsaky</title>
        </Helmet>
        <Header />
        <div className="content-wrapper" style={{ marginTop: "70px" }}>
          <div className="page-content">
            <Container>
              {/* Premium Search & Filter Section */}
              <div className="premium-filter-section mb-5 mt-3">
                <style>{`
                  .premium-filter-section {
                    position: relative;
                  }
                  .premium-filter-header {
                    margin-bottom: 2rem;
                  }
                  .premium-filter-header h2 {
                    font-weight: 800;
                    color: #1e293b;
                    letter-spacing: -0.5px;
                  }
                  .premium-filter-card {
                    background: #ffffff;
                    border-radius: 20px;
                    padding: 1.5rem;
                    box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08);
                    border: 1px solid #f1f5f9;
                    position: relative;
                    z-index: 10;
                  }
                  .filter-label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 0.5rem;
                    display: block;
                  }
                  .premium-select {
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 0.6rem 1rem;
                    font-size: 0.95rem;
                    color: #334155;
                    transition: all 0.2s;
                    background-color: #f8fafc;
                    cursor: pointer;
                  }
                  .premium-select:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    background-color: #ffffff;
                  }
                  .premium-input {
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 0.6rem 1rem;
                    font-size: 0.95rem;
                    color: #334155;
                    transition: all 0.2s;
                    background-color: #f8fafc;
                  }
                  .premium-input:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    background-color: #ffffff;
                  }
                  .btn-filter-action {
                    border-radius: 10px;
                    padding: 0.6rem 1.5rem;
                    font-weight: 600;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    height: 100%;
                  }
                  .btn-apply {
                    background: linear-gradient(135deg, #0d6efd, #2563eb);
                    color: white;
                    border: none;
                    box-shadow: 0 4px 12px rgba(13, 110, 253, 0.2);
                  }
                  .btn-apply:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(13, 110, 253, 0.3);
                  }
                  .btn-clear {
                    background: #f1f5f9;
                    color: #475569;
                    border: 1px solid #e2e8f0;
                  }
                  .btn-clear:hover {
                    background: #e2e8f0;
                    color: #1e293b;
                  }
                  .main-search-wrapper {
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                    background: white;
                    padding: 8px;
                    margin-bottom: 2rem;
                    border: 1px solid #e2e8f0;
                  }
                  .main-search-wrapper .react-autosuggest__input {
                    border: none !important;
                    font-size: 1.1rem !important;
                    padding: 12px 20px !important;
                    box-shadow: none !important;
                    background: transparent !important;
                  }
                `}</style>
                
                <div className="text-center premium-filter-header">
                  <h2>Khám Phá Sản Phẩm</h2>
                  <p className="text-muted">Tìm kiếm thiết bị công nghiệp phù hợp với nhu cầu của bạn</p>
                </div>

                {/* Main Search Bar */}
                <div className="row justify-content-center">
                  <div className="col-lg-8">
                    <div className="main-search-wrapper">
                      <SearchWithAutocomplete
                        initialValue={searchParams.get("search") || ""}
                        onSearch={handleSearch}
                        placeholder="Nhập tên sản phẩm bạn đang tìm kiếm..."
                      />
                    </div>
                  </div>
                </div>

                {/* Filter Grid */}
                <div className="premium-filter-card">
                  <div className="row g-3 align-items-end">
                    {/* Category Filter */}
                    <div className="col-md-3">
                      <label className="filter-label">Danh mục</label>
                      <select
                        className="form-select premium-select"
                        value={filterDraft.category}
                        onChange={(e) => handleFilterDraftChange("category", e.target.value)}
                      >
                        <option value="">Tất cả danh mục</option>
                        {fixedCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Brand Filter */}
                    <div className="col-md-2">
                      <label className="filter-label">Thương hiệu</label>
                      <select
                        className="form-select premium-select"
                        value={filterDraft.brand}
                        onChange={(e) => handleFilterDraftChange("brand", e.target.value)}
                      >
                        <option value="">Tất cả</option>
                        {brands.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range */}
                    <div className="col-md-3">
                      <label className="filter-label">Khoảng giá (VNĐ)</label>
                      <div className="d-flex gap-2">
                        <input
                          type="number"
                          className="form-control premium-input"
                          placeholder="Từ"
                          value={filterDraft.minPrice}
                          onChange={(e) => handleFilterDraftChange("minPrice", e.target.value)}
                        />
                        <span className="d-flex align-items-center text-muted">-</span>
                        <input
                          type="number"
                          className="form-control premium-input"
                          placeholder="Đến"
                          value={filterDraft.maxPrice}
                          onChange={(e) => handleFilterDraftChange("maxPrice", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div className="col-md-2">
                      <label className="filter-label">Tình trạng</label>
                      <select
                        className="form-select premium-select"
                        value={filterDraft.status}
                        onChange={(e) => handleFilterDraftChange("status", e.target.value)}
                      >
                        <option value="">Tất cả trạng thái</option>
                        <option value="New">Hàng Mới</option>
                        <option value="SecondHand">Chưa qua sử dụng</option>
                      </select>
                    </div>

                    {/* Actions */}
                    <div className="col-md-2">
                      <div className="d-flex gap-2 h-100">
                        <button className="btn btn-filter-action btn-apply flex-grow-1" onClick={handleApplyFilters}>
                          <Filter size={18} /> Lọc
                        </button>
                        <button
                          className="btn btn-filter-action btn-clear"
                          onClick={clearFilters}
                          title="Xóa bộ lọc"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="container-fluid" style={{ paddingTop: "1rem" }}>
                <div className="row">
                  {/* Products Section */}
                  <div className="col-12">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <h4>Duyệt Sản Phẩm</h4>
                        <p className="text-muted mb-0">
                          Hiển thị {products.length} sản phẩm
                        </p>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <div className="btn-group" role="group">
                          <button
                            type="button"
                            className={`btn btn-outline-secondary ${
                              viewMode === "grid" ? "active" : ""
                            }`}
                            onClick={() => setViewMode("grid")}
                          >
                            <Grid size={16} />
                          </button>
                          <button
                            type="button"
                            className={`btn btn-outline-secondary ${
                              viewMode === "list" ? "active" : ""
                            }`}
                            onClick={() => setViewMode("list")}
                          >
                            <List size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Results Info */}
                    <Row className="mb-3">
                      <Col>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h5 className="mb-0">
                              Kết quả tìm kiếm
                              {filters.search && (
                                <span className="text-muted">
                                  {" "}
                                  cho "{filters.search}"
                                </span>
                              )}
                            </h5>
                            <small className="text-muted">
                              {pagination.totalItems || products.length} sản phẩm
                            </small>
                          </div>
                          {pagination.totalPages > 1 && (
                            <div>
                              <small className="text-muted">
                                Trang {pagination.currentPage} /{" "}
                                {pagination.totalPages}
                              </small>
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>

                    {/* Error Message */}
                    {error && (
                      <Alert variant="danger" className="mb-4">
                        {error}
                      </Alert>
                    )}

                    {/* Products Grid/List */}
                    {products.length === 0 ? (
                      <div className="text-center py-5">
                        <h5>Không tìm thấy sản phẩm</h5>
                        <p className="text-muted">
                          Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                        </p>
                      </div>
                    ) : (
                      <div
                        className={`row ${viewMode === "list" ? "g-3" : "g-4"}`}
                      >
                        {currentProducts.map((product) => (
                          <div
                            key={product.id}
                            className={
                              viewMode === "list"
                                ? "col-12"
                                : "col-md-6 col-lg-4 col-xl-2-4"
                            }
                          >
                            <div
                              className={`card h-100 product-browser ${
                                viewMode === "list" ? "flex-row" : ""
                              }`}
                            >
                              <div
                                className={viewMode === "list" ? "col-md-3" : ""}
                              >
                                <div className="position-relative">
                                  {product.discount && (
                                    <span className="badge bg-success position-absolute top-0 start-0 m-2 z-index-1">
                                      -{product.discount}%
                                    </span>
                                  )}
                                  <FavoriteButton
                                    productId={product._id}
                                    className="position-absolute top-0 end-0 m-2 z-index-2"
                                  />
                                  <img
                                    src={getProductImage(product)}
                                    className={`card-img-top ${
                                      viewMode === "list" ? "h-100" : ""
                                    }`}
                                    alt={product.name}
                                    style={{
                                      width: "210px",
                                      height: "250px",
                                      objectFit: "contain",
                                      backgroundColor: "#f9f9f9",
                                      border: "1px solid #eee",
                                      borderRadius: "6px",
                                    }}
                                    onError={handleImageError}
                                    onClick={() => handleProductClick(product.id)}
                                  />
                                </div>
                              </div>
                              <div
                                className={`card-body ${
                                  viewMode === "list" ? "col-md-9" : ""
                                }`}
                              >
                                <h6
                                  className="card-title"
                                  onClick={() => handleProductClick(product.id)}
                                  style={{ cursor: "pointer" }}
                                >
                                  {product.name}
                                </h6>
                                <p className="card-text text-muted small">
                                  {product.brand} • {product.category}
                                </p>
                                {renderStars(product.rating)}
                                <div className="d-flex justify-content-between align-items-center mt-2">
                                  <span className="fw-bold text-primary">
                                    {formatPrice(product.price)}
                                  </span>
                                  <span
                                    className={`badge ${
                                      getStockStatus(product.quantity).variant
                                    }`}
                                  >
                                    {getStockStatus(product.quantity).text}
                                  </span>
                                </div>
                                <div className="d-flex gap-2 mt-3">
                                  <button
                                    className="btn btn-primary btn-sm flex-fill"
                                    onClick={() => handleProductClick(product.id)}
                                  >
                                    <Eye size={14} className="me-1" />
                                    Xem chi tiết
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <nav className="mt-4">
                        <ul className="pagination justify-content-center">
                          <li
                            className={`page-item ${
                              currentPage === 1 ? "disabled" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft size={16} />
                            </button>
                          </li>
                          {[...Array(totalPages)].map((_, index) => {
                            const pageNumber = index + 1;
                            return (
                              <li
                                key={pageNumber}
                                className={`page-item ${
                                  currentPage === pageNumber ? "active" : ""
                                }`}
                              >
                                <button
                                  className="page-link"
                                  onClick={() => handlePageChange(pageNumber)}
                                >
                                  {pageNumber}
                                </button>
                              </li>
                            );
                          })}
                          <li
                            className={`page-item ${
                              currentPage === totalPages ? "disabled" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              <ChevronRight size={16} />
                            </button>
                          </li>
                        </ul>
                      </nav>
                    )}
                  </div>
                </div>
              </div>
            </Container>
          </div>
        </div>

        <ChatWidget />
        <Footer />

        {/* Custom CSS for consistent image sizing and hover effects */}
        <style>
          {`
            /* 5 columns for xl screens */
            @media (min-width: 1200px) {
              .col-xl-2-4 {
                flex: 0 0 20%;
                max-width: 20%;
              }
            }
            .product-browser .card-img-top {
              width: 100%;
              height: 240px;
              object-fit: cover;
              object-position: center;
              transition: transform 0.4s ease;
              border-top-left-radius: 16px;
              border-top-right-radius: 16px;
            }
            .product-browser:hover .card-img-top {
              transform: scale(1.08);
            }
            .product-browser .card {
              height: 100%;
              min-height: 420px;
              transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
              border: 1px solid #f1f5f9;
              border-radius: 16px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.03);
              display: flex;
              flex-direction: column;
              overflow: hidden;
              background-color: #ffffff;
            }
            .product-browser:hover .card {
              box-shadow: 0 20px 40px -10px rgba(0,0,0,0.12);
              border-color: #e2e8f0;
            }
            .product-browser {
              transition: transform 0.3s ease-in-out;
            }
            .product-browser:hover {
              transform: translateY(-6px);
            }
            .product-browser .card-body {
              display: flex;
              flex-direction: column;
              min-height: 180px;
              justify-content: flex-start;
              padding: 1.25rem;
            }
            .product-browser .card-title {
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
              min-height: 2.6em;
              line-height: 1.4;
              margin-bottom: 0.5rem;
              font-weight: 700;
              color: #1e293b;
            }
            .product-browser .card-title:hover {
              color: #0d6efd;
            }
            .product-browser .card-text.text-muted.small {
              min-height: 1.5em;
              margin-bottom: 0.5rem;
              display: block;
              color: #64748b !important;
              font-weight: 500;
            }
            .product-browser .fw-bold.text-primary {
              font-size: 1.15rem;
              color: #ef4444 !important; /* Update price color to a more modern red */
            }
            .product-browser .d-flex.gap-2.mt-3 {
              margin-top: auto !important;
            }
            .product-browser .btn-primary {
              border-radius: 10px;
              font-weight: 600;
              background: #f1f5f9;
              border: none;
              color: #3b82f6;
              transition: all 0.2s;
            }
            .product-browser .btn-primary:hover {
              background: #3b82f6;
              color: #ffffff;
            }
            .product-browser .card-img-top[alt="product placeholder"] {
              background-color: #f8f9fa;
              border: 2px dashed #dee2e6;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
            }
            .product-browser .card-img-top[alt="product placeholder"]::before {
              content: "📦";
              font-size: 3rem;
              color: #6c757d;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
          `}
        </style>
      </div>
    </HelmetProvider>
  );
};

export default ProductBrowser;
