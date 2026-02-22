import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Heart, Trash2, Eye } from "lucide-react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import FavoriteButton from "../Components/FavoriteButton";
import favoriteService from "../Services/favorite.service";
import { useAuth } from "../hooks/useAuth";

const Favorites = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  console.log("Favorites page - user from useAuth:", user);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", {
        state: {
          message: "Vui lòng đăng nhập để xem danh sách yêu thích",
          returnUrl: "/favorites",
        },
      });
      return;
    }
    if (user) {
      fetchFavorites();
    }
    // eslint-disable-next-line
  }, [user, loading, currentPage, navigate]);

  const fetchFavorites = async () => {
    try {
      setError(null);
      const response = await favoriteService.getFavorites(currentPage, 12);
      console.log("Favorites page - API response:", response);
      if (response.success) {
        setFavorites(response.data);
        setTotalPages(response.totalPages);
        setTotalItems(response.total);
      }
    } catch (error) {
      console.error("Favorites page - Error fetching favorites:", error);
      setError("Không thể tải danh sách yêu thích. Vui lòng thử lại sau.");
    }
  };

  const handleProductClick = (productId) => {
    console.log("[Favorites] handleProductClick - productId:", productId);
    navigate(`/productView/${productId}`);
  };

  const handleRemoveFromFavorites = async (productId) => {
    try {
      await favoriteService.removeFromFavorites(productId);
      // Refresh the list
      fetchFavorites();
    } catch (error) {
      console.error("Error removing from favorites:", error);
      alert("Không thể xóa sản phẩm khỏi danh sách yêu thích");
    }
  };

  const handleClearAllFavorites = async () => {
    if (
      window.confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm yêu thích?")
    ) {
      try {
        await favoriteService.clearAllFavorites();
        setFavorites([]);
        setTotalItems(0);
        setTotalPages(1);
      } catch (error) {
        console.error("Error clearing favorites:", error);
        alert("Không thể xóa danh sách yêu thích");
      }
    }
  };

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getProductImage = (product) => {
    if (product.productId?.image) {
      if (
        Array.isArray(product.productId.image) &&
        product.productId.image.length > 0
      ) {
        const firstImage = product.productId.image[0];
        if (firstImage && firstImage.trim() !== "") {
          if (firstImage.startsWith("/") || firstImage.startsWith("./")) {
            const baseUrl = `${process.env.REACT_APP_BACKEND_URL}`;
            return firstImage.startsWith("/")
              ? `${baseUrl}${firstImage}`
              : `${baseUrl}/${firstImage.replace("./", "")}`;
          }
          if (
            firstImage.startsWith("http://") ||
            firstImage.startsWith("https://")
          ) {
            return firstImage;
          }
          return firstImage;
        }
      } else if (typeof product.productId.image === "string") {
        if (product.productId.image.trim() !== "") {
          if (
            product.productId.image.startsWith("/") ||
            product.productId.image.startsWith("./")
          ) {
            const baseUrl = `${process.env.REACT_APP_BACKEND_URL}`;
            return product.productId.image.startsWith("/")
              ? `${baseUrl}${product.productId.image}`
              : `${baseUrl}/${product.productId.image.replace("./", "")}`;
          }
          if (
            product.productId.image.startsWith("http://") ||
            product.productId.image.startsWith("https://")
          ) {
            return product.productId.image;
          }
          return product.productId.image;
        }
      }
    }
    return "/images/frigde.png";
  };

  const handleImageError = (e) => {
    e.target.src = "/images/frigde.png";
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div>
      <Header />
      <div className="content-wrapper">
        <Container className="py-5">
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="fw-bold mb-0">
                <Heart className="text-danger me-2" size={28} />
                Danh sách yêu thích
              </h2>
              {favorites.length > 0 && (
                <Button
                  variant="outline-danger"
                  onClick={handleClearAllFavorites}
                  className="d-flex align-items-center gap-2"
                >
                  <Trash2 size={16} />
                  Xóa tất cả
                </Button>
              )}
            </div>
            <p className="text-muted mb-0">
              {totalItems > 0
                ? `Bạn có ${totalItems} sản phẩm trong danh sách yêu thích`
                : "Chưa có sản phẩm nào trong danh sách yêu thích"}
            </p>
          </div>

          {error ? (
            <Alert variant="danger">
              <Alert.Heading>Lỗi!</Alert.Heading>
              <p>{error}</p>
              <Button variant="outline-danger" onClick={fetchFavorites}>
                Thử lại
              </Button>
            </Alert>
          ) : favorites.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <Heart size={64} className="text-muted mb-3" />
                <h4 className="text-muted mb-3">Danh sách yêu thích trống</h4>
                <p className="text-muted mb-4">
                  Bạn chưa có sản phẩm nào trong danh sách yêu thích.
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate("/productBrowser")}
                >
                  Khám phá sản phẩm
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <>
              <Row>
                {favorites.map((favorite) => {
                  const product = favorite.productId;
                  if (!product) return null;

                  return (
                    <Col
                      key={favorite._id}
                      xs={12}
                      sm={6}
                      md={4}
                      lg={3}
                      className="mb-4"
                    >
                      <Card className="h-100 border-0 shadow-sm product-card">
                        <div className="position-relative image-container">
                          <img
                            src={getProductImage(favorite)}
                            className="card-img-top"
                            alt={product.name}
                            onClick={() => handleProductClick(product.id || product._id)}
                            onError={handleImageError}
                          />
                          {product.discount && (
                            <span className="badge bg-success position-absolute top-0 start-0 m-2">
                              -{product.discount}%
                            </span>
                          )}
                        </div>
                        <Card.Body className="d-flex flex-column">
                          <h6
                            className="card-title fw-bold mb-2 cursor-pointer"
                            style={{
                              lineHeight: "1.3",
                              height: "2.6em",
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                            onClick={() => handleProductClick(product.id || product._id)}
                          >
                            {product.name}
                          </h6>
                          <p className="text-muted small mb-2">
                            {product.brand} • {product.category}
                          </p>
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="fw-bold text-success">
                                {formatPrice(product.price)}
                              </span>
                              <span
                                className={`badge ${
                                  product.quantity === 0
                                    ? "bg-danger"
                                    : product.quantity < 10
                                    ? "bg-warning"
                                    : "bg-success"
                                }`}
                              >
                                {product.quantity === 0
                                  ? "Hết hàng"
                                  : product.quantity < 10
                                  ? "Sắp hết"
                                  : "Còn hàng"}
                              </span>
                            </div>
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="w-100"
                                onClick={() => handleProductClick(product.id || product._id)}
                              >
                                <Eye size={14} className="me-1" />
                                Xem chi tiết
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleRemoveFromFavorites(product.id || product._id)}
                                className="d-flex align-items-center justify-content-center"
                                style={{ minWidth: 40 }}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <nav>
                    <ul className="pagination">
                      <li
                        className={`page-item ${
                          currentPage === 1 ? "disabled" : ""
                        }`}
                      >
                        <Button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Trước
                        </Button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <li
                            key={page}
                            className={`page-item ${
                              currentPage === page ? "active" : ""
                            }`}
                          >
                            <Button
                              className="page-link"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          </li>
                        )
                      )}
                      <li
                        className={`page-item ${
                          currentPage === totalPages ? "disabled" : ""
                        }`}
                      >
                        <Button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Sau
                        </Button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </Container>
      </div>
      <Footer />
    </div>
  );
};

export default Favorites;
