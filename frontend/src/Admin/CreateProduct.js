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
import { ArrowLeft, Upload, X, Save, Eye, Plus, Link } from "lucide-react";
import Sidebar from "../Components/Sidebar";
import HeaderAdmin from "../Components/HeaderAdmin";
import { parseJwt } from "../utils/jwt";
import "./styles/AdminModal.css"; // Import CSS cho admin modal

const CreateProduct = () => {
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
    status: "New",
    description: "",
    // category: "",
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
  const descriptionDivRef = React.useRef();

  // Chỉ dùng state isAdmin để kiểm tra quyền
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
      // Kiểm tra quyền admin đúng chuẩn
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
    return text.replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF.,!?()%-]/g, "").trimStart();
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
    const sanitizedValue = value.replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF.,!?()%-]/g, "");
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

  // Add new image URL input (max 3)
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

  // Enhanced form validation
  const validateForm = () => {
    const newErrors = {};

    // Kiểm tra tên sản phẩm
    if (!formData.name.trim()) {
      newErrors.name = "Tên sản phẩm là bắt buộc";
    } else if (formData.name.length < 3) {
      newErrors.name = "Tên sản phẩm phải có ít nhất 3 ký tự";
    } else if (formData.name.length > 100) {
      newErrors.name = "Tên sản phẩm không được vượt quá 100 ký tự";
    }

    // Kiểm tra thương hiệu
    if (!formData.brand.trim()) {
      newErrors.brand = "Thương hiệu là bắt buộc";
    } else if (formData.brand.length < 2) {
      newErrors.brand = "Thương hiệu phải có ít nhất 2 ký tự";
    }

    // Kiểm tra giá
    if (!formData.price || parseFloat(formData.price) < 1000) {
      newErrors.price = "Giá phải lớn hơn hoặc bằng 1.000 VND";
    } else if (parseFloat(formData.price) > 1000000000) {
      newErrors.price = "Giá không được vượt quá 1 tỷ VND";
    }

    // Kiểm tra số điện thoại doanh nghiệp
    if (!formData.business_phone.trim()) {
      newErrors.business_phone = "Số điện thoại doanh nghiệp là bắt buộc";
    } else if (!/^\+?\d{8,15}$/.test(formData.business_phone.trim())) {
      newErrors.business_phone = "Số điện thoại không hợp lệ";
    }

    // Kiểm tra mô tả
    if (!formData.description.trim()) {
      newErrors.description = "Mô tả là bắt buộc";
    } else if (formData.description.length < 10) {
      newErrors.description = "Mô tả phải có ít nhất 10 ký tự";
    } else if (formData.description.length > 2000) {
      newErrors.description = "Mô tả không được vượt quá 2000 ký tự";
    }

    // Kiểm tra kích thước
    if (formData.size.trim() && !/^\d+(\s*x\s*\d+)*$/.test(formData.size.replace(/\s/g, ""))) {
      newErrors.size =
        "Kích thước phải theo định dạng: số x số x số (VD: 60x55x85)";
    }

    // Kiểm tra trọng lượng
    if (formData.weight && parseFloat(formData.weight) > 1000) {
      newErrors.weight = "Trọng lượng không được vượt quá 1000kg";
    }

    // Kiểm tra điện áp
    if (formData.voltage.trim() && !/^\d+(\s*V)?$/.test(formData.voltage.replace(/\s/g, ""))) {
      newErrors.voltage = "Điện áp phải là số (VD: 220 hoặc 220V)";
    }

    // Kiểm tra số lượng
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = "Số lượng phải lớn hơn 0";
    } else if (parseInt(formData.quantity) > 10000) {
      newErrors.quantity = "Số lượng không được vượt quá 10.000";
    }

    // Kiểm tra tính năng
    if (
      formData.features.some((f) => !f.title.trim() || !f.description.trim())
    ) {
      newErrors.features = "Tất cả tính năng phải có tiêu đề và mô tả";
    } else if (
      formData.features.some(
        (f) => f.title.trim().length < 2 || f.title.trim().length > 25 || f.description.trim().length < 2 || f.description.trim().length > 25
      )
    ) {
      newErrors.features = "Tiêu đề và mô tả tính năng phải từ 2 đến 25 ký tự";
    }

    // Validate image URLs
    const validImageUrls = imageUrls.filter((url) => url.trim() !== "");
    if (validImageUrls.length === 0) {
      newErrors.images = "Cần ít nhất một URL hình ảnh";
    } else {
      const invalidImageUrls = validImageUrls.filter((url) => !isImageUrl(url));
      if (invalidImageUrls.length > 0) {
        newErrors.images = "Một số URL hình ảnh không hợp lệ";
      }
    }

    // Validate video URL (optional)
    if (videoUrl.trim() !== "" && !isVideoUrl(videoUrl)) {
      newErrors.video = "URL video không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Hàm kiểm tra và làm sạch dữ liệu trước khi gửi lên server
  const cleanDataBeforeSubmit = (data) => {
    // Làm sạch từng trường
    const cleanedData = {
      ...data,
      name: data.name.trim(),
      brand: data.brand.trim(),
      price: parseFloat(data.price),
      business_phone: data.business_phone.trim(),
      status: data.status,
      description: data.description.trim(),
      // category: data.category.trim(),
      size: data.size.trim(),
      weight: parseFloat(data.weight),
      voltage: data.voltage.trim(),
      warranty_period: parseInt(data.warranty_period),
      quantity: parseInt(data.quantity),
      features: data.features.map((f) => ({
        id: f.id,
        title: f.title.trim(),
        description: f.description.trim(),
      })),
      image: imageUrls.filter((url) => url.trim() !== ""),
      video: videoUrl.trim() !== "" ? [videoUrl] : [],
    };

    return cleanedData;
  };

  // Handle form submission
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
      // Clean and prepare data to send
      const dataToSend = cleanDataBeforeSubmit(formData);

      console.log("Sending data:", dataToSend);

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/product/createProduct`,
        dataToSend,
        {
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        }
      );

      setSuccess("Tạo sản phẩm thành công!");
      setTimeout(() => {
        navigate("/manaProduct");
      }, 2000);
    } catch (err) {
      console.error("Lỗi khi tạo sản phẩm:", err);
      let errorMessage = "Không thể tạo sản phẩm. Vui lòng thử lại.";
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = "Không được phép: Token không hợp lệ hoặc hết hạn";
            break;
          case 400:
            errorMessage =
              "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường";
            break;
          default:
            errorMessage = err.response.data?.message || errorMessage;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    console.log("Xem trước sản phẩm:", formData);
    console.log("Image URLs:", imageUrls);
    console.log("Video URL:", videoUrl);
  };

  // Thêm hàm upload file ảnh
  const handleUploadImageFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra loại file
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

    // Kiểm tra kích thước file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File ảnh không được vượt quá 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("img", file);
    try {
      // Gọi API upload ảnh
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/file/upload-image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const urls = res.data.urls || [];

      if (urls.length > 0) {
        setImageUrls((prev) => {
          const combined = [...prev, ...urls];

          return combined.slice(0, 3);
        });
      } else {
        alert("Không lấy được URL ảnh từ server!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload ảnh thất bại!");
    }
  };

  // Hàm chuyển đổi toàn bộ ký tự Unicode phông lạ về Latin thường
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
    return null; // or a spinner
  }

  return (
    <Container fluid className="admin-page" style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: 0 }}>
      <HeaderAdmin />
      <Row className="g-0">
        <Col md="auto" style={{ width: "250px", background: "#1e293b", color: "white", minHeight: "100vh" }}>
          <Sidebar />
        </Col>
        <Col className="p-4" style={{ paddingBottom: "100px !important", position: "relative", overflow: "hidden" }}>
          {/* Decorative Background Elements */}
          <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(255,255,255,0) 70%)", borderRadius: "50%", zIndex: 0, pointerEvents: "none" }}></div>
          <div style={{ position: "absolute", top: "20%", right: "-10%", width: "40%", height: "60%", background: "radial-gradient(circle, rgba(147,51,234,0.08) 0%, rgba(255,255,255,0) 70%)", borderRadius: "50%", zIndex: 0, pointerEvents: "none" }}></div>
          <div style={{ position: "absolute", bottom: "10%", left: "10%", width: "30%", height: "40%", background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, rgba(255,255,255,0) 70%)", borderRadius: "50%", zIndex: 0, pointerEvents: "none" }}></div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <style>{`
              .admin-create-product-header {
                margin-bottom: 32px;
                display: flex;
                align-items: center;
                background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
                padding: 24px 32px;
                border-radius: 20px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.8);
              }
              .admin-create-product-header h3 {
                font-weight: 800;
                color: #1e293b;
                letter-spacing: -0.5px;
                margin: 0;
                background: linear-gradient(90deg, #1e293b, #3b82f6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
              }
              .admin-create-product-section {
                background: #ffffff;
                border-radius: 20px;
                padding: 32px;
                margin-bottom: 24px;
                border: 1px solid rgba(226, 232, 240, 0.8);
                box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.03);
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
              }
              .admin-create-product-section::before {
                 content: '';
                 position: absolute;
                 top: 0; left: 0; width: 4px; height: 100%;
                 background: transparent;
                 transition: all 0.3s ease;
              }
              .admin-create-product-section:hover::before {
                 background: #3b82f6;
              }
              .admin-create-product-section:hover {
                box-shadow: 0 12px 25px -5px rgba(0, 0, 0, 0.08);
                transform: translateY(-2px);
              }
              .section-title {
                font-size: 1.25rem;
                font-weight: 700;
                color: #0f172a;
                margin-bottom: 28px;
                display: flex;
                align-items: center;
                gap: 12px;
                padding-bottom: 16px;
                border-bottom: 2px dashed #f1f5f9;
              }
              .admin-create-product-label {
                color: #475569;
                font-weight: 600;
                font-size: 0.95rem;
                margin-bottom: 8px;
              }
              .form-control {
                border-radius: 12px;
                border: 1px solid #cbd5e1;
                padding: 14px 18px;
                transition: all 0.2s;
                background-color: #f8fafc;
              }
              .form-control:focus {
                background-color: #ffffff;
                border-color: #3b82f6;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
              }
              .image-upload-container {
                border: 2px dashed #94a3b8;
                border-radius: 16px;
                padding: 48px 24px;
                text-align: center;
                background: #f8fafc;
                transition: all 0.3s;
                cursor: pointer;
                margin-bottom: 20px;
              }
              .image-upload-container:hover {
                border-color: #3b82f6;
                background: #eff6ff;
                transform: scale(1.02);
              }
              .image-preview-card {
                position: relative;
                border-radius: 14px;
                overflow: hidden;
                border: 1px solid #e2e8f0;
                aspect-ratio: 1;
                background: #f1f5f9;
                box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                transition: transform 0.2s;
              }
              .image-preview-card:hover {
                 transform: translateY(-4px);
                 box-shadow: 0 8px 15px rgba(0,0,0,0.1);
              }
              .image-preview-card img {
                width: 100%;
                height: 100%;
                object-fit: contain;
              }
              .image-remove-btn {
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(239, 68, 68, 0.95);
                color: white;
                border: none;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s;
                z-index: 10;
                box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
              }
              .image-remove-btn:hover {
                background: rgb(220, 38, 38);
                transform: scale(1.15) rotate(90deg);
              }
              .sticky-action-bar {
                position: fixed;
                bottom: 0;
                left: 250px; /* Offset for sidebar */
                right: 0;
                background: rgba(255, 255, 255, 0.85);
                backdrop-filter: blur(12px);
                padding: 20px 32px;
                box-shadow: 0 -10px 30px rgba(0,0,0,0.05);
                z-index: 1000;
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 20px;
                border-top: 1px solid rgba(226, 232, 240, 0.8);
              }
              .btn-save-sticky {
                background: linear-gradient(135deg, #2563eb, #4f46e5);
                border: none;
                border-radius: 12px;
                padding: 14px 40px;
                font-weight: 700;
                font-size: 1.15rem;
                color: white;
                box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4);
                transition: all 0.3s;
                display: flex;
                align-items: center;
                gap: 10px;
              }
              .btn-save-sticky:hover {
                transform: translateY(-3px);
                box-shadow: 0 15px 25px -5px rgba(37, 99, 235, 0.5);
              }
              .description-editable {
                min-height: 220px;
                border: 1px solid #cbd5e1;
                border-radius: 14px;
                padding: 20px;
                font-family: inherit;
                background: #f8fafc;
                outline: none;
                word-break: break-word;
                transition: all 0.2s;
                line-height: 1.6;
              }
              .description-editable:focus {
                background: #fff;
                border-color: #3b82f6;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
              }
              @media (max-width: 768px) {
                 .sticky-action-bar { left: 0; }
              }
            `}</style>

            <div className="admin-create-product-header">
              <Button
                variant="light"
                onClick={() => navigate("/manaProduct")}
                style={{ borderRadius: "14px", width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}
                className="me-4 shadow-sm border-0"
              >
                <ArrowLeft size={24} color="#334155" />
              </Button>
              <h3>Tạo Sản Phẩm Mới (Admin)</h3>
            </div>

          {error && <Alert variant="danger" className="border-0 shadow-sm" style={{ borderRadius: "12px" }}>{error}</Alert>}
          {success && <Alert variant="success" className="border-0 shadow-sm" style={{ borderRadius: "12px" }}>{success}</Alert>}

          <Form onSubmit={handleSubmit} style={{ paddingBottom: "100px" }}>
            {/* Section 1: Thông tin cơ bản */}
            <div className="admin-create-product-section">
              <div className="section-title">
                <span style={{ background: "#eff6ff", padding: "8px", borderRadius: "8px", color: "#2563eb", display: "flex" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
                </span>
                Thông tin cơ bản
              </div>
              
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-4">
                    <Form.Label className="admin-create-product-label">Tên sản phẩm *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      isInvalid={!!errors.name}
                      placeholder="VD: Máy làm đá công nghiệp SK-400P"
                      maxLength={100}
                    />
                    <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label className="admin-create-product-label">Thương hiệu *</Form.Label>
                    <Form.Control
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      isInvalid={!!errors.brand}
                      placeholder="VD: Sanaky, Berjaya..."
                      maxLength={50}
                    />
                    <Form.Control.Feedback type="invalid">{errors.brand}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label className="admin-create-product-label">Giá (VND) *</Form.Label>
                    <Form.Control
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      isInvalid={!!errors.price}
                      placeholder="VD: 15000000"
                    />
                    <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label className="admin-create-product-label">Tình trạng</Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="form-control"
                      style={{ cursor: "pointer" }}
                    >
                      <option value="New">Hàng Mới</option>
                      <option value="SecondHand">Chưa qua sử dụng</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group className="mb-4">
                    <Form.Label className="admin-create-product-label">Số điện thoại doanh nghiệp liên hệ *</Form.Label>
                    <Form.Control
                      type="text"
                      name="business_phone"
                      value={formData.business_phone}
                      onChange={handleInputChange}
                      isInvalid={!!errors.business_phone}
                      placeholder="Nhập số điện thoại liên hệ mua hàng"
                    />
                    <Form.Control.Feedback type="invalid">{errors.business_phone}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Section 2: Chi tiết kỹ thuật */}
            <div className="admin-create-product-section">
              <div className="section-title">
                <span style={{ background: "#f0fdf4", padding: "8px", borderRadius: "8px", color: "#16a34a", display: "flex" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </span>
                Chi tiết kỹ thuật
              </div>
              
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label className="admin-create-product-label">Kích thước (cm)</Form.Label>
                    <Form.Control
                      type="text"
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      isInvalid={!!errors.size}
                      placeholder="VD: 60 x 55 x 85"
                    />
                    <Form.Control.Feedback type="invalid">{errors.size}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label className="admin-create-product-label">Trọng lượng (kg)</Form.Label>
                    <Form.Control
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      isInvalid={!!errors.weight}
                      placeholder="VD: 65"
                    />
                    <Form.Control.Feedback type="invalid">{errors.weight}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label className="admin-create-product-label">Điện áp (V)</Form.Label>
                    <Form.Control
                      type="text"
                      name="voltage"
                      value={formData.voltage}
                      onChange={handleInputChange}
                      isInvalid={!!errors.voltage}
                      placeholder="VD: 220V"
                    />
                    <Form.Control.Feedback type="invalid">{errors.voltage}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="admin-create-product-label">Thời gian bảo hành (tháng)</Form.Label>
                    <Form.Control
                      type="number"
                      name="warranty_period"
                      value={formData.warranty_period}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="admin-create-product-label">Kho hàng (Số lượng) *</Form.Label>
                    <Form.Control
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      isInvalid={!!errors.quantity}
                    />
                    <Form.Control.Feedback type="invalid">{errors.quantity}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Section 3: Tính năng nổi bật */}
            <div className="admin-create-product-section">
              <div className="section-title">
                <span style={{ background: "#fef3c7", padding: "8px", borderRadius: "8px", color: "#d97706", display: "flex" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </span>
                Tính năng nổi bật
              </div>
              
              {formData.features.map((feature, index) => (
                <Row key={index} className="mb-3 align-items-start">
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      value={feature.title}
                      onChange={(e) => handleFeatureChange(index, "title", e.target.value)}
                      placeholder={`Tiêu đề (VD: Công nghệ làm lạnh)`}
                      isInvalid={!!errors.features}
                    />
                  </Col>
                  <Col md={7}>
                    <Form.Control
                      type="text"
                      value={feature.description}
                      onChange={(e) => handleFeatureChange(index, "description", e.target.value)}
                      placeholder={`Mô tả chi tiết năng`}
                      isInvalid={!!errors.features}
                    />
                  </Col>
                  <Col md={1} className="text-end">
                    {formData.features.length > 1 && (
                      <Button variant="outline-danger" className="border-0 bg-light" onClick={() => removeFeature(index)}>
                        <X size={18} className="text-danger" />
                      </Button>
                    )}
                  </Col>
                </Row>
              ))}
              <Button variant="outline-primary" onClick={addFeature} className="mt-2" style={{ borderRadius: "8px", fontWeight: "600" }}>
                <Plus size={18} className="me-1" /> Thêm tính năng
              </Button>
              {errors.features && <Form.Text className="text-danger d-block mt-2">{errors.features}</Form.Text>}
            </div>

            {/* Section 4: Hình ảnh và Video */}
            <div className="admin-create-product-section">
              <div className="section-title">
                <span style={{ background: "#f3e8ff", padding: "8px", borderRadius: "8px", color: "#9333ea", display: "flex" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </span>
                Hình ảnh & Video
              </div>
              
              <Form.Group className="mb-4">
                <Form.Label className="admin-create-product-label">Hình ảnh sản phẩm (Tối đa 5 ảnh) *</Form.Label>
                
                <div 
                  className="image-upload-container" 
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <div style={{ background: "white", width: "64px", height: "64px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", marginBottom: "16px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  </div>
                  <h6 style={{ color: "#1e293b", fontWeight: 700, fontSize: "1.1rem" }}>Click để tải ảnh lên</h6>
                  <p className="text-muted small mb-0 mt-2">Hỗ trợ JPG, PNG, GIF, WebP (Tối đa 5MB)</p>
                  <Form.Control
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleUploadImageFile}
                    disabled={imageUrls.filter(u => u.trim() !== "").length >= 5}
                    style={{ display: "none" }}
                  />
                </div>

                {/* Lưới hiển thị ảnh đã upload */}
                {imageUrls.filter(url => url.trim() !== "").length > 0 && (
                  <div className="row g-3 mt-4">
                    <div className="col-12 mb-2"><span className="fw-semibold" style={{color: "#64748b"}}>Ảnh đã chọn:</span></div>
                    {imageUrls.map((url, index) => {
                      if (url.trim() === "") return null;
                      return (
                        <div key={index} className="col-sm-4 col-md-3 col-lg-2">
                          <div className="image-preview-card">
                            <button 
                              type="button" 
                              className="image-remove-btn"
                              onClick={(e) => { e.stopPropagation(); removeImageUrl(index); }}
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                            <img 
                              src={url} 
                              alt={`Preview ${index + 1}`} 
                              onError={(e) => { e.target.style.display = "none"; }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                    {imageUrls.filter(u => u.trim() !== "").length < 5 && (
                       <div className="col-sm-4 col-md-3 col-lg-2">
                          <div 
                            className="image-preview-card d-flex flex-column align-items-center justify-content-center"
                            style={{ border: "2px dashed #cbd5e1", background: "#f8fafc", cursor: "pointer", transition: "all 0.2s" }}
                            onClick={() => {
                              const lastBlank = imageUrls.findIndex(u => u.trim() === "");
                              if (lastBlank === -1) {
                                  addImageUrl();
                              }
                            }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}
                          >
                            <Plus size={32} color="#94a3b8" />
                            <div className="fw-semibold mt-2" style={{color: "#94a3b8", fontSize: "0.9rem"}}>Thêm URL</div>
                          </div>
                       </div>
                    )}
                  </div>
                )}

                {/* URL Inputs fallback for direct links */}
                <div className="mt-4 pt-4 border-top">
                   <p className="text-muted mb-3 small fw-semibold">Hoặc nhập link hình ảnh trực tiếp:</p>
                   {imageUrls.map((url, index) => (
                      <div key={index} className="mb-2 d-flex align-items-center">
                        <Form.Control
                          type="url"
                          value={url}
                          onChange={(e) => handleImageUrlChange(index, e.target.value)}
                          placeholder="https://..."
                          style={{ fontSize: "0.9rem" }}
                          isInvalid={!!errors.images && url.trim() !== "" && !isImageUrl(url)}
                        />
                        {imageUrls.length > 1 && (
                           <Button variant="light" className="ms-2 text-danger border-0 d-flex align-items-center justify-content-center" style={{width: '44px', height: '44px', borderRadius: '10px'}} onClick={() => removeImageUrl(index)}><X size={20}/></Button>
                        )}
                      </div>
                   ))}
                   {errors.images && <Form.Text className="text-danger fw-semibold">{errors.images}</Form.Text>}
                </div>
              </Form.Group>

              <Form.Group className="mb-0 mt-4 pt-4 border-top">
                <Form.Label className="admin-create-product-label">URL Video sản phẩm (Tùy chọn)</Form.Label>
                <Form.Control
                  type="url"
                  value={videoUrl}
                  onChange={(e) => handleVideoUrlChange(e.target.value)}
                  placeholder="https://youtube.com/..."
                  isInvalid={!!errors.video}
                />
                <Form.Control.Feedback type="invalid">{errors.video}</Form.Control.Feedback>
                
                {videoUrl.trim() !== "" && isVideoUrl(videoUrl) && (
                  <div className="mt-3">
                    <video
                      src={videoUrl}
                      controls
                      style={{ height: "200px", borderRadius: "12px", background: "#000", width: "100%", objectFit: "contain", maxWidth: "600px" }}
                    />
                  </div>
                )}
              </Form.Group>
            </div>

            {/* Section 5: Mô tả chi tiết */}
            <div className="admin-create-product-section mb-5">
              <div className="section-title">
                <span style={{ background: "#ffe4e6", padding: "8px", borderRadius: "8px", color: "#e11d48", display: "flex" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </span>
                Mô tả chi tiết
              </div>
              <Form.Group>
                <div
                  ref={descriptionDivRef}
                  contentEditable
                  suppressContentEditableWarning
                  className="description-editable"
                  placeholder="Nhập mô tả chi tiết sản phẩm..."
                  onPaste={handleDescriptionPaste}
                  onInput={handleDescriptionInput}
                  spellCheck={true}
                />
                <div className="d-flex justify-content-between mt-3 align-items-center">
                   <Form.Text className="text-muted m-0">Ghi chú: Bạn có thể dán ảnh trực tiếp vào khung soạn thảo này.</Form.Text>
                   <span className="badge rounded-pill" style={{ background: formData.description.length > 2000 ? "#fee2e2" : "#f1f5f9", color: formData.description.length > 2000 ? "#ef4444" : "#64748b", fontWeight: 600 }}>
                     {formData.description.length}/2000
                   </span>
                </div>
                {errors.description && <div className="text-danger small mt-2 fw-semibold">{errors.description}</div>}
              </Form.Group>
            </div>

            {/* Sticky Save Action Bar */}
            <div className="sticky-action-bar">
              <Button variant="light" onClick={() => navigate("/manaProduct")} style={{ fontWeight: 600, color: "#475569", padding: "12px 28px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                Hủy và Quay Lại
              </Button>
              <Button type="button" variant="outline-primary" onClick={handlePreview} style={{ borderRadius: "10px", fontWeight: 600 }}>
                <Eye size={20} className="me-2" /> Xem trước dữ liệu
              </Button>
              <Button type="submit" disabled={loading} className="btn-save-sticky">
                {loading ? (
                  <><Spinner size="sm" /> Đang xử lý...</>
                ) : (
                  <><Save size={20} /> Tạo sản phẩm</>
                )}
              </Button>
            </div>

          </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateProduct;
