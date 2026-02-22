import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { checkOrderStatus } from "../Services/api.service";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import "../Pages/Cart.css"; // Reuse Cart styles if possible, or inline

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // SePay redirects back with ?orderCode=... or ?id=... format
  // We'll also just support standard query params if needed
  const orderId = searchParams.get("orderCode") || searchParams.get("id");

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await checkOrderStatus(orderId);
        const data = response.data?.data?.data || response.data?.data || response.data;
        if (data && data.status) {
          setOrderStatus(data.status); // Should be 'pending', 'paid', etc
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [orderId]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="cart-items-card checkout-success-view text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <h4 className="mt-3">Đang kiểm tra trạng thái thanh toán...</h4>
        </div>
      );
    }

    if (!orderId) {
      return (
        <div className="cart-items-card checkout-success-view text-center py-5">
          <div className="success-icon" style={{color: "var(--bs-danger)"}}>
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <h3>Không tìm thấy đơn hàng!</h3>
          <p>Link kiểm tra không hợp lệ.</p>
          <button className="cart-empty-btn" onClick={() => navigate("/products")}>
            Tiếp tục mua sắm
          </button>
        </div>
      );
    }

    if (orderStatus === "paid") {
      return (
        <div className="cart-items-card checkout-success-view text-center py-5">
          <div className="success-icon">
            <i className="fas fa-check-circle" style={{fontSize: "4rem", color: "#10b981"}}></i>
          </div>
          <h3 className="mt-3">Thanh Toán Thành Công!</h3>
          <p>
            Cảm ơn bạn đã tin tưởng và đặt hàng tại Vinsaky.<br />
            Đơn hàng <b>{orderId}</b> của bạn đã được thanh toán và đang được xử lý.
          </p>
          <button className="cart-empty-btn" onClick={() => navigate("/products")}>
            Tiếp tục mua sắm
          </button>
        </div>
      );
    }

    if (orderStatus === "pending") {
      return (
        <div className="cart-items-card checkout-success-view text-center py-5">
          <div className="success-icon">
            <i className="fas fa-clock" style={{fontSize: "4rem", color: "#f59e0b"}}></i>
          </div>
          <h3 className="mt-3">Đơn Hàng Đang Chờ Thanh Toán</h3>
          <p>
            Hệ thống đang ghi nhận giao dịch của bạn cho đơn hàng <b>{orderId}</b>.<br />
            Nếu bạn đã chuyển khoản, vui lòng đợi trong giây lát hoặc liên hệ CSKH.
          </p>
          <div className="mt-4 gap-3 d-flex justify-content-center">
             <button className="cart-empty-btn" onClick={() => window.location.reload()}>
               <i className="fas fa-sync-alt me-2"></i>Tải lại trang
             </button>
             <button className="cart-empty-btn" style={{background: "#64748b"}} onClick={() => navigate("/products")}>
               Về trang chủ
             </button>
          </div>
        </div>
      );
    }

    return (
      <div className="cart-items-card checkout-success-view text-center py-5">
        <div className="success-icon" style={{color: "var(--bs-danger)"}}>
          <i className="fas fa-times-circle" style={{fontSize: "4rem"}}></i>
        </div>
        <h3 className="mt-3">Thanh Toán Thất Bại</h3>
        <p>
          Đơn hàng <b>{orderId}</b> chưa được thanh toán hoặc đã bị hủy.
        </p>
        <button className="cart-empty-btn" onClick={() => navigate("/cart")}>
          Thử lại
        </button>
      </div>
    );
  };

  return (
    <div className="cart-page">
      <Header />
      <div className="content-wrapper" style={{ marginTop: "80px", minHeight: "60vh" }}>
        <div className="cart-container">
          {renderContent()}
        </div>
      </div>
      <Footer />
    </div>
  );
}
