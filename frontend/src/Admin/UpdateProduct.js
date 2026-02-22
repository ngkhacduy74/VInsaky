import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Save, Eye, X, Plus, Link } from "lucide-react";
import Sidebar from "../Components/Sidebar";
import HeaderAdmin from "../Components/HeaderAdmin";
import { parseJwt } from "../utils/jwt";
import "./styles/AdminModal.css";

const UpdateProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageUrls, setImageUrls] = useState([""]);
  const [videoUrl, setVideoUrl] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
    business_phone: "",
    status: "New",
    description: "",
    size: "",
    weight: "",
    voltage: "",
    warranty_period: 12,
    quantity: 1,
    features: [{ title: "", description: "" }],
    image: [],
    video: [],
  });
  const [errors, setErrors] = useState({});
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const descriptionDivRef = useRef();
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAdmin(false);
        alert("Bạn không có quyền truy cập trang này!");
        navigate("/", { replace: true });
        return;
      }
      const payload = parseJwt(token);
      if (
        payload &&
        ((payload.role && payload.role.toLowerCase() === "admin") ||
          (payload.user &&
            payload.user.role &&
            payload.user.role.toLowerCase() === "admin"))
      ) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        alert("Bạn không có quyền truy cập trang này!");
        navigate("/", { replace: true });
      }
    } catch {
      setIsAdmin(false);
      alert("Bạn không có quyền truy cập trang này!");
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Lấy dữ liệu sản phẩm theo id
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token không hợp lệ. Vui lòng đăng nhập lại.");
          return;
        }
        
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/product/${id}`, {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        });
        
        // Lấy dữ liệu từ res.data.product thay vì res.data
        const data = res.data.product || res.data;
        console.log("Product data:", data); // Debug log
        
        setFormData({
          ...formData,
          ...data,
          features: data.features && data.features.length > 0 ? data.features : [{ title: "", description: "" }],
        });
        setImageUrls(data.image || [""]);
        setVideoUrl(data.video && data.video[0] ? data.video[0] : "");
        setDescriptionHtml(data.description || "");
        if (descriptionDivRef.current) {
          descriptionDivRef.current.innerHTML = data.description || "";
        }
      } catch (err) {
        console.error("Lỗi khi fetch product:", err, err?.response);
        if (err.response?.status === 401) {
          setError("Token không hợp lệ. Vui lòng đăng nhập lại.");
        } else {
          setError("Không thể tải dữ liệu sản phẩm");
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
    // eslint-disable-next-line
  }, [id]);

  // Xử lý paste vào vùng mô tả (ảnh + text)
  const handleDescriptionPaste = async (e) => {
    const clipboardItems = e.clipboardData && e.clipboardData.items;
    let handled = false;
    if (clipboardItems) {
      for (let i = 0; i < clipboardItems.length; i++) {
        const item = clipboardItems[i];
        if (item.type.indexOf("image") !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const formDataImg = new FormData();
            formDataImg.append("img", file);
            try {
              const res = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/file/upload-image`,
                formDataImg,
                { headers: { "Content-Type": "multipart/form-data" } }
              );
              const imageUrl =
                res.data.url || res.data.path || res.data.secure_url;
              if (imageUrl && descriptionDivRef.current) {
                // Chèn ảnh vào vị trí con trỏ
                const sel = window.getSelection();
                if (sel && sel.rangeCount > 0) {
                  const range = sel.getRangeAt(0);
                  const img = document.createElement("img");
                  img.src = imageUrl;
                  img.style.maxWidth = "100%";
                  img.style.display = "block";
                  range.insertNode(img);
                  // Di chuyển con trỏ sau ảnh
                  range.setStartAfter(img);
                  range.collapse(true);
                  sel.removeAllRanges();
                  sel.addRange(range);
                } else {
                  descriptionDivRef.current.innerHTML += `<img src='${imageUrl}' style='max-width:100%;display:block;' />`;
                }
                setDescriptionHtml(descriptionDivRef.current.innerHTML);
                setFormData((prev) => ({
                  ...prev,
                  description: descriptionDivRef.current.innerText.trim(),
                }));
              }
            } catch (err) {
              alert("Upload ảnh thất bại!");
            }
            handled = true;
          }
        }
      }
    }
    // Nếu không phải ảnh, chỉ nhận plain text, chuyển Unicode lạ về Latin thường
    if (!handled) {
      e.preventDefault();
      let text = e.clipboardData.getData("text/plain");
      // Chuyển toàn bộ Unicode phông lạ về Latin thường, giữ dấu tiếng Việt
      text = toPlainText(text);
      document.execCommand("insertText", false, text);
      setTimeout(() => {
        if (descriptionDivRef.current) {
          setDescriptionHtml(descriptionDivRef.current.innerHTML);
          setFormData((prev) => ({
            ...prev,
            description: descriptionDivRef.current.innerText.trim(),
          }));
        }
      }, 0);
    }
  };

  // Xử lý khi nhập text (onInput)
  const handleDescriptionInput = () => {
    if (descriptionDivRef.current) {
      setDescriptionHtml(descriptionDivRef.current.innerHTML);
      setFormData((prev) => ({
        ...prev,
        description: descriptionDivRef.current.innerText.trim(),
      }));
    }
  };

  // Hàm kiểm tra và làm sạch văn bản (loại bỏ ký tự đặc biệt, emoji)
  const sanitizeText = (text) => {
    // Loại bỏ các ký tự đặc biệt, emoji, chỉ giữ lại chữ cái, số, dấu cách và một số ký tự cơ bản
    return text
      .replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF.,!?()%-]/g, "")
      .trim();
  };

  // Hàm kiểm tra chỉ cho phép số và dấu chấm
  const sanitizeNumber = (value) => {
    return value.replace(/[^0-9.]/g, "");
  };

  // Hàm kiểm tra chỉ cho phép số nguyên
  const sanitizeInteger = (value) => {
    return value.replace(/[^0-9]/g, "");
  };

  // Hàm kiểm tra kích thước (chỉ cho phép số, x, và dấu cách)
  const sanitizeSize = (value) => {
    return value.replace(/[^0-9x\s]/g, "").trim();
  };

  // Handle input changes với validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    // Áp dụng sanitization dựa trên loại trường
    switch (name) {
      case "price":
      case "weight":
        sanitizedValue = sanitizeNumber(value);
        break;
      case "quantity":
      case "warranty_period":
        sanitizedValue = sanitizeInteger(value);
        break;
      case "size":
        sanitizedValue = sanitizeSize(value);
        break;
      case "voltage":
        sanitizedValue = value.replace(/[^0-9V\s]/g, "").trim();
        break;
      case "business_phone":
        sanitizedValue = value.replace(/[^0-9+]/g, "");
        break;
      default:
        sanitizedValue = value;
    }

    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle features array với validation
  const handleFeatureChange = (index, field, value) => {
    const sanitizedValue = sanitizeText(value);
    const newFeatures = [...formData.features];
    newFeatures[index] = { ...newFeatures[index], [field]: sanitizedValue };
    setFormData((prev) => ({ ...prev, features: newFeatures }));
    if (errors.features) {
      setErrors((prev) => ({ ...prev, features: "" }));
    }
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, { title: "", description: "" }],
    }));
  };

  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, features: newFeatures }));
    }
  };

  // Handle image URL changes
  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value.trim();
    setImageUrls(newImageUrls);

    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  // Add new image URL input (max 5)
  const addImageUrl = () => {
    if (imageUrls.length < 5) {
      setImageUrls([...imageUrls, ""]);
    }
  };

  // Remove image URL input
  const removeImageUrl = (index) => {
    if (imageUrls.length > 1) {
      const newImageUrls = imageUrls.filter((_, i) => i !== index);
      setImageUrls(newImageUrls);
    }
  };

  // Handle video URL change
  const handleVideoUrlChange = (value) => {
    setVideoUrl(value.trim());
  };

  // Validate URL format
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Validate if URL is an image
  const isImageUrl = (url) => {
    if (!isValidUrl(url)) return false;
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
    const urlLower = url.toLowerCase();
    return (
      imageExtensions.some((ext) => urlLower.includes(ext)) ||
      url.includes("imgur.com") ||
      url.includes("cloudinary.com") ||
      url.includes("unsplash.com") ||
      url.includes("pexels.com")
    );
  };

  // Validate if URL is a video
  const isVideoUrl = (url) => {
    if (!isValidUrl(url)) return false;
    const videoExtensions = [".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm"];
    const urlLower = url.toLowerCase();
    return (
      videoExtensions.some((ext) => urlLower.includes(ext)) ||
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("vimeo.com")
    );
  };

  // Hàm chuyển đổi Unicode về Latin
  function toPlainText(str) {
    const unicodeMap = {
      // Mathematical Bold, Italic, Script, Fraktur, Double-struck, Sans-serif, Monospace
      // Chữ hoa
      0x1d400: 0x41,
      0x1d434: 0x41,
      0x1d468: 0x41,
      0x1d49c: 0x41,
      0x1d4d0: 0x41,
      0x1d504: 0x41,
      0x1d538: 0x41,
      0x1d56c: 0x41,
      0x1d5a0: 0x41,
      0x1d5d4: 0x41,
      0x1d608: 0x41,
      0x1d63c: 0x41,
      0x1d670: 0x41,
      // Chữ thường
      0x1d41a: 0x61,
      0x1d44e: 0x61,
      0x1d482: 0x61,
      0x1d4b6: 0x61,
      0x1d4ea: 0x61,
      0x1d51e: 0x61,
      0x1d552: 0x61,
      0x1d586: 0x61,
      0x1d5ba: 0x61,
      0x1d5ee: 0x61,
      0x1d622: 0x61,
      0x1d656: 0x61,
      0x1d68a: 0x61,
    };
    return str.normalize("NFC").replace(/./gu, (c) => {
      const code = c.codePointAt(0);
      // Latin, số, dấu tiếng Việt, dấu câu cơ bản thì giữ nguyên
      if (
        (code >= 32 && code <= 126) ||
        (code >= 0x00c0 && code <= 0x1ef9) || // Latin-1 Supplement + Latin Extended
        (code >= 0x20 && code <= 0x2f) || // dấu câu
        (code >= 0x30 && code <= 0x39) || // số
        (code >= 0x41 && code <= 0x5a) || // A-Z
        (code >= 0x61 && code <= 0x7a)
      )
        return c;
      // Mathematical Unicode Latin: map về ký tự thường
      // Chữ hoa
      if (code >= 0x1d400 && code <= 0x1d419)
        return String.fromCharCode(code - 0x1d400 + 0x41);
      if (code >= 0x1d434 && code <= 0x1d44d)
        return String.fromCharCode(code - 0x1d434 + 0x41);
      if (code >= 0x1d468 && code <= 0x1d481)
        return String.fromCharCode(code - 0x1d468 + 0x41);
      if (code >= 0x1d49c && code <= 0x1d4b5)
        return String.fromCharCode(code - 0x1d49c + 0x41);
      if (code >= 0x1d4d0 && code <= 0x1d4e9)
        return String.fromCharCode(code - 0x1d4d0 + 0x41);
      if (code >= 0x1d504 && code <= 0x1d51d)
        return String.fromCharCode(code - 0x1d504 + 0x41);
      if (code >= 0x1d538 && code <= 0x1d551)
        return String.fromCharCode(code - 0x1d538 + 0x41);
      if (code >= 0x1d56c && code <= 0x1d585)
        return String.fromCharCode(code - 0x1d56c + 0x41);
      if (code >= 0x1d5a0 && code <= 0x1d5b9)
        return String.fromCharCode(code - 0x1d5a0 + 0x41);
      if (code >= 0x1d5d4 && code <= 0x1d5ed)
        return String.fromCharCode(code - 0x1d5d4 + 0x41);
      if (code >= 0x1d608 && code <= 0x1d621)
        return String.fromCharCode(code - 0x1d608 + 0x41);
      if (code >= 0x1d63c && code <= 0x1d655)
        return String.fromCharCode(code - 0x1d63c + 0x41);
      if (code >= 0x1d670 && code <= 0x1d689)
        return String.fromCharCode(code - 0x1d670 + 0x41);
      // Chữ thường
      if (code >= 0x1d41a && code <= 0x1d433)
        return String.fromCharCode(code - 0x1d41a + 0x61);
      if (code >= 0x1d44e && code <= 0x1d467)
        return String.fromCharCode(code - 0x1d44e + 0x61);
      if (code >= 0x1d482 && code <= 0x1d49b)
        return String.fromCharCode(code - 0x1d482 + 0x61);
      if (code >= 0x1d4b6 && code <= 0x1d4cf)
        return String.fromCharCode(code - 0x1d4b6 + 0x61);
      if (code >= 0x1d4ea && code <= 0x1d503)
        return String.fromCharCode(code - 0x1d4ea + 0x61);
      if (code >= 0x1d51e && code <= 0x1d537)
        return String.fromCharCode(code - 0x1d51e + 0x61);
      if (code >= 0x1d552 && code <= 0x1d56b)
        return String.fromCharCode(code - 0x1d552 + 0x61);
      if (code >= 0x1d586 && code <= 0x1d59f)
        return String.fromCharCode(code - 0x1d586 + 0x61);
      if (code >= 0x1d5ba && code <= 0x1d5d3)
        return String.fromCharCode(code - 0x1d5ba + 0x61);
      if (code >= 0x1d5ee && code <= 0x1d607)
        return String.fromCharCode(code - 0x1d5ee + 0x61);
      if (code >= 0x1d622 && code <= 0x1d63b)
        return String.fromCharCode(code - 0x1d622 + 0x61);
      if (code >= 0x1d656 && code <= 0x1d66f)
        return String.fromCharCode(code - 0x1d656 + 0x61);
      if (code >= 0x1d68a && code <= 0x1d6a3)
        return String.fromCharCode(code - 0x1d68a + 0x61);
      // Số in đậm/in nghiêng
      if (code >= 0x1d7ce && code <= 0x1d7d7)
        return String.fromCharCode(code - 0x1d7ce + 0x30);
      // Nếu không map được thì bỏ qua (trả về rỗng)
      return "";
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    // ... validate form ...
    // ... chuẩn hóa dữ liệu ...
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token không hợp lệ. Vui lòng đăng nhập lại.");
        return;
      }
      
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/product/update/${id}`, {
        ...formData,
        image: imageUrls,
        video: videoUrl ? [videoUrl] : [],
        description: descriptionDivRef.current ? descriptionDivRef.current.innerHTML : formData.description,
      }, {
        headers: {
          token: token,
          "Content-Type": "application/json",
        },
      });
      setSuccess("Cập nhật sản phẩm thành công!");
      setTimeout(() => navigate("/manaProduct"), 1200);
    } catch (err) {
      console.error("Lỗi khi update product:", err, err?.response);
      if (err.response?.status === 401) {
        setError("Token không hợp lệ. Vui lòng đăng nhập lại.");
      } else {
        setError("Cập nhật sản phẩm thất bại!");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin === false) {
    return (
      <Container style={{ maxWidth: 600, margin: "80px auto" }}>
        <Alert variant="danger" className="mt-5 text-center">
          Bạn không có quyền truy cập trang này.
        </Alert>
      </Container>
    );
  }
  if (isAdmin === null) {
    return null;
  }

  return (
    <Container fluid className="bg-light admin-page" style={{ minHeight: "100vh" }}>
      <HeaderAdmin />
      <Row>
        <Col md="auto" style={{ width: "250px", background: "#2c3e50", color: "white", padding: 0 }}>
          <Sidebar />
        </Col>
        <Col style={{ marginLeft: "10px" }} className="p-4">
          <div className="d-flex align-items-center mb-4">
            <Button variant="outline-secondary" onClick={() => navigate("/manaProduct")} className="me-3">
              <ArrowLeft size={20} />
            </Button>
            <h3 className="mb-0">Cập nhật sản phẩm</h3>
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">Thông tin cơ bản</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Tên sản phẩm *</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            isInvalid={!!errors.name}
                            placeholder="Nhập tên sản phẩm"
                            maxLength={100}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.name}
                          </Form.Control.Feedback>
                          <Form.Text className="text-muted">
                            {formData.name.length}/100 ký tự
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Thương hiệu *</Form.Label>
                          <Form.Control
                            type="text"
                            name="brand"
                            value={formData.brand}
                            onChange={e => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                            isInvalid={!!errors.brand}
                            placeholder="Nhập thương hiệu"
                            maxLength={50}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.brand}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Giá (VND) *</Form.Label>
                          <Form.Control
                            type="text"
                            name="price"
                            value={formData.price}
                            onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                            isInvalid={!!errors.price}
                            placeholder="1000"
                          />
                          <Form.Text className="text-muted">
                            Tối thiểu 1.000 VND
                          </Form.Text>
                          <Form.Control.Feedback type="invalid">
                            {errors.price}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Liên Hệ *</Form.Label>
                          <Form.Control
                            type="text"
                            name="business_phone"
                            value={formData.business_phone}
                            onChange={e => setFormData(prev => ({ ...prev, business_phone: e.target.value }))}
                            isInvalid={!!errors.business_phone}
                            placeholder="Nhập số điện thoại doanh nghiệp"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.business_phone}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Số lượng *</Form.Label>
                          <Form.Control
                            type="text"
                            name="quantity"
                            value={formData.quantity}
                            onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                            isInvalid={!!errors.quantity}
                            placeholder="1"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.quantity}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Tình trạng</Form.Label>
                          <Form.Select
                            name="status"
                            value={formData.status}
                            onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                          >
                            <option value="New">Mới</option>
                            <option value="SecondHand">Đã qua sử dụng</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>Mô tả *</Form.Label>
                      <div
                        ref={descriptionDivRef}
                        contentEditable
                        suppressContentEditableWarning
                        className="description-editable"
                        style={{
                          minHeight: 180,
                          border: "1px solid #ccc",
                          borderRadius: 4,
                          padding: 10,
                          fontFamily: "Times New Roman",
                          background: "#fff",
                          outline: "none",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                        placeholder="Nhập mô tả sản phẩm (có thể dán ảnh, chỉ nhận text thường, font Times New Roman)"
                        onPaste={handleDescriptionPaste}
                        onInput={handleDescriptionInput}
                        spellCheck={true}
                      />
                      <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
                        {formData.description.length}/2000 ký tự
                      </div>
                      {errors.description && (
                        <div className="error-message">
                          {errors.description}
                        </div>
                      )}
                    </Form.Group>
                  </Card.Body>
                </Card>

                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">Thông số kỹ thuật</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Kích thước (cm) *</Form.Label>
                          <Form.Control
                            type="text"
                            name="size"
                            value={formData.size}
                            onChange={handleInputChange}
                            isInvalid={!!errors.size}
                            placeholder="VD: 60 x 55 x 85"
                          />
                          <Form.Text className="text-muted">
                            Sử dụng dấu "x" giữa các số (VD: 60 x 55 x 85)
                          </Form.Text>
                          <Form.Control.Feedback type="invalid">
                            {errors.size}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Trọng lượng *</Form.Label>
                          <div className="d-flex align-items-center">
                            <Form.Control
                              type="text"
                              name="weight"
                              value={formData.weight}
                              onChange={handleInputChange}
                              isInvalid={!!errors.weight}
                              placeholder="VD: 65"
                            />
                            <span className="ms-2">kg</span>
                          </div>
                          <Form.Control.Feedback type="invalid">
                            {errors.weight}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Điện áp *</Form.Label>
                          <div className="d-flex align-items-center">
                            <Form.Control
                              type="text"
                              name="voltage"
                              value={formData.voltage}
                              onChange={handleInputChange}
                              isInvalid={!!errors.voltage}
                              placeholder="VD: 220 hoặc 220V"
                            />
                            <span className="ms-2">volt</span>
                          </div>
                          <Form.Control.Feedback type="invalid">
                            {errors.voltage}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Thời gian bảo hành (tháng)</Form.Label>
                          <Form.Control
                            type="text"
                            name="warranty_period"
                            value={formData.warranty_period}
                            onChange={handleInputChange}
                            placeholder="12"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="mb-4">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Tính năng</h5>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={addFeature}
                    >
                      Thêm tính năng
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    {formData.features.map((feature, index) => (
                      <Row key={index} className="mb-2">
                        <Col md={4}>
                          <Form.Control
                            type="text"
                            value={feature.title}
                            onChange={(e) =>
                              handleFeatureChange(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder={`Tiêu đề tính năng ${index + 1}`}
                            isInvalid={!!errors.features}
                            maxLength={100}
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Control
                            type="text"
                            value={feature.description}
                            onChange={(e) =>
                              handleFeatureChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder={`Mô tả tính năng ${index + 1}`}
                            isInvalid={!!errors.features}
                            maxLength={500}
                          />
                        </Col>
                        <Col md={2}>
                          {formData.features.length > 1 && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeFeature(index)}
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </Col>
                      </Row>
                    ))}
                    {errors.features && (
                      <Form.Text className="text-danger">
                        {errors.features}
                      </Form.Text>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4}>
                <Card className="mb-4">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <Link size={20} className="me-2" />
                      URL Hình ảnh sản phẩm
                    </h5>
                    {imageUrls.length < 5 && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={addImageUrl}
                      >
                        <Plus size={16} />
                      </Button>
                    )}
                  </Card.Header>
                  <Card.Body>
                    {imageUrls.map((url, index) => (
                      <div key={index} className="mb-3">
                        <Form.Group>
                          <Form.Label>
                            URL Hình ảnh {index + 1} {index === 0 && "*"}
                          </Form.Label>
                          <div className="d-flex">
                            <Form.Control
                              type="url"
                              value={url}
                              onChange={(e) =>
                                handleImageUrlChange(index, e.target.value)
                              }
                              placeholder="https://example.com/image.jpg"
                              isInvalid={
                                !!errors.images &&
                                url.trim() !== "" &&
                                !isImageUrl(url)
                              }
                            />
                            {imageUrls.length > 1 && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="ms-2"
                                onClick={() => removeImageUrl(index)}
                              >
                                <X size={16} />
                              </Button>
                            )}
                          </div>
                          {url.trim() !== "" && !isImageUrl(url) && (
                            <Form.Text className="text-danger">
                              URL hình ảnh không hợp lệ
                            </Form.Text>
                          )}
                        </Form.Group>

                        {/* Preview image */}
                        {url.trim() !== "" && isImageUrl(url) && (
                          <div className="mt-2">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="img-fluid"
                              style={{
                                maxHeight: "150px",
                                borderRadius: "8px",
                                border: "1px solid #dee2e6",
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    <Form.Text className="text-muted">
                      Tối đa 5 URL hình ảnh. Hỗ trợ: JPG, PNG, GIF, WebP
                    </Form.Text>
                    {errors.images && (
                      <Form.Text className="text-danger d-block">
                        {errors.images}
                      </Form.Text>
                    )}
                  </Card.Body>
                </Card>

                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">
                      <Link size={20} className="me-2" />
                      URL Video sản phẩm
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>URL Video (tùy chọn)</Form.Label>
                      <Form.Control
                        type="url"
                        value={videoUrl}
                        onChange={(e) => handleVideoUrlChange(e.target.value)}
                        placeholder="https://example.com/video.mp4"
                        isInvalid={!!errors.video}
                      />
                      <Form.Text className="text-muted">
                        Hỗ trợ: MP4, AVI, MOV, YouTube, Vimeo
                      </Form.Text>
                      <Form.Control.Feedback type="invalid">
                        {errors.video}
                      </Form.Control.Feedback>
                    </Form.Group>

                    {/* Preview video */}
                    {videoUrl.trim() !== "" && isVideoUrl(videoUrl) && (
                      <div className="mt-3">
                        {videoUrl.includes("youtube.com") ||
                        videoUrl.includes("youtu.be") ? (
                          <div className="ratio ratio-16x9">
                            <iframe
                              src={videoUrl
                                .replace("watch?v=", "embed/")
                                .replace("youtu.be/", "youtube.com/embed/")}
                              title="Video preview"
                              allowFullScreen
                              style={{ borderRadius: "8px" }}
                            ></iframe>
                          </div>
                        ) : (
                          <video
                            src={videoUrl}
                            controls
                            className="img-fluid"
                            style={{
                              maxHeight: "200px",
                              borderRadius: "8px",
                              border: "1px solid #dee2e6",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                      </div>
                    )}
                  </Card.Body>
                </Card>

                <Card>
                  <Card.Body>
                    <div className="d-grid gap-2">
                      <Button
                        variant="success"
                        type="submit"
                        disabled={loading}
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Đang cập nhật...
                          </>
                        ) : (
                          <>
                            <Save size={20} className="me-2" />
                            Cập nhật sản phẩm
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={() => navigate("/manaProduct")}
                        disabled={loading}
                      >
                        Hủy
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default UpdateProduct;
