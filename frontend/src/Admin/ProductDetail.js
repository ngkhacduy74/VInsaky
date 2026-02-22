import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  Alert,
  Card,
  Modal,
  Spinner,
  Form,
} from "react-bootstrap";
import HeaderAdmin from "../Components/HeaderAdmin";
import Sidebar from "../Components/Sidebar";
import ErrorPage from "../Components/ErrorPage";
import "./styles/AdminModal.css";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  timeout: 5000,
});

const convertToEmbedUrl = (url) => {
  const videoIdMatch = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&?]+)/);
  return videoIdMatch
    ? `https://www.youtube.com/embed/${videoIdMatch[1]}`
    : url;
};

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    brand: "",
    price: "",
    business_phone: "",
    quantity: "",
    status: "New",
    description: ""
  });
  const [editErrors, setEditErrors] = useState({});
  const [editSuccess, setEditSuccess] = useState("");

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      if (!productId) {
        setError("Product ID is missing from the URL.");
        return;
      }

      const response = await api.get(`/product/${productId}`, {
        headers: {
          token,
          "Content-Type": "application/json",
        },
      });

      const productData =
        response.data.data || response.data.product || response.data;
      setProduct(productData);
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 401:
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            setError("Session expired. Redirecting to login...");
            setTimeout(() => navigate("/login"), 2000);
            break;
          case 403:
            setError(
              "Access denied. You dont have permission to view this product."
            );
            break;
          case 404:
            setError(
              "Product not found. It may have been deleted or the ID is incorrect."
            );
            break;
          case 500:
            setError("Server error. Please try again later.");
            break;
          default:
            setError(
              `Error ${err.response.status}: ${
                err.response.data?.message || "Unknown error occurred"
              }`
            );
        }
      } else if (err.request) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId, navigate]);

  const getQuantityStatus = useCallback((quantity) => {
    if (quantity === undefined || quantity === null)
      return { variant: "secondary", text: "Unknown" };
    if (quantity === 0) return { variant: "danger", text: "Out of Stock" };
    if (quantity < 10) return { variant: "warning", text: "Low Stock" };
    return { variant: "success", text: "In Stock" };
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
    return [
      "https://fushimavina.com/data/data/files/test/may-lam-da-100kg.jpg",
    ];
  }, []);

  const handleImageError = (e) => {
    e.target.src =
      "https://fushimavina.com/data/data/files/test/may-lam-da-100kg.jpg";
  };

  // Handle edit product - show edit modal
  const handleEditProduct = () => {
    if (!product) return;

    setEditForm({
      name: product.name || "",
      brand: product.brand || "",
      price: product.price || "",
      business_phone: product.business_phone || "",
      quantity: product.quantity || "",
      status: product.status || "New",
      description: product.description || ""
    });
    setEditErrors({});
    setEditSuccess("");
    setShowEditModal(true);
  };

  // Handle edit form change
  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (editErrors[field]) {
      setEditErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Validate edit form
  const validateEditForm = () => {
    const newErrors = {};

    if (!editForm.name.trim()) {
      newErrors.name = "Tên sản phẩm là bắt buộc";
    }

    if (!editForm.brand.trim()) {
      newErrors.brand = "Thương hiệu là bắt buộc";
    }

    if (!editForm.price || parseFloat(editForm.price) < 1000) {
      newErrors.price = "Giá phải lớn hơn hoặc bằng 1.000 VND";
    }

    if (!editForm.business_phone || editForm.business_phone.trim() === "") {
      newErrors.business_phone = "Số điện thoại sản phẩm là bắt buộc";
    }

    if (!editForm.quantity || parseInt(editForm.quantity) <= 0) {
      newErrors.quantity = "Số lượng phải lớn hơn 0";
    }

    if (!editForm.description.trim()) {
      newErrors.description = "Mô tả là bắt buộc";
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Confirm edit product
  const confirmEditProduct = async () => {
    if (!validateEditForm()) return;

    try {
      setEditLoading(true);
      setEditErrors({});
      setEditSuccess("");

      const token = localStorage.getItem("token");
      if (!token) {
        setEditErrors({
          general: "Authentication token not found. Please log in again.",
        });
        return;
      }

      const dataToSend = {
        name: editForm.name.trim(),
        brand: editForm.brand.trim(),
        price: parseFloat(editForm.price),
        business_phone: editForm.business_phone.trim(),
        quantity: parseInt(editForm.quantity),
        status: editForm.status,
        description: editForm.description.trim(),
      };

      const response = await api.put(
        `/product/update/${productId}`,
        dataToSend,
        {
          headers: {
            token,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local product state
      setProduct((prev) => ({
        ...prev,
        ...dataToSend,
      }));

      setEditSuccess("Cập nhật sản phẩm thành công!");

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowEditModal(false);
        setEditSuccess("");
      }, 2000);
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setEditErrors({ general: "Session expired. Please log in again." });
            break;
          case 403:
            setEditErrors({
              general:
                "Access denied. You don't have permission to edit this product.",
            });
            break;
          case 404:
            setEditErrors({
              general: "Product not found. It may have been deleted.",
            });
            break;
          case 422:
            setEditErrors({
              general:
                err.response.data?.message ||
                "Validation error. Please check your input.",
            });
            break;
          default:
            setEditErrors({
              general:
                err.response.data?.message ||
                "Failed to update product. Please try again.",
            });
        }
      } else if (err.request) {
        setEditErrors({
          general: "Network error. Please check your connection and try again.",
        });
      } else {
        setEditErrors({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setEditLoading(false);
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setShowEditModal(false);
    setEditForm({
      name: "",
      brand: "",
      price: "",
      business_phone: "",
      quantity: "",
      status: "New",
      description: ""
    });
    setEditErrors({});
    setEditSuccess("");
  };

  if (loading) {
    return (
      <Container
        fluid
        className="bg-light admin-page"
        style={{ minHeight: "100vh" }}
      >
        <HeaderAdmin />
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "50vh" }}
        >
          <Card className="shadow-sm w-100" style={{ maxWidth: "600px" }}>
            <Card.Body>
              <div className="placeholder-glow">
                <div
                  className="placeholder col-6 mb-3"
                  style={{ height: "30px" }}
                ></div>
                <div
                  className="placeholder col-12 mb-3"
                  style={{ height: "200px" }}
                ></div>
                <div
                  className="placeholder col-4"
                  style={{ height: "20px" }}
                ></div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    );
  }

  if (error) {
    return <ErrorPage message={error} />;
  }

  if (!product) {
    return <ErrorPage message="No product data available." />;
  }

  const images = getProductImages(product);
  const quantityStatus = getQuantityStatus(product.quantity);

  return (
    <Container
      fluid
      className="bg-light admin-page"
      style={{ minHeight: "100vh" }}
    >
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
        <Col className="p-4">
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Button
                  variant="link"
                  className="p-0 text-decoration-none"
                  onClick={() => navigate("/products")}
                >
                  Products
                </Button>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {product.name || `Product #${productId}`}
              </li>
            </ol>
          </nav>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-2 text-primary">
                {product.name || "Unnamed Product"}
              </h2>
              <div className="d-flex align-items-center gap-3">
                <p className="text-muted mb-0">ID: {product.id || productId}</p>
                {product.brand && (
                  <Badge bg="outline-primary" className="px-3 py-1">
                    <i className="fas fa-tag me-1"></i>
                    {product.brand}
                  </Badge>
                )}
                {product.status && (
                  <Badge
                    bg={getStatusColor(product.status)}
                    className="px-3 py-1"
                  >
                    {product.status}
                  </Badge>
                )}
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" onClick={handleEditProduct}>
                <i className="fas fa-edit me-1"></i> Edit Product
              </Button>
              <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left me-1"></i> Back
              </Button>
            </div>
          </div>

          <Row>
            <Col lg={5}>
              <Card className="shadow-sm mb-4">
                <Card.Body className="p-0">
                  <div className="position-relative">
                    <img
                      src={images[selectedImageIndex]}
                      alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                      className="img-fluid rounded"
                      style={{
                        width: "100%",
                        maxHeight: "fit-content",
                        objectFit: "cover",
                      }}
                      onError={handleImageError}
                      loading="lazy"
                    />
                    {product.discount && (
                      <Badge
                        bg="success"
                        className="position-absolute top-0 start-0 m-3 fs-6"
                      >
                        -{product.discount}%
                      </Badge>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="d-flex gap-2 flex-wrap mt-3 p-3">
                      {images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className={`img-thumbnail ${
                            selectedImageIndex === index ? "border-primary" : ""
                          }`}
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                          onClick={() => setSelectedImageIndex(index)}
                          onError={handleImageError}
                          loading="lazy"
                          role="button"
                          aria-label={`Select image ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>

              {product.video && Array.isArray(product.video) && product.video.length > 0 && (
                <Card className="shadow-sm mb-4">
                  <Card.Header className="bg-white border-bottom">
                    <h6 className="mb-0">
                      <i className="fas fa-video text-primary me-2"></i> Product Videos
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      {product.video.map((vid, index) => (
                        <Col key={index} xs={12} className="mb-4">
                          {vid.includes("youtube.com") || vid.includes("youtu.be") ? (
                            <div className="ratio ratio-16x9">
                              <iframe
                                src={convertToEmbedUrl(vid)}
                                title={`YouTube video ${index + 1}`}
                                allowFullScreen
                                className="rounded"
                                style={{ width: '100%', minHeight: 300, border: 'none' }}
                              ></iframe>
                            </div>
                          ) : (
                            <video
                              src={vid}
                              className="w-100 rounded"
                              style={{ maxHeight: 400, background: '#000' }}
                              controls
                            >
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              )}
            </Col>

            <Col lg={7}>
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-white border-bottom">
                  <h5 className="mb-0">
                    <i className="fas fa-info-circle text-primary me-2"></i>{" "}
                    Product Information
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">
                          PRODUCT NAME
                        </label>
                        <p className="fs-5 mb-0">{product.name || "N/A"}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">
                          BRAND
                        </label>
                        <p className="mb-0">{product.brand || "N/A"}</p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">
                          PRICE
                        </label>
                        <p className="fs-4 fw-bold text-success mb-0">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">
                          STATUS
                        </label>
                        <Badge
                          bg={getStatusColor(product.status)}
                          className="fs-6 px-3 py-2"
                        >
                          {product.status || "Unknown"}
                        </Badge>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">
                          QUANTITY STATUS
                        </label>
                        <div className="d-flex align-items-center">
                          <Badge
                            bg={quantityStatus.variant}
                            className="fs-6 px-3 py-2 me-2"
                          >
                            {quantityStatus.text}
                          </Badge>
                          <span className="text-muted">
                            (
                            {product.quantity !== undefined
                              ? `${product.quantity} units`
                              : "Unknown quantity"}
                            )
                          </span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">
                          SỐ ĐIỆN THOẠI DOANH NGHIỆP
                        </label>
                        <p className="mb-0">
                          {product.business_phone || "N/A"}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">
                          WARRANTY
                        </label>
                        <p className="mb-0">
                          {product.warranty_period
                            ? `${product.warranty_period} months`
                            : "N/A"}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">
                          SIZE
                        </label>
                        <p className="mb-0">
                          {product.size || "N/A"}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">
                          WEIGHT
                        </label>
                        <p className="mb-0">
                          {product.weight ? `${product.weight} kg` : "N/A"}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">
                          VOLTAGE
                        </label>
                        <p className="mb-0">
                          {product.voltage || "N/A"}
                        </p>
                      </div>
                    </Col>
                  </Row>

                  <hr className="my-4" />

                  <div className="mb-4">
                    <label className="form-label text-muted small fw-bold">
                      DESCRIPTION
                    </label>
                    <div className="bg-light p-3 rounded">
                      <p className="mb-0" style={{ lineHeight: "1.6" }}>
                        {product.description ||
                          "No description provided for this product."}
                      </p>
                    </div>
                  </div>

                  {product.features && product.features.length > 0 && (
                    <div>
                      <label className="form-label text-muted small fw-bold">
                        KEY FEATURES
                      </label>
                      <div className="row">
                        {product.features.map((feature, index) => (
                          <div
                            key={feature.id || index}
                            className="col-md-6 mb-3"
                          >
                            <div className="border rounded p-3 h-100">
                              <h6 className="text-primary mb-2">
                                <i className="fas fa-check-circle me-2"></i>
                                {feature.title}
                              </h6>
                              <p className="mb-0 small text-muted">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {product.quantity !== undefined && product.quantity < 10 && (
                <Alert variant="warning" className="mb-4">
                  <Alert.Heading className="h6">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Low Quantity Alert
                  </Alert.Heading>
                  <p className="mb-0 small">
                    This product is running low on quantity ({product.quantity}{" "}
                    units remaining). Consider restocking soon.
                  </p>
                </Alert>
              )}
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Edit Product Modal */}
      <Modal
        show={showEditModal}
        onHide={cancelEdit}
        size="md"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-primary">
            <i className="fas fa-edit me-2"></i>
            Sửa sản phẩm - {product?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editSuccess && (
            <Alert variant="success" className="mb-3">
              {editSuccess}
            </Alert>
          )}
          {editErrors.general && (
            <Alert variant="danger" className="mb-3">
              {editErrors.general}
            </Alert>
          )}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên sản phẩm *</Form.Label>
              <Form.Control
                type="text"
                value={editForm.name}
                onChange={(e) => handleEditFormChange("name", e.target.value)}
                placeholder="Nhập tên sản phẩm"
                isInvalid={!!editErrors.name}
              />
              <Form.Control.Feedback type="invalid">
                {editErrors.name}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Thương hiệu *</Form.Label>
              <Form.Control
                type="text"
                value={editForm.brand}
                onChange={(e) => handleEditFormChange("brand", e.target.value)}
                placeholder="Nhập thương hiệu"
                isInvalid={!!editErrors.brand}
              />
              <Form.Control.Feedback type="invalid">
                {editErrors.brand}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Giá (VND) *</Form.Label>
              <Form.Control
                type="number"
                value={editForm.price}
                onChange={(e) => handleEditFormChange("price", e.target.value)}
                placeholder="1000"
                isInvalid={!!editErrors.price}
              />
              <Form.Control.Feedback type="invalid">
                {editErrors.price}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại doanh nghiệp *</Form.Label>
              <Form.Control
                type="text"
                value={editForm.business_phone}
                onChange={(e) => handleEditFormChange("business_phone", e.target.value)}
                placeholder="Nhập số điện thoại doanh nghiệp"
                isInvalid={!!editErrors.business_phone}
              />
              <Form.Control.Feedback type="invalid">
                {editErrors.business_phone}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số lượng *</Form.Label>
              <Form.Control
                type="number"
                value={editForm.quantity}
                onChange={(e) => handleEditFormChange("quantity", e.target.value)}
                placeholder="1"
                isInvalid={!!editErrors.quantity}
              />
              <Form.Control.Feedback type="invalid">
                {editErrors.quantity}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select
                value={editForm.status}
                onChange={(e) => handleEditFormChange("status", e.target.value)}
              >
                <option value="New">Mới</option>
                <option value="SecondHand">Đã qua sử dụng</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={editForm.description}
                onChange={(e) => handleEditFormChange("description", e.target.value)}
                placeholder="Nhập mô tả chi tiết sản phẩm"
                isInvalid={!!editErrors.description}
              />
              <Form.Control.Feedback type="invalid">
                {editErrors.description}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={cancelEdit}
            disabled={editLoading}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={confirmEditProduct}
            disabled={editLoading}
          >
            {editLoading ? "Đang cập nhật..." : "Cập nhật sản phẩm"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProductDetail;
