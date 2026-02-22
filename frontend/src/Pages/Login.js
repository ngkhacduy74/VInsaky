import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApiClient } from "../Services/auth.service";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [canClose, setCanClose] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const modalContentRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  // Terms of Service content
  const termsContent = `
ĐIỀU KHOẢN DỊCH VỤ VINSAKY

1. GIỚI THIỆU
Chào mừng bạn đến với Vinsaky! Khi bạn sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản này.

2. SỬ DỤNG DỊCH VỤ
- Bạn phải cung cấp thông tin chính xác khi đăng ký
- Không được sử dụng dịch vụ cho mục đích bất hợp pháp
- Tuân thủ các quy định của pháp luật Việt Nam

3. QUYỀN VÀ NGHĨA VỤ
- Chúng tôi có quyền thay đổi điều khoản dịch vụ
- Người dùng có trách nhiệm bảo mật thông tin tài khoản
- Báo cáo kịp thời nếu phát hiện vi phạm

4. CHÍNH SÁCH BẢO MẬT
Thông tin cá nhân của bạn được bảo vệ theo chính sách riêng tư của chúng tôi.

5. LIÊN HỆ
Mọi thắc mắc xin liên hệ: support@vinsaky.com
  `;

  // Customer Policy content
  const policyContent = `
CHÍNH SÁCH KHÁCH HÀNG VINSAKY

1. CAM KẾT CHẤT LƯỢNG
Chúng tôi cam kết cung cấp dịch vụ chất lượng cao nhất cho khách hàng.

2. CHÍNH SÁCH HOÀN TIỀN
- Hoàn tiền 100% nếu không hài lòng trong 7 ngày đầu
- Quy trình hoàn tiền trong vòng 3-5 ngày làm việc
- Phí dịch vụ có thể được khấu trừ tùy theo từng trường hợp

3. HỖ TRỢ KHÁCH HÀNG
- Hỗ trợ 24/7 qua hotline: 1900-xxxx
- Email hỗ trợ: support@vinsaky.com
- Chat trực tuyến trên website

4. QUYỀN LỢI KHÁCH HÀNG
- Được tư vấn miễn phí
- Ưu đãi đặc biệt cho khách hàng thân thiết
- Chương trình khuyến mãi hàng tháng

5. CHÍNH SÁCH BẢO HÀNH
Tất cả sản phẩm/dịch vụ đều được bảo hành theo quy định của nhà sản xuất.
  `;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Vui lòng nhập email và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const response = await authApiClient.post("/auth/login", {
        email,
        password,
      });
      if (response.data.success) {
        // Backend có ResponseInterceptor wrap thêm 1 lớp:
        // response.data = { success, statusCode, message, data: <service_return>, path, timestamp }
        // service trả về: { success, data: { accessToken, refreshToken, user } }
        // → token thực nằm ở response.data.data.data
        const outerData = response.data?.data;         // { success, data: {...} }
        const resData = outerData?.data || outerData;  // { accessToken, refreshToken, user }
        const accessToken = resData?.accessToken || resData?.token;
        const refreshToken = resData?.refreshToken;
        const user = resData?.user;

        if (accessToken) {
          // Lưu token và thông tin user vào localStorage
          localStorage.setItem("token", accessToken);
          if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
          if (user) localStorage.setItem("user", JSON.stringify(user));
          localStorage.removeItem("lastTokenValidation");

          // Ưu tiên returnUrl từ state, fallback sessionStorage (tránh mất khi refresh)
          const returnUrl =
            location.state?.returnUrl || sessionStorage.getItem("loginReturnUrl");
          if (returnUrl) sessionStorage.removeItem("loginReturnUrl");
          const destination = returnUrl
            ? returnUrl
            : user?.role === "Admin"
            ? "/admin"
            : "/";
          navigate(destination, {
            replace: true,
            state: { token: accessToken, user, message: "Đăng nhập thành công!" },
          });
        } else {
          throw new Error("Đăng nhập thất bại, không nhận được token từ server.");
        }

      } else {
        throw new Error(response.data.message || "Đăng nhập thất bại.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(
        error.response?.data?.message || "Đăng nhập thất bại, vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
    setCanClose(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setCanClose(false);
  };

  const handleScroll = () => {
    if (modalContentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = modalContentRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setCanClose(isAtBottom);
    }
  };

  useEffect(() => {
    if (showModal && modalContentRef.current) {
      modalContentRef.current.scrollTop = 0;
      setCanClose(false);
    }
  }, [showModal]);

  const handleRegister = () => {
    navigate('/register');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    mainCard: {
      maxWidth: '64rem',
      width: '100%',
      backgroundColor: 'white',
      borderRadius: '1rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f3f4f6',
      overflow: 'hidden'
    },
    mainContent: {
      display: 'flex',
      flexDirection: 'column'
    },
    leftPanel: {
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'white',
      borderRight: '1px solid #f3f4f6'
    },
    bgOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#f9fafb',
      opacity: 0.5
    },
    branding: {
      position: 'relative',
      zIndex: 10,
      textAlign: 'center'
    },
    logo: {
      width: '6rem',
      height: '6rem',
      backgroundColor: '#dbeafe',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem'
    },
    logoSvg: {
      width: '3rem',
      height: '3rem',
      color: '#2563eb'
    },
    brandTitle: {
      fontSize: '2.25rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: '#1f2937'
    },
    brandSubtitle: {
      fontSize: '1.25rem',
      color: '#6b7280',
      marginBottom: '2rem'
    },
    features: {
      textAlign: 'left',
      maxWidth: '20rem'
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1rem'
    },
    featureDot: {
      width: '0.5rem',
      height: '0.5rem',
      backgroundColor: '#2563eb',
      borderRadius: '50%',
      marginRight: '0.75rem'
    },
    featureText: {
      color: '#374151'
    },
    decorativeCircle1: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: '8rem',
      height: '8rem',
      backgroundColor: '#dbeafe',
      borderRadius: '50%',
      transform: 'translate(4rem, -4rem)'
    },
    decorativeCircle2: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '6rem',
      height: '6rem',
      backgroundColor: '#eff6ff',
      borderRadius: '50%',
      transform: 'translate(-3rem, 3rem)'
    },
    rightPanel: {
      padding: '2rem'
    },
    message: {
      marginBottom: '1.5rem',
      padding: '1rem',
      backgroundColor: '#fef3c7',
      border: '1px solid #f59e0b',
      color: '#92400e',
      borderRadius: '0.5rem'
    },
    formHeader: {
      marginBottom: '2rem'
    },
    formTitle: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    formSubtitle: {
      color: '#6b7280'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    formLabel: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    formInput: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      transition: 'all 0.2s',
      outline: 'none'
    },
    btnPrimary: {
      width: '100%',
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '0.75rem 1rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      outline: 'none'
    },
    loadingSpinner: {
      width: '1rem',
      height: '1rem',
      border: '2px solid white',
      borderTop: '2px solid transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginRight: '0.5rem'
    },
    textCenter: {
      textAlign: 'center',
      margin: '1.5rem 0'
    },
    linkButton: {
      background: 'none',
      border: 'none',
      color: '#2563eb',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      textDecoration: 'none'
    },
    formFooter: {
      paddingTop: '1.5rem',
      borderTop: '1px solid #e5e7eb',
      textAlign: 'center',
      color: '#6b7280'
    },
    footerLinks: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      fontSize: '0.875rem'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 50
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      maxWidth: '42rem',
      width: '100%',
      maxHeight: '80vh',
      display: 'flex',
      flexDirection: 'column'
    },
    modalHeader: {
      padding: '1.5rem',
      borderBottom: '1px solid #e5e7eb'
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1f2937'
    },
    modalContent: {
      flex: 1,
      overflowY: 'auto',
      padding: '1.5rem'
    },
    modalText: {
      whiteSpace: 'pre-line',
      color: '#374151',
      lineHeight: 1.6
    },
    scrollIndicator: {
      textAlign: 'center',
      marginTop: '1.5rem',
      padding: '1rem',
      backgroundColor: '#eff6ff',
      borderRadius: '0.5rem'
    },
    scrollIndicatorContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#2563eb'
    },
    scrollIndicatorSvg: {
      width: '1rem',
      height: '1rem',
      marginRight: '0.5rem',
      animation: 'bounce 1s infinite'
    },
    scrollIndicatorText: {
      fontSize: '0.875rem'
    },
    modalFooter: {
      padding: '1.5rem',
      borderTop: '1px solid #e5e7eb'
    },
    btnModal: {
      width: '100%',
      padding: '0.75rem 1rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    btnModalEnabled: {
      backgroundColor: '#2563eb',
      color: 'white'
    },
    btnModalDisabled: {
      backgroundColor: '#d1d5db',
      color: '#6b7280',
      cursor: 'not-allowed'
    }
  };

  // CSS animations
  const cssAnimations = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
      40%, 43% { transform: translateY(-10px); }
    }
    input:focus {
      border-color: transparent !important;
      box-shadow: 0 0 0 2px #3b82f6 !important;
    }
    button:hover:not(:disabled) {
      opacity: 0.9;
    }
    .btn-primary:hover:not(:disabled) {
      background-color: #1d4ed8 !important;
    }
    .link-button:hover {
      color: #1d4ed8 !important;
    }
    @media (min-width: 640px) {
      .footer-links {
        flex-direction: row !important;
        justify-content: center !important;
      }
    }
    @media (min-width: 1024px) {
      .main-content {
        flex-direction: row !important;
      }
      .left-panel, .right-panel {
        width: 50% !important;
      }
      .right-panel {
        padding: 3rem !important;
      }
    }
  `;

  return (
    <div>
      <style>{cssAnimations}</style>
      <div style={styles.container}>
        <div style={styles.mainCard}>
          <div style={{...styles.mainContent}} className="main-content">
            {/* Left Side - Image/Branding */}
            <div style={{...styles.leftPanel}} className="left-panel">
              <div style={styles.bgOverlay}></div>
              <div style={styles.branding}>
                <div style={styles.logo}>
                  <img
                    src="../images/Logo.png"
                    alt="logo"
                    style={{
                      width: '3rem',
                      height: '3rem',
                      objectFit: 'contain'
                    }}
                  />
                </div>
                <h1 style={styles.brandTitle}>Vinsaky</h1>
                <p style={styles.brandSubtitle}>Nền tảng dịch vụ hiện đại</p>
                
                <div style={styles.features}>
                  <div style={styles.featureItem}>
                    <div style={styles.featureDot}></div>
                    <span style={styles.featureText}>Dịch vụ chuyên nghiệp</span>
                  </div>
                  <div style={styles.featureItem}>
                    <div style={styles.featureDot}></div>
                    <span style={styles.featureText}>Hỗ trợ 24/7</span>
                  </div>
                  <div style={styles.featureItem}>
                    <div style={styles.featureDot}></div>
                    <span style={styles.featureText}>Bảo mật tuyệt đối</span>
                  </div>
                </div>
              </div>
              
              <div style={styles.decorativeCircle1}></div>
              <div style={styles.decorativeCircle2}></div>
            </div>

            {/* Right Side - Login Form */}
            <div style={{...styles.rightPanel}} className="right-panel">
              {message && (
                <div style={styles.message}>
                  {message}
                </div>
              )}

              <div style={styles.formHeader}>
                <h2 style={styles.formTitle}>Đăng nhập</h2>
                <p style={styles.formSubtitle}>Chào mừng bạn trở lại!</p>
              </div>

              <div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    Email của bạn
                  </label>
                  <input
                    type="email"
                    style={styles.formInput}
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    style={styles.formInput}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  style={{
                    ...styles.btnPrimary,
                    opacity: loading ? 0.5 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                  className="btn-primary"
                >
                  {loading ? (
                    <>
                      <div style={styles.loadingSpinner}></div>
                      <span>Đang đăng nhập...</span>
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </button>
              </div>

              <div style={styles.textCenter}>
                <button
                  type="button"
                  style={styles.linkButton}
                  className="link-button"
                  onClick={() => alert("Chức năng quên mật khẩu")}
                >
                  Quên mật khẩu?
                </button>
              </div>

              <div style={styles.textCenter}>
                Chưa có tài khoản?{" "}
                <button
                  type="button"
                  style={styles.linkButton}
                  className="link-button"
                  onClick={handleRegister}
                >
                  Đăng ký ngay
                </button>
              </div>

              <div style={styles.formFooter}>
                <div style={{...styles.footerLinks}} className="footer-links">
                  <button
                    type="button"
                    style={styles.linkButton}
                    className="link-button"
                    onClick={() => openModal("policy")}
                  >
                    Chính sách khách hàng
                  </button>
                  <button
                    type="button"
                    style={styles.linkButton}
                    className="link-button"
                    onClick={() => openModal("terms")}
                  >
                    Điều khoản dịch vụ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>
                  {modalType === "terms" ? "Điều khoản dịch vụ" : "Chính sách khách hàng"}
                </h3>
              </div>
              
              <div
                ref={modalContentRef}
                onScroll={handleScroll}
                style={styles.modalContent}
              >
                <div style={styles.modalText}>
                  {modalType === "terms" ? termsContent : policyContent}
                </div>
                
                {!canClose && (
                  <div style={styles.scrollIndicator}>
                    <div style={styles.scrollIndicatorContent}>
                      <svg style={styles.scrollIndicatorSvg} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M15.707 4.293a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L10 8.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span style={styles.scrollIndicatorText}>Vui lòng lướt xuống cuối để tiếp tục</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div style={styles.modalFooter}>
                <button
                  onClick={closeModal}
                  disabled={!canClose}
                  style={{
                    ...styles.btnModal,
                    ...(canClose ? styles.btnModalEnabled : styles.btnModalDisabled)
                  }}
                >
                  Tôi đã hiểu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;