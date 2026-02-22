import React, { useState, useEffect } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import "./styles/style.css";
import "./styles/vendor.css";
import Footer from "../Components/Footer";
import Canvas from "../Components/Canvas";
import ChatWidget from "../Components/WidgetChat";
import Header from "../Components/Header";
import {
  Plus,
  X,
  Search,
  Star,
  ShoppingCart,
  Package,
  Scale,
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { authApiClient } from "../Services/auth.service";
import { useNavigate } from "react-router-dom";

const CompareProduct = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [compareProducts, setCompareProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const MAX_COMPARE_PRODUCTS = 4;

  // Backup image path
  const backUpImg = "/images/frigde.png";

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
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await authApiClient.get("/product/");
        console.log("API Response:", response.data);

        const productData = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        setProducts(productData);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Search products
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    const timer = setTimeout(() => {
      const filteredProducts = products
        .filter((product) => {
          const search = searchTerm.toLowerCase();
          return product.name?.toLowerCase().includes(search);
        })
        .filter(
          (product) => !compareProducts.some((cp) => cp.id === product.id)
        );

      setSearchResults(filteredProducts.slice(0, 10)); // Limit to 10 results
      setSearchLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, products, compareProducts]);

  // Add product to comparison
  const addToCompare = (product) => {
    if (compareProducts.length >= MAX_COMPARE_PRODUCTS) {
      alert(
        `Bạn chỉ có thể so sánh tối đa ${MAX_COMPARE_PRODUCTS} sản phẩm cùng lúc.`
      );
      return;
    }

    if (!compareProducts.some((cp) => cp.id === product.id)) {
      setCompareProducts([...compareProducts, product]);
      setSearchTerm("");
      setShowProductSearch(false);
    }
  };

  // Remove product from comparison
  const removeFromCompare = (productId) => {
    setCompareProducts(
      compareProducts.filter((product) => product.id !== productId)
    );
  };

  // Clear all comparisons
  const clearAllComparisons = () => {
    setCompareProducts([]);
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return "Chưa có";
    return `${parseFloat(price).toLocaleString("vi-VN")} VND`;
  };

  // Render star rating
  const renderStars = (rating) => {
    if (!rating) return <span className="text-muted">Chưa đánh giá</span>;

    return (
      <div className="d-flex align-items-center justify-content-center">
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

  // Get comparison features
  const getComparisonFeatures = () => {
    if (compareProducts.length === 0) return [];

    const features = [
      { key: "image", label: "Hình ảnh", type: "image" },
      { key: "name", label: "Tên sản phẩm", type: "text" },
      { key: "brand", label: "Thương hiệu", type: "text" },
      { key: "category", label: "Danh mục", type: "text" },
      { key: "price", label: "Giá", type: "price" },
      { key: "rating", label: "Đánh giá", type: "rating" },
      { key: "quantity", label: "Tình trạng", type: "stock" },
      { key: "capacity", label: "Dung lượng", type: "capacity" },
      { key: "size", label: "Kích thước", type: "text" },
      { key: "weight", label: "Trọng lượng (kg)", type: "text" },
      { key: "voltage", label: "Điện áp", type: "text" },
      { key: "features", label: "Tính năng nổi bật", type: "features" },
    ];

    return features.filter((feature) => {
      if (feature.key === "features") {
        return compareProducts.some(
          (product) => Array.isArray(product.features) && product.features.length > 0
        );
      }
      return compareProducts.some((product) => product[feature.key]);
    });
  };

  // Render feature value
  const renderFeatureValue = (product, feature) => {
    const value = product[feature.key];

    switch (feature.type) {
      case "image":
        return (
          <img
            src={getProductImage(product)}
            alt={product.name}
            className="img-fluid rounded mx-auto d-block"
            style={{ height: "60px", width: "60px", objectFit: "cover" }}
            onError={handleImageError}
          />
        );
      case "price":
        return (
          <span className="fw-bold text-primary small">
            {formatPrice(value)}
          </span>
        );
      case "rating":
        return renderStars(value);
      case "stock":
        return (
          <span
            className={`badge ${value > 0 ? "bg-success" : "bg-danger"} small`}
          >
            {value > 0 ? `Còn hàng (${value})` : "Hết hàng"}
          </span>
        );
      case "capacity":
        return (
          <span className="small">{value ? `${value} kg` : "Chưa có"}</span>
        );
      case "features":
        if (Array.isArray(product.features) && product.features.length > 0) {
          return (
            <ul className="text-start ps-3 mb-0 small">
              {product.features.map((f, idx) => (
                <li key={f.id || idx}>
                  <strong>{f.title}</strong>
                  {f.description ? `: ${f.description}` : ""}
                </li>
              ))}
            </ul>
          );
        }
        return <span className="small">Chưa có</span>;
      case "text":
        return <span className="small">{value || "Chưa có"}</span>;
      default:
        return <span className="small">{value || "Chưa có"}</span>;
    }
  };

  if (loading) {
    return (
      <HelmetProvider>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "100vh" }}
        >
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-2">Đang tải sản phẩm...</p>
          </div>
        </div>
      </HelmetProvider>
    );
  }

  if (error) {
    return (
      <HelmetProvider>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "100vh" }}
        >
          <div className="text-center">
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          </div>
        </div>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <div
        style={{
          overflowX: "hidden",
          paddingLeft: "10px",
          paddingRight: "10px",
        }}
      >
        <Helmet>
          <title>So sánh sản phẩm - Vinsaky Shop</title>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </Helmet>

        {/* Cart Offcanvas */}
        <div
          className="offcanvas offcanvas-end"
          data-bs-scroll="true"
          tabIndex="-1"
          id="offcanvasCart"
          aria-labelledby="offcanvasCartLabel"
        >
          <div className="offcanvas-header justify-content-center">
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <Canvas />
          </div>
        </div>

        <Header />

        <div className="content-wrapper">
          <div className="container" style={{ paddingTop: "2rem" }}>
            {/* Page Header */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h2 className="mb-1">
                      <Scale className="me-2" size={28} />
                      So sánh sản phẩm
                    </h2>
                    <p className="text-muted mb-0">
                      So sánh tối đa {MAX_COMPARE_PRODUCTS} sản phẩm để đưa ra lựa
                      chọn tốt nhất
                    </p>
                  </div>
                  {compareProducts.length > 0 && (
                    <button
                      className="btn btn-outline-danger"
                      onClick={clearAllComparisons}
                    >
                      <Trash2 size={16} className="me-1" />
                      Xóa tất cả
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Add Product Section */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Thêm sản phẩm để so sánh</h5>
                      <span className="badge bg-primary">
                        {compareProducts.length}/{MAX_COMPARE_PRODUCTS} Sản phẩm
                      </span>
                    </div>

                    {/* Search Bar */}
                    <div className="position-relative">
                      <div className="input-group">
                        <span className="input-group-text">
                          <Search size={16} />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Tìm kiếm sản phẩm theo tên, thương hiệu hoặc danh mục..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onFocus={() => setShowProductSearch(true)}
                        />
                      </div>

                      {/* Search Results Dropdown */}
                      {showProductSearch &&
                        (searchTerm || searchResults.length > 0) && (
                          <div
                            className="position-absolute w-100 bg-white border border-top-0 rounded-bottom shadow-lg"
                            style={{
                              zIndex: 1000,
                              maxHeight: "300px",
                              overflowY: "auto",
                            }}
                          >
                            {searchLoading ? (
                              <div className="p-3 text-center">
                                <div
                                  className="spinner-border spinner-border-sm text-primary"
                                  role="status"
                                >
                                  <span className="visually-hidden">
                                    Đang tìm kiếm...
                                  </span>
                                </div>
                              </div>
                            ) : searchResults.length > 0 ? (
                              searchResults.map((product) => (
                                <div
                                  key={product.id}
                                  className="p-3 border-bottom hover-bg-light cursor-pointer d-flex align-items-center"
                                  onClick={() => addToCompare(product)}
                                  style={{ cursor: "pointer" }}
                                  onMouseEnter={(e) =>
                                    (e.target.closest(
                                      ".p-3"
                                    ).style.backgroundColor = "#f8f9fa")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.target.closest(
                                      ".p-3"
                                    ).style.backgroundColor = "transparent")
                                  }
                                >
                                  <img
                                    src={getProductImage(product)}
                                    alt={product.name}
                                    className="me-3 rounded"
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      objectFit: "cover",
                                    }}
                                    onError={handleImageError}
                                  />
                                  <div className="flex-grow-1">
                                    <h6 className="mb-1">{product.name}</h6>
                                    <small className="text-muted">
                                      {product.brand} • {product.category} •{" "}
                                      {formatPrice(product.price)}
                                    </small>
                                  </div>
                                  <Plus size={16} className="text-primary" />
                                </div>
                              ))
                            ) : (
                              searchTerm && (
                                <div className="p-3 text-center text-muted">
                                  Không tìm thấy sản phẩm nào khớp với "
                                  {searchTerm}"
                                </div>
                              )
                            )}

                            {searchResults.length > 0 && (
                              <div className="p-2 border-top bg-light">
                                <button
                                  className="btn btn-sm btn-link text-decoration-none w-100"
                                  onClick={() => setShowProductSearch(false)}
                                >
                                  Đóng
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            {compareProducts.length > 0 ? (
              <div className="row">
                <div className="col-12">
                  <div className="card">
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover mb-0 table-sm">
                          <thead className="table-light">
                            <tr>
                              <th
                                scope="col"
                                className="border-end bg-white sticky-column"
                                style={{ width: "150px", minWidth: "150px" }}
                              >
                                <strong>Thông số</strong>
                              </th>
                              {compareProducts.map((product, index) => (
                                <th
                                  key={product.id}
                                  scope="col"
                                  className="text-center position-relative"
                                  style={{
                                    width: `${Math.floor(
                                      75 / compareProducts.length
                                    )}%`,
                                    minWidth: "180px",
                                  }}
                                >
                                  <div className="pt-3 pb-1">
                                    <small className="text-muted">
                                      Sản phẩm {index + 1}
                                    </small>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {getComparisonFeatures().map((feature) => (
                              <tr key={feature.key}>
                                <td
                                  className="fw-semibold border-end bg-light sticky-column"
                                  style={{ fontSize: "0.9rem" }}
                                >
                                  {feature.label}
                                </td>
                                {compareProducts.map((product) => (
                                  <td
                                    key={product.id}
                                    className="text-center align-middle"
                                    style={{
                                      padding: "0.5rem",
                                      fontSize: "0.85rem",
                                    }}
                                  >
                                    {renderFeatureValue(product, feature)}
                                  </td>
                                ))}
                              </tr>
                            ))}

                            {/* Action Row */}
                            <tr className="table-light">
                              <td className="fw-semibold border-end bg-light sticky-column">
                                <strong>Thao tác</strong>
                              </td>
                              {compareProducts.map((product) => (
                                <td
                                  key={product.id}
                                  className="text-center"
                                  style={{ padding: "0.5rem" }}
                                >
                                  <button
                                    className="btn btn-sm btn-outline-primary me-2"
                                    onClick={() => navigate(`/productView/${product.id}`)}
                                  >
                                    <Eye size={12} className="me-1" />
                                    Xem chi tiết
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => removeFromCompare(product.id)}
                                    style={{ zIndex: 10 }}
                                  >
                                    <X size={12} />
                                  </button>
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="row">
                <div className="col-12">
                  <div className="text-center py-5">
                    <Package size={64} className="text-muted mb-3" />
                    <h4 className="text-muted mb-3">
                      Chưa có sản phẩm để so sánh
                    </h4>
                    <p className="text-muted mb-4">
                      Bắt đầu bằng cách tìm kiếm và thêm sản phẩm để so sánh các
                      tính năng của chúng.
                    </p>
                    <div className="row justify-content-center">
                      <div className="col-md-6">
                        <div className="card bg-light">
                          <div className="card-body">
                            <h6 className="card-title">
                              <CheckCircle
                                size={20}
                                className="text-success me-2"
                              />
                              Cách so sánh sản phẩm
                            </h6>
                            <ol className="text-start mb-0">
                              <li>
                                Sử dụng thanh tìm kiếm phía trên để tìm sản phẩm
                              </li>
                              <li>
                                Nhấp vào sản phẩm từ menu thả xuống để thêm chúng
                              </li>
                              <li>
                                So sánh tối đa {MAX_COMPARE_PRODUCTS} sản phẩm
                                cùng lúc
                              </li>
                              <li>Xem bảng so sánh chi tiết bên dưới</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <ChatWidget />
        <Footer />

        {/* Custom CSS for sticky column and compact table */}
        <style jsx>{`
          .sticky-column {
            position: sticky;
            left: 0;
            z-index: 10;
            background-color: #f8f9fa !important;
            border-right: 2px solid #dee2e6 !important;
          }

          .table-sm td,
          .table-sm th {
            padding: 0.4rem 0.6rem;
            font-size: 0.875rem;
          }

          .table th {
            vertical-align: middle;
            border-bottom: 2px solid #dee2e6;
          }

          .table td {
            vertical-align: middle;
            border-bottom: 1px solid #dee2e6;
          }

          .table-responsive {
            border-radius: 0.375rem;
          }

          .hover-bg-light:hover {
            background-color: #f8f9fa !important;
            transition: background-color 0.15s ease-in-out;
          }

          @media (max-width: 768px) {
            .sticky-column {
              min-width: 120px !important;
              width: 120px !important;
            }

            .table-sm td,
            .table-sm th {
              padding: 0.3rem 0.4rem;
              font-size: 0.8rem;
            }
          }
        `}</style>
      </div>
    </HelmetProvider>
  );
};

export default CompareProduct;
