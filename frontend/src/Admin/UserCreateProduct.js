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
import { Save, X, Plus, Link, ArrowLeft, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authApiClient } from "../Services/auth.service";

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

  const [currentUser, setCurrentUser] = useState(null);
  const [limitReached, setLimitReached] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authApiClient.get("/users/me");
        if (res.data && res.data.success) {
          const user = res.data.data;
          setCurrentUser(user);
          if (user?.role !== 'Admin' && !user.isPremium && user.postCount >= 3) {
            setLimitReached(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

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
    <div className="content-wrapper" style={{ backgroundColor: "#f8fafc", paddingBottom: "100px", position: "relative", overflow: "hidden" }}>
      {/* Decorative Background Elements */}
      <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(255,255,255,0) 70%)", borderRadius: "50%", zIndex: 0, pointerEvents: "none" }}></div>
      <div style={{ position: "absolute", top: "20%", right: "-10%", width: "40%", height: "60%", background: "radial-gradient(circle, rgba(147,51,234,0.08) 0%, rgba(255,255,255,0) 70%)", borderRadius: "50%", zIndex: 0, pointerEvents: "none" }}></div>
      <div style={{ position: "absolute", bottom: "10%", left: "10%", width: "30%", height: "40%", background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, rgba(255,255,255,0) 70%)", borderRadius: "50%", zIndex: 0, pointerEvents: "none" }}></div>

      <Header />

      <Container style={{ maxWidth: 900, marginTop: "40px", position: "relative", zIndex: 1 }}>
        <style>{`
          .user-create-product-header {
            margin-bottom: 32px;
            display: flex;
            align-items: center;
            background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
            padding: 24px 32px;
            border-radius: 20px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.8);
          }
          .user-create-product-header h2 {
            font-weight: 800;
            color: #1e293b;
            letter-spacing: -0.5px;
            margin: 0;
            flex-grow: 1;
            text-align: center;
            background: linear-gradient(90deg, #1e293b, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .user-create-product-section {
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
          .user-create-product-section::before {
             content: '';
             position: absolute;
             top: 0; left: 0; width: 4px; height: 100%;
             background: transparent;
             transition: all 0.3s ease;
          }
          .user-create-product-section:hover::before {
             background: #3b82f6;
          }
          .user-create-product-section:hover {
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
          .user-create-product-label {
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
            left: 0;
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
        `}</style>

        <div className="user-create-product-header">
          <Button
            variant="light"
            onClick={() => navigate(-1)}
            style={{ borderRadius: "14px", width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}
            className="shadow-sm border-0"
          >
            <ArrowLeft size={24} color="#334155" />
          </Button>
          <h2>Tạo Sản Phẩm Mới</h2>
          <div style={{ width: "52px" }}></div>
        </div>

        {loadingUser ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Đang kiểm tra thông tin tài khoản...</p>
          </div>
        ) : limitReached ? (
          <Alert variant="warning" className="border-0 shadow-sm text-center py-5" style={{ borderRadius: "16px" }}>
            <h3 className="fw-bold mb-3"><i className="bi bi-exclamation-triangle-fill text-warning me-2"></i> Đã đạt giới hạn đăng bài!</h3>
            <p className="fs-5 text-muted mb-4">Bạn đang sử dụng gói <b>Cơ bản</b> và đã sử dụng hết 3 lượt đăng bài miễn phí.</p>
            <Button variant="primary" size="lg" className="rounded-pill px-5 shadow-sm fw-bold mb-3" onClick={() => navigate('/upgrade')}>
              <i className="bi bi-rocket-takeoff-fill me-2"></i> Nâng cấp tài khoản VIP ngay
            </Button>
            <p className="text-muted small">Mở khóa quyền đăng bài không giới hạn và huy hiệu tài khoản uy tín.</p>
          </Alert>
        ) : (
          <>
            {error && <Alert variant="danger" className="border-0 shadow-sm" style={{ borderRadius: "12px" }}>{error}</Alert>}
            {success && <Alert variant="success" className="border-0 shadow-sm" style={{ borderRadius: "12px" }}>{success}</Alert>}

            {currentUser?.role !== 'Admin' && !currentUser?.isPremium && (
              <Alert variant="info" className="border-0 shadow-sm d-flex align-items-center justify-content-between mb-4" style={{ borderRadius: "12px" }}>
                <div>
                  <i className="bi bi-info-circle-fill me-2"></i>
                  Bạn còn <b>{3 - (currentUser?.postCount || 0)}</b> lượt đăng bài miễn phí.
                </div>
                <Button variant="outline-primary" size="sm" className="rounded-pill fw-bold px-3" onClick={() => navigate('/upgrade')}>
                  Nâng cấp VIP
                </Button>
              </Alert>
            )}

        <Form onSubmit={handleSubmit}>
          {/* Section 1: Thông tin cơ bản */}
          <div className="user-create-product-section">
            <div className="section-title">
              <span style={{ background: "#eff6ff", padding: "8px", borderRadius: "8px", color: "#2563eb", display: "flex" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
              </span>
              Thông tin cơ bản
            </div>
            
            <Row>
              <Col md={12}>
                <Form.Group className="mb-4">
                  <Form.Label className="user-create-product-label">Tên sản phẩm *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    isInvalid={!!errors.name}
                    placeholder="VD: Tủ đông công nghiệp 4 cánh"
                    maxLength={100}
                  />
                  <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="user-create-product-label">Thương hiệu *</Form.Label>
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
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="user-create-product-label">Giá (VND) *</Form.Label>
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
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="user-create-product-label">Liên Hệ Doanh Nghiệp *</Form.Label>
                  <Form.Control
                    type="text"
                    name="business_phone"
                    value={formData.business_phone}
                    onChange={handleInputChange}
                    isInvalid={!!errors.business_phone}
                    placeholder="Số điện thoại liên hệ"
                  />
                  <Form.Control.Feedback type="invalid">{errors.business_phone}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="user-create-product-label">Tình trạng</Form.Label>
                  <Form.Control
                    type="text"
                    name="status"
                    value="Đã qua sử dụng"
                    readOnly
                    disabled
                    style={{ background: "#f1f5f9", fontWeight: 600, color: "#64748b" }}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Section 2: Chi tiết kỹ thuật */}
          <div className="user-create-product-section">
            <div className="section-title">
              <span style={{ background: "#f0fdf4", padding: "8px", borderRadius: "8px", color: "#16a34a", display: "flex" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </span>
              Chi tiết kỹ thuật
            </div>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-4">
                  <Form.Label className="user-create-product-label">Kích thước (cm)</Form.Label>
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
                  <Form.Label className="user-create-product-label">Trọng lượng (kg)</Form.Label>
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
                  <Form.Label className="user-create-product-label">Điện áp (V)</Form.Label>
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
                  <Form.Label className="user-create-product-label">Thời gian bảo hành (tháng)</Form.Label>
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
                  <Form.Label className="user-create-product-label">Kho hàng (Số lượng) *</Form.Label>
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
          <div className="user-create-product-section">
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
                    placeholder={`Tiêu đề (VD: Công nghệ)`}
                    isInvalid={!!errors.features}
                  />
                </Col>
                <Col md={7}>
                  <Form.Control
                    type="text"
                    value={feature.description}
                    onChange={(e) => handleFeatureChange(index, "description", e.target.value)}
                    placeholder={`Mô tả tính năng`}
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
          <div className="user-create-product-section">
            <div className="section-title">
              <span style={{ background: "#f3e8ff", padding: "8px", borderRadius: "8px", color: "#9333ea", display: "flex" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </span>
              Hình ảnh & Video
            </div>
            
            <Form.Group className="mb-4">
              <Form.Label className="user-create-product-label">Hình ảnh sản phẩm (Tối đa 5 ảnh) *</Form.Label>
              
              <div className="image-upload-container" onClick={() => document.getElementById('file-upload').click()}>
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
                      <div key={index} className="col-sm-4 col-md-3">
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
                     <div className="col-sm-4 col-md-3">
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
                 <p className="text-muted mb-3 small fw-semibold">Hoặc dán link hình ảnh trực tiếp:</p>
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
              <Form.Label className="user-create-product-label">URL Video sản phẩm (Tùy chọn)</Form.Label>
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
                    style={{ height: "200px", borderRadius: "12px", background: "#000", width: "100%", objectFit: "contain" }}
                  />
                </div>
              )}
            </Form.Group>
          </div>

          {/* Section 5: Mô tả chi tiết */}
          <div className="user-create-product-section">
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
                 <Form.Text className="text-muted m-0">Bạn có thể dán ảnh trực tiếp vào khung soạn thảo này.</Form.Text>
                 <span className="badge rounded-pill" style={{ background: formData.description.length > 2000 ? "#fee2e2" : "#f1f5f9", color: formData.description.length > 2000 ? "#ef4444" : "#64748b", fontWeight: 600 }}>
                   {formData.description.length}/2000
                 </span>
              </div>
              {errors.description && <div className="text-danger small mt-2 fw-semibold">{errors.description}</div>}
            </Form.Group>
          </div>

          {/* Sticky Save Action Bar */}
          <div className="sticky-action-bar">
            <Button variant="light" onClick={() => navigate(-1)} style={{ fontWeight: 600, color: "#475569", padding: "12px 28px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
              Hủy
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
        </>
        )}
      </Container>
      <Footer />

      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={2000}
        autohide
        style={{
          position: "fixed",
          top: 80,
          right: 20,
          minWidth: 320,
          zIndex: 10000,
          background: "#16a34a",
          color: "#fff",
          fontWeight: 600,
          boxShadow: "0 10px 25px -5px rgba(22,163,74,0.4)",
          borderRadius: "14px",
          border: "none",
        }}
      >
        <Toast.Body className="d-flex align-items-center p-3 fs-6">
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "12px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          Tạo sản phẩm thành công!
        </Toast.Body>
      </Toast>
    </div>
  );
};

export default UserCreateProduct;
