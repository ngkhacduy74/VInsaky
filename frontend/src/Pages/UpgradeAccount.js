import React, { useState, useEffect } from "react";
import { Container, Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { authApiClient } from "../Services/auth.service";
import { useAuth } from "../hooks/useAuth";

const UpgradeAccount = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role && user.role.toLowerCase() === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      setError(null);
      // Giả lập gọi API khởi tạo thanh toán
      const response = await authApiClient.post("/users/upgrade/init");
      if (response?.data?.success && response?.data?.data?.html) {
          // Thực thi HTML form ẩn để redirect qua SePay
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = response.data.data.html;
          document.body.appendChild(tempDiv);
          const form = tempDiv.querySelector('form');
          if (form) form.submit();
      } else {
        setError("Không thể khởi tạo thanh toán. Vui lòng thử lại sau.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || "Lỗi kết nối. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pdv-page" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Header />
      <div className="content-wrapper py-5">
        <Container style={{ maxWidth: 800 }}>
          <div className="text-center mb-5">
            <h1 className="fw-bold text-primary">Nâng Cấp Tài Khoản VIP</h1>
            <p className="text-muted fs-5">
              Mở khóa không giới hạn sức mạnh rraoo vặt của bạn!
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="row g-4 justify-content-center">
             {/* Plan Basic (Current) */}
             <div className="col-md-5">
              <Card className="h-100 border-0 shadow-sm" style={{ opacity: 0.8 }}>
                <Card.Body className="p-4 d-flex flex-column">
                  <h4 className="text-secondary fw-bold">Gói Cơ Bản</h4>
                  <p className="text-muted">Dành cho người mới bắt đầu</p>
                  <h2 className="mb-4">Miễn Phí</h2>
                  
                  <ul className="list-unstyled flex-grow-1" style={{ lineHeight: '2' }}>
                    <li><i className="bi bi-check-circle text-success me-2"></i> Tối đa 3 bài đăng sản phẩm</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i> Xem thông tin liên lạc</li>
                    <li><i className="bi bi-x-circle text-danger me-2"></i> Huy hiệu người bán uy tín</li>
                    <li><i className="bi bi-x-circle text-danger me-2"></i> Đăng bài không giới hạn</li>
                  </ul>
                  
                  <Button variant="outline-secondary" disabled className="w-100 mt-4 rounded-pill py-2 fw-bold">
                    Đang sử dụng
                  </Button>
                </Card.Body>
              </Card>
            </div>

            {/* Plan PRO */}
            <div className="col-md-7">
              <Card className="h-100 border-primary shadow-lg position-relative" style={{ borderWidth: '2px' }}>
                <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-danger px-3 py-2 fs-6">
                  Khuyên Dùng <i className="bi bi-stars"></i>
                </span>
                <Card.Body className="p-5 d-flex flex-column">
                  <h3 className="text-primary fw-bold">Gói Premium (Pro)</h3>
                  <p className="text-muted">Bán hàng không giới hạn, chuyên nghiệp hơn!</p>
                  <h1 className="mb-4 d-flex align-items-center gap-2">
                    99.000 <span className="text-muted fs-5">VND / Mãi mãi</span>
                  </h1>
                  
                  <ul className="list-unstyled flex-grow-1" style={{ lineHeight: '2', fontSize: '1.1rem' }}>
                    <li><i className="bi bi-check-circle-fill text-primary me-2"></i> <strong>Đăng bài không giới hạn</strong></li>
                    <li><i className="bi bi-check-circle-fill text-primary me-2"></i> <strong>Huy hiệu "Người bán uy tín"</strong></li>
                    <li><i className="bi bi-check-circle-fill text-primary me-2"></i> Hỗ trợ kỹ thuật 24/7</li>
                    <li><i className="bi bi-check-circle-fill text-primary me-2"></i> Quản lý đa sản phẩm dễ dàng</li>
                  </ul>
                  
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-100 mt-4 rounded-pill py-3 fw-bold shadow"
                    onClick={handleUpgrade}
                    disabled={loading}
                    style={{ fontSize: '1.2rem', transition: 'all 0.3s' }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Đang xử lý...</>
                    ) : (
                      <><i className="bi bi-rocket-takeoff-fill me-2"></i> Nâng cấp ngay bằng SePay</>
                    )}
                  </Button>
                </Card.Body>
              </Card>
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </div>
  );
};

export default UpgradeAccount;
