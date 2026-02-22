import React, { useState, useRef } from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Row,
  Col,
  Toast,
} from "react-bootstrap";
import axios from "axios";
import { Save, X, Plus, Link, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserCreateProduct = () => {
  const navigate = useNavigate();
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
    status: "SecondHand", // Sửa lại đúng giá trị backend yêu cầu
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
  const [showToast, setShowToast] = useState(false);
  const descriptionDivRef = useRef();

  // Hàm chuyển đổi toàn bộ ký tự Unicode phông lạ về Latin thường (giống admin)
  function toPlainText(str) {
    // Map các block Unicode phổ biến về Latin thường
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

  // Hàm kiểm tra và làm sạch văn bản (loại bỏ ký tự đặc biệt, emoji, chỉ giữ lại chữ cái, số, dấu cách và một số ký tự cơ bản)
  function sanitizeText(text) {
    return text
      .replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF.,!?()%-]/g, "")
      .trim();
  }

  // Utility: Remove all HTML tags except <img>, keep only plain text and images
  function sanitizeDescriptionHtml(html) {
    // Replace all tags except <img> with their text content
    // 1. Replace all tags except <img> with their text content
    // 2. Keep <img> tags as is
    // 3. Remove style attributes from <img>
    const div = document.createElement("div");
    div.innerHTML = html;
    // Remove all tags except <img>
    div.querySelectorAll("*:not(img)").forEach((el) => {
      if (el.parentNode) {
        // Replace node with its text content
        el.replaceWith(document.createTextNode(el.textContent));
      }
    });
    // Remove all style attributes from <img>
    div.querySelectorAll("img").forEach((img) => {
      img.removeAttribute("style");
      img.style.maxWidth = "100%";
      img.style.display = "block";
    });
    return div.innerHTML;
  }

  // Handle paste in description (image or plain text)
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
                const sel = window.getSelection();
                if (sel && sel.rangeCount > 0) {
                  const range = sel.getRangeAt(0);
                  const img = document.createElement("img");
                  img.src = imageUrl;
                  img.style.maxWidth = "100%";
                  img.style.display = "block";
                  range.insertNode(img);
                  range.setStartAfter(img);
                  range.collapse(true);
                  sel.removeAllRanges();
                  sel.addRange(range);
                } else {
                  descriptionDivRef.current.innerHTML += `<img src='${imageUrl}' style='max-width:100%;display:block;' />`;
                }
                // Sau khi chèn ảnh, chỉ lấy text thuần cho formData
                let text = Array.from(descriptionDivRef.current.childNodes)
                  .filter((node) => node.nodeType === 3)
                  .map((node) => node.textContent)
                  .join(" ");
                text = toPlainText(text);
                setFormData((prev) => ({
                  ...prev,
                  description: text.trim(),
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
    if (!handled) {
      e.preventDefault();
      let text = e.clipboardData.getData("text/plain");
      text = toPlainText(text);
      document.execCommand("insertText", false, text);
      setTimeout(() => {
        if (descriptionDivRef.current) {
          let text = Array.from(descriptionDivRef.current.childNodes)
            .filter((node) => node.nodeType === 3)
            .map((node) => node.textContent)
            .join(" ");
          text = toPlainText(text);
          setFormData((prev) => ({
            ...prev,
            description: text.trim(),
          }));
        }
      }, 0);
    }
  };

  // Sử dụng toPlainText cho mọi trường hợp nhập/chỉnh sửa mô tả
  const handleDescriptionInput = () => {
    if (descriptionDivRef.current) {
      // Lấy text thuần từ contentEditable div
      let text =
        descriptionDivRef.current.textContent ||
        descriptionDivRef.current.innerText ||
        "";

      // Cập nhật formData với text thuần
      setFormData((prev) => ({
        ...prev,
        description: text.trim(),
      }));
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle features array
  const handleFeatureChange = (index, field, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFormData((prev) => ({ ...prev, features: newFeatures }));
    if (errors.features) setErrors((prev) => ({ ...prev, features: "" }));
  };
  const addFeature = () =>
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, { title: "", description: "" }],
    }));
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
    if (errors.images) setErrors((prev) => ({ ...prev, images: "" }));
  };
  const addImageUrl = () => {
    if (imageUrls.length < 5) setImageUrls([...imageUrls, ""]);
  };
  const removeImageUrl = (index) => {
    if (imageUrls.length > 1)
      setImageUrls(imageUrls.filter((_, i) => i !== index));
  };
  const handleVideoUrlChange = (value) => setVideoUrl(value.trim());

  // Hàm upload file ảnh (giống trang create-product)
  const handleUploadImageFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Chỉ chấp nhận file ảnh: JPG, PNG, GIF, WebP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File ảnh không được vượt quá 5MB");
      return;
    }
    const formDataImg = new FormData();
    formDataImg.append("img", file);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/file/upload-image`,
        formDataImg,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const urls =
        res.data.urls ||
        [res.data.url, res.data.path, res.data.secure_url].filter(Boolean);
      if (urls.length > 0) {
        setImageUrls((prev) => {
          const combined = [...prev, ...urls];
          return combined.slice(0, 5);
        });
      } else {
        alert("Không lấy được URL ảnh từ server!");
      }
    } catch (error) {
      alert("Upload ảnh thất bại!");
    }
  };

  // Validate URL format
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };
  const isImageUrl = (url) => {
    if (!isValidUrl(url)) return false;
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
    const urlLower = url.toLowerCase();
    return imageExtensions.some((ext) => urlLower.includes(ext));
  };
  const isVideoUrl = (url) => {
    if (!isValidUrl(url)) return false;
    const videoExtensions = [".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm"];
    const urlLower = url.toLowerCase();
    return videoExtensions.some((ext) => urlLower.includes(ext));
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Tên sản phẩm là bắt buộc";
    if (!formData.brand.trim()) newErrors.brand = "Thương hiệu là bắt buộc";
    if (!formData.price || parseFloat(formData.price) < 1000)
      newErrors.price = "Giá phải lớn hơn hoặc bằng 1.000 VND";
    if (!formData.business_phone.trim())
      newErrors.business_phone = "Số điện thoại là bắt buộc";
    if (!formData.description.trim())
      newErrors.description = "Mô tả là bắt buộc";
    if (formData.weight && parseFloat(formData.weight) <= 0)
      newErrors.weight = "Trọng lượng phải lớn hơn 0";
    if (
      formData.voltage &&
      !/^\d+(V)?$/.test(formData.voltage.replace(/\s/g, ""))
    )
      newErrors.voltage = "Điện áp không hợp lệ (ví dụ: 220V)";
    if (formData.quantity && parseInt(formData.quantity) <= 0)
      newErrors.quantity = "Số lượng phải lớn hơn 0";
    if (formData.features.some((f) => !f.title.trim() || !f.description.trim()))
      newErrors.features = "Tất cả tính năng phải có tiêu đề và mô tả";
    const validImageUrls = imageUrls.filter((url) => url.trim() !== "");
    if (validImageUrls.length === 0)
      newErrors.images = "Cần ít nhất một URL hình ảnh";
    else if (validImageUrls.some((url) => !isImageUrl(url)))
      newErrors.images = "Một số URL hình ảnh không hợp lệ";
    if (videoUrl.trim() !== "" && !isVideoUrl(videoUrl))
      newErrors.video = "URL video không hợp lệ";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError(
        "Vui lòng điền đầy đủ các trường bắt buộc và kiểm tra lại thông tin"
      );
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vui lòng đăng nhập để tạo sản phẩm");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price),
        weight: parseFloat(formData.weight),
        warranty_period: parseInt(formData.warranty_period),
        quantity: parseInt(formData.quantity),
        image: imageUrls.filter((url) => url.trim() !== ""),
        video: videoUrl.trim() !== "" ? [videoUrl] : [],
      };
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/product/createProduct`,
        dataToSend,
        { headers: { "Content-Type": "application/json", token } }
      );
      setSuccess("Tạo sản phẩm thành công!");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      setError("Không thể tạo sản phẩm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-wrapper">
      <Header />

      <Container style={{ maxWidth: 800, margin: "40px auto" }}>
        <style>{`
        .user-create-product-card {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.07);
          border: 1px solid #e5e7eb;
        }
        .user-create-product-header {
          background: #f8fafc;
          color: #222;
          border-radius: 12px 12px 0 0;
          padding: 18px 24px 12px 24px;
          margin-bottom: 24px;
          border-bottom: 1px solid #e5e7eb;
        }
        .user-create-product-label {
          color: #2563eb;
          font-weight: 600;
        }
        .user-create-product-section {
          background: #f6f8fa;
          border-radius: 10px;
          padding: 18px 16px 10px 16px;
          margin-bottom: 18px;
          border: 1px solid #e5e7eb;
        }
        .user-create-product-btn {
          background: #22c55e;
          border: none;
        }
        .user-create-product-btn:hover {
          background: #16a34a;
        }
        .user-create-product-card .form-control:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 0.2rem rgba(37,99,235,0.10);
        }
        .user-create-product-divider {
          border-top: 1px solid #e5e7eb;
          margin: 24px 0 18px 0;
        }
        .user-create-product-tip {
          background: #f1f5f9;
          border-left: 4px solid #2563eb;
          border-radius: 8px;
          padding: 12px 18px;
          color: #2563eb;
          font-size: 15px;
          margin-bottom: 18px;
        }
        .description-editable {
          min-height: 180px;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 10px;
          font-family: "Times New Roman", Times, serif;
          background: #fff;
          outline: none;
          white-space: pre-wrap;
          word-break: break-word;
        }
      `}</style>
        <Card className="user-create-product-card">
          <Card.Body>
            <div className="user-create-product-header d-flex align-items-center mb-4">
              <Button
                variant="light"
                onClick={() => navigate(-1)}
                className="me-3"
                style={{ boxShadow: "0 2px 8px rgba(37,99,235,0.07)" }}
              >
                <ArrowLeft size={20} color="#2563eb" />
              </Button>
              <h3
                className="mb-0 text-center flex-grow-1"
                style={{ letterSpacing: 1 }}
              >
                Tạo sản phẩm mới
              </h3>
            </div>
            <div className="user-create-product-tip">
              <b>Gợi ý:</b> Hãy điền thông tin sản phẩm thật chi tiết, hình ảnh
              rõ nét và giá hợp lý để tăng khả năng bán hàng!
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={12} className="user-create-product-section">
                  <Form.Group className="mb-3">
                    <Form.Label className="user-create-product-label">
                      Tên sản phẩm *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      isInvalid={!!errors.name}
                      placeholder="Nhập tên sản phẩm"
                      maxLength={100}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="user-create-product-label">
                      Thương hiệu *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      isInvalid={!!errors.brand}
                      placeholder="Nhập thương hiệu"
                      maxLength={50}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.brand}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="user-create-product-label">
                          Giá (VND) *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          isInvalid={!!errors.price}
                          placeholder="1000"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.price}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="user-create-product-label">
                          Liên Hệ *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="business_phone"
                          value={formData.business_phone}
                          onChange={handleInputChange}
                          isInvalid={!!errors.business_phone}
                          placeholder="Nhập số điện thoại"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.business_phone}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="user-create-product-label">
                          Số lượng *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          isInvalid={!!errors.quantity}
                          placeholder="1"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.quantity}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="user-create-product-label">
                          Tình trạng
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="status"
                          value="Đã qua sử dụng"
                          readOnly
                          disabled
                          style={{
                            background: "#f1f5f9",
                            color: "#2563eb",
                            fontWeight: 600,
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label className="user-create-product-label">
                      Mô tả *
                    </Form.Label>
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
                      <div className="error-message">{errors.description}</div>
                    )}
                  </Form.Group>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="user-create-product-label">
                          Kích thước (cm)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="size"
                          value={formData.size}
                          onChange={handleInputChange}
                          isInvalid={!!errors.size}
                          placeholder="VD: 60 x 55 x 85"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.size}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="user-create-product-label">
                          Trọng lượng
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="weight"
                          value={formData.weight}
                          onChange={handleInputChange}
                          isInvalid={!!errors.weight}
                          placeholder="VD: 65"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.weight}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="user-create-product-label">
                          Điện áp
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="voltage"
                          value={formData.voltage}
                          onChange={handleInputChange}
                          isInvalid={!!errors.voltage}
                          placeholder="VD: 220 hoặc 220V"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.voltage}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="user-create-product-label">
                          Thời gian bảo hành (tháng)
                        </Form.Label>
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
                </Col>
                <div className="user-create-product-divider"></div>
                <Col md={12} className="user-create-product-section">
                  <Form.Group className="mb-3">
                    <Form.Label className="user-create-product-label">
                      Tính năng
                    </Form.Label>
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
                            minLength={1}
                            maxLength={25}
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
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={addFeature}
                      className="mt-2"
                    >
                      <Plus size={16} /> Thêm tính năng
                    </Button>
                    {errors.features && (
                      <Form.Text className="text-danger d-block">
                        {errors.features}
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
                <div className="user-create-product-divider"></div>
                <Col md={12} className="user-create-product-section">
                  <Card
                    className="mb-4"
                    style={{ background: "#fff", borderRadius: 12 }}
                  >
                    <Card.Header
                      style={{
                        background: "#f6f8fa",
                        borderRadius: "12px 12px 0 0",
                        color: "#2563eb",
                        fontWeight: 600,
                      }}
                    >
                      <Link size={20} className="me-2" />
                      URL Hình ảnh sản phẩm
                    </Card.Header>
                    <Card.Body>
                      {/* Thêm input file upload ảnh */}
                      <div className="mb-3">
                        <Form.Group>
                          <Form.Label>Hoặc chọn file ảnh để upload</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleUploadImageFile}
                            disabled={imageUrls.length >= 5}
                          />
                          <Form.Text className="text-muted">
                            Tối đa 5 ảnh. Ảnh upload sẽ tự động thêm vào danh
                            sách URL.
                          </Form.Text>
                        </Form.Group>
                      </div>
                      {/* ...phần nhập URL ảnh như cũ... */}
                      {imageUrls.map((url, index) => (
                        <div key={index} className="mb-3">
                          <Form.Group>
                            <Form.Label className="user-create-product-label">
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
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={addImageUrl}
                        disabled={imageUrls.length >= 5}
                      >
                        <Plus size={16} /> Thêm ảnh
                      </Button>
                      <Form.Text className="text-muted d-block">
                        Tối đa 5 URL hình ảnh. Hỗ trợ: JPG, PNG, GIF, WebP
                      </Form.Text>
                      {errors.images && (
                        <Form.Text className="text-danger d-block">
                          {errors.images}
                        </Form.Text>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <div className="user-create-product-divider"></div>
                <Col md={12} className="user-create-product-section">
                  <Card
                    className="mb-4"
                    style={{ background: "#fff", borderRadius: 12 }}
                  >
                    <Card.Header
                      style={{
                        background: "#f6f8fa",
                        borderRadius: "12px 12px 0 0",
                        color: "#2563eb",
                        fontWeight: 600,
                      }}
                    >
                      <Link size={20} className="me-2" />
                      URL Video sản phẩm
                    </Card.Header>
                    <Card.Body>
                      <Form.Group className="mb-3">
                        <Form.Label className="user-create-product-label">
                          URL Video (tùy chọn)
                        </Form.Label>
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
                      {videoUrl.trim() !== "" && isVideoUrl(videoUrl) && (
                        <div className="mt-3">
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
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={12} className="d-grid gap-2 mb-3">
                  <Button
                    className="user-create-product-btn"
                    type="submit"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <Save size={20} className="me-2" />
                        Tạo sản phẩm
                      </>
                    )}
                  </Button>
                </Col>
              </Row>
            </Form>
            <Toast
              onClose={() => setShowToast(false)}
              show={showToast}
              delay={2000}
              autohide
              style={{
                position: "fixed",
                top: 20,
                right: 20,
                minWidth: 300,
                zIndex: 9999,
                background: "#22c55e",
                color: "#fff",
                fontWeight: 600,
                fontSize: 18,
                boxShadow: "0 2px 12px rgba(34,197,94,0.15)",
                borderRadius: 12,
                border: "none",
              }}
            >
              <Toast.Body>
                <span
                  role="img"
                  aria-label="success"
                  style={{ fontSize: 22, marginRight: 8 }}
                >
                  ✅
                </span>
                Tạo sản phẩm thành công!
              </Toast.Body>
            </Toast>
          </Card.Body>
        </Card>
      </Container>
      <Footer />
    </div>
  );
};

export default UserCreateProduct;
