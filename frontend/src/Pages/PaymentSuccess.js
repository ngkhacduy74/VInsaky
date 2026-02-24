import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { checkOrderStatus } from "../Services/api.service";
import { authApiClient } from "../Services/auth.service";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import "../Pages/Cart.css"; 

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isVipUpgrade, setIsVipUpgrade] = useState(false);
  const [vipStatus, setVipStatus] = useState("pending");

  const orderId = searchParams.get("orderCode") || searchParams.get("id");

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    if (orderId.startsWith("INV-VIP-")) {
      setIsVipUpgrade(true);
      let attempts = 0;
      const maxAttempts = 15;
      const pollVip = setInterval(async () => {
        try {
          const res = await authApiClient.get("/users/me");
          if (res.data?.success && res.data?.data?.isPremium) {
             const updatedUser = res.data.data;
             // Update localStorage cache so Header.js reads the new VIP status on navigation/refresh
             localStorage.setItem("user", JSON.stringify(updatedUser));
             
             setVipStatus("success");
             setLoading(false);
             clearInterval(pollVip);
          }
        } catch (e) {
          console.error(e);
        }
        attempts++;
        if (attempts >= maxAttempts) {
           setLoading(false);
           clearInterval(pollVip);
        }
      }, 2000);
      return () => clearInterval(pollVip);
    } else {
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
    }
  }, [orderId]);

  const renderContent = () => {
    if (isVipUpgrade) {
      if (loading) {
         return (
           <div className="cart-items-card checkout-success-view text-center py-5">
             <div className="spinner-border text-warning" role="status"></div>
             <h4 className="mt-3 fw-bold text-warning">Khởi tạo giao dịch VIP...</h4>
             <p className="text-muted">Hệ thống đang tích cực xử lý hóa đơn của bạn. Vui lòng chờ trong giây lát.</p>
           </div>
         );
      }
      if (vipStatus === "success") {
        return (
          <div className="cart-items-card checkout-success-view text-center py-5 position-relative overflow-hidden" style={{ background: "linear-gradient(145deg, #fffbeb, #fef3c7)", border: "2px solid #fbbf24", boxShadow: "0 10px 25px rgba(245, 158, 11, 0.2)" }}>
            <div className="position-absolute" style={{ top: "-20px", right: "-20px", color: "rgba(251, 191, 36, 0.2)", fontSize: "10rem" }}>
               <i className="bi bi-star-fill"></i>
            </div>
            <div className="success-icon mb-4 position-relative z-index-1">
              <i className="bi bi-star-fill" style={{fontSize: "5rem", color: "#f59e0b", filter: "drop-shadow(0px 4px 6px rgba(245,158,11,0.4))"}}></i>
            </div>
            <h2 className="mt-3 fw-bold position-relative z-index-1" style={{ color: "#b45309", letterSpacing: "-0.03em" }}>Nâng Cấp VIP Thành Công!</h2>
            <p className="fs-5 text-dark mt-3 mb-4 position-relative z-index-1 px-4">
              Chúc mừng! Tài khoản của bạn đã trở thành thẻ <b className="text-warning">Thành Viên VIP Vinsaky</b>.<br/>
              Sức mạnh đăng tin không giới hạn đã được mở khóa!
            </p>
            <div className="mt-4 gap-3 d-flex justify-content-center position-relative z-index-1 flex-wrap">
               <button className="cart-empty-btn mb-2 mb-sm-0" style={{background: "linear-gradient(135deg, #f59e0b, #d97706)", border: "none", boxShadow: "0 4px 14px rgba(245, 158, 11, 0.4)"}} onClick={() => navigate("/user-products")}>
                 <i className="bi bi-box me-2"></i>Tiến hành đăng bài
               </button>
               <button className="cart-empty-btn" style={{background: "#64748b"}} onClick={() => navigate("/products")}>
                 Về trang chủ
               </button>
            </div>
          </div>
        );
      } else {
        return (
          <div className="cart-items-card checkout-success-view text-center py-5" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div className="success-icon mb-3">
              <i className="fas fa-clock" style={{fontSize: "4rem", color: "#f59e0b"}}></i>
            </div>
            <h3 className="mt-3 fw-bold text-secondary">Đang Chờ Xác Nhận VIP</h3>
            <p className="text-muted">
              Giao dịch <b>{orderId}</b> của bạn đã được tiếp nhận.<br />
              Nếu bạn đã chuyển khoản, hệ thống sẽ tự động nâng cấp tài khoản của bạn sau ít phút.
            </p>
            <div className="mt-4 gap-3 d-flex justify-content-center flex-wrap">
               <button className="cart-empty-btn mb-2 mb-sm-0" onClick={() => window.location.reload()}>
                 <i className="fas fa-sync-alt me-2"></i>Tải lại trang
               </button>
               <button className="cart-empty-btn" style={{background: "#64748b"}} onClick={() => navigate("/products")}>
                 Về trang chủ
               </button>
            </div>
          </div>
        );
      }
    }

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
          <div className="mt-4 gap-3 d-flex justify-content-center flex-wrap">
             <button className="cart-empty-btn mb-2 mb-sm-0" onClick={() => window.location.reload()}>
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
        <div className="cart-container mx-auto px-3" style={{ maxWidth: "800px" }}>
          {renderContent()}
        </div>
      </div>
      <Footer />
    </div>
  );
}
