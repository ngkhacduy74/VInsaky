import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
  Modal,
  Spinner,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Save, Eye, Link, X, Plus, Upload, Image, FileText, Tag, Info, CheckCircle, AlertCircle } from "lucide-react";
import Sidebar from "../Components/Sidebar";
import HeaderAdmin from "../Components/HeaderAdmin";
import ErrorPage from "../Components/ErrorPage";
import "./styles/AdminModal.css";

const CreatePost = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageUrls, setImageUrls] = useState([""]);
  const [videoUrl, setVideoUrl] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: [""],
    video: [""],
    status: "New",
    user_position: "Newbie",
    address: "",
    content: "",
  });
  const [errors, setErrors] = useState({});

  // Validate URL format
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
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
    return (
      videoExtensions.some((ext) => urlLower.includes(ext)) ||
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("vimeo.com")
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Xử lý dán text thuần vào description
  const handlePasteDescription = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    setFormData((prev) => ({ ...prev, description: prev.description + text }));
  };

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
    const formDataUpload = new FormData();
    formDataUpload.append("img", file);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/file/upload-image`,
        formDataUpload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const imageUrlRes = res.data.url || res.data.path || res.data.secure_url;
      if (imageUrlRes) {
        setImageUrls((prev) => {
          if (prev.length < 3) return [...prev, imageUrlRes];
          return prev;
        });
      } else {
        alert("Không lấy được URL ảnh từ server!");
      }
    } catch (error) {
      alert("Upload ảnh thất bại!");
    }
  };

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value.trim();
    setImageUrls(newImageUrls);
    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const addImageUrl = () => {
    if (imageUrls.length < 3) {
      setImageUrls([...imageUrls, ""]);
    }
  };

  const removeImageUrl = (index) => {
    if (imageUrls.length > 1) {
      const newImageUrls = imageUrls.filter((_, i) => i !== index);
      setImageUrls(newImageUrls);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Tiêu đề là bắt buộc";
    if (!formData.description.trim())
      newErrors.description = "Mô tả là bắt buộc";
    if (!formData.category.trim()) newErrors.category = "Danh mục là bắt buộc";
    if (!formData.status.trim()) newErrors.status = "Trạng thái là bắt buộc";
    if (!formData.user_position.trim())
      newErrors.user_position = "Chức vụ là bắt buộc";
    if (!formData.address.trim()) newErrors.address = "Địa chỉ là bắt buộc";
    const validImageUrls = imageUrls.filter((url) => url.trim() !== "");
    if (validImageUrls.length === 0) {
      newErrors.image = "Cần ít nhất một URL hình ảnh";
    } else {
      const invalidImageUrls = validImageUrls.filter((url) => !isImageUrl(url));
      if (invalidImageUrls.length > 0) {
        newErrors.image = "Một số URL hình ảnh không hợp lệ";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token hết hạn hoặc không tồn tại. Vui lòng đăng nhập lại.");
      return;
    }
    if (!validateForm()) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const plainTextDescription = formData.description
        .replace(/\s+/g, " ")
        .replace(/\u00A0/g, " ")
        .replace(/\r?\n|\r/g, " ")
        .trim();
      const validImageUrls = imageUrls.filter((url) => url.trim() !== "");
      const dataToSend = {
        id: undefined,
        category: formData.category,
        image: validImageUrls,
        video: videoUrl ? [videoUrl] : [],
        status: formData.status,
        title: formData.title,
        user_position: formData.user_position,
        address: formData.address,
        description: plainTextDescription,
        content: formData.content,
      };
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/post/createPost`,
        dataToSend,
        {
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        }
      );
      setSuccess("Tạo bài viết thành công!");
      setTimeout(() => navigate("/manaPost"), 2000);
    } catch (err) {
      setError("Không thể tạo bài viết. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    // Xem trước dữ liệu bài viết
    alert(
      "Xem trước bài viết:\n" +
        JSON.stringify(
          { ...formData, image: imageUrls, video: videoUrl },
          null,
          2
        )
    );
  };

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
        <Col style={{ marginLeft: "10px" }} className="p-4">
          <div className="d-flex align-items-center mb-4">
            <Button
              variant="outline-secondary"
              onClick={() => navigate("/manaPost")}
              className="me-3"
            >
              <ArrowLeft size={20} />
            </Button>
            <h3 className="mb-0">Tạo bài viết mới</h3>
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">Thông tin bài viết</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Tiêu đề *</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        isInvalid={!!errors.title}
                        placeholder="Nhập tiêu đề bài viết"
                        maxLength={200}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.title}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Mô tả *</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        isInvalid={!!errors.description}
                        placeholder="Nhập mô tả bài viết"
                        maxLength={1000}
                        className="description-textarea time-new-roman-font"
                        onPaste={handlePasteDescription}
                        style={{
                          fontFamily: "'Times New Roman', Times, serif",
                        }}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.description}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        {formData.description.length}/1000 ký tự
                      </Form.Text>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Danh mục *</Form.Label>
                      <Form.Control
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        isInvalid={!!errors.category}
                        placeholder="Nhập danh mục bài viết"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.category}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Trạng thái *</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        isInvalid={!!errors.status}
                      >
                        <option value="New">Mới</option>
                        <option value="SecondHand">Đã qua sử dụng</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.status}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Chức vụ *</Form.Label>
                      <Form.Select
                        name="user_position"
                        value={formData.user_position}
                        onChange={handleInputChange}
                        isInvalid={!!errors.user_position}
                      >
                        <option value="Newbie">Người mới</option>
                        <option value="Professional">Chuyên nghiệp</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.user_position}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Địa chỉ *</Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        isInvalid={!!errors.address}
                        placeholder="Nhập địa chỉ người đăng"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.address}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Nội dung</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={8}
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        placeholder="Nhập nội dung bài viết"
                        maxLength={5000}
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">
                      <Link size={20} className="me-2" />
                      URL Hình ảnh bài viết
                    </h5>
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
                          disabled={imageUrls.length >= 3}
                        />
                        <Form.Text className="text-muted">
                          Tối đa 3 ảnh. Ảnh upload sẽ tự động thêm vào danh sách
                          URL.
                        </Form.Text>
                      </Form.Group>
                    </div>
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
                                !!errors.image &&
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
                                Xóa
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
                    {/* Nút thêm ảnh */}
                    {imageUrls.length < 3 && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="mb-3"
                        onClick={addImageUrl}
                      >
                        Thêm ảnh
                      </Button>
                    )}
                    <Form.Text className="text-muted">
                      Tối đa 3 URL hình ảnh. Hỗ trợ: JPG, PNG, GIF, WebP
                    </Form.Text>
                    {errors.image && (
                      <Form.Text className="text-danger d-block">
                        {errors.image}
                      </Form.Text>
                    )}
                  </Card.Body>
                </Card>
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">
                      <Link size={20} className="me-2" />
                      URL Video bài viết
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>URL Video (tùy chọn)</Form.Label>
                      <Form.Control
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://example.com/video.mp4"
                        isInvalid={!!errors.video}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.video}
                      </Form.Control.Feedback>
                      {videoUrl && isVideoUrl(videoUrl) && (
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
                    </Form.Group>
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
                            Đang tạo...
                          </>
                        ) : (
                          <>
                            <Save size={20} className="me-2" />
                            Tạo bài viết
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline-info"
                        onClick={handlePreview}
                        disabled={loading}
                      >
                        <Eye size={20} className="me-2" />
                        Xem trước
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={() => navigate("/manaPost")}
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

export default CreatePost;
