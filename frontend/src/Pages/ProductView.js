import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authApiClient } from "../Services/auth.service";
import { Container } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Header from "../Components/Header"; // User header component
import Footer from "../Components/Footer"; // User footer component
import ErrorPage from "../Components/ErrorPage";
import "./ProductView.css";
import WigdetChat from "../Components/WidgetChat.js";
import {
  addToRecentlyViewed,
  loadRecentlyViewed,
} from "../utils/recentlyViewed";
import { useFavorite } from "../hooks/useFavorite";
import { addToCart } from "../utils/cartUtils";

function stripHtml(html) {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

const ProductView = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const mainSwiperRef = React.useRef(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [cartToast, setCartToast] = useState(null);
  const {
    isFavorite,
    loading: favoriteLoading,
    toggleFavorite,
  } = useFavorite(product?._id);

  // Redirect to login if not authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    const returnUrl = `/productView/${productId}`;
    if (!token) {
      sessionStorage.setItem("loginReturnUrl", returnUrl);
      navigate("/login", {
        replace: true,
        state: {
          message: "Vui lòng đăng nhập để xem chi tiết sản phẩm",
          returnUrl,
        },
      });
      return;
    }
    setAuthChecked(true);
  }, [navigate, productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!productId) {
        setError("Product ID is missing from the URL.");
        return;
      }

      const response = await authApiClient.get(`/product/${productId}`);

      const raw = response?.data;
      const productData =
        raw?.data ?? raw?.product ?? (raw && typeof raw === "object" && (raw.id || raw._id) ? raw : null);
      const validProduct = productData && (productData.id || productData._id) ? productData : null;
      setProduct(validProduct);
      // Don't add to recently viewed immediately - wait for user interaction
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const msg = err.response?.data?.message || "";
        if (status === 401) {
          // Token hết hạn hoặc không hợp lệ → clear và redirect login (chỉ 401)
          const returnUrl = `/productView/${productId}`;
          sessionStorage.setItem("loginReturnUrl", returnUrl);
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          navigate("/login", {
            replace: true,
            state: {
              message: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại",
              returnUrl,
            },
          });
          return;
        }
        if (status === 403) {
          // Không đủ quyền - KHÔNG clear token, KHÔNG redirect (tránh vòng lặp đăng nhập)
          setError(
            msg || "Bạn không có quyền xem sản phẩm này. Vui lòng kiểm tra tài khoản hoặc liên hệ quản trị viên."
          );
          return;
        }
        switch (status) {
          case 404:
            setError("Không tìm thấy sản phẩm này.");
            break;
          case 500:
            setError("Lỗi máy chủ. Vui lòng thử lại sau.");
            break;
          default:
            setError(`Lỗi ${status}: ${msg || "Unknown error occurred"}`);
        }
      } else if (err.request) {
        setError("Lỗi mạng. Vui lòng kiểm tra kết nối.");
      } else {
        setError("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authChecked) {
      fetchProduct();
    }
  }, [productId, authChecked]);


  // Scroll to top when component mounts or productId changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  // Load recently viewed products
  useEffect(() => {
    const loadRecentlyViewedProducts = () => {
      const recentlyViewedProducts = loadRecentlyViewed();
      // Filter out current product by both id and productId
      const filteredProducts = recentlyViewedProducts.filter(
        (p) => p.id !== productId && p.id !== product?.id
      );
      setRecentlyViewed(filteredProducts.slice(0, 4)); // Show only 4 products
    };

    loadRecentlyViewedProducts();
  }, [productId, product]);

  // Add product to recently viewed when user scrolls down to view details
  useEffect(() => {
    if (product) {
      const handleScroll = () => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;

        // If user scrolls down more than 50% of the page, consider they're viewing the product
        if (scrollPosition > windowHeight * 0.5) {
          addToRecentlyViewed(product);
          // Remove scroll listener after adding to recently viewed
          window.removeEventListener("scroll", handleScroll);
        }
      };

      window.addEventListener("scroll", handleScroll);

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [product]);

  // Redirect to login if productId is missing
  useEffect(() => {
    if (!productId) {
      navigate("/login", {
        state: {
          message: "Vui lòng chọn sản phẩm để xem chi tiết.",
        },
      });
    }
  }, [productId, navigate]);

  const getQuantityStatus = useCallback((quantity) => {
    if (quantity === undefined || quantity === null)
      return { variant: "secondary", text: "Liên hệ" };
    if (quantity === 0) return { variant: "danger", text: "Hết hàng" };
    if (quantity < 10) return { variant: "warning", text: "Sắp hết hàng" };
    return { variant: "success", text: "Còn hàng" };
  }, []);

  const formatPrice = useCallback((price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "success";
      case "used":
        return "warning";
      case "refurbished":
        return "info";
      case "second hand":
        return "warning";
      default:
        return "secondary";
    }
  }, []);

  const getProductImages = useCallback((product) => {
    if (Array.isArray(product?.image) && product.image.length > 0) {
      return product.image.filter((img) => img && typeof img === "string");
    } else if (typeof product?.image === "string" && product.image) {
      return [product.image];
    }
    // Return a placeholder image if no images are available
    return [
      "https://fushimavina.com/data/data/files/test/may-lam-da-100kg.jpg",
    ];
  }, []);

  const handleImageError = (e) => {
    e.target.src =
      "https://fushimavina.com/data/data/files/test/may-lam-da-100kg.jpg";
  };

  const handleQuantityChange = (change) => {
    setQuantity((prev) => Math.max(1, prev + change));
  };

  const handleContactUs = () => {
    if (product) {
      addToRecentlyViewed(product);
    }
    setShowPhone((prev) => !prev);
  };

  const handleNavigateToProduct = (productId) => {
    // Scroll to top before navigating
    window.scrollTo(0, 0);
    navigate(`/productView/${productId}`);
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1];
      const ampersandPosition = videoId.indexOf("&");
      if (ampersandPosition !== -1) {
        videoId = videoId.substring(0, ampersandPosition);
      }
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1];
      const ampersandPosition = videoId.indexOf("&");
      if (ampersandPosition !== -1) {
        videoId = videoId.substring(0, ampersandPosition);
      }
    } else if (url.includes("youtube.com/embed/")) {
      return url;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const isYouTubeUrl = (url) => {
    return url && (url.includes("youtube.com") || url.includes("youtu.be"));
  };

  if (loading) {
    return (
      <div className="pdv-page">
        <Header />
        <div className="content-wrapper">
          <Container className="py-5" style={{ minHeight: "60vh", maxWidth: 1200 }}>
            <div
              className="pdv-product-block"
              style={{ minHeight: 400, alignItems: "center", justifyContent: "center" }}
            >
              <div className="d-flex flex-column align-items-center gap-3">
                <div
                  className="spinner-border text-primary"
                  role="status"
                  style={{ width: "3rem", height: "3rem" }}
                />
                <span className="text-muted">Đang tải sản phẩm...</span>
              </div>
            </div>
          </Container>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdv-page">
        <Header />
        <div className="content-wrapper">
          <Container className="py-5" style={{ minHeight: "60vh", maxWidth: 1200 }}>
            <div
              className="pdv-product-block"
              style={{ minHeight: 300, flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem" }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
              <h5 className="mb-2">Không tải được sản phẩm</h5>
              <p className="text-muted mb-4" style={{ textAlign: "center" }}>{error}</p>
              <button
                type="button"
                className="pdv-btn-contact"
                style={{ maxWidth: 220 }}
                onClick={() => navigate("/products")}
              >
                Xem sản phẩm khác
              </button>
            </div>
          </Container>
        </div>
        <Footer />
      </div>
    );
  }


  if (!product) {
    return (
      <>
        <Header />
        <div className="content-wrapper">
          <ErrorPage message="Product not available." />
        </div>
        <Footer />
      </>
    );
  }

  const images = getProductImages(product);
  const quantityStatus = getQuantityStatus(product.quantity);

  return (
    <div className="pdv-page">
      <Header />
      <div className="content-wrapper">
        <Container className="py-4" style={{ maxWidth: 1200 }}>
          {/* Breadcrumb */}
          <nav className="pdv-breadcrumb" aria-label="breadcrumb">
            <button type="button" className="border-0 bg-transparent p-0 text-secondary" onClick={() => navigate("/")}>
              Trang chủ
            </button>
            <span>/</span>
            <button type="button" className="border-0 bg-transparent p-0 text-secondary" onClick={() => navigate("/products")}>
              Sản phẩm
            </button>
            <span>/</span>
            <span>{product.name || `Product #${productId}`}</span>
          </nav>

          {/* Unified product block */}
          <div className="pdv-product-block">
            {/* Gallery */}
            <div className="pdv-gallery">
              <div className="pdv-gallery-main">
                {images.length > 1 ? (
                  <Swiper
                    spaceBetween={10}
                    navigation={true}
                    modules={[Navigation, Pagination]}
                    className="product-image-swiper"
                    style={{ width: "100%", height: "100%", minHeight: 320 }}
                    onSwiper={(swiper) => (mainSwiperRef.current = swiper)}
                    onSlideChange={(swiper) =>
                      setSelectedImageIndex(swiper.activeIndex)
                    }
                  >
                    {images.map((image, index) => (
                      <SwiperSlide key={index}>
                        <div style={{ position: "relative", width: "100%", height: "100%" }}>
                          <img
                            src={image}
                            alt={`${product.name} - Image ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              display: "block",
                            }}
                            onError={handleImageError}
                            loading="lazy"
                          />
                          {product.discount && index === 0 && (
                            <span className="pdv-gallery-discount">
                              -{product.discount}% GIẢM
                            </span>
                          )}
                          <span
                            style={{
                              position: "absolute",
                              bottom: 8,
                              right: 8,
                              background: "rgba(0,0,0,0.6)",
                              color: "#fff",
                              fontSize: "0.8rem",
                              padding: "4px 8px",
                              borderRadius: 4,
                            }}
                          >
                            {index + 1} / {images.length}
                          </span>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img
                      src={images[0]}
                      alt={product.name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                      onError={handleImageError}
                    />
                    {product.discount && (
                      <span className="pdv-gallery-discount">
                        -{product.discount}% GIẢM
                      </span>
                    )}
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="pdv-gallery-thumbs">
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className={selectedImageIndex === index ? "active" : ""}
                      onClick={() => {
                        setSelectedImageIndex(index);
                        mainSwiperRef.current?.slideTo(index);
                      }}
                      onError={handleImageError}
                      loading="lazy"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="pdv-info">
              <h1>{product.name || "Product Name"}</h1>
              <div className="pdv-info-tags">
                {product.brand && (
                  <span className="pdv-tag pdv-tag--brand">
                    <i className="fas fa-tag me-1" style={{ fontSize: "0.7rem" }}></i>
                    {product.brand}
                  </span>
                )}
                {product.status && (
                  <span className={`pdv-tag pdv-tag--status`}>
                    {product.status}
                  </span>
                )}
                <span
                  className={`pdv-tag pdv-tag--stock ${
                    quantityStatus.variant === "warning" ? "warning" : ""
                  } ${quantityStatus.variant === "danger" ? "danger" : ""}`}
                >
                  {quantityStatus.text}
                </span>
              </div>

              <div className="pdv-price-block">
                <div>
                  <div className="pdv-price">{formatPrice(product.price)}</div>
                  {product.discount && (
                    <div className="pdv-price-old">
                      {formatPrice(
                        product.price * (1 + product.discount / 100)
                      )}
                    </div>
                  )}
                </div>
                {product.discount && (
                  <span className="pdv-price-save-pill">
                    🏷 Tiết kiệm {product.discount}%
                  </span>
                )}
              </div>

              <div className="pdv-quantity-row">
                <div className="d-flex align-items-center gap-2">
                  <span className="pdv-quantity-label">Số lượng:</span>
                  <div className="pdv-quantity-input">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(-1)}
                      aria-label="Giảm số lượng"
                    >
                      −
                    </button>
                    <input
                      type="text"
                      value={quantity}
                      readOnly
                      aria-label="Số lượng"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(1)}
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>
                </div>
                <span className="pdv-stock-note">
                  {product.quantity !== undefined
                    ? `${product.quantity} sản phẩm có sẵn`
                    : "Liên hệ để biết tình trạng hàng"}
                </span>
              </div>

              <div className="pdv-actions">
                {product.business_phone ? (
                  <button
                    type="button"
                    className="pdv-btn-contact"
                    onClick={() => {
                      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                      if (isMobile) {
                        window.open(`tel:${product.business_phone}`);
                      } else {
                        window.open(`https://zalo.me/${product.business_phone}`, "_blank");
                      }
                    }}
                    title="Bấm để liên hệ"
                  >
                    <i className="fas fa-phone-alt"></i>
                    {product.business_phone}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="pdv-btn-contact"
                    onClick={handleContactUs}
                  >
                    <i className="fas fa-phone"></i>
                    Liên hệ
                  </button>
                )}
                {!isFavorite && product && (
                  <button
                    type="button"
                    className="pdv-btn-favorite"
                    onClick={toggleFavorite}
                    disabled={favoriteLoading}
                  >
                    <i className="fas fa-heart"></i>
                    Thêm vào yêu thích
                  </button>
                )}
              </div>

              {product.quantity !== undefined &&
                product.quantity < 10 &&
                product.quantity > 0 && (
                  <div className="pdv-alert-low">
                    <i className="fas fa-exclamation-triangle mt-1"></i>
                    <div>
                      <strong>Sắp hết hàng</strong>
                      <p>Chỉ còn {product.quantity} sản phẩm trong kho. Đặt hàng sớm!</p>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Product Specs */}
          <div className="pdv-specs">
            <div className="pdv-specs-header">
              <i className="fas fa-info-circle text-primary"></i>
              Thông tin sản phẩm
            </div>
            <div className="pdv-specs-body">
              {product.brand && (
                <div className="pdv-spec-item">
                  <div className="pdv-spec-label">Thương hiệu</div>
                  <div className="pdv-spec-value">{product.brand}</div>
                </div>
              )}
              {product.category && (
                <div className="pdv-spec-item">
                  <div className="pdv-spec-label">Danh mục</div>
                  <div className="pdv-spec-value">{product.category}</div>
                </div>
              )}
              {product.status && (
                <div className="pdv-spec-item">
                  <div className="pdv-spec-label">Tình trạng</div>
                  <div className="pdv-spec-value">{product.status}</div>
                </div>
              )}
              {product.warranty_period && (
                <div className="pdv-spec-item">
                  <div className="pdv-spec-label">Bảo hành</div>
                  <div className="pdv-spec-value">{product.warranty_period} tháng</div>
                </div>
              )}
              {product.size && (
                <div className="pdv-spec-item">
                  <div className="pdv-spec-label">Kích thước</div>
                  <div className="pdv-spec-value">{product.size}</div>
                </div>
              )}
              {product.weight && (
                <div className="pdv-spec-item">
                  <div className="pdv-spec-label">Trọng lượng</div>
                  <div className="pdv-spec-value">{product.weight} kg</div>
                </div>
              )}
              {product.voltage && (
                <div className="pdv-spec-item">
                  <div className="pdv-spec-label">Điện áp</div>
                  <div className="pdv-spec-value">{product.voltage}</div>
                </div>
              )}
            </div>
            {product.features && product.features.length > 0 && (
              <div className="pdv-features">
                {product.features.map((feature, index) => (
                  <div key={feature.id || index} className="pdv-feature-item">
                    <div className="pdv-feature-title">
                      <i className="fas fa-check-circle text-primary me-2"></i>
                      {feature.title}
                    </div>
                    {feature.description && (
                      <div className="pdv-feature-desc">{feature.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          {(() => {
            const descText = stripHtml(product.description || "");
            const paragraphs = descText
              .split(/\n+/)
              .map((p) => p.trim())
              .filter((p) => p.length > 0);
            const shouldTruncate = descText.length > 300;

            return (
              <div className="pdv-description">
                <div className="pdv-description-header">
                  <div className="pdv-description-icon-circle">
                    <i className="fas fa-file-alt"></i>
                  </div>
                  <div>
                    <h2>Mô tả sản phẩm</h2>
                    <p className="pdv-description-subtitle">
                      Thông tin chi tiết về sản phẩm
                    </p>
                  </div>
                </div>
                <div className="pdv-description-body">
                  <div className="pdv-description-quote-icon" aria-hidden="true">
                    <i className="fas fa-quote-left"></i>
                  </div>
                  <div
                    className={`pdv-description-content ${
                      !descExpanded && shouldTruncate
                        ? "pdv-description-collapsed"
                        : ""
                    }`}
                  >
                    {paragraphs.length > 0 ? (
                      paragraphs.map((p, i) => <p key={i}>{p}</p>)
                    ) : (
                      <p className="pdv-description-empty">
                        <i className="fas fa-info-circle me-2"></i>
                        Chưa có mô tả cho sản phẩm này.
                      </p>
                    )}
                  </div>
                  {shouldTruncate && (
                    <button
                      type="button"
                      className="pdv-description-toggle"
                      onClick={() => setDescExpanded((prev) => !prev)}
                    >
                      {descExpanded ? "Thu gọn" : "Xem thêm"}
                      <i
                        className={`fas fa-chevron-${
                          descExpanded ? "up" : "down"
                        } ms-2`}
                      ></i>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Videos */}
          {product.video &&
            Array.isArray(product.video) &&
            product.video.length > 0 && (
              <section className="pdv-videos">
                <h2>
                  <i className="fas fa-play-circle me-2"></i>
                  Video sản phẩm
                </h2>
                {product.video.map((vid, index) => {
                  const isYouTube = isYouTubeUrl(vid);
                  const embedUrl = isYouTube
                    ? getYouTubeEmbedUrl(vid)
                    : vid;
                  return (
                    <div key={index} className="pdv-video-wrapper">
                      {isYouTube ? (
                        <div className="ratio ratio-16x9" style={{ minHeight: 350 }}>
                          <iframe
                            src={embedUrl}
                            title={`Product video ${index + 1}`}
                            allowFullScreen
                            style={{ border: "none", width: "100%", height: "100%" }}
                          ></iframe>
                        </div>
                      ) : (
                        <video
                          controls
                          className="w-100"
                          style={{ maxHeight: 500, minHeight: 350 }}
                          src={embedUrl}
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  );
                })}
              </section>
            )}
        </Container>

        {/* Recently Viewed Products */}
        {recentlyViewed.length > 0 && (
          <Container style={{ maxWidth: 1200, marginTop: "2rem" }}>
          <section className="pdv-recent">
            <h3>Sản phẩm đã xem gần đây</h3>
            <p className="pdv-recent-sub">Dựa trên lịch sử xem của bạn</p>
            <div className="pdv-recent-grid">
              {recentlyViewed.map((recentProduct) => (
                <div
                  key={recentProduct.id}
                  className="pdv-recent-card"
                  onClick={() => handleNavigateToProduct(recentProduct.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleNavigateToProduct(recentProduct.id);
                    }
                  }}
                >
                  <div className="position-relative">
                    <img
                      src={getProductImages(recentProduct)[0]}
                      alt={recentProduct.name}
                      onError={handleImageError}
                      loading="lazy"
                    />
                    {recentProduct.discount && (
                      <span
                        className="position-absolute top-0 start-0 m-2 px-2 py-1 rounded"
                        style={{
                          background: "#dc3545",
                          color: "#fff",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        -{recentProduct.discount}%
                      </span>
                    )}
                  </div>
                  <div className="pdv-recent-card-body">
                    <div className="pdv-recent-card-title">{recentProduct.name}</div>
                    <div className="pdv-recent-card-price">
                      {formatPrice(recentProduct.price)}
                    </div>
                    <button
                      type="button"
                      className="pdv-btn-favorite mt-2 w-100"
                      style={{ fontSize: "0.875rem", padding: "0.5rem" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToProduct(recentProduct.id);
                      }}
                    >
                      Xem lại
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
          </Container>
        )}

        <WigdetChat></WigdetChat>
      </div>
      {/* Cart Toast */}
      {cartToast && (
        <div style={{
          position: 'fixed', top: 80, right: 24, background: '#fff',
          borderRadius: 10, boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
          border: '1px solid #e2e8f0', padding: '0.85rem 1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          zIndex: 1000, animation: 'slideInRight 0.35s ease', maxWidth: 340,
        }}>
          <span style={{ fontSize: '1.25rem' }}>{cartToast.icon}</span>
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{cartToast.text}</span>
          <button
            type="button"
            style={{
              background: '#eff6ff', border: 'none', color: '#3b82f6',
              padding: '0.3rem 0.7rem', borderRadius: 6, fontWeight: 600,
              fontSize: '0.8rem', cursor: 'pointer', marginLeft: 4,
            }}
            onClick={() => navigate('/cart')}
          >
            Xem giỏ
          </button>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProductView;
