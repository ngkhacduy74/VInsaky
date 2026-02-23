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

  const MAX_COMPARE_PRODUCTS = 2;

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

        let productData = [];
        if (response.data && response.data.data) {
          if (Array.isArray(response.data.data)) {
            productData = response.data.data;
          } else if (response.data.data.items && Array.isArray(response.data.data.items)) {
            productData = response.data.data.items;
          }
        }

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

            {/* Application Section */}
            <div className="row mb-5">
              <div className="col-12">
                <style>{`
                  .compare-slot {
                    border: 2px dashed #dee2e6;
                    border-radius: 16px;
                    transition: all 0.3s ease;
                    background-color: #f8f9fa;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    height: 100%;
                    min-height: 250px;
                  }
                  .compare-slot:hover {
                    border-color: #4361ee;
                    background-color: #f0f4ff;
                  }
                  .compare-slot-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background-color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    color: #adb5bd;
                    transition: all 0.3s ease;
                  }
                  .compare-slot:hover .compare-slot-icon {
                    color: #4361ee;
                    transform: scale(1.1);
                  }
                  .search-dropdown-menu {
                    max-height: 400px;
                    overflow-y: auto;
                    border-radius: 12px;
                    border: 1px solid #e9ecef;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.08);
                    z-index: 1050;
                  }
                  .search-result-item {
                    border-bottom: 1px solid #f1f3f5;
                    transition: all 0.2s;
                  }
                  .search-result-item:last-child {
                    border-bottom: none;
                  }
                  .search-result-item:hover {
                    background-color: #f8f9fa;
                  }
                  .premium-comparison-box {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.03);
                    padding: 2rem;
                    border: 1px solid #f1f5f9;
                  }
                `}</style>
                <div className="premium-comparison-box mb-4 position-relative">
                  <div className="row justify-content-center mb-4">
                    <div className="col-lg-8 text-center">
                      <h4 className="fw-bold mb-3">Chọn sản phẩm để so sánh</h4>
                      <p className="text-muted">So sánh chi tiết thông số kỹ thuật, tính năng và giá cả giữa các sản phẩm</p>
                      
                      {/* Premium Search input */}
                      <div className="position-relative mt-4">
                        <div className="input-group input-group-lg shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                          <span className="input-group-text bg-white border-end-0" style={{ border: '1px solid #e9ecef' }}>
                            <Search size={20} className="text-muted" />
                          </span>
                          <input
                            type="text"
                            className="form-control border-start-0 ps-0"
                            placeholder="Nhập tên sản phẩm bạn muốn tìm kiếm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setShowProductSearch(true)}
                            style={{ border: '1px solid #e9ecef', fontSize: '1.05rem', padding: '15px' }}
                          />
                          {searchTerm && (
                            <button
                               className="btn btn-white border border-start-0 text-muted"
                               onClick={() => { setSearchTerm(""); setShowProductSearch(false); }}
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>

                        {/* Search Results */}
                        {showProductSearch && (searchTerm.trim() || searchResults.length > 0) && (
                          <div className="position-absolute w-100 bg-white search-dropdown-menu mt-2">
                            {searchLoading ? (
                               <div className="p-4 text-center">
                                 <div className="spinner-border text-primary" role="status">
                                   <span className="visually-hidden">Đang tìm kiếm...</span>
                                 </div>
                               </div>
                            ) : searchResults.length > 0 ? (
                              <div className="list-group list-group-flush rounded-3">
                                {searchResults.map((product) => (
                                  <div
                                    key={product.id}
                                    className="list-group-item list-group-item-action p-3 search-result-item cursor-pointer"
                                    onClick={() => addToCompare(product)}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <div className="d-flex align-items-center">
                                      <div className="me-3" style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #f1f3f5' }}>
                                        <img
                                          src={getProductImage(product)}
                                          alt={product.name}
                                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                          onError={handleImageError}
                                        />
                                      </div>
                                      <div className="flex-grow-1">
                                        <h6 className="mb-1 fw-semibold text-dark">{product.name}</h6>
                                        <div className="text-muted small mb-1">
                                          <span className="badge bg-light text-dark me-2 border">{product.brand || "Khác"}</span>
                                          {product.category || "Danh mục"}
                                        </div>
                                      </div>
                                      <div className="text-end ms-3">
                                        <div className="text-primary fw-bold mb-2">{formatPrice(product.price)}</div>
                                        <button className="btn btn-sm btn-outline-primary rounded-pill px-3">
                                          <Plus size={14} className="me-1" /> Thêm
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : searchTerm ? (
                              <div className="p-4 text-center text-muted">
                                <Package size={32} className="mb-2 opacity-50" />
                                <p className="mb-0">Không tìm thấy sản phẩm nào khớp với "{searchTerm}"</p>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Comparison Slots Grid */}
                  <div className="row g-4 justify-content-center mt-2">
                    {[0, 1].map((slotIndex) => {
                      const selProd = compareProducts[slotIndex];
                      
                      return (
                        <div key={slotIndex} className="col-md-4">
                          {selProd ? (
                            <div className="card h-100 border-0 shadow-sm position-relative" style={{ borderRadius: '16px' }}>
                              <button 
                                className="btn btn-danger btn-sm position-absolute rounded-circle shadow" 
                                style={{ top: '-10px', right: '-10px', width: '30px', height: '30px', padding: 0, zIndex: 10 }}
                                onClick={(e) => { e.stopPropagation(); removeFromCompare(selProd.id); }}
                              >
                                <X size={16} style={{ display: 'block', margin: 'auto' }} />
                              </button>
                              <div className="card-img-top p-3 text-center" style={{ height: '220px', backgroundColor: '#f8f9fa', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
                                <img
                                  src={getProductImage(selProd)}
                                  className="img-fluid"
                                  alt={selProd.name}
                                  style={{ maxHeight: '100%', objectFit: 'contain' }}
                                  onError={handleImageError}
                                />
                              </div>
                              <div className="card-body">
                                <h6 className="card-title fw-bold text-truncate">{selProd.name}</h6>
                                <p className="card-text text-primary fw-bold fs-5 mb-0">{formatPrice(selProd.price)}</p>
                                <p className="text-muted small mt-2 mb-0">Thương hiệu: <span className="text-dark fw-medium">{selProd.brand}</span></p>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="compare-slot" 
                              onClick={() => {
                                const input = document.querySelector('.premium-comparison-box input');
                                if(input) {
                                  input.focus();
                                  input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                              }}
                            >
                              <div className="compare-slot-icon">
                                <Plus size={32} />
                              </div>
                              <h6 className="text-muted fw-semibold">Thêm sản phẩm</h6>
                              <p className="text-muted small text-center px-4">Tìm kiếm để thêm sản phẩm vào ô trống này</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            {compareProducts.length > 0 && (
              <div className="row mb-5">
                <div className="col-12">
                  <div className="card border-0 shadow-sm" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                    <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                      <h5 className="mb-0 fw-bold">Chi tiết so sánh</h5>
                    </div>
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <tbody>
                            {getComparisonFeatures().map((feature, idx) => (
                              <tr key={feature.key}>
                                <td
                                  className={`fw-semibold border-end sticky-column px-4 py-3 align-middle ${idx % 2 === 0 ? 'bg-light' : 'bg-white'}`}
                                  style={{ width: "30%", minWidth: "150px", color: '#495057' }}
                                >
                                  {feature.label}
                                </td>
                                {/* Make sure table has 2 columns for 2 slots consistently */}
                                {[0, 1].map((slotIndex) => {
                                  const product = compareProducts[slotIndex];
                                  return (
                                    <td
                                      key={`${feature.key}-${slotIndex}`}
                                      className={`text-center align-middle px-3 py-3 ${idx % 2 === 0 ? 'bg-white' : ''}`}
                                      style={{ width: "35%", borderRight: slotIndex === 1 ? 'none' : '1px solid #dee2e6' }}
                                    >
                                      {product ? renderFeatureValue(product, feature) : <span className="text-muted small opacity-50">-</span>}
                                    </td>
                                  )
                                })}
                              </tr>
                            ))}
                            {/* Actions Row in details table */}
                            <tr>
                                <td className="fw-semibold border-end sticky-column px-4 py-4 bg-light align-middle text-muted">
                                  Thao tác
                                </td>
                                {[0, 1].map((slotIndex) => {
                                  const product = compareProducts[slotIndex];
                                  return (
                                    <td
                                      key={`action-${slotIndex}`}
                                      className="text-center align-middle py-4 bg-white"
                                      style={{ borderRight: slotIndex === 1 ? 'none' : '1px solid #dee2e6' }}
                                    >
                                      {product ? (
                                        <button
                                          className="btn btn-primary rounded-pill px-4"
                                          onClick={() => navigate(`/productView/${product.id}`)}
                                        >
                                          Xem chi tiết <i className="bi bi-arrow-right ms-1"></i>
                                        </button>
                                      ) : null}
                                    </td>
                                  )
                                })}
                            </tr>
                          </tbody>
                        </table>
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
