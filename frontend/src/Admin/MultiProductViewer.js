// src/Pages/MultiProductViewer.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  Alert,
  Card,
  Form,
  InputGroup,
  Modal,
  Spinner,
  Table,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import HeaderAdmin from "../Components/HeaderAdmin";
import Sidebar from "../Components/Sidebar";
import { useBanner } from "../context/BannerContext";
import "./styles/AdminModal.css"; // Import CSS cho admin modal
import { 
  Search, 
  Trash2, 
  Tag, 
  Percent, 
  Star, 
  Eye, 
  ExternalLink, 
  RefreshCw, 
  Info, 
  Box, 
  AlertTriangle,
  CheckCircle,
  X,
  Save
} from "lucide-react";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  timeout: 10000,
});

const MultiProductViewer = () => {
  const navigate = useNavigate();
  const [productNames, setProductNames] = useState(["", "", "", "", ""]); // 5 product names
  const [productDiscounts, setProductDiscounts] = useState(["", "", "", "", ""]); // 5 product discounts
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all products for search
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errors, setErrors] = useState([]);
  const [showProducts, setShowProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedForBanner, setSelectedForBanner] = useState(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const backUpImg = "/images/frigde.jpg";
  
  // Use BannerContext
  const { 
    bannerProductIds, 
    loading: loadingBannerIds, 
    refreshBannerData,
    addProductIdToBanner,
    removeProductIdFromBanner,
    saveBannerProducts
  } = useBanner();
  
  // Load all products for search suggestions
  useEffect(() => {
    fetchAllProducts();
    loadSavedData();
  }, []);

  // Update selected products when banner product IDs change
  useEffect(() => {
    const existingSelection = new Set(bannerProductIds);
    setSelectedForBanner(existingSelection);
  }, [bannerProductIds]);

  const fetchAllProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get("/product", {
        headers: {
          token,
          "Content-Type": "application/json",
        },
      });

      setAllProducts(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error fetching all products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadSavedData = () => {
    // Load saved product names
    const savedNames = localStorage.getItem("savedProductNames");
    if (savedNames) {
      try {
        const parsedNames = JSON.parse(savedNames);
        if (Array.isArray(parsedNames) && parsedNames.length === 5) {
          setProductNames(parsedNames);
        }
      } catch (error) {
        console.error("Error parsing saved product names:", error);
      }
    }

    // Load saved product discounts
    const savedDiscounts = localStorage.getItem("savedProductDiscounts");
    if (savedDiscounts) {
      try {
        const parsedDiscounts = JSON.parse(savedDiscounts);
        if (Array.isArray(parsedDiscounts) && parsedDiscounts.length === 5) {
          setProductDiscounts(parsedDiscounts);
        }
      } catch (error) {
        console.error("Error parsing saved product discounts:", error);
      }
    }

    // Load saved banner selections
    const savedBannerSelections = localStorage.getItem("savedBannerSelections");
    if (savedBannerSelections) {
      try {
        const parsedSelections = JSON.parse(savedBannerSelections);
        setSelectedForBanner(new Set(parsedSelections));
      } catch (error) {
        console.error("Error parsing saved banner selections:", error);
      }
    }
  };

  // Save product names to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("savedProductNames", JSON.stringify(productNames));
  }, [productNames]);

  // Save product discounts to localStorage
  useEffect(() => {
    localStorage.setItem("savedProductDiscounts", JSON.stringify(productDiscounts));
  }, [productDiscounts]);

  // Save banner selections to localStorage
  useEffect(() => {
    localStorage.setItem(
      "savedBannerSelections",
      JSON.stringify([...selectedForBanner])
    );
  }, [selectedForBanner]);

  const handleInputChange = (index, value) => {
    const newNames = [...productNames];
    newNames[index] = value;
    setProductNames(newNames);
  };

  const handleDiscountChange = (index, value) => {
    const newDiscounts = [...productDiscounts];
    newDiscounts[index] = value;
    setProductDiscounts(newDiscounts);
  };

  const clearAllInputs = () => {
    setProductNames(["", "", "", "", ""]);
    setProductDiscounts(["", "", "", "", ""]);
    setProducts([]);
    setShowProducts(false);
    setErrors([]);
    setSelectedForBanner(new Set());
  };

  const searchProductsByName = async () => {
    setLoading(true);
    setErrors([]);
    const fetchedProducts = [];
    const fetchErrors = [];

    const token = localStorage.getItem("token");
    if (!token) {
      setErrors(["Authentication token not found. Please log in again."]);
      setLoading(false);
      return;
    }

    // Filter out empty product names
    const validNames = productNames.filter((name) => name.trim() !== "");

    if (validNames.length === 0) {
      setErrors(["Please enter at least one Product Name"]);
      setLoading(false);
      return;
    }

    for (let i = 0; i < productNames.length; i++) {
      const productName = productNames[i].trim();

      if (productName === "") {
        continue; // Skip empty inputs
      }

      try {
        // Search for products that match the name (case-insensitive)
        const matchedProducts = allProducts.filter(
          (product) =>
            product.name &&
            product.name.toLowerCase().includes(productName.toLowerCase())
        );

        if (matchedProducts.length > 0) {
          // Take the first match
          const product = matchedProducts[0];
          fetchedProducts.push({
            ...product,
            originalIndex: i + 1,
            searchName: productName,
            matchCount: matchedProducts.length,
            discount: productDiscounts[i] || "", // Không gán mặc định nếu để trống
          });
        } else {
          fetchErrors.push(
            `No products found matching "${productName}" (Input ${i + 1})`
          );
        }
      } catch (err) {
        fetchErrors.push(
          `Error searching for "${productName}" (Input ${i + 1}): ${
            err.message
          }`
        );
      }
    }

    setProducts(fetchedProducts);
    setErrors(fetchErrors);
    setShowProducts(true);
    setLoading(false);
  };

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getQuantityStatus = (quantity) => {
    if (quantity === undefined || quantity === null)
      return { variant: "secondary", text: "Unknown" };
    if (quantity === 0) return { variant: "danger", text: "Out of Stock" };
    if (quantity < 10) return { variant: "warning", text: "Low Stock" };
    return { variant: "success", text: "In Stock" };
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "success";
      case "used":
        return "warning";
      case "refurbished":
        return "info";
      default:
        return "secondary";
    }
  };

  const handleViewDetail = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleGoToProductDetail = (productId) => {
    navigate(`/product/${productId}`);
  };

  const toggleBannerSelection = (productId) => {
    const newSelection = new Set(selectedForBanner);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      if (newSelection.size >= 5) {
        showToastMessage(
          "Chỉ có thể chọn tối đa 5 sản phẩm cho banner!",
          "warning"
        );
        return;
      }
      newSelection.add(productId);
    }
    setSelectedForBanner(newSelection);
  };

  const saveToBanner = async () => {
    if (selectedForBanner.size === 0) {
      showToastMessage(
        "Vui lòng chọn ít nhất một sản phẩm để lưu vào banner!",
        "warning"
      );
      return;
    }

    try {
      // Get selected products data
      const selectedProducts = products.filter((product) =>
        selectedForBanner.has(product.Id || product.id)
      );

      // Transform to banner format
      const bannerProducts = selectedProducts.map((product, index) => ({
        id: product.Id || product.id,
        name: product.name || "Unnamed Product",
        category: product.category || "Sản phẩm",
        description:
          product.description || `${product.name} - Sản phẩm chất lượng cao`,
        price: formatPrice(product.price),
        discount: product.discount || "", // Không gán mặc định nếu để trống
        image: (product.image && product.image[0]) || backUpImg,
        badge: index === 0 ? "Bán Chạy #1" : `Top ${index + 1}`,
        buttonText: "Mua Ngay",
      }));

      // Use BannerContext to save
      const result = await saveBannerProducts(bannerProducts);
      
      if (result.success) {
        showToastMessage(result.message, "success");
      } else {
        showToastMessage(result.message, "danger");
      }
    } catch (error) {
      showToastMessage("Lỗi khi lưu banner products!", "danger");
    }
  };

  const handleAddProductIdToBanner = async (productId) => {
    const result = await addProductIdToBanner(productId);
    showToastMessage(result.message, result.success ? "success" : "warning");
  };

  const handleRemoveProductIdFromBanner = async (productId) => {
    const result = await removeProductIdFromBanner(productId);
    showToastMessage(result.message, result.success ? "success" : "warning");
  };

  const showToastMessage = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  // Get product suggestions based on input
  const getProductSuggestions = (input, index) => {
    if (!input || input.length < 2) return [];

    return allProducts
      .filter(
        (product) =>
          product.name &&
          product.name.toLowerCase().includes(input.toLowerCase())
      )
      .slice(0, 5); // Limit to 5 suggestions
  };

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
        <Col className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-2 text-primary">Multi-Product Search</h2>
              <p className="text-muted mb-0">
                Search up to 5 products by name to view them simultaneously
              </p>
            </div>
            <Button variant="outline-secondary" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left me-1"></i>
              Back
            </Button>
          </div>

          {/* Banner Product IDs Management */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <Star className="text-warning me-2" size={20} />
                  Banner Product IDs Management
                </h5>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={refreshBannerData}
                    disabled={loadingBannerIds}
                  >
                    {loadingBannerIds ? (
                      <Spinner size="sm" />
                    ) : (
                      <RefreshCw size={16} />
                    )}
                  </Button>
                  <Badge bg="info" className="fs-6">
                    {bannerProductIds.length} IDs in banner
                  </Badge>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {bannerProductIds.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {bannerProductIds.map((productId, index) => (
                    <Badge
                      key={productId}
                      bg="primary"
                      className="fs-6 p-2 d-flex align-items-center gap-2"
                    >
                      <span>#{index + 1}: {productId}</span>
                      <Button
                        variant="outline-light"
                        size="sm"
                        onClick={() => handleRemoveProductIdFromBanner(productId)}
                        className="p-0"
                        style={{ width: "20px", height: "20px" }}
                      >
                        <X size={12} />
                      </Button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <Alert variant="info" className="mb-0">
                  <Info size={16} className="me-2" />
                  Chưa có sản phẩm nào được thêm vào banner. Hãy tìm kiếm và chọn sản phẩm bên dưới.
                </Alert>
              )}
            </Card.Body>
          </Card>

          {/* Input Section */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <Search className="text-primary me-2" size={20} />
                  Product Names
                </h5>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={clearAllInputs}
                >
                  <Trash2 size={16} className="me-1" />
                  Clear All
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                {productNames.map((name, index) => (
                  <Col md={6} lg={4} key={index} className="mb-3">
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted">
                        PRODUCT NAME {index + 1}
                      </Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <Tag size={16} />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder={`Enter Product Name ${index + 1}`}
                          value={name}
                          onChange={(e) =>
                            handleInputChange(index, e.target.value)
                          }
                          list={`suggestions-${index}`}
                        />
                        <datalist id={`suggestions-${index}`}>
                          {getProductSuggestions(name, index).map(
                            (product, idx) => (
                              <option key={idx} value={product.name} />
                            )
                          )}
                        </datalist>
                      </InputGroup>
                    </Form.Group>
                    
                    <Form.Group className="mt-2">
                      <Form.Label className="small fw-bold text-muted">
                        DISCOUNT {index + 1}
                      </Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <Percent size={16} />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Để trống nếu không giảm giá"
                          value={productDiscounts[index]}
                          onChange={(e) =>
                            handleDiscountChange(index, e.target.value)
                          }
                        />
                      </InputGroup>
                      <Form.Text className="text-muted">
                        Ví dụ: Giảm 15%, Sale 20%, Khuyến mãi 30%. Để trống nếu không muốn giảm giá.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                ))}
              </Row>

              <div className="text-center mt-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={searchProductsByName}
                  disabled={loading || loadingProducts}
                  className="px-4 me-3"
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Searching Products...
                    </>
                  ) : (
                    <>
                      <Search size={20} className="me-2" />
                      Search Products
                    </>
                  )}
                </Button>

                {selectedForBanner.size > 0 && (
                  <Button
                    variant="success"
                    size="lg"
                    onClick={saveToBanner}
                    className="px-4"
                  >
                    <Save size={20} className="me-2" />
                    Save to Banner ({selectedForBanner.size})
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="warning" className="mb-4">
              <Alert.Heading className="h6">
                <AlertTriangle size={16} className="me-2" />
                Search Results
              </Alert.Heading>
              <ul className="mb-0">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Products Display */}
          {showProducts && products.length > 0 && (
            <Card className="shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <Box className="text-primary me-2" size={20} />
                    Products Found ({products.length})
                  </h5>
                  <div className="d-flex gap-2">
                    <Badge bg="success" className="fs-6">
                      {products.length} of{" "}
                      {productNames.filter((name) => name.trim() !== "").length}{" "}
                      found
                    </Badge>
                    {selectedForBanner.size > 0 && (
                      <Badge bg="info" className="fs-6">
                        {selectedForBanner.size} selected for banner
                      </Badge>
                    )}
                  </div>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <Table responsive hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0">
                        <Form.Check type="checkbox" />
                      </th>
                      <th className="border-0">#</th>
                      <th className="border-0">Product</th>
                      <th className="border-0">Brand</th>
                      <th className="border-0">Price</th>
                      <th className="border-0">Discount</th>
                      <th className="border-0">Status</th>
                      <th className="border-0">Stock</th>
                      <th className="border-0">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => {
                      const quantityStatus = getQuantityStatus(
                        product.quantity
                      );
                      const productId = product.Id || product.id;
                      const isSelected = selectedForBanner.has(productId);

                      return (
                        <tr
                          key={index}
                          className={isSelected ? "table-success" : ""}
                        >
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleBannerSelection(productId)}
                            />
                          </td>
                          <td className="fw-bold text-muted">
                            {product.originalIndex}
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              {product.image && product.image[0] && (
                                <img
                                  src={product.image[0]}
                                  alt={product.name}
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    objectFit: "cover",
                                  }}
                                  className="rounded me-3"
                                  onError={(e) => {
                                    e.target.src = backUpImg;
                                  }}
                                />
                              )}
                              <div>
                                <div className="fw-bold">
                                  {product.name || "Unnamed Product"}
                                </div>
                                <small className="text-muted">
                                  ID: {productId}
                                </small>
                                {product.matchCount > 1 && (
                                  <small className="text-info d-block">
                                    ({product.matchCount} matches found)
                                  </small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            {product.brand ? (
                              <Badge bg="outline-primary">
                                {product.brand}
                              </Badge>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </td>
                          <td className="fw-bold text-success">
                            {formatPrice(product.price)}
                          </td>
                          <td>
                            {product.discount || "N/A"}
                          </td>
                          <td>
                            <Badge bg={getStatusColor(product.status)}>
                              {product.status || "Unknown"}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={quantityStatus.variant}>
                              {product.quantity !== undefined
                                ? `${product.quantity} units`
                                : "Unknown"}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleViewDetail(product)}
                              >
                                <Eye size={16} />
                              </Button>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() =>
                                  handleGoToProductDetail(productId)
                                }
                              >
                                <ExternalLink size={16} />
                              </Button>
                              {bannerProductIds.includes(productId) ? (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleRemoveProductIdFromBanner(productId)}
                                  title="Remove from banner"
                                >
                                  <Star size={16} />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  onClick={() => handleAddProductIdToBanner(productId)}
                                  title="Add to banner"
                                >
                                  <Star size={16} />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {showProducts && products.length === 0 && errors.length === 0 && (
            <Alert variant="info" className="text-center">
              <Info size={16} className="me-2" />
              No products found. Please check your search terms and try again.
            </Alert>
          )}
        </Col>
      </Row>

      {/* Product Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <Box className="text-primary me-2" size={20} />
            Product Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <Row>
              <Col md={4}>
                {selectedProduct.image && selectedProduct.image[0] && (
                  <img
                    src={selectedProduct.image[0]}
                    alt={selectedProduct.name}
                    className="img-fluid rounded"
                    onError={(e) => {
                      e.target.src = backUpImg;
                    }}
                  />
                )}
              </Col>
              <Col md={8}>
                <h4 className="text-primary mb-3">
                  {selectedProduct.name || "Unnamed Product"}
                </h4>

                <div className="mb-3">
                  <strong>ID:</strong>{" "}
                  {selectedProduct.Id || selectedProduct.id}
                </div>

                <div className="mb-3">
                  <strong>Brand:</strong> {selectedProduct.brand || "N/A"}
                </div>

                <div className="mb-3">
                  <strong>Price:</strong>
                  <span className="text-success fw-bold ms-2">
                    {formatPrice(selectedProduct.price)}
                  </span>
                </div>

                <div className="mb-3">
                  <strong>Discount:</strong>
                  <Badge bg="danger" className="ms-2">
                    {selectedProduct.discount || "N/A"}
                  </Badge>
                </div>

                <div className="mb-3">
                  <strong>Status:</strong>
                  <Badge
                    bg={getStatusColor(selectedProduct.status)}
                    className="ms-2"
                  >
                    {selectedProduct.status || "Unknown"}
                  </Badge>
                </div>

                <div className="mb-3">
                  <strong>Quantity:</strong>
                  <Badge
                    bg={getQuantityStatus(selectedProduct.quantity).variant}
                    className="ms-2"
                  >
                    {selectedProduct.quantity !== undefined
                      ? `${selectedProduct.quantity} units`
                      : "Unknown"}
                  </Badge>
                </div>

                {selectedProduct.description && (
                  <div className="mb-3">
                    <strong>Description:</strong>
                    <p className="mt-2 text-muted">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
          {selectedProduct && (
            <Button
              variant="primary"
              onClick={() => {
                setShowDetailModal(false);
                handleGoToProductDetail(
                  selectedProduct.Id || selectedProduct.id
                );
              }}
            >
              <ExternalLink size={16} className="me-1" />
              View Full Details
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Toast Notifications */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
          bg={toastVariant}
        >
          <Toast.Header>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body
            className={toastVariant === "success" ? "text-white" : ""}
          >
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default MultiProductViewer;
