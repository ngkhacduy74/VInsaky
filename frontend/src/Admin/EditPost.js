import React, { useState, useEffect } from "react";
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
import { ArrowLeft, Save } from "lucide-react";
import Sidebar from "../Components/Sidebar";
import HeaderAdmin from "../Components/HeaderAdmin";

const EditPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    category: "",
    image: [""],
    video: [""],
    status: "New",
    user_position: "Newbie",
    address: "",
  });
  const [imageUrls, setImageUrls] = useState([""]);
  const [videoUrl, setVideoUrl] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/post/${postId}`,
          {
            headers: {
              token: token,
            },
          }
        );
        const post = res.data.data;
        setFormData({
          title: post.title || "",
          description: post.description || "",
          content: post.content || "",
          category: post.category || "",
          image: post.image && post.image.length > 0 ? post.image : [""],
          video: post.video && post.video.length > 0 ? post.video : [""],
          status: post.status || "New",
          user_position: post.user_position || "Newbie",
          address: post.address || "",
        });
        setImageUrls(post.image && post.image.length > 0 ? post.image : [""]);
        setVideoUrl(post.video && post.video.length > 0 ? post.video[0] : "");
      } catch (err) {
        setError("Không thể tải dữ liệu bài viết.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value.trim();
    setImageUrls(newImageUrls);
    setFormData((prev) => ({ ...prev, image: newImageUrls }));
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
      setFormData((prev) => ({ ...prev, image: newImageUrls }));
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
      const validImageUrls = imageUrls.filter((url) => url.trim() !== "");
      const dataToSend = {
        id: postId,
        category: formData.category,
        image: validImageUrls,
        video: videoUrl ? [videoUrl] : [],
        status: formData.status,
        title: formData.title,
        user_position: formData.user_position,
        address: formData.address,
        description: formData.description,
        content: formData.content,
      };
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/post/update-post/${postId}`,
        dataToSend,
        {
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        }
      );
      setSuccess("Cập nhật bài viết thành công!");
      setTimeout(() => navigate("/manaPost"), 2000);
    } catch (err) {
      setError("Không thể cập nhật bài viết. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="bg-light admin-page" style={{ minHeight: "100vh" }}>
      <HeaderAdmin />
      <Row>
        <Col
          md="auto"
          style={{ width: "250px", background: "#2c3e50", color: "white", padding: 0 }}
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
            <h3 className="mb-0">Chỉnh sửa bài viết</h3>
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <div>Đang tải dữ liệu...</div>
            </div>
          ) : (
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
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.description}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                          {formData.description.length}/1000 ký tự
                        </Form.Text>
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
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="mb-4">
                    <Card.Header>
                      <h5 className="mb-0">URL Hình ảnh bài viết</h5>
                    </Card.Header>
                    <Card.Body>
                      {imageUrls.map((url, idx) => (
                        <div key={idx} className="d-flex align-items-center mb-2">
                          <Form.Control
                            type="text"
                            placeholder="Dán URL hình ảnh"
                            value={url}
                            onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                            isInvalid={!!errors.image}
                          />
                          {imageUrls.length > 1 && (
                            <Button
                              variant="danger"
                              size="sm"
                              className="ms-2"
                              onClick={() => removeImageUrl(idx)}
                            >
                              Xóa
                            </Button>
                          )}
                        </div>
                      ))}
                      {imageUrls.length < 3 && (
                        <Button variant="link" onClick={addImageUrl}>
                          Thêm ảnh
                        </Button>
                      )}
                      {errors.image && (
                        <div className="text-danger mt-1">{errors.image}</div>
                      )}
                    </Card.Body>
                  </Card>
                  <Card className="mb-4">
                    <Card.Header>
                      <h5 className="mb-0">URL Video bài viết</h5>
                    </Card.Header>
                    <Card.Body>
                      <Form.Control
                        type="text"
                        placeholder="Dán URL video (YouTube, mp4, v.v.)"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                      />
                    </Card.Body>
                  </Card>
                  <Button type="submit" variant="primary" className="w-100">
                    <Save className="me-2" /> Lưu thay đổi
                  </Button>
                </Col>
              </Row>
            </Form>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default EditPost; 