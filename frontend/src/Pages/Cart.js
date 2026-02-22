import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import ChatWidget from "../Components/WidgetChat";
import {
  getCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  getCartTotal,
  getCartCount,
} from "../utils/cartUtils";
import { useAuth } from "../hooks/useAuth";
import { authApiClient } from "../Services/auth.service";
import { checkoutOrder } from "../Services/api.service";
import "./Cart.css";

const formatPrice = (price) => {
  if (!price && price !== 0) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState(null);
  const [isCheckout, setIsCheckout] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });
  
  const { user, loading } = useAuth();
  const [isAutofilling, setIsAutofilling] = useState(false);

  useEffect(() => {
    setCartItems(getCart());
  }, []);

  const handleAutofill = async () => {
    if (!user) {
      showToast("Vui lòng đăng nhập để sử dụng tính năng này", "info", "👤");
      return;
    }
    
    setIsAutofilling(true);
    try {
      // Fetch full profile info using user.email
      let fullProfile = user;
      if (user.email) {
        const res = await authApiClient.get(`/users/email/${user.email}`);
        if (res.data?.success && res.data?.data) {
          fullProfile = res.data.data;
        }
      }

      setFormData((prev) => ({
        ...prev,
        name: fullProfile.fullname || fullProfile.name || prev.name,
        phone: fullProfile.phone || fullProfile.phoneNumber || prev.phone,
        address: fullProfile.address || prev.address,
      }));
      showToast("Đã điền thông tin từ hồ sơ", "success", "✨");
    } catch (err) {
      console.warn("Could not fetch detailed profile:", err);
      // Fallback to token decoded payload
      setFormData((prev) => ({
        ...prev,
        name: user.fullname || user.name || prev.name,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
      }));
      showToast("Đã điền thông tin từ hồ sơ", "success", "✨");
    } finally {
      setIsAutofilling(false);
    }
  };

  const showToast = (text, type = "info", icon = "💬") => {
    setToast({ text, type, icon });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRemove = (productId) => {
    const updated = removeFromCart(productId);
    setCartItems(updated);
    showToast("Đã xóa sản phẩm khỏi giỏ hàng", "info", "🗑️");
  };

  const handleQuantity = (productId, delta) => {
    const item = cartItems.find((i) => i.productId === productId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    const updated = updateCartQuantity(productId, newQty);
    setCartItems(updated);
  };

  const handleClear = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?")) {
      clearCart();
      setCartItems([]);
      showToast("Đã làm trống giỏ hàng", "info", "🧹");
      setIsCheckout(false);
    }
  };

  // Switch to checkout mode
  const handleProceedCheckout = () => {
    if (cartItems.length === 0) {
      showToast("Giỏ hàng đang trống", "error", "⚠️");
      return;
    }
    setIsCheckout(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Form Input Handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Order Simulator
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      showToast("Vui lòng điền đầy đủ thông tin bắt buộc", "error", "⚠️");
      return;
    }

    // Phone validation regex
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(formData.phone)) {
      showToast("Số điện thoại không hợp lệ", "error", "📱");
      return;
    }

    try {
      // Prepare payload for backend
      const payload = {
        shipping: {
          fullName: formData.name,
          phone: formData.phone,
          addressDetail: formData.address,
          note: formData.notes
        },
        items: cartItems.map(item => ({
          product_id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: getCartTotal()
      };

      showToast("Đang chuyển hướng đến cổng thanh toán...", "info", "💳");

      const response = await checkoutOrder(payload);

      // Extract from ResponseInterceptor format: response.data.data
      const outerData = response.data?.data;
      const resData = outerData?.data || outerData;

      if (response.data?.success && resData?.html) {
        // Clear cart first so when they return it's empty
        clearCart();
        setCartItems([]);

        // Inject the sepay form to the document and submit
        const sepayHtml = resData.html;
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = sepayHtml;
        document.body.appendChild(tempDiv);
        
        // Find and submit the form
        const sepayForm = document.getElementById("sepay");
        if (sepayForm) {
          sepayForm.submit();
        } else {
          // If script tag is provided instead, try executing it
          const scripts = tempDiv.getElementsByTagName('script');
          for (let i = 0; i < scripts.length; i++) {
            eval(scripts[i].innerText);
          }
        }
      } else {
        showToast("Có lỗi xảy ra khi tạo đơn hàng", "error", "⚠️");
      }
    } catch (error) {
      console.error("Checkout validation / API error:", error);
      showToast("Lỗi kết nối tới máy chủ", "error", "❌");
    }
  };

  const defaultImg =
    "https://res.cloudinary.com/dtdwjplew/image/upload/v1737903159/9_gnxlmk.jpg";

  return (
    <div className="cart-page">
      <Header />
      <div className="content-wrapper" style={{ marginTop: "70px" }}>
        {/* Require Login State */}
        {!loading && !user ? (
          <div className="cart-container" style={{ marginTop: "40px" }}>
            <div className="cart-empty">
              <div className="cart-empty-icon">🔒</div>
              <h3>Vui lòng đăng nhập</h3>
              <p>Bạn cần đăng nhập để xem giỏ hàng và đặt hàng.</p>
              <button
                type="button"
                className="cart-empty-btn"
                onClick={() => navigate("/login")}
              >
                <i className="fas fa-sign-in-alt"></i> Đăng nhập ngay
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <div className="cart-hero">
          <div className="cart-hero-content">
            <h1>
              <i className="fas fa-shopping-cart"></i> Giỏ hàng của bạn
            </h1>
            <p>
              {cartItems.length > 0
                ? `Bạn đang có ${getCartCount()} sản phẩm được chọn`
                : "Không có sản phẩm nào trong giỏ"}
            </p>
          </div>
        </div>

        <div className="cart-container">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛍️</div>
              <h3>Giỏ hàng trống</h3>
              <p>Khám phá thêm các sản phẩm tuyệt vời của Vinsaky nhé!</p>
              <button
                type="button"
                className="cart-empty-btn"
                onClick={() => navigate("/products")}
              >
                <i className="fas fa-compass"></i> Khám phá sản phẩm
              </button>
            </div>
          ) : (
            <div className="cart-layout">
              {/* Left Column: Items List */}
              <div className="cart-items-card">
                <div className="cart-items-header">
                  <h2>Sản phẩm đã chọn ({cartItems.length})</h2>
                  <button
                    type="button"
                    className="cart-clear-btn"
                    onClick={handleClear}
                  >
                    <i className="fas fa-trash-alt"></i> Xóa tất cả
                  </button>
                </div>
                {cartItems.map((item) => (
                  <div key={item.productId} className="cart-item">
                    <img
                      src={item.image || defaultImg}
                      alt={item.name}
                      className="cart-item-img"
                      onClick={() => navigate(`/productView/${item.productId}`)}
                      onError={(e) => {
                        e.target.src = defaultImg;
                      }}
                    />
                    <div className="cart-item-info">
                      <div
                        className="cart-item-name"
                        onClick={() => navigate(`/productView/${item.productId}`)}
                        title={item.name}
                      >
                        {item.name}
                      </div>
                      {item.brand && (
                        <div className="cart-item-brand">{item.brand}</div>
                      )}
                      <div className="cart-item-price">
                        {formatPrice(item.price)}
                      </div>
                    </div>
                    <div className="cart-item-actions">
                      <div className="cart-item-qty">
                        <button
                          type="button"
                          onClick={() => handleQuantity(item.productId, -1)}
                        >
                          <i className="fas fa-minus" style={{fontSize: "0.8rem"}}></i>
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantity(item.productId, 1)}
                        >
                          <i className="fas fa-plus" style={{fontSize: "0.8rem"}}></i>
                        </button>
                      </div>
                      <button
                        type="button"
                        className="cart-item-remove"
                        onClick={() => handleRemove(item.productId)}
                      >
                        <i className="fas fa-times"></i> Loại bỏ
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Checkout / Summary */}
              <div className="cart-summary-wrapper">
                <div className="cart-summary">
                  {isCheckout ? (
                    <form className="checkout-form" onSubmit={handlePlaceOrder}>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <button 
                          type="button" 
                          className="back-to-cart m-0"
                          onClick={() => setIsCheckout(false)}
                        >
                          <i className="fas fa-arrow-left"></i> Quay lại
                        </button>
                        {user && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary shadow-sm"
                            onClick={handleAutofill}
                            disabled={isAutofilling}
                            style={{ borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600" }}
                          >
                            <i className={`fas ${isAutofilling ? 'fa-spinner fa-spin' : 'fa-magic'} me-1`}></i> Gợi ý thông tin
                          </button>
                        )}
                      </div>
                      <h3>📦 Thông tin nhận hàng</h3>
                      
                      <div className="form-group">
                        <label>Họ và tên *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Nhập họ tên người nhận"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Số điện thoại *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="VD: 0912345678"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Địa chỉ giao hàng chi tiết *</label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/TP"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Ghi chú thêm (Tùy chọn)</label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          placeholder="Lưu ý giao hàng, thời gian nhận..."
                          style={{ minHeight: "60px" }}
                        />
                      </div>

                      <div className="cart-summary-row total">
                        <span>Tổng thanh toán</span>
                        <span className="cart-summary-total-price">
                          {formatPrice(getCartTotal())}
                        </span>
                      </div>

                      <button type="submit" className="cart-summary-btn success">
                        Hoàn Tất Đặt Hàng <i className="fas fa-check"></i>
                      </button>
                    </form>
                  ) : (
                    <>
                      <h3>📋 Tóm tắt đơn hàng</h3>
                      <div className="cart-summary-row">
                        <span>Số lượng sản phẩm</span>
                        <strong>{getCartCount()}</strong>
                      </div>
                      <div className="cart-summary-row">
                        <span>Lượng tồn kho</span>
                        <span style={{ color: "#3b82f6" }}>Đảm bảo</span>
                      </div>
                      <div className="cart-summary-row">
                        <span>Phí giao hàng</span>
                        <span style={{ color: "#059669" }}>Sẽ liên hệ sau</span>
                      </div>
                      <div className="cart-summary-row total">
                        <span>Tạm tính</span>
                        <span className="cart-summary-total-price">
                          {formatPrice(getCartTotal())}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="cart-summary-btn primary"
                        onClick={handleProceedCheckout}
                      >
                        Tiến Hành Đặt Hàng <i className="fas fa-arrow-right"></i>
                      </button>
                      <button
                        type="button"
                        className="cart-summary-btn secondary"
                        onClick={() => navigate("/products")}
                      >
                        <i className="fas fa-store"></i> Tiếp tục mua sắm
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        </>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`cart-toast ${toast.type}`}>
          <span style={{ fontSize: "1.25rem" }}>{toast.icon}</span>
          <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--cart-text)" }}>
            {toast.text}
          </span>
        </div>
      )}

      <ChatWidget />
      <Footer />
    </div>
  );
}

export default Cart;
